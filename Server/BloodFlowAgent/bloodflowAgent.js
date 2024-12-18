const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const axios = require("axios");
const fse = require("fs-extra");
require("dotenv").config();

// Configuration
const PATIENTS_FOLDER = path.resolve(__dirname, "../Patients");
const RESULTS_FOLDER = path.resolve(__dirname, "../Results");
const BLOODFLOW_API_URL = "http://localhost:4000/ai-agent/analyse";

// Helper function to send file to BloodFlow API
const analyzeBloodTest = async (filePath, patientName) => {
    try {
        console.log(`Analyzing: ${filePath}`);
        const pdfBuffer = fs.readFileSync(filePath);
        const pdfFile = Buffer.from(pdfBuffer).toString("base64");

        const response = await axios.post(BLOODFLOW_API_URL, {
            pdfFile: pdfFile,
            userName: patientName,
        }, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        return response.data;
    } catch (error) {
        console.error(`Error analyzing file ${filePath}:`, error.message);
        return null;
    }
};

// Helper function to save results
const saveResults = async (resultData, filePath, patientName) => {
    try {
        const resultFolder = path.join(RESULTS_FOLDER, patientName);
        await fse.ensureDir(resultFolder);

        const resultFileName = `${path.basename(filePath, ".pdf")}_result.json`;
        const resultFilePath = path.join(resultFolder, resultFileName);

        fs.writeFileSync(resultFilePath, JSON.stringify(resultData, null, 2));
        console.log(`Results saved to: ${resultFilePath}`);
    } catch (error) {
        console.error(`Error saving results:`, error.message);
        console.error(error.stack);
    }
};

let processingQueue = [];
let isProcessing = false;
let delayTimeout;

// Function to process PDFs sequentially
const processQueue = async () => {
    if (processingQueue.length > 0 && !isProcessing) {
        const { filePath, patientName } = processingQueue[0];

        isProcessing = true;

        const result = await analyzeBloodTest(filePath, patientName);

        if (result) {
            console.log(`Successfully analyzed: ${filePath}`);
            try {
                await saveResults(result, filePath, patientName);
            } catch (error) {
                console.error(`Error saving results for ${filePath}:`, error);
            }
        } else {
            console.log(`Failed to analyze: ${filePath}`);
        }

        processingQueue.shift();
        console.log(`Queue length: ${processingQueue.length}`);

        isProcessing = false;

        // Process the next file after a short delay
        setTimeout(processQueue, 500);
    } else if (processingQueue.length === 0) {
        console.log("No more files in the queue.");
    }
};

// Function to add files to the queue
const addToQueue = (filePath, patientName) => {
    const alreadyQueued = processingQueue.some(item => item.filePath === filePath);

    if (!alreadyQueued) {
        processingQueue.push({ filePath, patientName });
        console.log(`File added to queue: ${filePath} | Current queue size: ${processingQueue.length}`);
    } else {
        console.log(`File already in queue: ${filePath}`);
    }

    if (!isProcessing) {
        processQueue();
    }
};
  
// Monitor patient folders for new PDFs
const monitorPatientFolders = () => {
    console.log("Agent started. Monitoring folders for new blood tests...");
  
    // Watch all folders inside the patients folder
    const watcher = chokidar.watch(`${PATIENTS_FOLDER}`, {
      persistent: true,
      ignoreInitial: false, // Watch existing files
    });
  
    watcher.on("add", (filePath) => {
        console.log(`New blood test detected: ${filePath}`);
        const patientName = path.basename(path.dirname(filePath));
    
        // Directly add the detected file to the queue
        addToQueue(filePath, patientName);
    });

  
    watcher.on("change", (filePath) => {
      console.log(`File changed: ${filePath}`);
    });
  
    watcher.on("unlink", (filePath) => {
      console.log(`File deleted: ${filePath}`);
    });
  
    watcher.on("error", (error) => console.error(`Watcher error: ${error}`));
  };
  
  // Start the agent
  monitorPatientFolders();
