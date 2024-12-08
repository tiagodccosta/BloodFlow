import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { addDoc, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import BloodFlowLogo from "../../Assets/BloodflowLogo.png";
//import { ref, uploadBytes, listAll, getDownloadURL, getMetadata, deleteObject } from 'firebase/storage';
import Spinner from '../Spinner';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAuth } from 'firebase/auth';
import DeletePatientPopup from '../DashboardFertilityCare/DeletePatientPopup';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import MultiStepForm from './MultiStepForm/MultiStepForm';

const Dashboard = () => {
    const [loadingWindow, setLoadingWindow] = useState(true);
    const [nav, setNav] = useState(false);
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [consultationNumber, setConsultationNumber] = useState(0);

    const fetchPatients = async () => {
        try {
            const patientsCollection = collection(db, 'FertilityCareFollowUp');
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
      
            const docRef = await addDoc(collection(db, 'FertilityCareFollowUp'), newPatient);
            console.log('Patient added with ID:', docRef.id);

            fetchPatients();
        } catch (error) {
            console.error('Error adding patient:', error.message);
        }
    };

    const resetFormState = () => {
        setShowForm(false);
        setConsultationNumber(0);
    };

    const handlePatientSelect = async (patient) => {
        if (showForm) {
            const confirmSwitch = window.confirm(
                "A form is currently open for another patient. Switching patients will discard the current form. Do you want to continue?"
            );
            if (!confirmSwitch) return;
        }
    
        resetFormState();
        setSelectedPatient(patient);
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

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleNewFormClick = () => {
        if (!selectedPatient) {
            toast.error('Please select a patient first.');
            return;
        }
    
        const consultNumber = prompt('Enter consultation number (1-8):');
        const parsedConsultNumber = parseInt(consultNumber, 10);
    
        if (!consultNumber || isNaN(parsedConsultNumber) || parsedConsultNumber < 1 || parsedConsultNumber > 8) {
            toast.error('Please enter a valid consultation number between 1 and 8.');
            return;
        }
    
        setConsultationNumber(parsedConsultNumber);
        setShowForm(true);
    };

    const handleLogout = async () => {
        try {
            const auth = getAuth();
            await auth.signOut();
            setSelectedPatient(null);
            setShowForm(false);
            setConsultationNumber(0);
            toast.success("You have been logged out.");
            navigate('/');
        } catch (error) {
            toast.error("Error logging out.");
        }
    };

    const confirmDeletePatient = async (patientId) => {
        try {
            const patientDocRef = doc(db, 'FertilityCareFollowUp', patientId);

            await deleteDoc(patientDocRef);
            toast.success("Patient deleted successfully.");
            fetchPatients();
            setSelectedPatient(null);
        } catch (error) {
            console.error("Error deleting patient:", error);
            toast.error("Error deleting patient.");
        }
    }
    
    const handleSideBar = () => {
        setNav(!nav);
    }

    return (
        loadingWindow ? (
            <Spinner />
        ) : (
            <div className="flex h-screen">
                {/* Sidebar */}
                <div id="Sidebar" className="bg-white hidden md:flex flex-col h-full md:w-1/5 sm:w-0 w-0 relative">
                    <div className="justify-start items-start w-full">
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
                        <div className="flex-grow p-2">
                            <h3 className="font-bold text-gray-700">Patients</h3>
                            {patients.length === 0 ? (
                                <p className="text-sm text-gray-500">No patients available. Add a new patient to get started.</p>
                            ) : (
                                <ul className="patient-list overflow-y-auto" style={{ minHeight: '350px', maxHeight: '350px' }}>
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
                            )}
                        </div>
                    </div>
    
                    {/* Buttons at the bottom */}
                    <div className="absolute bottom-0 left-0 w-full py-4 px-4">
                        <button 
                            onClick={handleAddPatientClick} 
                            className="bg-[#ff0000] text-white cursor-pointer font-bold text-sm w-full py-3 rounded-md my-2"
                        >
                            Add New Patient
                        </button>
    
                        <button className="bg-black w-full cursor-pointer rounded-md font-bold py-3 text-white" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>

                <div className={`${nav ? 'fixed' : 'hidden'} left-0 top-0 w-3/5 h-full bg-white flex flex-col ease-in-out duration-500 z-40`}>
                    <img className="w-40 mx-auto -mt-2" src={BloodFlowLogo} alt="BloodFlow Logo" />
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
                        <div className="flex-grow p-2">
                            <h3 className="font-bold text-gray-700">Patients</h3>
                            {patients.length === 0 ? (
                                <p className="text-sm text-gray-500">No patients available. Add a new patient to get started.</p>
                            ) : (
                                <ul className="patient-list overflow-y-auto" style={{ minHeight: '350px', maxHeight: '350px' }}>
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
                            )}
                        </div>              
                    </div>
    
                    {/* Buttons at the bottom */}
                    <div className="absolute bottom-0 left-0 w-full py-4 px-4">
                        <button 
                            onClick={handleAddPatientClick} 
                            className="bg-[#ff0000] text-white w-full cursor-pointer font-bold text-sm py-3 rounded-md my-2"
                        >
                            Add New Patient
                        </button>
    
                        <button className="bg-black w-full text-sm rounded-md cursor-pointer font-bold py-3 text-white" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
    
                {/* Main Container */}
                <div className="main-container bg-gray-300 flex-grow overflow-y-auto pt-6 px-4 md:w-4/5 flex flex-col">
                    
                    {/* Title Container */}
                    <div className="bg-white w-full mb-6 shadow-md rounded-md flex justify-between items-center font-bold text-lg md:text-2xl text-[#ce3d3d] p-6">
                        <h1>
                            FertilityCare Dashboard
                        </h1>
                        <div className="md:hidden" onClick={handleSideBar}>
                            {nav ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
                        </div>
                    </div>

                    {/* Patient Information Container */}
                    <div className="bg-white flex flex-col mb-4 shadow-md rounded-md md:flex-row py-4">
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
                                    </div>
                                </div>

                                {/* Right Container: Actions */}
                                <div className="w-full md:w-1/3 p-2 md:p-6 md:pl-4 flex flex-col items-center justify-center mt-4 mb-4">
                                    <p className="font-bold text-black text-lg md:text-xl mb-2 md:mb-4 text-center -mt-6">Start New Consultation Follow Up Form</p>
                                    <button 
                                        onClick={handleNewFormClick}
                                        className="bg-[#ff0000] w-40 text-sm md:w-52 cursor-pointer rounded-md font-bold py-2 md:py-4 text-white"
                                    >
                                        New Form
                                    </button>
                                    <button 
                                        onClick={handleDeleteClick} 
                                        className="w-40 text-sm md:w-52 rounded-md cursor-pointer font-bold py-2 md:py-4 text-white mt-1 md:mt-2 md:-mb-8 bg-black"
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
                        {showForm && selectedPatient && consultationNumber ? (
                            <div>
                                <h1 className="text-xl font-bold text-black mb-4">
                                    Consultation {consultationNumber} Follow-Up Form
                                </h1>
                                <MultiStepForm
                                    patientId={selectedPatient.id}
                                    consultationNumber={consultationNumber}
                                    onFormComplete={() => resetFormState()}
                                />
                            </div>
                        ) : (
                            <p>Select a patient and click "New Form" to start the consultation form.</p>
                        )}
                    </div>
                </div>
            </div>
        )
    );
};

export default Dashboard;