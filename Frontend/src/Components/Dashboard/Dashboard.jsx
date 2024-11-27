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
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [loadingWindow, setLoadingWindow] = useState(true);
    const analysisContainerRef = useRef(null);
    const [smartReport, setSmartReport] = useState(null);
    const [smartReportLoading, setSmartReportLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("fullAnalysis");

    const { t } = useTranslation();

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
    
            const metadata = await getMetadata(fileRef);
            setSelectedFileData(metadata);
    
            if (metadata.customMetadata?.analysis !== undefined) {
                setDisplayedText(metadata.customMetadata.analysis);
                setAnalysisPerformed(true);
            } else {
                setAnalysisPerformed(false);
            }
    
            try {
                const smartReport = await fetchSmartReport(userId, fileName);
                setSmartReport(smartReport);
            } catch (error) {
                console.warn("Failed to fetch Smart Report:", error);
                setSmartReport(null);
            }
        } catch (error) {
            console.error("Error handling file click:", error);
            toast.error(t('erroFicheiroSelecionado'));
        }
    }, [t]);

    const saveSmartReportToStorage = async (smartReport, userId, fileName) => {
        const smartReportRef = ref(storage, `smartReportsJson/${userId}/${fileName}_smartReport.json`);
        
        const jsonData = JSON.stringify(smartReport);
        const blob = new Blob([jsonData], { type: "application/json" });
      
        await uploadBytes(smartReportRef, blob);
    };

    const fetchSmartReport = async (userId, fileName) => {

        try {
            const smartReportRef = ref(storage, `smartReportsJson/${userId}/${fileName}_smartReport.json`);

            try {
                await getMetadata(smartReportRef);
            } catch (error) {
                if (error.code === 'storage/object-not-found') {
                    console.warn('Smart Report file does not exist.');
                    return;
                }
                throw error;
            }

            const downloadURL = await getDownloadURL(smartReportRef);
            const response = await fetch(downloadURL);

            const smartReport = await response.json();
            return smartReport;
        } catch (error) {
            console.log('Failed to fetch Smart Report:');
        }
    };

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
        
            setLoading(true); 
            const fullAnalysisPromise = analyseBloodTest(text)
                .then((fullAnalysisResult) => {
                    setLoading(false);
                    setAnalysisResult(fullAnalysisResult);
        
                    if (fullAnalysisResult) {
                        const score = extractScoreFromAnalysis(fullAnalysisResult);
                        setScores([...scores, { time: new Date().toLocaleDateString(), score }]);
        
                        getMetadata(fileRef).then((fileMetadata) => {
                            updateMetadata(fileRef, {
                                customMetadata: {
                                    ...fileMetadata.customMetadata,
                                    score: parseFloat(score),
                                    analysis: fullAnalysisResult,
                                },
                            }).catch((error) => console.error("Error updating metadata:", error));
                        });

                        fetchUpdatedScores();
                    } else {
                        console.warn("Full analysis failed.");
                    }
                })
                .catch((error) => {
                    console.error("Error in full analysis:", error);
                    setLoading(false); 
                });
        
            setSmartReportLoading(true);
            const smartReportPromise = generateSmartReport(text)
                .then((smartReportResult) => {
                    setSmartReportLoading(false);
                    setSmartReport(smartReportResult);
        
                    if (!smartReportResult) {
                        console.warn("Smart report failed.");
                    }

                    saveSmartReportToStorage(smartReportResult, userId, selectedFileData.name);
                })
                .catch((error) => {
                    console.error("Error in smart report:", error);
                    setSmartReportLoading(false);
                });
        
            await Promise.all([fullAnalysisPromise, smartReportPromise]);
        } catch (error) {
            toast.error(t('erroAnalise'));
            setAnalysisPerformed(false);
        } finally {
            setLoading(false);
            setSmartReportLoading(false);
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

    const generateSmartReport = async (text) => {
        try {
            const language = getLanguageFromDomain();
    
            const response = await fetch(`${BASE_URL}/generate-smart-report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text, language }),
            });
    
            if (!response.ok) {
                console.error('Failed to generate smart report');
                return null;
            }
    
            const data = await response.json();
            return data.analysisSmartReport;
    
        } catch (error) {
            console.error('Error generating smart report:', error);
            return null;
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
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
                            <ul className="-mt-4 sm:text-xs md:text-xs lg:text-sm p-2 font-medium text-gray-600">
                                {userData !== null && (
                                    <>
                                        <li className="px-4 py-2 font-sans"><strong>{t('nomeDash')}</strong> {userData.username}</li>
                                        <li className="px-4 py-2 font-sans"><strong>{t('Idade')}</strong> {userAge} Anos</li>
                                        <li className="px-4 py-2 font-sans"><strong>{t('condicaoMedicaDash')}</strong> {userData.medicalCondition ? userData.medicalCondition : t('nenhuma')}</li>

                                        <div className="flex justify-center">
                                            <button 
                                                onClick={handleEditClick} 
                                                className="text-blue-600 font-bold text-sm"
                                            >
                                                {t('editarInfoDash')}
                                            </button>
                                        </div>
                                        <EditPersonalInfo show={showEditPopup} onClose={handleClosePopup} userInfo={userData} userId={user.uid}/>
                                    {/* Closing tag for conditional rendering */}
                                    </>
                                )}
                            </ul>

                            <div className="sm:mx-3 lg:mx-6 font-sans w-[90%]">
                                {/* Stored Results button with toggle icon */}
                                <div className="flex items-center justify-normal">
                                    <button onClick={toggleResults} className="uppercase mb-3 sm:text-xs md:text-xs lg:text-sm font-bold mr-2">{t('resultsStored')}</button>
                                    {/* Toggle icon */}
                                    <button onClick={toggleResults} className="text-gray-600 focus:outline-none">
                                        <svg className={`h-4 w-4 transform transition-transform ${resultsVisible ? '-rotate-90' : ''} -mt-3`} fill="none" viewBox="0 0 24 24" stroke="#ff0000">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                                {/* Results list */}
                                <div className={`p-3 ${resultsVisible ? '' : 'hidden'} -mt-2 text-xs font-bold`} style={{ maxHeight: '295px', overflowY: 'auto' }}>
                                    <ul id="resultsList" className='cursor-pointer'>
                                        {userFiles.slice().reverse().map((result, index) => (
                                            <li key={index} onClick={() => handleFileClick(result)} className={`-m-2 py-3 ${selectedFileData?.name === result ? 'text-[#ce3d3d]' : 'text-gray-600'}`}>{result}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 w-full py-4 px-6 flex flex-col items-center bg-white">
                                {/* New File Button */}
                                <button className="bg-[#ff0000] w-full rounded-md font-bold py-3 mb-2 text-white" onClick={handleNewFileClick}>
                                    {t('newFile')}
                                </button>

                                {/* Display selected file and upload button */}
                                {selectedFile && !uploadSuccess && showNewFileModal && (
                                    <NewFilePopup show={showNewFileModal} onClose={handleCancelFileUpload} onConfirm={handleUpload} fileName={selectedFile.name}/>
                                )}

                                <button className="bg-black w-full rounded-md font-bold py-3 text-white" onClick={handleLogout}>{t('logoutDash')}</button>
                            </div>
                        </div>

                        <div className={`${nav ? 'fixed' : 'hidden'} left-0 top-0 w-3/5 h-full bg-white flex flex-col ease-in-out duration-500 z-40`}>
                            <img className="w-40 mx-auto -mt-2 cursor-pointer" onClick={handleSideBar} src={BloodFlowLogo} alt="Logo" />
                            <ul className="pl-4 -mt-5 mb-4 text-xs font-medium text-gray-600">
                                {userData && (
                                    <>
                                        <li className="py-2 font-sans"><strong>{t('nomeDash')}</strong> {userData.username}</li>
                                        <li className="py-2 font-sans"><strong>{t('Idade')}</strong> {userAge} Anos</li>
                                        <li className="py-2 font-sans"><strong>{t('condicaoMedicaDash')}</strong> {userData.medicalCondition ? userData.medicalCondition : t('nenhuma')}</li>

                                        <div className="flex justify-center">
                                            <button 
                                                onClick={handleEditClick} 
                                                className="text-blue-600 font-bold text-xs"
                                            >
                                                {t('editarInfoDash')}
                                            </button>
                                        </div>
                                        <EditPersonalInfo show={showEditPopup} onClose={handleClosePopup} userInfo={userData} userId={user.uid}/>
                                    </>
                                )}
                            </ul>

                            <div className="ml-4">
                                {/* Stored Results button with toggle icon */}
                                <div className="flex items-center">
                                    <button onClick={toggleResults} className="uppercase mb-3 text-xs font-bold mr-2">{t('resultsStored')}</button>
                                    {/* Toggle icon */}
                                    <button onClick={toggleResults} className="text-gray-600 focus:outline-none">
                                        <svg className={`h-4 w-4 transform transition-transform ${resultsVisible ? '-rotate-90' : ''} -mt-3`} fill="none" viewBox="0 0 24 24" stroke="#ff0000">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                                {/* Results list */}
                                <div className={`${resultsVisible ? '' : 'hidden'} -mt-2 text-xs p-2 font-bold text-gray-600 overflow-y-auto`} style={{ maxHeight: '230px' }}>
                                    <ul id="resultsList" className='pl-3 cursor-pointer'>
                                        {userFiles.slice().reverse().map((result, index) => (
                                            <li key={index} onClick={() => handleFileClick(result)} className={`-m-2 py-3 ${selectedFileData?.name === result ? 'text-[#ce3d3d]' : 'text-gray-600'}`}>{result}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="absolute bottom-0 left-0 w-full py-4 px-4">
                                <button className="bg-[#ff0000] w-full rounded-md font-bold py-3 mb-2 text-white text-sm hover:bg-black hover:text-white transition duration-300" onClick={handleNewFileClick}>
                                    {t('newFile')}
                                </button>

                                {/* Display selected file and upload button */}
                                {selectedFile && !uploadSuccess && showNewFileModal && (
                                    <NewFilePopup show={showNewFileModal} onClose={handleCancelFileUpload} onConfirm={handleUpload} fileName={selectedFile.name}/>
                                )}

                                <button className="bg-black w-full rounded-md font-bold py-3 text-white text-sm" onClick={handleLogout}>{t('logoutDash')}</button>
                            </div>
                        </div>
                    </div>


                    {/* Main Container */}
                    <div className="main-container bg-gray-300 flex-grow overflow-y-auto pt-6 px-4 md:w-4/5 flex flex-col">
                        {/* Title */}
                        <div className="bg-white w-full mb-6 shadow-md rounded-md">
                            <div className='flex justify-between items-center font-bold text-lg md:text-2xl text-[#ce3d3d] p-6'>
                                {userData !== null && (
                                    <h1>{t('dasboardTitle')} {userData.username}</h1>
                                )}
                                <div className="md:hidden" onClick={handleSideBar}>
                                    {nav ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
                                </div>
                            </div>
                        </div>

                        {/* selected file container */}
                        <div className="bg-white flex flex-col mb-4 shadow-md rounded-md md:flex-row">
                            {selectedFileData && selectedFile == null ? (
                                <>
                                    {/* Left container */}
                                    <div className="w-full md:w-2/3 p-2 md:p-6 flex flex-col">
                                        <div className="border-2 border-[#ff0000] rounded-lg p-2 md:p-4 md:border-4 flex-grow flex items-center">
                                            <div className="flex-grow">
                                                <h1 className="text-md md:text-xl font-bold text-black py-1 md:py-2">{t('selectedFileForAnalysis')}</h1>
                                                <p className="text-xs md:text-sm text-gray-600 py-1 md:py-2">
                                                    <span className="font-bold mr-2">{t('nomeFile')}</span>
                                                    <span className="font-medium">{selectedFileData.name}</span>
                                                </p>
                                                <p className="text-xs md:text-sm text-gray-600 py-1 md:py-2">
                                                    <span className="font-bold mr-2">{t('storedAt')}</span>
                                                    <span className="font-medium">{formatDate(selectedFileData.timeCreated)}</span>
                                                </p>
                                                <h1 className="text-xs font-medium md:text-xs md:font-bold text-gray-500 py-1 md:py-2">
                                                    {t('textFileSelected')}
                                                </h1>
                                            </div>
                                            <div>
                                                <img className="w-60 md:w-80" src={PDF_ICON} alt="PDF Icon"/>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right container */}
                                    <div className="w-full md:w-1/3 p-2 md:p-6 md:pl-4 flex flex-col items-center justify-center">
                                        <p className="font-bold text-black text-lg md:text-xl mb-2 md:mb-4 text-center">{t('startAnalysis')}</p>
                                        <div className="px-2 md:px-4">
                                            <button onClick={handleAnalyzeClick} disabled={loading} className="bg-[#ff0000] w-40 text-sm md:w-52 rounded-md font-bold py-2 md:py-4 text-white">
                                                {loading ? t('analysing') : t('analise')}
                                            </button>
                                        </div>
                                        <button onClick={handleDeleteClick} className="w-40 text-sm md:w-52 rounded-md font-bold py-2 md:py-4 text-white mt-1 md:mt-2 md:-mb-8 bg-black">
                                            {t('deleteButton')}
                                        </button>
                                        {showModal && (
                                            <DeletePopup
                                                show={showModal}
                                                onClose={() => setShowModal(false)}
                                                onConfirm={confirmDeleteFile}
                                            />
                                        )}
                                    </div>
                                </>
                        ) : (
                            <div className="flex-grow p-2 md:p-5">
                                <h1 className="text-lg md:text-xl font-bold text-black">{t('selectedFileForAnalysis')}</h1>
                                <div className="w-full p-2 md:p-6 flex items-center justify-center">
                                    <h1 className="text-lg md:text-xl font-bold text-gray-500 p-4 md:p-10">{t('noData')}</h1>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Test Score container */}
                    <div className="bg-white mb-4 shadow-md rounded-md">
                    {selectedFileData && selectedFile == null ? (
                        <>
                            <div className="text-center py-2 md:py-4">
                                <h1 className="text-lg md:text-xl font-bold text-black mb-4 md:mb-6 mt-4 px-3">{t('scoreProgress')}</h1>
                            </div>
                            {/* Left column */}
                            <div className="flex flex-col md:flex-row justify-center items-center">
                                <div className="w-full md:w-1/3 flex flex-col justify-center items-center p-2 md:pl-4">
                                    <div className="mb-2 md:mb-4">
                                        <CircularChart score={ fileScores.length > 0 ? fileScores[fileScores.length - 1].score : fileScores[fileScores.length - 2].score } />
                                    </div>
                                    <p className="text-center text-sm md:text-lg">{t('lastScoreResult')}</p>
                                </div>
                                {/* Right column */}
                                <div className="w-full -ml-10 md:w-2/3 p-2 md:pr-10 py-2 md:py-4">
                                    <MyBarChart data={fileScores} selectedFileMetadata={selectedFileData} onBarClick={handleFileClick} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-2 md:py-5">
                            <h1 className="text-lg md:text-xl font-medium text-black">{t('scoreProgress')}</h1>
                            <div className="w-full p-2 md:p-6 flex items-center justify-center">
                                <h1 className="text-lg md:text-xl font-bold text-gray-500 p-4 md:p-10">{t('noData')}</h1>
                            </div>
                        </div>
                    )}
                    </div>

                    {/* Analysis Results Container */}
                    <div
                        id="analysisContainer"
                        ref={analysisContainerRef}
                        className="bg-white mb-6 shadow-md rounded-md p-6"
                        >
                        {/* No Data message */}
                        {!analysisPerformed && !loading && !smartReportLoading && (
                            <div>
                            <h1 className="text-xl font-bold text-black mb-4">
                                {t("yourAnalysisBy")}{" "}
                                <span style={{ color: "#ff0000" }}>{t("bloodFlowAI")}</span>
                            </h1>
                            <h1 className="text-xl font-bold text-gray-500 mb-4 text-center py-10">
                                {t("analyseFileResultsHere")}
                            </h1>
                            </div>
                        )}

                        {/* Analysis content */}
                        {analysisPerformed && (
                            <>
                            <h1 className="text-xl font-bold text-black mb-4">
                                {t("yourAnalysisBy")}{" "}
                                <span style={{ color: "#ff0000" }}>{t("bloodFlowAI")}</span>
                            </h1>

                            {/* Tabs */}
                            <div className="flex justify-center border-b mb-4">
                                <button
                                onClick={() => handleTabChange("fullAnalysis")}
                                className={`px-4 py-2 ${
                                    activeTab === "fullAnalysis"
                                    ? "border-b-2 border-red-500 text-red-500 font-bold"
                                    : "text-gray-600"
                                }`}
                                >
                                Full Analysis
                                </button>

                                <button
                                onClick={() => handleTabChange("smartReport")}
                                className={`px-4 py-2 ${
                                    activeTab === "smartReport"
                                    ? "border-b-2 border-red-500 text-red-500 font-bold"
                                    : "text-gray-600"
                                }`}
                                >
                                Smart Report
                                </button>
                            </div>

                            {/* Full Analysis Tab */}
                            {activeTab === "fullAnalysis" && (
                                <div>
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                    <img
                                        src={BloodFlowLogoNL}
                                        alt="Logo"
                                        className="w-44 animate-spin"
                                    />
                                    </div>
                                ) : (
                                    <div className="typing-effect">
                                    <ReactMarkdown
                                        children={displayedText}
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                        strong: ({ children }) => (
                                            <strong className="text-[#ce3d3d]">{children}</strong>
                                        ),
                                        p: ({ children }) => <p className="my-4">{children}</p>,
                                        }}
                                    />
                                    </div>
                                )}
                                </div>
                            )}

                            {/* Smart Report Tab */}
                            {activeTab === "smartReport" && (
                                <div>
                                {smartReportLoading ? (
                                    <div className="flex items-center justify-center">
                                    <img
                                        src={BloodFlowLogoNL}
                                        alt="Logo"
                                        className="w-44 animate-spin"
                                    />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {smartReport && smartReport.parameters?.length > 0 ? (
                                        smartReport.parameters.map((param, index) => (
                                        <div
                                            key={index}
                                            className="bg-white p-4 shadow-sm rounded-lg border border-gray-200 flex flex-col relative text-sm"
                                        >
                                            {/* Status indicator */}
                                            <div
                                            className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                                                param.status === "high"
                                                ? "bg-red-500"
                                                : param.status === "low"
                                                ? "bg-red-500"
                                                : param.status === "ND"
                                                ? "bg-blue-500"
                                                : "bg-green-500"
                                            }`}
                                            ></div>

                                            {/* Parameter Name */}
                                            <h2 className="text-lg font-semibold text-black mb-1">
                                            {param.name}
                                            </h2>

                                            {/* Parameter Value and Range */}
                                            <p className="text-sm">
                                            <strong>Value:</strong>{" "}
                                            <span className="font-semibold">{param.value}</span>
                                            </p>
                                            <p className="text-sm">
                                            <strong>Range:</strong>{" "}
                                            <span className="font-semibold">{param.range}</span>
                                            </p>

                                            {/* Insights */}
                                            <p className="mt-2 text-gray-600 text-sm">
                                            {param.insight}
                                            </p>
                                        </div>
                                        ))
                                    ) : (
                                        <p className="col-span-1 md:col-span-2 text-center text-gray-500 text-sm">
                                        No smart report available. Please generate a smart report to see the results.
                                        </p>
                                    )}
                                    </div>
                                )}
                                </div>
                            )}
                            </>
                        )}
                    </div>


                    {/* 
                        Container for partner medical facility
                        <div className="bg-white mb-4 shadow-md rounded-md p-4 md:p-6">
                            <h1 className="text-xl md:text-xl font-bold text-[#ff0000] mb-4 md:mb-6">{t('partnerClinic')}</h1>
                            <p className="text-gray-500 text-sm md:text-sm font-bold text-center px-4 md:px-10">
                                {t('bloodFlowFezParceria')}<strong className='text-[#ce3d3d]'>{t('clinicaParceira')}</strong> 
                                    {t('bloodFlowFezParceria2')}
                            </p>
                            <div className="flex overflow-x-auto mt-4 md:mt-6 mb-4 md:mb-6">
                                <img src={ImageClinica2} alt="" className="w-36 h-36 md:w-64 md:h-64 mr-2 md:mr-4 rounded-lg" />
                                <img src={ImageClinica3} alt="" className="w-36 h-36 md:w-64 md:h-64 mr-2 md:mr-4 rounded-lg" />
                                <img src={ImageClinica4} alt="" className="w-36 h-36 md:w-64 md:h-64 mr-2 md:mr-4 rounded-lg" />
                                <img src={ImageClinica5} alt="" className="w-36 h-36 md:w-64 md:h-64 mr-2 md:mr-4 rounded-lg" />
                            </div>

                            <p className="text-black text-sm md:text-md font-bold text-center px-4 md:px-10">
                                {t('enviarResults')}<strong className='text-[#ce3d3d]'>{t('enviarAnalise')}</strong>
                                    {t('enviarResults2')}
                            </p>

                            Availability Form
                            <div className="mt-6 flex flex-col items-center">
                                <h2 className="text-lg font-bold text-center mb-4 text-[#ce3d3d]">{t('disponibilidade')}</h2>
                                <div className="flex flex-col items-center w-full">
                                    {availability.map((entry, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row items-center mb-2 w-full justify-between sm:justify-center space-y-2 sm:space-y-0 sm:space-x-2">
                                            <select
                                                value={entry.day}
                                                onChange={(e) => handleChange(index, 'day', e.target.value)}
                                                className="w-full sm:w-auto p-2 border rounded-md"
                                            >
                                                <option value="Dia">{t('dia')}</option>
                                                <option value="Segunda-feira">{t('monday')}</option>
                                                <option value="Terça-feira">{t('tuesday')}</option>
                                                <option value="Quarta-feira">{t('wednesday')}</option>
                                                <option value="Quinta-feira">{t('thursday')}</option>
                                                <option value="Sexta-feira">{t('friday')}</option>
                                                <option value="Sábado">{t('saturday')}</option>
                                                <option value="Domingo">{t('sunday')}</option>
                                            </select>
                                            <input
                                                type="time"
                                                value={entry.startTime}
                                                onChange={(e) => handleChange(index, 'startTime', e.target.value)}
                                                className="w-full sm:w-auto p-2 border rounded-md"
                                            />
                                            <span className="mx-1">{t('ateHora')}</span>
                                            <input
                                                type="time"
                                                value={entry.endTime}
                                                onChange={(e) => handleChange(index, 'endTime', e.target.value)}
                                                className="w-full sm:w-auto p-2 border rounded-md"
                                            />
                                            <div className="flex items-center space-x-2">
                                                {index > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveRow(index)}
                                                        className="px-4 py-2 bg-red-500 text-white rounded-md"
                                                    >
                                                        -
                                                    </button>
                                                )}
                                                {index === availability.length - 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={handleAddRow}
                                                        className="px-4 py-2 bg-blue-500 text-white rounded-md"
                                                    >
                                                        +
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-center">
                                <button 
                                    disabled={sendingEmail} className="bg-gradient-to-r from-red-500 via-blue-400 to-red-500 bg-[length:200%_200%] animate-gradient-move w-40 md:w-52 rounded-md font-bold py-2 md:py-3 text-white mt-4 md:mt-6 mb-2 md:mb-3">
                                    {sendingEmail ? t('aEnviar') : t('comingSoon')}
                                </button>
                                <p className="text-gray-500 text-xs mt-2 md:text-sm font-bold text-center px-4 md:px-10">
                                    {t('resultsViaEmail')}
                                </p>
                            </div>
                        </div>    


                        Container for generating PDF with analysis
                        <div className="bg-white mb-4 shadow-md rounded-md p-4 md:p-6">
                            <h1 className="text-xl md:text-xl font-bold text-[#ff0000] mb-4 md:mb-6">{t('pdfGen')}</h1>
                            <p className="text-gray-500 text-sm md:text-md font-bold text-center px-4 md:px-10">
                                {t('pdfTextGen')}
                            </p>
                            <img className="w-full md:w-[70%] mx-auto my-4 md:my-6" src={bloodTestResults} alt="PDF Gen" /> 
                            <div className="flex justify-center mt-4">
                                <button
                                    onClick={generateDownloadNewAnalysis}
                                    className="bg-[#ff0000] w-44 sm:text-md text-sm sm:w-52 rounded-md font-bold py-3 sm:py-3 text-white"
                                >
                                    { downloadingAnalysis ? t('downloadingAnalysis') : t('downloadAnalysis') }
                                </button> 
                            </div>
                        </div>            


                        Map container for showing user medical faciliteis near him 
                        <div className="bg-white mb-4 shadow-md rounded-md px-4 py-6 md:px-6 md:py-10">
                            <h1 className="text-xl md:text-xl font-bold text-[#ff0000] mb-4 md:mb-6">{t('otherClinics')}</h1>
                            <p className="text-gray-500 text-sm md:text-sm font-bold text-center px-4 md:px-10">
                                {t('otherClinicsText')}
                            </p>
                            <div className="flex justify-center py-4 md:py-6">
                                {userLocation && (
                                    <iframe
                                        id="map"
                                        title="Map"
                                        width="400"
                                        height="300"
                                        className="md:w-[900px] md:h-[420px]"
                                        style={{ border: 0 }}
                                        src={`https://www.google.com/maps/embed/v1/search?key=${mapsApiKey}&q=hospital&center=${userLocation.lat},${userLocation.lng}&zoom=14`}
                                        allowFullScreen
                                    ></iframe>
                                )}
                            </div>
                        </div>
                    */}        

                        {/* Footer */}
                        <div className="flex justify-center">
                            <img className="w-32 sm:w-40 md:w-52 -mt-4 sm:-mt-6 md:-mt-7" src={BloodFlowLogoNL} alt="/" />
                        </div>
                    </div>
                </div>
          )    
    );
}

export default Dashboard;