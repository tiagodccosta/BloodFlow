import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import {auth, storage, db} from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { ref, listAll, getMetadata, uploadBytes, getDownloadURL, updateMetadata, deleteObject } from "firebase/storage";
import BloodFlowLogo from "../../Assets/BloodflowLogo.png";
import BloodFlowLogoNL from "../../Assets/BloodflowLogoNoLetters.png";
import PDF_ICON from "../../Assets/pdf-icon.png";
import { toast } from 'react-toastify';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import MyBarChart from './BarGraph';
import CircularChart from './RadialGraph';
import axios from "axios"; 
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DeletePopup from './DeletePopup';
import NewFilePopup from './NewFilePopup';
import EditPersonalInfo from './EditPersonalInfo';

/*
import ImageClinica2 from "../../Assets/clinicaSaoCristovao_2.jpeg";
import ImageClinica3 from "../../Assets/clinicaSaoCristovao_3.jpeg";
import ImageClinica4 from "../../Assets/clinicaSaoCristovao_4.jpeg";
import ImageClinica5 from "../../Assets/clinicaSaoCristovao_5.jpeg";
import bloodTestResults from "../../Assets/bloodTestResults.png";
*/

import Spinner from '../Spinner';
import { useTranslation } from 'react-i18next';

function Dashboard() {

    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userAge, setUserAge] = useState(null);
    const [nav, setNav] = useState(false);
    const navigate = useNavigate();
    const [resultsVisible, setResultsVisible] = useState(false);
    const [userFiles, setUserFiles] = useState([]);
    const [selectedFileData, setSelectedFileData] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [fileScores, setFileScores] = useState([]);
    const [analysisResult, setAnalysisResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [scores, setScores] = useState([]);
    const [analysisPerformed, setAnalysisPerformed] = useState(false);
    const [displayedText, setDisplayedText] = useState("");
    const [index, setIndex] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [showNewFileModal, setShowNewFileModal] = useState(false);
    //const [userLocation, setUserLocation] = useState(null);
    // const [sendingEmail, setSendingEmail] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [loadingWindow, setLoadingWindow] = useState(true);
    // const [availability, setAvailability] = useState([{ day: '', startTime: '', endTime: '' }]);
    // const [downloadingAnalysis, setDownloadingAnalysis] = useState(false);
    const analysisContainerRef = useRef(null);

    const { t } = useTranslation();

    // const mapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        const timer = setTimeout(() => {
          setLoadingWindow(false);
        }, 3000);
    
        return () => clearTimeout(timer);
      }, []);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setUser(user);
                const userData = await fetchUserData(user);
                if (userData.dateOfBirth) {
                    const dateOfBirth = new Date(userData.dateOfBirth.seconds * 1000);
                    const today = new Date();
                    const age = today.getFullYear() - dateOfBirth.getFullYear();
                    setUserAge(age);
                }
            } else {
                setUser(null);
                navigate('/login');
            }
        });
        return () => unsubscribe();
    }, [navigate, userAge]);
    
    useEffect(() => {
        if (user) {
            fetchUserData(user);
        }
    }, [user]);
    
    const fetchUserData = async (user) => {
        try {
            const userId = user.uid;
            const userDocRef = doc(db, "users", userId);
            const userDocSnapshot = await getDoc(userDocRef);
            if (userDocSnapshot.exists()) {
                const userData = userDocSnapshot.data();
                setUserData(userData);
                return userData;
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    };

    useEffect(() => {
        const fetchUserFiles = async () => {
            try {
                if (!user || !userData) return;
    
                const userId = auth.currentUser.uid;
                const userFilesRef = ref(storage, `bloodTestResults/${userId}`);
                const userFilesList = await listAll(userFilesRef);
    
                const filesWithMetadata = await Promise.all(userFilesList.items.map(async (item) => {
                    const metadata = await getMetadata(item);
                    return { name: item.name, time: metadata.timeCreated };
                }));
    
                const sortedFiles = filesWithMetadata.sort((a, b) => new Date(a.time) - new Date(b.time));
    
                setUserFiles(sortedFiles.map(file => file.name));
    
                if (sortedFiles.length === 0) {

                } else {
                    const scores = await Promise.all(sortedFiles.map(async (file) => {
                        const fileRef = ref(storage, `bloodTestResults/${userId}/${file.name}`);
                        const metadata = await getMetadata(fileRef);
                        return { time: metadata.timeCreated, score: parseFloat(metadata.customMetadata?.score || '0'), name: metadata.name };
                    }));
    
                    setFileScores(scores.filter(score => score !== null));
    
                    const latestFile = sortedFiles[sortedFiles.length - 1].name;
                    if (latestFile) {
                        handleFileClick(latestFile);
                    }
                }
    
            } catch (error) {
                toast.error(`${t('ficheirosErroToast')} ${userData.username}!`);
            }
        };
    
        if (user) {
            fetchUserFiles();
        }
        // eslint-disable-next-line
    }, [user, userData]);

    const fetchUpdatedScores = async () => {
        try {
            const userId = auth.currentUser.uid;
            const userFilesRef = ref(storage, `bloodTestResults/${userId}`);
            const userFilesList = await listAll(userFilesRef);

            const filesWithMetadata = await Promise.all(userFilesList.items.map(async (item) => {
                const metadata = await getMetadata(item);
                return { name: item.name, time: metadata.timeCreated };
            }));

            const sortedFiles = filesWithMetadata.sort((a, b) => new Date(a.time) - new Date(b.time));

            setUserFiles(sortedFiles.map(file => file.name));

            if (sortedFiles.length === 0) {

            } else {
                const scores = await Promise.all(sortedFiles.map(async (file) => {
                    const fileRef = ref(storage, `bloodTestResults/${userId}/${file.name}`);
                    const metadata = await getMetadata(fileRef);
                    return { time: metadata.timeCreated, score: parseFloat(metadata.customMetadata?.score || '0'), name: metadata.name };
                }));

                setFileScores(scores.filter(score => score !== null));
            }

        } catch (error) {
            toast.error(t('erroResultadosToast'));
        }
    };

    const handleFileClick = useCallback (async (fileName) => {
        try {
            const userId = auth.currentUser.uid;
            const fileRef = ref(storage, `bloodTestResults/${userId}/${fileName}`);

            try {
                const metadata = await getMetadata(fileRef);
                setSelectedFileData(metadata);
                if(metadata.customMetadata?.analysis !== undefined) {
                    setDisplayedText(metadata.customMetadata?.analysis);
                    setAnalysisPerformed(true);
                } else {
                    setAnalysisPerformed(false);
                }    
            } catch (error) {
                toast.error(t('erroFicheiroSelecionado'));
                return;
            }
        } catch (error) {
            toast.error(t('erroFicheiroAgain'));
        }
    }, [t]);

    const handleAnalyzeClick = async () => {
        setLoading(true);
        try {
            const userId = auth.currentUser.uid;
            const fileRef = ref(storage, `bloodTestResults/${userId}/${selectedFileData.name}`);

            try {
                const metadata = await getMetadata(fileRef);
                setSelectedFileData(metadata);

                if(metadata.customMetadata?.analysis !== undefined) {
                    setDisplayedText(metadata.customMetadata.analysis);
                    setLoading(true);
                    setTimeout(() => {
                        setAnalysisPerformed(true);
                        analysisContainerRef.current.scrollIntoView({ behavior: 'smooth' });
                    }, 800);
                    return;
                }
            } catch (error) {
                console.error('Error fetching file metadata:', error);
            }
        } catch (error) {
            console.error('Error fetching file metadata:', error);
        } finally {
            setLoading(false);
        }

        setLoading(true);
        setTimeout(() => {
            setAnalysisPerformed(true);
            analysisContainerRef.current.scrollIntoView({ behavior: 'smooth' });
        }, 1200);

        try {
            const userId = auth.currentUser.uid;
    
            const fileRef = ref(storage, `bloodTestResults/${userId}/${selectedFileData.name}`);
            const downloadURL = await getDownloadURL(fileRef);
            
            const text = await convertPDFToText(downloadURL);
        
            const analysis = await analyseBloodTest(text);
            setDisplayedText("");
            setAnalysisResult(analysis);
    
            const score = extractScoreFromAnalysis(analysis);
            setScores([...scores, { time: new Date().toLocaleDateString(), score }]);
            setAnalysisPerformed(true);

            const fileMetadata = await getMetadata(fileRef);

            await updateMetadata(fileRef, {
                customMetadata: {
                    ...fileMetadata.customMetadata,
                    score: parseFloat(score),
                    analysis: analysis
                }
            });

            await fetchUpdatedScores();
        } catch (error) {
            toast.error(t('erroAnalise'));
            setAnalysisPerformed(false);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setUploadSuccess(false);
        setShowNewFileModal(true);
    };
    
    const handleUpload = async () => {
        try {
            if (!selectedFile) {
                return;
            }

            const userId = auth.currentUser.uid;
            const storageRef = ref(storage, `bloodTestResults/${userId}/${selectedFile.name}`);
            await uploadBytes(storageRef, selectedFile);

            setUploadSuccess(true);
            setShowNewFileModal(false);
            
            toast.success(t('ficheiroCarregado'));
            window.location.reload();
        } catch (error) {
            toast.error(t('erroFicheiroAgain'))
        }
    };

    const handleNewFileClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf';
        input.onchange = handleFileChange;
        input.click();
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success(t('logout'));
            navigate('/');
        } catch (error) {
            toast.error(t('logoutError'));
        }
    };

    const handleSideBar = () => {
        setNav(!nav);
    };

    useEffect(() => {
        const closeBarOnResize = () => {
            if (window.innerWidth > 768 && nav) {
                setNav(false);
            }
        };

        window.addEventListener('resize', closeBarOnResize);

        return () => {
            window.removeEventListener('resize', closeBarOnResize);
        };
    }, [nav]);

    const toggleResults = () => {
        setResultsVisible(!resultsVisible);
    }

    const convertPDFToText = async (pdfURL) => {
        try {
            const response = await fetch(`${BASE_URL}/extract-text`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pdfURL }),
              });

              if (response.status === 400) {
                const { message } = await response.json();
                const password = prompt(message);
                
                if (password) {
                    const unlockResponse = await fetch(`${BASE_URL}/submit-password`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ pdfURL, password }),
                    });
    
                    if (unlockResponse.ok) {
                        const unlockData = await unlockResponse.json();
                        return unlockData.extractedText;
                    } else {
                        console.error('Failed to unlock PDF:', unlockResponse.statusText);
                        throw new Error('Failed to unlock PDF');
                    }
                } else {
                    throw new Error('Password input was canceled');
                }
              }
      
              const data = await response.json();
              return data.text;
            } catch (error) {
              console.error('Error fetching text:', error);
            }
    };

    function getLanguageFromDomain() {
        const domain = window.location.hostname;
  
        if (domain === 'bloodflow.eu' || domain === 'www.bloodflow.eu') {
            return 'en';
        } else if (domain === 'bloodflow.pt' || domain === 'www.bloodflow.pt') {
            return 'pt';
        }

        return 'en';
    }

    const analyseBloodTest = async (text) => {
        const language = getLanguageFromDomain();
        const userName = userData.username;
        const age = userAge;
        const medicalCondition = userData.medicalCondition;
    
        try {
            const response = await axios.post(`${BASE_URL}/analyze-blood-test`, {
                text,
                userName,
                age,
                medicalCondition,
                language
            });
    
            return response.data.analysis;
        } catch (error) {
            throw error; 
        }
    };
    const extractScoreFromAnalysis = (analysis) => {
        const match = analysis.match(/(?:\*\*)?Score(?:\*\*)?:\s*(\d+(\.\d+)?)/i);
        return match ? parseFloat(match[1]) : 0;
    };

    useEffect(() => {
        if (analysisResult && index < analysisResult.length) {
            const intervalId = setInterval(() => {
                setDisplayedText((prev) => prev + analysisResult.charAt(index));
                setIndex((prev) => prev + 1);
            }, 10);

            if (index === analysisResult.length) {
                clearInterval(intervalId);
            }

            return () => clearInterval(intervalId);
        }
    }, [index, analysisResult]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleDeleteClick = () => { 
        setShowModal(true);
      };

    const selectAnotherFile = (files) => {
        if (files.length > 0) {
            const fileName = files[files.length - 1];
            handleFileClick(fileName);
        } else {
            setSelectedFileData(null);
        }
    };  

    const handleCancelFileUpload = () => {  
        setSelectedFile(null);
        setUploadSuccess(false);
        setShowNewFileModal(false);
    };    

    const confirmDeleteFile = async () => {
        const userId = user.uid;
        const fileRef = ref(storage, `bloodTestResults/${userId}/${selectedFileData.name}`);

        try {
          await deleteObject(fileRef);
          toast.success(t('ficheiroEliminado'));
          setUserFiles((prevFiles) => prevFiles.filter(file => file !== selectedFileData.name));
          setFileScores((prevScores) => prevScores.filter(file => file.name !== selectedFileData.name));
          selectAnotherFile(userFiles.filter(file => file !== selectedFileData.name));
          setShowModal(false);
        } catch (error) {
          toast.error(t('ficheiroEliminadoError'));
        }
      };

    /*
      useEffect(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            position => {
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
            },
            error => {
              console.error('Error getting user location:', error);
            }
          );
        } else {
          console.error('Geolocation is not supported by this browser.');
        }
    }, []);
    */

    const handleEditClick = () => {
        setShowEditPopup(true);
    };
    
    const handleClosePopup = () => {
        setShowEditPopup(false);
    };

    /*
    const checkJobStatus = async (jobId) => {
        try {
            const response = await axios.get(`${BASE_URL}/check-job-status/${jobId}`);
            return response.data;
        } catch (error) {
            console.error('Error checking job status:', error);
            return null;
        }
    };
    
    const generateDownloadNewAnalysis = async () => {

        try {
            setDownloadingAnalysis(true);
    
            const userId = auth.currentUser.uid;
            const analysis = displayedText;
            const fileRef = ref(storage, `bloodTestResults/${userId}/${selectedFileData.name}`);
            const pdfUrl = await getDownloadURL(fileRef);
    
            const response = await axios.post(`${BASE_URL}/add-analysis-to-pdf`, { pdfUrl, analysis });
            const { jobId } = response.data;

            while (true) {
                const statusResponse = await checkJobStatus(jobId);
                if (statusResponse?.status === 'completed') {
                    const pdfResponse = await axios.get(`${BASE_URL}/download-pdf/${jobId}`, {
                        responseType: 'blob'
                    });
    
                    const url = window.URL.createObjectURL(new Blob([pdfResponse.data], { type: 'application/pdf' }));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'BloodFlow_Analysis.pdf');
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(url);
                    break;
                } else if (statusResponse?.status === 'failed') {
                    throw new Error('PDF generation failed');
                } else {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        } catch (error) {
            console.error('Error downloading the PDF:', error);
            toast.error(t('erroDownloadPDF'));
        } finally {
            setDownloadingAnalysis(false);
        }
    };
        
    const sendEmailToPartnerFacility = async () => {
        setSendingEmail(true);
        try {
            const user = auth.currentUser;
            const userEmail = user ? user.email : null;
            const userName = userData.username;
            const analysis = displayedText;
            const pdfUrl = `bloodTestResults/${user.uid}/${selectedFileData.name}`;
            const userAvailability = formatAvailability();
    
            const response = await axios.post(`${BASE_URL}/send-email-analysi`, {
                userEmail,
                userName,
                analysis,
                pdfUrl,
                userAvailability
            });
            
            console.log(response.data);
            toast.success(t('emailClinicaParceira'));
            setSendingEmail(false);
        } catch (error) {
            toast.error(t('emailClinicaParceiraError'));
            setSendingEmail(false);
        }
    };

    const handleAddRow = () => {
        setAvailability([...availability, { day: '', startTime: '', endTime: '' }]);
      };
    
    const handleRemoveRow = (index) => {
        const updatedAvailability = availability.filter((_, i) => i !== index);
        setAvailability(updatedAvailability);
    };

    const handleChange = (index, field, value) => {
        const updatedAvailability = availability.map((entry, i) =>
            i === index ? { ...entry, [field]: value } : entry
        );
        setAvailability(updatedAvailability);
    };

    const formatAvailability = () => {
        return availability
          .filter(entry => entry.day && entry.startTime && entry.endTime)
          .map(entry => `${entry.day}: ${entry.startTime} - ${entry.endTime}`)
          .join('\n');
    };
    */
    
    return (
        loadingWindow ? (
            <Spinner />
        ) : (
            <div className="flex h-screen">
                {/* Sidebar */}
                <div id="Sidebar" className="bg-white h-full md:w-1/5 sm:w-0 w-0 relative">
                    <div className="hidden md:flex flex-col justify-start items-start w-full">
                        <img className="w-40 mx-auto -mt-2" src={BloodFlowLogo} alt="/" />
                        
                        {/* Clinic-specific options */}
                        <ul className="-mt-4 sm:text-xs md:text-xs lg:text-sm p-2 font-medium text-gray-600">
                            <li className="px-4 py-2 font-sans font-bold">Clinic Dashboard</li>
                            
                            {/* Add New Patient Button */}
                            <button 
                                onClick={handleAddPatientClick} 
                                className="bg-blue-500 text-white font-bold text-sm w-full py-2 rounded-md my-2"
                            >
                                Add New Patient
                            </button>
    
                            {/* Patient List */}
                            <h3 className="font-bold text-gray-700 py-2">Patients</h3>
                            <ul className="patient-list overflow-y-auto" style={{ maxHeight: '300px' }}>
                                {patients.map((patient, index) => (
                                    <li 
                                        key={index} 
                                        onClick={() => handlePatientSelect(patient)} 
                                        className={`cursor-pointer p-2 ${selectedPatient === patient ? 'bg-gray-300' : 'bg-white'}`}
                                    >
                                        {patient.name}
                                    </li>
                                ))}
                            </ul>
                        </ul>
                        
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
                                <h1>Select a Patient</h1>
                            )}
                        </div>
                    </div>
    
                    {/* Patient-specific data */}
                    {selectedPatient ? (
                        <>
                            {/* Upload New Blood Test for Patient */}
                            <div className="flex justify-center mb-4">
                                <button 
                                    onClick={handleUploadNewTest} 
                                    className="bg-[#ff0000] w-40 rounded-md font-bold py-2 text-white"
                                >
                                    Upload Blood Test
                                </button>
                            </div>
    
                            {/* Test Results and Analysis */}
                            <div className="bg-white mb-6 shadow-md rounded-md p-6">
                                {/* Show test results for the selected patient */}
                                {patientTests.length > 0 ? (
                                    <ul>
                                        {patientTests.map((test, index) => (
                                            <li key={index} onClick={() => handleTestSelect(test)}>
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
    
}

export default Dashboard;