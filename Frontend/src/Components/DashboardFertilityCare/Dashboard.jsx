import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { addDoc, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import BloodFlowLogo from "../../Assets/BloodflowLogo.png";
import { ref, uploadBytes, listAll, getDownloadURL, getMetadata, deleteObject } from 'firebase/storage';
import Spinner from '../Spinner';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAuth } from 'firebase/auth';
import DeletePatientPopup from './DeletePatientPopup';
import NewFilePopup from '../Dashboard/NewFilePopup';
import DeleteTestPopup from '../Dashboard/DeletePopup';
import SpinnerButton from './SpinnerButton';

const Dashboard = () => {
    const [loadingWindow, setLoadingWindow] = useState(true);
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedPatientTest, setSelectedPatientTest] = useState(null);
    const [patientTests, setPatientTests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showNewFileModal, setShowNewFileModal] = useState(false);
    const [showDeleteTestModal, setShowDeleteTestModal] = useState(false);
    const [excelFileName, setExcelFileName] = useState("");
    const [excelFile, setExcelFile] = useState(null);
    const [generatingExcelFile, setGeneratingExcelFile] = useState(false);

    const fetchPatients = async () => {
        try {
            const patientsCollection = collection(db, 'FertilityCare');
            const snapshot = await getDocs(patientsCollection);
            const patientsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPatients(patientsList);
            setFilteredPatients(patientsList);
        } catch (error) {
            console.error("Error fetching patients:", error);
        } finally {
            setLoadingWindow(false);
        }
    };

    const fetchPatientTests = async (patientId) => {
        try {
            const patientTestsRef = ref(storage, `FertilityCare/${patientId}`);
            const testFiles = await listAll(patientTestsRef);
    
            const fetchedTests = await Promise.all(
                testFiles.items.map(async (itemRef) => {
                    const fileURL = await getDownloadURL(itemRef);
                    const metadata = await getMetadata(itemRef);    
                    const createdAtDate = new Date(metadata.timeCreated);
    
                    return {
                        name: itemRef.name,
                        url: fileURL,
                        createdAt: createdAtDate,
                    };
                })
            );
    
            const sortedFiles = fetchedTests.sort((a, b) => a.createdAt - b.createdAt);
    
            setPatientTests(sortedFiles.map(file => ({
                name: file.name,
                date: file.createdAt.toLocaleDateString(),
                url: file.url,
            })));
        } catch (error) {
            console.error("Error fetching patient tests:", error);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        fetchPatientTests();
    }, []);
        
    const fetchPatientExcelFile = async (patientId) => {
        try {
            const patientExcelFileRef = ref(storage, `FertilityCare/${patientId}`);
            const fileList = await listAll(patientExcelFileRef);
    
            const excelFile = fileList.items.find((item) =>
                item.name.toLowerCase().endsWith(".xlsx")
            );
    
            if (excelFile) {
                const fileURL = await getDownloadURL(excelFile);
                const metadata = await getMetadata(excelFile);
    
                const formattedUpdatedAt = new Date(metadata.updated).toLocaleDateString();
                setExcelFile({
                    name: excelFile.name,
                    url: fileURL,
                    updatedAt: formattedUpdatedAt,
                });
            } else {
                setExcelFile(null);
            }
        } catch (error) {
            console.error("Error fetching patient Excel file:", error);
        }
    };

    const handleAddPatientClick = async () => {
        const name = prompt("Enter patient's iMed Number:");
        await addPatient(name);
    };

    const addPatient = async (name) => {
        const auth = getAuth();
        const user = auth.currentUser;
      
        if (!user) {
          console.error("User is not authenticated.");
          return;
        }
      
        try {
            const newPatient = {
                name,
                createdAt: new Date(),
                createdBy: user.uid,
            };
      
            const docRef = await addDoc(collection(db, 'FertilityCare'), newPatient);
            console.log('Patient added with ID:', docRef.id);

            fetchPatients();
        } catch (error) {
            console.error('Error adding patient:', error.message);
        }
      };

      const handleNewFileClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf';
        input.onchange = handleFileChange;
        input.click();
    };

    const handleFileChange = (event) => {
        setSelectedPatientTest(event.target.files[0]);
        setShowNewFileModal(true);
    };


    const uploadBloodTest = async (patientId) => {

        try {

            if(!selectedPatientTest) {
                return;
            }

            const fileRef = ref(storage, `FertilityCare/${patientId}/${selectedPatientTest.name}`);
            await uploadBytes(fileRef, selectedPatientTest);
            setShowNewFileModal(false);
            toast.success("Blood Test file uploaded successfully.");
            console.log("Blood Test file uploaded successfully.");

            setPatientTests([]);
            fetchPatientTests(patientId);
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const handlePatientSelect = async (patient) => {
        setSelectedPatient(patient);
        fetchPatientExcelFile(patient.id);
        setPatientTests([]);

        try {
            fetchPatientTests(patient.id);
        } catch (error) {
            console.error("Error fetching patient tests:", error);
        }
    };

    const handleTestSelect = (test) => {
        setSelectedPatientTest(test);
        setShowDeleteTestModal(true);
    };

    const handleSearchChange = (event) => {
        const term = event.target.value;
        setSearchTerm(term);
        searchPatientByName(term);
    };

    const searchPatientByName = (term) => {
        if (!term) {
            setFilteredPatients(patients);
            return;
        }
        const searchResults = patients.filter(patient => 
            patient.name.toLowerCase().includes(term.toLowerCase())
        );
        setFilteredPatients(searchResults);
    };

    const handleLogout = async () => {
        try {
            const auth = getAuth();
            await auth.signOut();
            toast.success("You have been logged out.");
            navigate('/');
        } catch (error) {
            toast.error("Error logging out.");
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    }

    const handleBloodTestSelection = (testName) => {
        const selectedTest = patientTests.find((test) => test.name === testName);
        setSelectedPatientTest(selectedTest);
    };

    const confirmDeletePatient = async (patientId) => {
        try {
            const patientDocRef = doc(db, 'FertilityCare', patientId);

            await deleteDoc(patientDocRef);
            toast.success("Patient deleted successfully.");
            fetchPatients();
            setSelectedPatient(null);
        } catch (error) {
            console.error("Error deleting patient:", error);
            toast.error("Error deleting patient.");
        }
    }

    const confirmDeleteTest = async () => {
        try {
            if (selectedPatientTest) {
                const testRef = ref(storage, `FertilityCare/${selectedPatient.id}/${selectedPatientTest.name}`);
                await deleteObject(testRef);
                toast.success("Blood test deleted successfully.");
    
                setPatientTests((tests) => tests.filter(test => test !== selectedPatientTest));
    
                setShowDeleteTestModal(false);
                setSelectedPatientTest(null);
            }
        } catch (error) {
            console.error("Error deleting blood test:", error);
            toast.error("Failed to delete blood test.");
        }
    };

    const generateExcelFileBackend = async (patientId, fileURL, excelFileName) => {

        try {
            const response = await fetch('http://localhost:4000/fertility-care/generate-excel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    patientId,
                    fileURL,
                    excelFileName
                })
            });

            const result = await response.json();
    
            if (!response.ok) {
                throw new Error("Failed to initiate Excel file generation.");
            } else if(response.ok) {
                const downloadLink = document.createElement('a');
                downloadLink.href = result.url;
                downloadLink.download = excelFileName;
                downloadLink.click();
            }
        } catch (error) {
            console.error("Backend request error:", error);
            throw error;
        }
    };

    const handleGenerateExcelFile = async () => {
        if (!selectedPatientTest || !excelFileName) {
            alert("Please select a blood test and provide a name for the Excel file.");
            return;
        }

        setGeneratingExcelFile(true);

        try {
            await generateExcelFileBackend(selectedPatient.id, selectedPatientTest.url, excelFileName);
            toast.success("Excel file generated successfully.");
            setGeneratingExcelFile(false);
        } catch (error) {
            setGeneratingExcelFile(false);
            console.error("Error generating Excel file:", error);
            toast.error("Failed to generate Excel file.");
        }
    };

    return (
        loadingWindow ? (
            <Spinner />
        ) : (
            <div className="flex h-screen">
                {/* Sidebar */}
                <div id="Sidebar" className="bg-white h-full md:w-1/5 sm:w-0 w-0 relative flex flex-col justify-between">
                    <div className="flex flex-col justify-start items-start w-full">
                        <img className="w-40 mx-auto -mt-2" src={BloodFlowLogo} alt="BloodFlow Logo" />
                    </div>

                    <div className="flex-grow p-2">
                        {/* Search Input */}
                        <input 
                            type="text" 
                            value={searchTerm} 
                            onChange={handleSearchChange} 
                            placeholder="Search for a patient..." 
                            className="p-2 border rounded w-full mb-4 text-sm"
                        />

                        {/* Patient List */}
                        <h3 className="font-bold text-gray-700 mb-2">Patients</h3>
                        <ul className="patient-list overflow-y-auto" style={{ minHeight: '200px', maxHeight: '200px' }}>
                            {filteredPatients.map((patient, index) => (
                                <li 
                                    key={index} 
                                    onClick={() => handlePatientSelect(patient)} 
                                    className={`cursor-pointer p-2 text-xs ${selectedPatient === patient ? 'bg-gray-300' : 'bg-white'}`}
                                >
                                    {patient.name}
                                </li>
                            ))}
                        </ul>

                        {/* Blood Tests List */}
                            <h3 className="font-bold text-gray-700 mb-2">Blood Tests</h3>
                            <ul className="blood-test-list overflow-y-auto" style={{ minHeight: '140px', maxHeight: '140px' }}>
                                {patientTests && patientTests.length > 0 ? (
                                    patientTests.slice().reverse().map((test, index) => (
                                        <li 
                                        key={index}
                                        onClick={() => handleTestSelect(test)}
                                        className={`p-2 text-xs cursor-pointer ${selectedPatientTest === test ? 'bg-gray-300' : 'bg-white'}`}>
                                            {test.name} - {test.date}
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-xs">No test data available.</p>
                                )}
                            </ul>
                            <DeleteTestPopup 
                                show={showDeleteTestModal}
                                onClose={() => setShowDeleteTestModal(false)}
                                onConfirm={confirmDeleteTest}
                            />
                    </div>
    
                    {/* Buttons at the bottom */}
                    <div className="absolute bottom-0 left-0 w-full py-4 px-4">
                        <button 
                            onClick={handleAddPatientClick} 
                            className="bg-[#ff0000] text-white font-bold text-sm w-full py-3 rounded-md my-2"
                        >
                            Add New Patient
                        </button>
    
                        <button className="bg-black w-full rounded-md font-bold py-3 text-white" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
    
                {/* Main Container */}
                <div className="main-container bg-gray-300 flex-grow overflow-y-auto pt-6 px-4 md:w-4/5 flex flex-col">
                    
                    {/* Title Container */}
                    <div className="bg-white w-full mb-6 shadow-md rounded-md px-6 py-4">
                        <h1 className="font-bold text-lg md:text-2xl text-[#ce3d3d]">
                            FertilityCare Dashboard
                        </h1>
                    </div>

                    {/* Patient Information Container */}
                    <div className="bg-white flex flex-col mb-4 shadow-md rounded-md md:flex-row">
                        {selectedPatient ? (
                            <>
                                {/* Left Container: Patient Details */}
                                <div className="w-full md:w-2/3 p-2 md:p-6 flex flex-col">
                                    <div className="border-2 border-[#ff0000] rounded-lg p-2 md:px-4 py-6 md:border-4 flex-grow">
                                        <h1 className="text-md md:text-xl font-bold text-black py-1 md:py-4">Patient Information</h1>
                                        <p className="text-xs md:text-sm text-gray-600 py-1 md:py-4">
                                            <span className="font-bold mr-2">iMed Number:</span>
                                            <span className="font-medium">{selectedPatient.name}</span>
                                        </p>
                                        <p className="text-xs md:text-sm text-gray-600 py-1 md:py-4">
                                            <span className="font-bold mr-2">Excel File:</span>
                                            {excelFile ? (
                                                <span className="font-medium">
                                                    {excelFile.name} - last updated at {excelFile.updatedAt}
                                                </span>
                                            ) : (
                                                <span className="font-medium">No Excel file available</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Right Container: Actions */}
                                <div className="w-full md:w-1/3 p-2 md:p-6 md:pl-4 flex flex-col items-center justify-center">
                                    <p className="font-bold text-black text-lg md:text-xl mb-2 md:mb-4 text-center -mt-6">Upload Patient Blood Test</p>
                                    <button 
                                        onClick={() => handleNewFileClick()} 
                                        className="bg-[#ff0000] w-40 text-sm md:w-52 rounded-md font-bold py-2 md:py-4 text-white"
                                    >
                                        Upload Blood Test
                                    </button>
                                    {showNewFileModal && (
                                        <NewFilePopup
                                            show={showNewFileModal}
                                            onClose={() => setShowNewFileModal(false)}
                                            onConfirm={() => uploadBloodTest(selectedPatient.id)}
                                            fileName={selectedPatientTest.name}
                                        />
                                    )}
                                    <button 
                                        onClick={handleDeleteClick} 
                                        className="w-40 text-sm md:w-52 rounded-md font-bold py-2 md:py-4 text-white mt-1 md:mt-2 md:-mb-8 bg-black"
                                    >
                                        Delete Patient
                                    </button>
                                    {showDeleteModal && (
                                        <DeletePatientPopup
                                            show={showDeleteModal}
                                            onClose={() => setShowDeleteModal(false)}
                                            onConfirm={() => confirmDeletePatient(selectedPatient.id)}
                                        />
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-grow p-2 md:p-5">
                                <h1 className="text-lg md:text-xl font-bold text-black">Patient Information</h1>
                                <div className="w-full p-2 md:p-6 flex items-center justify-center">
                                    <h1 className="text-lg md:text-xl font-bold text-gray-500 p-4 md:p-10">No Patient Selected</h1>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white shadow-md rounded-md px-10 py-8 mt-4 mb-8">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Generate Excel File</h2>
                        
                        {/* Blood Test Selection Dropdown */}
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Blood Test:</label>
                        <select 
                            value={selectedPatientTest ? selectedPatientTest.name : ''} 
                            onChange={(e) => handleBloodTestSelection(e.target.value)} 
                            className="border border-gray-300 rounded-md p-2 w-full mb-4"
                        >
                            <option value="" disabled>Select a test</option>
                            {patientTests.slice().reverse().map((test) => (
                                <option key={test.name} value={test.name}>
                                    {test.name} - {test.date}
                                </option>
                            ))}
                        </select>

                        {/* Excel File Name Input */}
                        <label className="block text-sm font-medium text-gray-700 mb-2">Excel File Name:</label>
                        <input 
                            type="text" 
                            value={excelFileName} 
                            onChange={(e) => setExcelFileName(e.target.value)} 
                            placeholder="Enter file name..." 
                            className="border border-gray-300 rounded-md p-2 w-full mb-4"
                        />

                        {/* Generate Excel Button */}
                        <div className="flex items-center justify-center space-x-2">
                            <SpinnerButton 
                                onClick={handleGenerateExcelFile} 
                                isLoading={generatingExcelFile}
                                >
                                {generatingExcelFile ? 'Generating...' : 'Generate Excel File'}
                            </SpinnerButton>
                        </div>  
                    </div>
                </div>
            </div>
        )
    );
};

export default Dashboard;