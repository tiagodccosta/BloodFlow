import React, {useState} from 'react';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import BloodFlowLogo from "../../Assets/BloodflowLogo.png";
import {createUserWithEmailAndPassword} from "firebase/auth";
import { auth } from "../../firebase";
import { doc, setDoc, Timestamp } from "firebase/firestore"; 
import { db } from "../../firebase";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink} from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function SignUpPage() {

  const { t } = useTranslation();  

  const [username, setUsername] = useState("");
  const [userHealthNumber, setHealthNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [userEmail, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [medicalCondition, setMedicalCondition] = useState("");
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const registerUser = (e) => {
    e.preventDefault();

    createUserWithEmailAndPassword(auth, userEmail, password)
    .then(async (userCredential) => {
        const user = userCredential.user;

        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
            username: username,
            healthNumber: userHealthNumber,
            dateOfBirth: Timestamp.fromDate(dateOfBirth),
        });
        toast.success(t('registerToastSuc'));

        sendEmail(userEmail, username);
        navigate("/login");
    })
    .catch((error) => {
        if (error.code === 'auth/email-already-in-use') {
            toast.error(t('registerToastErrDupl'));
        } else {
            toast.error(t('registerToastErr'));
        }
    });
  };

  const backToHome = () => {
    navigate("/");
  };

    const sendEmail = async (email, name) => {
        const response = await fetch(`${BASE_URL}/send-email-welcome`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userEmail: email, userName: name }),
        });

        if (response.ok) {
            console.log("Email sent");
        } else {
            console.error('Failed to send email');
        }
    }
  
  return (
    <div className='grid h-screen w-full bg-white'>
        <div className='flex flex-col justify-center -mt-6 bg-white'>
            <form onSubmit={registerUser} className='max-w-[400px] w-full mx-auto bg-white p-4'>
                <img onClick={backToHome} className='mx-auto w-52 cursor-pointer' src={BloodFlowLogo} alt='/' />
                <h2 className='md:text-2xl sm:text-2xl text-xl font-bold text-center -mt-5'>{t('registeConta')}</h2>
                <div className='flex flex-col pb-2 mx-4 mt-4'>
                    <input className='border border-[#ff0000] rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-[#ff0000]' 
                    type='text' 
                    placeholder={t('nome')}
                    value={username}
                    required={true}
                    onChange={(e) => setUsername(e.target.value)}/>
                </div>
                <div className='flex flex-col py-2 mx-4'>
                    <DatePicker
                        className="custom-date-picker border border-[#ff0000] w-full rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-[#ff0000]"
                        onChange={setDateOfBirth}
                        value={dateOfBirth}
                        format="dd/MM/yyyy"
                        clearIcon={null}
                        calendarIcon={null}
                        dayPlaceholder="DD"
                        monthPlaceholder="MM"
                        yearPlaceholder="YYYY"
                        required={true}
                    />
                    <style jsx global>{`
                        .custom-date-picker .react-date-picker__wrapper {
                        border: none !important;
                        width: 100%;
                        }
                        .custom-date-picker .react-date-picker__inputGroup__input {
                        border: none !important;
                        outline: none !important;
                        }
                        .custom-date-picker .react-date-picker__inputGroup__divider {
                        color: inherit !important;
                        }
                        .custom-date-picker .react-date-picker__inputGroup__input:focus {
                        outline: none !important;
                        }
                        .custom-date-picker .react-date-picker__calendar {
                        border: 1px solid #ff0000 !important;
                        border-radius: 0.5rem !important;
                        }
                    `}</style>
                </div>
                <div className='flex flex-col py-2 mx-4'>
                    <input className='border border-[#ff0000] rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-[#ff0000]' 
                    type='text' 
                    placeholder='Email'
                    value={userEmail}
                    required={true}
                    onChange={(e) => setEmail(e.target.value)}/>
                </div>
                <div className='flex flex-col py-2 mx-4'>
                    <input className='border border-[#ff0000] rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-[#ff0000]' 
                    type='password' 
                    placeholder='Password'
                    value={password}
                    required={true}
                    onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <div className='flex flex-col py-2 mx-4'>
                    <label className='text-sm font-bold text-black p-2'>{t('medCondition')}</label>
                    <input className='border border-[#ff0000] rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-[#ff0000]' 
                    type='text' 
                    placeholder={t('medConditionPH')}
                    value={medicalCondition}
                    required={true}
                    onChange={(e) => setMedicalCondition(e.target.value)}/>
                </div>
                <div className='mx-4  my-3'>
                    <button type='submit' className='bg-[#ff0000] w-full rounded-md font-bold py-3 text-white'>{t('registerAccount')}</button>
                </div>
            </form>

            <div className='max-w-[400px] w-full mx-auto bg-white px-7 mb-10 -mt-3'>
                <p className='text-center font-bold text-sm pb-3'>{t('jaTemConta')}</p>
                <button className='bg-black w-full rounded-md font-bold py-3 text-white'>
                <RouterLink to="/login">{t('login')}</RouterLink></button>
            </div>
        </div>
    </div>
  );
}

export default SignUpPage;