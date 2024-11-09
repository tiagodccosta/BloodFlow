import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { addDoc, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import BloodFlowLogo from "../../Assets/BloodflowLogo.png";
import { ref, uploadBytes, listAll, getDownloadURL, getMetadata } from 'firebase/storage';
import Spinner from '../Spinner';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAuth } from 'firebase/auth';
import DeletePopup from '../Dashboard/DeletePopup';

const Dashboard = () => {
    const [loadingWindow, setLoadingWindow] = useState(true);
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientTests, setPatientTests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

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
                    return {
                        name: itemRef.name,
                        url: fileURL,
                        createdAt: metadata.timeCreated,
                    };
                })
            );
    
            setPatientTests(fetchedTests);
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
        fileInput.accept = '.pdf';
        fileInput.onchange = async () => {
            const file = fileInput.files[0];
            if (file) {
                await uploadBloodTest(patientId, file);
            }
        };
        fileInput.click();
    };

    const uploadBloodTest = async (patientId, file) => {
        try {
            const fileRef = ref(storage, `FertilityCare/${patientId}/${file.name}`);
            
            await uploadBytes(fileRef, file);
    
            console.log("Blood Test file uploaded successfully.");
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const handlePatientSelect = async (patient) => {
        setSelectedPatient(patient);
        setPatientTests([]);

        try {
            fetchPatientTests(patient.id);
        } catch (error) {
            console.error("Error fetching patient tests:", error);
        }
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

    const handleDeleteClick = () => {
        setShowModal(true);
    }

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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
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
                            className="p-2 border rounded w-full mb-4"
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
                                    patientTests.map((test, index) => (
                                        <li key={index} className="p-2 text-xs text-gray-600">
                                            {test.name} - {formatDate(test.createdAt)}
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-xs">No test data available.</p>
                                )}
                            </ul>
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
                                    <div className="border-2 border-[#ff0000] rounded-lg p-2 md:p-4 md:border-4 flex-grow">
                                        <h1 className="text-md md:text-xl font-bold text-black py-1 md:py-2">Patient Information</h1>
                                        <p className="text-xs md:text-sm text-gray-600 py-1 md:py-2">
                                            <span className="font-bold mr-2">Name:</span>
                                            <span className="font-medium">{selectedPatient.name}</span>
                                        </p>
                                        <p className="text-xs md:text-sm text-gray-600 py-1 md:py-2">
                                            <span className="font-bold mr-2">Age:</span>
                                            <span className="font-medium">{selectedPatient.age}</span>
                                        </p>
                                        <p className="text-xs md:text-sm text-gray-600 py-1 md:py-2">
                                            <span className="font-bold mr-2">Excel File:</span>
                                            <span className="font-medium">excelFile.xslx - last updated at 13/10/24</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Right Container: Actions */}
                                <div className="w-full md:w-1/3 p-2 md:p-6 md:pl-4 flex flex-col items-center justify-center">
                                    <p className="font-bold text-black text-lg md:text-xl mb-2 md:mb-4 text-center -mt-6">Upload Patient Blood Test</p>
                                    <button 
                                        onClick={() => handleUploadNewTest(selectedPatient.id)} 
                                        className="bg-[#ff0000] w-40 text-sm md:w-52 rounded-md font-bold py-2 md:py-4 text-white"
                                    >
                                        Upload Blood Test
                                    </button>
                                    <button 
                                        onClick={handleDeleteClick} 
                                        className="w-40 text-sm md:w-52 rounded-md font-bold py-2 md:py-4 text-white mt-1 md:mt-2 md:-mb-8 bg-black"
                                    >
                                        Delete Patient
                                    </button>
                                    {showModal && (
                                        <DeletePopup
                                            show={showModal}
                                            onClose={() => setShowModal(false)}
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

                </div>
            </div>
        )
    );
};

export default Dashboard;
