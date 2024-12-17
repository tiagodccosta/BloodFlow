const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const axios = require("axios");
const fse = require("fs-extra");
const { time } = require("console");
require("dotenv").config();

// Configuration
const PATIENTS_FOLDER = path.resolve(__dirname, "../Patients");
const RESULTS_FOLDER = path.resolve(__dirname, "..//Results");
const BLOODFLOW_API_URL = "http://localhost:4000/ai-agent/analyse"; // Replace with your BloodFlow API URL
// const API_KEY = "your_api_key_here"; // If needed for authentication

// Log the folders to ensure they are correct
console.log("Patients Folder:", PATIENTS_FOLDER);
console.log("Results Folder:", RESULTS_FOLDER);

// Helper function to send file to BloodFlow API
const analyzeBloodTest = async (filePath, patientName) => {
    try {
        console.log(`Analyzing: ${filePath}`);
      
        // Read the PDF file as a buffer
        const pdfBuffer = fs.readFileSync(filePath);
        const pdfFile = Buffer.from(pdfBuffer).toString("base64");

  
        // Send the PDF file as base64 to BloodFlow API
        const response = await axios.post(BLOODFLOW_API_URL, {
            pdfFile: pdfFile,
            userName: patientName,
        }, {
            headers: {
            "Content-Type": "application/json", // Send JSON data
            },
        });
  
        // Return the analysis result
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
    await fse.ensureDir(resultFolder); // Create folder if it doesn't exist

    // Define result file name (JSON or TXT)
    const resultFileName = `${path.basename(filePath, ".pdf")}_result.json`;
    const resultFilePath = path.join(resultFolder, resultFileName);

    // Save result to file
    fs.writeFileSync(resultFilePath, JSON.stringify(resultData, null, 2));
    console.log(`Results saved to: ${resultFilePath}`);
  } catch (error) {
    console.error(`Error saving results:`, error.message);
    console.error(error.stack);
  }
};

const logPatientFoldersContents = () => {
    console.log("Logging contents of Patients folder...");
  
    const patientFolders = fs.readdirSync(PATIENTS_FOLDER);
  
    patientFolders.forEach((folder) => {
      const folderPath = path.join(PATIENTS_FOLDER, folder);
      if (fs.statSync(folderPath).isDirectory()) {
        console.log(`Contents of ${folder}:`);
  
        const files = fs.readdirSync(folderPath);
        if (files.length === 0) {
          console.log(`  No files found in ${folder}`);
        } else {
          files.forEach((file) => {
            console.log(`  - ${file}`);
          });
        }
      }
    });
};
  

// Monitor patient folders for new PDFs
const monitorPatientFolders = () => {
    console.log("Agent started. Monitoring folders for new blood tests...");

    logPatientFoldersContents();
  
    // Log all monitored patient folders for debugging
    console.log("Monitoring patient folders:");
    fs.readdirSync(PATIENTS_FOLDER).forEach(folder => {
      const folderPath = path.join(PATIENTS_FOLDER, folder);
      if (fs.statSync(folderPath).isDirectory()) {
        console.log(`Monitoring: ${folderPath}`);
      }
    });
  
    // Watch all folders inside the patients folder
    const watcher = chokidar.watch(`${PATIENTS_FOLDER}`, {
      persistent: true,
      ignoreInitial: false, // Watch existing files
      depth: 2,
    });
  
    watcher.on("add", async (filePath) => {
      console.log(`New blood test detected: ${filePath}`);
  
      // Extract patient name and analyze the blood test
      const patientName = path.basename(path.dirname(filePath)); // Get folder name (patient name)
      
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

let processingQueue = []; // This will store the files to be processed
let isProcessing = false; // Flag to track if a file is currently being processed

// Function to process PDFs sequentially
const processQueue = async () => {
  // If the queue has files and we're not already processing, start processing
  if (processingQueue.length > 0 && !isProcessing) {
    const { filePath, patientName } = processingQueue[0]; // Get the first file in the queue

    // Set the flag to indicate that we are processing
    isProcessing = true;

    // Process the file
    const result = await analyzeBloodTest(filePath, patientName);

    if (result) {
        console.log(`Successfully analyzed: ${filePath}`);
      
        // Await saveResults to ensure it completes before continuing
        try {
            await saveResults(result, filePath, patientName);
        } catch (error) {
            console.error(`Error saving results for ${filePath}:`, error);
        }
      } else {
          console.log(`Failed to analyze: ${filePath}`);
    }

    // Remove the file from the queue once processed
    processingQueue.shift();

    // Reset the flag and recursively process the next file in the queue
    isProcessing = false;
    setTimeout(processQueue, 1000);
  } else {
    console.log('No more files in the queue.');
  }
};

// Function to add files to the queue and start the process
const addToQueue = (filePath, patientName) => {
  processingQueue.push({ filePath, patientName });

  // If no file is being processed, start processing
  if (!isProcessing) {
    processQueue();
  }
};
  
  // Start the agent
  monitorPatientFolders();
