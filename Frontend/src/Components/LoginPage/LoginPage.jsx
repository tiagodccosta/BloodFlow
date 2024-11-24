import React, { useState } from 'react';
import BloodFlowLogo from "../../Assets/BloodflowLogo.png";
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { setPersistence, browserLocalPersistence, signInWithCustomToken } from "firebase/auth";
import { getDoc, doc } from 'firebase/firestore';
import { db, auth } from "../../firebase";
import { sendEmailVerification } from 'firebase/auth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';

function LoginPage() {
  const [userEmail, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const { t } = useTranslation();

  const loginUser = async (e) => {
    e.preventDefault();
    setLoading(true);

      try {
        const response = await fetch(`${BASE_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: userEmail, password }),
        });

        if (!response.ok) {
          throw new Error(t('loginError'));
        }
        
        const data = await response.json();
        const customToken = data.token;

        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserLocalPersistence);
        const userCredential = await signInWithCustomToken(auth, customToken);
        const user = userCredential.user;

        await user.reload();

        if(!user.emailVerified) {
          setLoading(false);
          await sendEmailVerification(user);
          return toast.error(t('registerToastVerifyEmailYet'));
        }

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        if (userData) {
          toast.success(`${t('bemVindo')} ${userData.username}!`);
    
          if (userData.role === 'fertilitycare') {
            console.log(userData.role);
            navigate('/fertility-care-dashboard', { state: { user: userData } });
          } else {
            navigate('/dashboard', { state: { user: userData } });
          }
        }
      } catch (error) {
        setLoading(false);
        toast.error(t('loginError'));
      }
  };

  const backToHome = () => {
    navigate("/");
  };

  return (
    <div className='grid h-screen w-full bg-white'>
      <div className='flex flex-col justify-center -mt-20 bg-white'>
        <form onSubmit={loginUser} className='max-w-[400px] w-full mx-auto bg-white p-4'>
          <img onClick={backToHome} className='mx-auto w-52 cursor-pointer' src={BloodFlowLogo} alt='/' />
          <h1 className='md:text-2xl sm:text-xl text-xl font-bold -mt-3 pb-10 text-center text-black'>{t('InicieSessãoNaConta')}</h1>
          <div className='flex flex-col pb-2 mx-4 -mt-2'>
            <input className='border border-[#ff0000] rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-[#ff0000]'
              type='text'
              placeholder='Email'
              value={userEmail}
              required={true}
              onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className='flex flex-col py-2 mx-4'>
            <input className='border border-[#ff0000] rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-[#ff0000]'
              type='password'
              placeholder='Password'
              value={password}
              required={true}
              onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className='mx-4  my-4'>
            <button type='submit' className='bg-[#ff0000] w-full rounded-md font-bold py-3 text-white'>
                {loading ? t('aIniciar') : t('login')}
            </button>
          </div>
          <div className='flex justify-between my-5 mx-4'>
            <p className='flex items-center'><input className='mr-2' type='checkbox' onChange={(e) => setRememberMe(e.target.checked)}></input>{t('rememberMe')}</p>
            <p className='font-bold'><RouterLink to="/signup">{t('CriarConta')}</RouterLink></p>
          </div>
        </form>
        <div className='max-w-[400px] w-full mx-auto bg-white px-7 -mt-3'>
                <button className='bg-white w-full text-sm rounded-md py-3 text-black'>
                <RouterLink to="/forgotpassword">{t('forgotPassword')}</RouterLink></button>
            </div>
      </div>
    </div>
  );
}

export default LoginPage;