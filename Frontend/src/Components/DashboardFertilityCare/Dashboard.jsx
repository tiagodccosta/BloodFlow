import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import BloodFlowLogo from "../../Assets/BloodflowLogo.png";
import Spinner from '../Spinner';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAuth } from 'firebase/auth';

const Dashboard = () => {
    const [loadingWindow, setLoadingWindow] = useState(true);
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientTests, setPatientTests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

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

    useEffect(() => {
        fetchPatients();
    }, []);


    const handleAddPatientClick = async () => {
        const name = prompt("Enter patient's name:");
        const age = prompt("Enter patient's age:");
        await addPatient(name, age);
    };

    const addPatient = async (name, age) => {
        const auth = getAuth();
        const user = auth.currentUser;
      
        if (!user) {
          console.error("User is not authenticated.");
          return;
        }
      
        try {
            const newPatient = {
                name,
                age,
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

    const handleUploadNewTest = async (patientId) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.xlsx';
        fileInput.onchange = async () => {
            const file = fileInput.files[0];
            if (file) {
                await uploadExcelFile(patientId, file);
            }
        };
        fileInput.click();
    };

    const uploadExcelFile = async (patientId, file) => {
        try {
            const fileRef = storage.ref(`FertilityCare/${patientId}/${file.name}`);
            await fileRef.put(file);
            const fileURL = await fileRef.getDownloadURL();
            await db.collection('FertilityCare').doc(patientId).update({ excelFile: fileURL });
            console.log("Excel file uploaded successfully.");
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const handlePatientSelect = (patient) => {
        setSelectedPatient(patient);
        // Fetch test data for selected patient, if available
        setPatientTests([]); // Reset test data if switching patients
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
            // Logout user
            const auth = getAuth();
            await auth.signOut();
            toast.success("You have been logged out.");
            navigate('/');
        } catch (error) {
            toast.error("Error logging out.");
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
    
                        {/* Clinic-specific options */}
                        <ul className="w-full sm:text-xs md:text-xs lg:text-sm p-2 font-medium text-gray-600">
                            {/* Search Input */}
                            <input 
                                type="text" 
                                value={searchTerm} 
                                onChange={handleSearchChange} 
                                placeholder="Search for a patient..." 
                                className="p-2 border rounded mb-4 w-full"
                            />
    
                            {/* Patient List */}
                            <h3 className="font-bold text-gray-700 py-2">Patients</h3>
                            <ul className="patient-list overflow-y-auto" style={{ maxHeight: '400px' }}>
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
                        </ul>
                    </div>
    
                    {/* Buttons at the bottom */}
                    <div className="flex flex-col items-center mb-6 mx-4">
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
                    
                    {/* Title */}
                    <div className="bg-white w-full mb-6 shadow-md rounded-md">
                        <div className='flex justify-between items-center font-bold text-lg md:text-2xl text-[#ce3d3d] p-6'>
                            {selectedPatient ? (
                                <h1>{`Patient: ${selectedPatient.name}`}</h1>
                            ) : (
                                <h1>FertilityCare Dashboard</h1>
                            )}
                        </div>
                    </div>
    
                    {/* Patient-specific data */}
                    {selectedPatient ? (
                        <>
                            {/* Upload New Blood Test for Patient */}
                            <div className="flex justify-center mb-4">
                                <button 
                                    onClick={() => handleUploadNewTest(selectedPatient.id)} 
                                    className="bg-[#ff0000] w-40 rounded-md font-bold py-2 text-white"
                                >
                                    Upload Blood Test
                                </button>
                            </div>
    
                            {/* Test Results and Analysis */}
                            <div className="bg-white mb-6 shadow-md rounded-md p-6" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {patientTests.length > 0 ? (
                                    <ul>
                                        {patientTests.map((test, index) => (
                                            <li key={index}>
                                                {test.date}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No test data available.</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-gray-500 mt-10">
                            <p>Select a patient to view their information and test results.</p>
                        </div>
                    )}
                </div>
            </div>
        )
    );
};

export default Dashboard;
