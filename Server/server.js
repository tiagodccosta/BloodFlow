const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const { marked } = require('marked');
const admin = require('firebase-admin');
const firebase = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const fetch = require('node-fetch');
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');
const axios = require('axios');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const MarkdownIt = require('markdown-it');
const { v4: uuidv4 } = require('uuid');
const jobQueue = new Map();
const { Readable } = require('stream');
const pdfParser = require('pdf-parse');
const { exec } = require('child_process');
const ExcelJS = require('exceljs');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

const md = new MarkdownIt();
const fontBytes = fs.readFileSync(path.join(__dirname, 'arial-unicode-ms.ttf'));
const logoPath = path.join(__dirname, 'logo.png');
const logoBytes = fs.readFileSync(logoPath);

const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
});

const firebaseAccount = JSON.parse(Buffer.from(process.env.FIREBASE_ACCOUNT_KEY, 'base64').toString('utf-8'));

admin.initializeApp({
    credential: admin.credential.cert(firebaseAccount),
});

firebase.initializeApp({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  });

const bucketName = process.env.STORAGE_BUCKET;

const storage = admin.storage();

app.get('/', async (req, res) => {
    res.send('Welcome to the BloodFlow application!');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const auth = getAuth();  
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const customToken = await admin.auth().createCustomToken(user.uid);
      res.send({ token: customToken });
    } catch (error) {
      console.error('Error during authentication:', error);
      res.status(400).send({ error: error.message });
    }
});

app.post('/send-email-analysis', async (req, res) => {
  try {
    const { userEmail, userName, analysis, pdfUrl, userAvailability } = req.body;

    const htmlAnalysis = await marked(analysis);

    const file = storage.bucket(bucketName).file(pdfUrl);
    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${pdfUrl}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'bloodflowpartner@gmail.com',
      cc: userEmail,
      subject: 'Nova Análise da BloodFlow',
      html: `
        <div style="text-align: center;">
            <img src="cid:logo" alt="BloodFlow Logo" style="width: 150px; margin-bottom: 20px;">
        </div>
        <h1>Uma nova análise foi criada:</h1>
        <ul>
            <li>Utilizador: ${userName}</li>
            <li>Análise: ${htmlAnalysis}</li>
            <li><strong>Disponibilidade de ${userName} para uma consulta:</strong> <br> ${userAvailability}</li>
            <li>PDF Link: <a href="${publicUrl}">Descarregar PDF</a></li>
        </ul>
      `,
      attachments: [
            {
                filename: 'logo.png',
                path: path.join(__dirname, './logo.png'),
                cid: 'logo'
            }
        ]   
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'An error occurred while sending email' });
  }
});

app.post('/send-email-welcome', async (req, res) => {
    try {
        const { userEmail, userName } = req.body;
    
        const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: `Welcome to BloodFlow, ${userName}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <div style="text-align: center;">
                        <img src="cid:logo" alt="BloodFlow Logo" style="width: 150px; margin-bottom: 20px;">
                    </div>
                    <p style="font-size: 18px;">Hello <strong>${userName}</strong>!</p>
                    <p style="font-size: 16px;">Welcome to <strong>BloodFlow</strong>!</p>
                    <p style="font-size: 14px; line-height: 1.5;">
                        We are a company dedicated to advanced blood test analysis using artificial intelligence.
                    </p>
                    <p style="font-size: 14px; line-height: 1.5;">
                        Our mission is to provide our users with detailed insights into their health from their blood tests, helping them make informed decisions and promote a healthier lifestyle.
                    </p>
                    <p style="font-size: 14px; line-height: 1.5;">
                        If you have any questions or need more information, please don't hesitate to contact us.
                    </p>
                    <p style="font-size: 16px; margin-top: 20px;">Thank you for choosing BloodFlow.</p>
                    <p style="font-size: 16px;">Sincerely,<br>The BloodFlow Team</p>
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="font-size: 12px; color: #888;">© 2024 BloodFlow. All rights reserved.</p>
                    </div>
                </div>
            `,
            attachments: [
                {
                    filename: 'logo.png',
                    path: path.join(__dirname, './logo.png'),
                    cid: 'logo'
                }
            ]   
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'An error occurred while sending email' });
    }
});

app.post('/add-email-to-database', async (req, res) => {
    try {
        const { userEmail } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userEmail)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const db = admin.firestore();
        const emailRef = db.collection('marketingEmails').doc(userEmail);
        await emailRef.set({ email: userEmail });
        res.status(200).json({ message: 'Email added to database' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while adding email to database' });
    }
});

async function extractTextNoPassword(pdfBuffer) {
    try {
        const pdfData = new Uint8Array(pdfBuffer);
        const pdfText = await pdfParser(pdfData);
        
        return pdfText.text;
    } catch (error) {
        console.error('Error in extractTextFromPdfBuffer:', error);
        throw error;
    }
}

async function extractTextFromPdfBuffer(pdfBuffer, password) {
    const tempInputPath = path.join(__dirname, 'tempInput.pdf');
    const tempOutputPath = path.join(__dirname, 'tempOutput.pdf');
    
    try {
        fs.writeFileSync(tempInputPath, pdfBuffer);

        await decryptPdf(tempInputPath, tempOutputPath, password);

        const decryptedPdfBuffer = fs.readFileSync(tempOutputPath);
        const text = await pdfParser(decryptedPdfBuffer);
        
        return text.text;
    } catch (error) {
        console.error('Error in decryption or extraction:', error);
    } finally {
        fs.unlinkSync(tempInputPath);
        fs.unlinkSync(tempOutputPath);
    }
}

async function decryptPdf(inputPath, outputPath, password) {
    return new Promise((resolve, reject) => {
        const command = `qpdf --password=${password} --decrypt "${inputPath}" "${outputPath}"`;
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log('Error decrypting PDF:', error);
                console.log('stdout:', stdout);
                return reject(`Decryption failed: ${stderr}`);
            }
            resolve(outputPath);
        });
    });
}

app.post('/extract-text', async (req, res) => {
    try {
        const { pdfURL } = req.body;
        
        const response = await fetch(pdfURL);   

        if (!response.ok) {
            console.log('Failed to fetch PDF:', response.status);
        }

        const pdfBytes = await response.arrayBuffer();
        const pdfBuffer = Buffer.from(pdfBytes);

        const isPasswordProtected = await checkPDFPasswordProtection(pdfBuffer);
        
        if (isPasswordProtected) {
            console.log('PDF is password-protected');
            return res.status(400).json({ message: 'PDF is password-protected. Please provide the password.' });
        } else {
            console.log('Doesnt need password');
            const extractedText = await extractTextNoPassword(pdfBuffer);

            res.json({ text: extractedText });
        }

    } catch (error) {
        console.log('Error extracting text:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

app.post('/submit-password', async (req, res) => {
    const { pdfURL, password } = req.body;

    try {
        const pdfBuffer = await fetch(pdfURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch PDF: ${response.status}`);
                }
                return response.arrayBuffer();
            })
            .then(buffer => Buffer.from(buffer));

        const extractedText = await extractTextFromPdfBuffer(pdfBuffer, password);

        return res.status(200).json({ extractedText });
    } catch (error) {
        console.log('Error unlocking PDF or analyzing:', error.message);
        return res.status(400).json({ message: 'Incorrect password or unable to process the PDF. Please try again.' });
    }
});

app.post('/add-analysis-to-pdf', async (req, res) => {

    console.log('Received request to add analysis to PDF');
    const jobId = uuidv4();
    jobQueue.set(jobId, { status: 'processing' });

    try {
        const { pdfUrl, analysis } = req.body;

        try {
            const htmlContent = md.render(analysis);
            const plainText = htmlContent.replace(/<\/?[^>]+(>|$)/g, "");

            const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
            const pdfBuffer = Buffer.from(response.data);

            const pdfDoc = await PDFDocument.load(pdfBuffer);

            pdfDoc.registerFontkit(fontkit);
            const customFont = await pdfDoc.embedFont(fontBytes);
            const logoImage = await pdfDoc.embedPng(logoBytes, { quality: 0.1}); 

            const pageWidth = 600;
            const pageHeight = 800;
            const maxPages = 2;
            const textPerPage = Math.ceil(plainText.length / maxPages);
            const logoWidth = 100;
            const logoHeight = (logoImage.height / logoImage.width) * logoWidth;

            for (let i = 0; i < maxPages; i++) {
                const page = pdfDoc.addPage([pageWidth, pageHeight]);
                const { width, height } = page.getSize();
                const startIndex = i * textPerPage;
                const endIndex = Math.min(startIndex + textPerPage, plainText.length);
                const pageText = plainText.substring(startIndex, endIndex);

                if (i === 0) { 
                    page.drawImage(logoImage, {
                        x: width - logoWidth - 50,
                        y: height - logoHeight - 30,
                        width: logoWidth,
                        height: logoHeight,
                    });
                }

                page.drawText(pageText, {
                    x: 50,
                    y: height - logoHeight,
                    size: 10,
                    font: customFont,
                    color: rgb(0, 0, 0),
                    maxWidth: width - 100,
                });
            }

            const modifiedPdfBytes = await pdfDoc.save();
            console.log('PDF generated with size:', modifiedPdfBytes.length);
            jobQueue.set(jobId, { status: 'completed', pdfBytes: modifiedPdfBytes });
            console.log('PDF generated successfully');

        } catch (error) {
            console.error('Error processing PDF:', error);
            jobQueue.set(jobId, { status: 'failed', error: error.message });
        }
    
        res.status(202).json({ jobId });   
    } catch (error) {
        console.error('Error processing PDF:', error);
        res.status(500).send('Error processing PDF');
    }
});

app.get('/download-pdf/:jobId', (req, res) => {
    console.log('Received request for /download-pdf');
    const jobId = req.params.jobId;
    const job = jobQueue.get(jobId);

    if (job && job.status === 'completed') {
        console.log('Job found and completed');
        res.setHeader('Content-Disposition', 'attachment; filename="BloodFlow_Analysis.pdf"');
        res.setHeader('Content-Type', 'application/pdf');
        console.log('Sending PDF with size:', job.pdfBytes.length);

        const pdfStream = new Readable({
            read() {
                this.push(job.pdfBytes);
                this.push(null);
            }
        });

        pdfStream.pipe(res);

        jobQueue.delete(jobId);
    } else if (job && job.status === 'failed') {
        console.log('Job failed');
        res.status(500).json({ error: job.error });
    } else {
        console.log('Job not found or not completed yet');
        res.status(404).json({ error: 'Job not found or not completed yet' });
    }
});

app.get('/check-job-status/:jobId', (req, res) => {
    const jobId = req.params.jobId;
    const job = jobQueue.get(jobId);

    if (job) {
        res.status(200).json({ status: job.status });
    } else {
        res.status(404).json({ error: 'Job not found' });
    }
});

async function analyzeTextWithOpenAI(text, languageDirective, userName, userAge, medicalCondition) {
    const url = "https://api.openai.com/v1/chat/completions";

    const messages = [
        {
            role: "system",
            content: `
            ${languageDirective}

            Tu és o BloodFlow AI, um analista médico especializado. Analise os seguintes resultados de análises de sangue para o paciente chamado ${userName}, que tem ${userAge} anos. A análise tem de ter em extrema consideração que o paciente tem a seguinte condição médica: ${medicalCondition}. Forneça um relatório de análise completo e detalhado no seguinte formato, se o documento fornecido for um relatório de análise de sangue ou resultados de testes de saúde:

            1. **Pontuação do Teste**: Forneça uma pontuação geral de saúde de 0 a 10 (por exemplo, '5.3'). Esta pontuação deve refletir o estado de saúde atual do paciente com base nos resultados dos testes. A pontuação deve estar no formato: " Score: X.X".

            2. **Data da Análise**: Forneça a data da análise. O formato deve ser: "DD/MM/AAAA".

            3. **Resumo**: 
                - Forneça uma visão geral dos principais resultados e destaque o estado geral de saúde.
                - Use uma redação e estrutura ligeiramente diferentes em cada análise para evitar repetições.

            4. **Análise Detalhada**:
                - **Comparação dos Resultados dos Testes**: Compare os valores dos parâmetros mais relevantes com o intervalo de referência normal e com valores anteriores (se disponíveis).
                - **Valores Anormais**: Destaque e explique a significância de quaisquer valores fora do intervalo normal.
                - **Tendências e Alterações**: Identifique e discuta mudanças notáveis em comparação com os resultados anteriores.
                - **Implicações Potenciais**: Explicite possíveis implicações para a saúde dos resultados anormais.
                - **Prognósticos**: Com base nos resultados, ofereça uma perspectiva prognóstica, indicando potenciais desfechos se as tendências atuais continuarem.

            5. **Recomendações**: 
                - Sugira testes adicionais ou acompanhamentos relevantes para confirmar o diagnóstico ou obter mais detalhes.
                - Ofereça sugestões práticas para mudanças de estilo de vida, dieta, ou tratamentos que possam beneficiar a condição do paciente, adequadas à idade e estado do paciente.
                - Inclua conselhos médicos específicos ou precauções, assegurando que sejam viáveis.

            6. **Avisos e Considerações**:
                - Destaque quaisquer valores críticos que requeiram atenção médica imediata.
                - Informe sobre possíveis interferências ou fatores que podem afetar a precisão dos resultados, como medicamentos ou atividades recentes.

            Aqui estão os resultados das análises de sangue. O formato é:
            - Nome do Parâmetro: valor anterior 1 / valor anterior 2 valor atual unidades

            Utilize apenas o valor atual (o último valor) para a análise e mencione valores anteriores apenas para comparação. Se não houver valores anteriores, use o valor fornecido.

            Instruções Adicionais:
                - Adapte a análise para focar especificamente nos aspectos ligados à condição médica mencionada do paciente.
                - Utilize a estrutura fornecida para garantir consistência em cada relatório e clareza para o leitor.
            `,
        },
        {
            role: "user",
            content: text
        }
    ];

    const response = await axios.post(url, {
        model: "gpt-4o-2024-08-06",
        messages: messages,
        max_tokens: 3000,
        n: 1
    }, {
        headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json"
        }
    });

    return response.data.choices[0].message.content;
};


app.post('/analyze-blood-test', async (req, res) => {
    const { text, userName, age, medicalCondition, language } = req.body;

    try {
        const languageDirective = language === 'en'
            ? "Por favor, dá a resposta ao paciente em Inglês, seguindo a formatação indicada abaixo."
            : "Por favor, responde ao paciente em Português.";

        const analysis = await analyzeTextWithOpenAI(text, languageDirective, userName, age, medicalCondition);

        res.json({ analysis });
    } catch (error) {
        console.error("Error analyzing blood test:", error);
        res.status(500).json({ error: "Failed to analyze blood test" });
    }
});

async function analyzeBloodTestEFP(text, userName, userAge, medicalCondition) {
    const url = "https://api.openai.com/v1/chat/completions";

    const messages = [
        {
            role: "system",
            content: `
            Por favor, dá a resposta ao paciente em Português, seguindo a formatação indicada abaixo.

            Tu és o BloodFlow AI, um analista médico especializado. Analise os seguintes resultados de análises de sangue para o paciente chamado ${userName}, que tem ${userAge} anos. A análise tem de ter em extrema consideração que o paciente tem a seguinte condição médica: ${medicalCondition}. Forneça um relatório de análise completo e detalhado no seguinte formato, se o documento fornecido for um relatório de análise de sangue ou resultados de testes de saúde:

            1. **Pontuação do Teste**: Forneça uma pontuação geral de saúde de 0 a 10 (por exemplo, '5.3'). Esta pontuação deve refletir o estado de saúde atual do paciente com base nos resultados dos testes. A pontuação deve estar no formato: " Score: X.X".

            2. **Data da Análise**: Forneça a data da análise. O formato deve ser: "DD/MM/AAAA".

            3. **Lista de Parâmetros e Valores**: Antes de iniciar a análise, liste o nome e o valor atual de cada parâmetro dos resultados da análise de sangue. O formato deve ser o seguinte:
                - Nome do Parâmetro: Valor atual (Unidades)

            4. **Resumo**: 
                - Forneça uma visão geral dos principais resultados e destaque o estado geral de saúde.
                - Use uma redação e estrutura ligeiramente diferentes em cada análise para evitar repetições.

            5. **Análise Detalhada**:
                - **Comparação dos Resultados dos Testes**: Compare os valores dos parâmetros mais relevantes com o intervalo de referência normal e com valores anteriores (se disponíveis).
                - **Valores Anormais**: Destaque e explique a significância de quaisquer valores fora do intervalo normal.
                - **Tendências e Alterações**: Identifique e discuta mudanças notáveis em comparação com os resultados anteriores.
                - **Implicações Potenciais**: Explicite possíveis implicações para a saúde dos resultados anormais.
                - **Prognósticos**: Com base nos resultados, ofereça uma perspectiva prognóstica, indicando potenciais desfechos se as tendências atuais continuarem.

            6. **Recomendações**: 
                - Sugira testes adicionais ou acompanhamentos relevantes para confirmar o diagnóstico ou obter mais detalhes.
                - Ofereça sugestões práticas para mudanças de estilo de vida, dieta, ou tratamentos que possam beneficiar a condição do paciente, adequadas à idade e estado do paciente.
                - Inclua conselhos médicos específicos ou precauções, assegurando que sejam viáveis.

            7. **Avisos e Considerações**:
                - Destaque quaisquer valores críticos que requeiram atenção médica imediata.
                - Informe sobre possíveis interferências ou fatores que podem afetar a precisão dos resultados, como medicamentos ou atividades recentes.

            Aqui estão os resultados das análises de sangue. O formato é:
            - Nome do Parâmetro: valor anterior 1 / valor anterior 2 valor atual unidades

            Utilize apenas o valor atual (o último valor) para a análise e mencione valores anteriores apenas para comparação. Se não houver valores anteriores, use o valor fornecido.

            Instruções Adicionais:
                - Adapte a análise para focar especificamente nos aspectos ligados à condição médica mencionada do paciente.
                - Utilize a estrutura fornecida para garantir consistência em cada relatório e clareza para o leitor.
            `,
        },
        {
            role: "user",
            content: text
        }
    ];

    const response = await axios.post(url, {
        model: "gpt-4o-2024-08-06",
        messages: messages,
        max_tokens: 4000,
        n: 1
    }, {
        headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json"
        }
    });

    return response.data.choices[0].message.content;
};

async function checkPDFPasswordProtection(pdfBuffer) {
    try {
        await PDFDocument.load(pdfBuffer);
        return false;
    } catch (error) {
        return true;
    }
}


app.post('/efp/submit-password', async (req, res) => {
    const { pdfFile, password, userName, userAge, medicalCondition } = req.body;
  
    const pdfBuffer = Buffer.from(pdfFile, 'base64');
    try {
  
      const extractedText = await extractTextFromPdfBuffer(pdfBuffer, password);
      const analysisResults = await analyzeBloodTestEFP(extractedText, userName, userAge, medicalCondition);
  
      return res.status(200).json({ analysisResults });
    } catch (error) {
      return res.status(400).json({ message: 'Incorrect password. Please try again.' });
    }
});

app.post('/efp/analyse-blood-test', async (req, res) => {
    const { pdfFile, userName, userAge, medicalCondition } = req.body;

    try {
        const pdfBuffer = Buffer.from(pdfFile, 'base64');
        const isPasswordProtected = await checkPDFPasswordProtection(pdfBuffer);

        if (isPasswordProtected) {
            return res.status(400).json({ message: 'PDF is password-protected. Please provide the password.' });
        } else {
            console.log('Doesnt need password');
            const extractedText = await extractTextNoPassword(pdfBuffer);
            const analysis = await analyzeBloodTestEFP(extractedText, userName, userAge, medicalCondition);
            return res.json({ analysis });
        }

    } catch (error) {
        console.error("Error analyzing blood test:", error);
        res.status(500).json({ error: "Failed to analyze blood test" });
    }
});

async function extractParametersAndValuesFromBloodTest(text) {
    const url = "https://api.openai.com/v1/chat/completions";

    const messages = [
        {
            role: "system",
            content: `
                Extract the analysis date in the format: "DD/MM/YYYY". This will usually appear near the beginning of the text and close to phrases like "Data da análise: 01/01/2024".

                Extract all parameters, values, units, and whether the value is within the normal range. Return the results in the following JSON structure:

                {
                    "analysisDate": "DD/MM/YYYY",
                    "parameters": [
                        {
                            "parameter": "Eritrócitos",
                            "value": "5.19 x10¹²/L",
                            "status": "dentro do intervalo"
                        },
                        {
                            "parameter": "Hemoglobina",
                            "value": "15.4 g/dL",
                            "status": "fora do intervalo"
                        }
                    ]
                }
                
                Always extract the full name of the parameter, not just an abbreviation. Like "eGFR-CKD-EPI 2009 (18-70 anos)" instead of just "eGFR-CKD-EPI 2009".
                If a parameter appears multiple times specify the parameter that appears again type like "Hemoglobina (Urina)".
                Always extract the full unit of measurement, like "x10¹²/L" instead of just "x10¹²".
                If a parameter lacks a reference range, use "ND" for the status.
            `,
        },
        {
            role: "user",
            content: text
        }
    ];

    const response = await axios.post(url, {
        model: "gpt-4o-2024-08-06",
        messages: messages,
        max_tokens: 5000,
        n: 1
    }, {
        headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json"
        }
    });

    let outputText = response.data.choices[0].message.content;

    if (outputText.startsWith("```json")) {
        outputText = outputText.slice(7, -3).trim();
    } else if (outputText.startsWith("```")) {
        outputText = outputText.slice(3, -3).trim();
    }

    let parsedResponse;
    try {
        parsedResponse = JSON.parse(outputText);
    } catch (error) {
        console.error('Failed to parse JSON from the model:', error);
        console.log('Output text:', outputText);
        return { parameters: null, testDate: null };
    }

    const testDate = parsedResponse.analysisDate || null;
    const parameters = parsedResponse.parameters || [];

    console.log('Parsed data:', { parameters, testDate });

    return { parameters, testDate };
}

async function downloadExcelFile(patientId, fileName) {
    const file = storage.bucket(bucketName).file(`FertilityCare/${patientId}/${fileName}.xlsx`);
    const exists = (await file.exists())[0];
    if (!exists) return null;

    const fileBuffer = await file.download();
    const workbook = new ExcelJS.Workbook();
    try {
        await workbook.xlsx.load(fileBuffer[0]);
        return workbook;
    } catch (error) {
        console.error("Error reading Excel file:", error);
        return null;
    }
}

async function updateOrCreateExcelFile(existingWorkbook, newTestData, testDate) {
    const workbook = existingWorkbook || new ExcelJS.Workbook();
    let worksheet = workbook.getWorksheet('Blood Test Results');

    const flatData = newTestData.flat();

    if (!worksheet) {
        worksheet = workbook.addWorksheet('Blood Test Results');
        worksheet.addRow(['Parameters', testDate]);

        flatData.forEach((data) => {
            if (data.parameter === 'Data da análise') return;

            const row = worksheet.addRow([data.parameter, data.value]);

            if (data.status === "fora do intervalo") {
                row.getCell(2).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFF0000' }
                };
            }
        });
    } else {
        const headerRow = worksheet.getRow(1);
        const newColumnIndex = headerRow.actualCellCount + 1;
        headerRow.getCell(newColumnIndex).value = testDate;

        const parameterRowMap = {};
        worksheet.eachRow((row, rowIndex) => {
            if (rowIndex > 1) {
                parameterRowMap[row.getCell(1).value] = row;
            }
        });

        flatData.forEach((data) => {
            if (data.parameter === 'Data da análise') return;

            let row = parameterRowMap[data.parameter];
            if (!row) {
                row = worksheet.addRow([data.parameter]);
            }
            const valueCell = row.getCell(newColumnIndex);
            valueCell.value = data.value;

            if (data.status === "fora do intervalo") {
                valueCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFF0000' }
                };
            }
        });
    }

    return workbook;
}

async function saveWorkbookToStorage(workbook, patientId, fileName) {
    const fileBuffer = await workbook.xlsx.writeBuffer();

    const file = storage.bucket(bucketName).file(`FertilityCare/${patientId}/${fileName}.xlsx`);
    await file.save(fileBuffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const options = {
        action: 'read',
        expires: Date.now() + 3600 * 1000,
    };

    const signedUrls = await file.getSignedUrl(options);
    return signedUrls[0];
}

app.post('/fertility-care/generate-excel', async (req, res) => {
    const { patientId, fileURL, excelFileName } = req.body;

    try {
        const pdfResponse = await axios.get(fileURL, { responseType: 'arraybuffer' });
        const pdfText = await pdfParser(pdfResponse.data);

        const { parameters, testDate } = await extractParametersAndValuesFromBloodTest(pdfText.text);

        if (!testDate) {
            throw new Error("Test date could not be extracted from the blood test.");
        }

        let workbook = await downloadExcelFile(patientId, excelFileName);

        workbook = await updateOrCreateExcelFile(workbook, parameters, testDate);

        const signedUrl = await saveWorkbookToStorage(workbook, patientId, excelFileName);

        res.status(200).send({ message: "Excel file updated successfully.", url: signedUrl });
    } catch (error) {
        console.error("Error generating Excel file:", error);
        res.status(500).send({ error: "Failed to generate Excel file." });
    }
});

async function generateSmartReport(text) {
    const url = "https://api.openai.com/v1/chat/completions";

    const messages = [
        {
            role: "system",
            content: `
                Extract all parameters, values, units, and whether the value is within the normal range. Return the results in the following JSON structure:

                    {
                        "parameters": [
                            {
                                "name": "Hemoglobin",
                                "value": "15.4 g/L",
                                "range": "13.0 g/L - 17.0 g/L",
                                "status": "normal",
                                "insight": "Hemoglobin level is within the normal range, indicating good oxygen-carrying capacity."
                            },
                            {
                                "name": "CK",
                                "value": "513",
                                "range": "> 200",
                                "status": "high",
                                "insight": "CK level is outise the normal range, indicating potential muscle damage."
                            }
                        ]
                    }
                    
                    Always extract the full name of the parameter, not just an abbreviation. Like "eGFR-CKD-EPI 2009 (18-70 anos)" instead of just "eGFR-CKD-EPI 2009".
                    If a parameter appears multiple times specify the parameter that appears again type like "Hemoglobina (Urina)".
                    Always extract the full unit of measurement, like "x10¹²/L" instead of just "x10¹²".
                    If a parameter lacks a reference range, use "ND" for the status.
                    
                    The insights should be concise and informative, providing a brief explanation of the significance of the value and its implications for health.
            `,
        },
        {
            role: "user",
            content: text
        }
    ];

    const response = await axios.post(url, {
        model: "gpt-4o-2024-08-06",
        messages: messages,
        max_tokens: 10000,
        n: 1
    }, {
        headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json"
        }
    });

    let outputText = response.data.choices[0].message.content;

    if (outputText.startsWith("```json")) {
        outputText = outputText.slice(7, -3).trim();
    } else if (outputText.startsWith("```")) {
        outputText = outputText.slice(3, -3).trim();
    } 

    let parsedResponse;
    try {
        parsedResponse = JSON.parse(outputText);
    } catch (error) {
        console.error('Failed to parse JSON from the model:', error);
        console.log('Output text:', outputText);
        return { parameters: null };
    }

    const parameters = parsedResponse.parameters || [];

    console.log('Parsed data:', { parameters });

    return { parameters };
}


app.post('/generate-smart-report', async (req, res) => {
    try {
        const { text } = req.body;

        const analysisSmartReport = await generateSmartReport(text);

        res.json({ analysisSmartReport });

    } catch (error) {
        console.error('Error generating smart report:', error);
        res.status(500).json({ error: 'Failed to generate smart report' });
    }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});