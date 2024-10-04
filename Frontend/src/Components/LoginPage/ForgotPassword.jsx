import React, {useState} from 'react';
import BloodFlowLogo from "../../Assets/BloodflowLogo.png";
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import {auth} from "../../firebase";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';

function ForgotPassword() {

    const navigate = useNavigate();
    const [email, setEmail] = useState('');  

    const { t } = useTranslation();

    const sendEmail = async (e) => {
        e.preventDefault();
        try {
            sendPasswordResetEmail(auth, email);
            toast.success(t('emailSent'));
            navigate("/login");
        } catch (error) {
            toast.error(t('emailError'));
        }
    };

    const backToHome = () => {
        navigate("/");
    };

    return (
        <div className='grid h-screen w-full bg-white'>
            <div className='flex flex-col justify-center -mt-20 bg-white'>
                <form onSubmit={sendEmail} className='max-w-[400px] w-full mx-auto bg-white p-4'>
                    <img onClick={backToHome} className='mx-auto w-52 cursor-pointer' src={BloodFlowLogo} alt='/' />
                    <h1 className='md:text-xl sm:text-xl text-xl font-bold -mt-3 pb-10 text-center text-black'>{t('forgotMyPassword')}</h1>
                    <div className='flex flex-col pb-2 mx-4 -mt-2'>
                        <input className='border border-[#ff0000] rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-[#ff0000]' 
                        type='email'
                        placeholder='Email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required />
                    </div>
                    <div className='mx-4 my-4'>
                        <button type='submit' className='bg-[#ff0000] w-full rounded-md font-bold py-3 text-white'>{t('sendEmail')}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ForgotPassword;