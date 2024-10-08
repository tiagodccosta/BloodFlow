const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const { marked } = require('marked');
const { Storage } = require('@google-cloud/storage');
const admin = require('firebase-admin');
const firebase = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const PDFParser = require('pdf-parse');
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

const serviceAccount = JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf-8'));

const storage = new Storage({
    credentials: serviceAccount,
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

app.post('/send-email-contact', async (req, res) => {
    try {
        const { userEmail } = req.body;
    
        const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: `Get to Know BloodFlow!`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <div style="text-align: center;">
                        <img src="cid:logo" alt="BloodFlow Logo" style="width: 150px; margin-bottom: 20px;">
                    </div>
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

async function extractTextFromPdf(pdfUrl) {
    try {
        const pdfBytes = await fetch(pdfUrl)
            .then(res => res.arrayBuffer());
        const pdfData = new Uint8Array(pdfBytes);
        const pdfText = await PDFParser(pdfData);

        return pdfText.text;
    } catch (error) {
        console.error('Error in extractTextFromPdf:', error);
        throw error;
    }
}

app.post('/extract-text', async (req, res) => {
    try {
        const { pdfURL } = req.body;
        const pdfRef = pdfURL;        
        const extractedText = await extractTextFromPdf(pdfRef);
        res.json({ text: extractedText });
    } catch (error) {
        console.error('Error extracting text:', error);
        res.status(500).send('Internal Server Error');
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
                - Forneça uma visão geral dos principais resultados.
                - Destaque o estado geral de saúde.
                - Assegure que o resumo tem uma redação variada e estrutura diferente a cada vez para evitar repetição.

            4. **Análise Detalhada**:
                - **Comparação dos Resultados dos Testes**: Para os parâmetros mais relevantes, compare o valor atual com o intervalo de referência normal e valores anteriores (se houver).
                - **Valores Anormais**: Destaque claramente e explique a significância de quaisquer valores fora do intervalo normal.
                - **Tendências e Alterações**: Discuta quaisquer tendências ou alterações notáveis em comparação com os resultados de testes anteriores.
                - **Implicações Potenciais**: Explique as possíveis implicações para a saúde dos resultados anormais.
                - **Prognósticos**: Forneça uma perspetiva prognóstica com base nos resultados, indicando possíveis desfechos futuros de saúde se a tendência atual continuar.

            5. **Recomendações**: 
                - Sugira mais testes ou acompanhamentos que possam ser necessários para confirmar o diagnóstico ou obter mais informações.
                - Recomende mudanças no estilo de vida, ajustes na dieta ou tratamentos que possam ajudar a melhorar a condição do paciente.
                - Forneça conselhos médicos específicos ou precauções com base na análise. Assegure que as recomendações sejam práticas e exequíveis.

            6. **Avisos e Considerações**:
                - Destaque quaisquer valores críticos que requeiram atenção médica imediata.
                - Note quaisquer possíveis interferências ou fatores que possam afetar a precisão dos resultados (por exemplo, medicamentos, atividades recentes).

            Aqui estão os resultados das análises de sangue. O formato é:
            - Nome do Parâmetro: valor anterior 1 / valor anterior 2 valor atual unidades

            Por favor, use apenas o valor atual (o último valor) para a análise e mencione os valores anteriores apenas para comparação, se não houver valores anteriores use apenas o valor dado.
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
        max_tokens: 2500,
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});