import React from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const Newsletter = () => {
    const [userEmail, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const { t } = useTranslation();
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const addEmailToDatabase = async (email) => {
        setLoading(true);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setLoading(false);
            return toast.error(t('registerToastErrEmail'));
        }
        
        const response = await fetch('http://localhost:4000/add-email-to-database', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userEmail: email }),
        });

        if (response.ok) {
            toast.success(t('addToEmailMarketing'));
        } else {
            setLoading(false);
            toast.error(t('addEmailError'));
        } 
    }

    const handleButtonClick = () => {
        addEmailToDatabase(userEmail);
    };

    return(
        <div id="Newsletter" className="w-full bg-black py-16 text-white px-4">
            <div className="max-w-[1240px] mx-auto grid lg:grid-cols-3">
                <div className="lg:col-span-2 my-4">
                    <h1 className="md:text=4xl sm:text-3xl text-2xl  font-bold py-2">{t('KnowMoreNewsLetter')}</h1>
                    <p>{t('registNews')}</p>
                </div>
                <div className="my-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between w-full">
                        <input className="p-3 flex w-full rounded-md text-black" 
                        type="email" 
                        placeholder={t('enterEmail')}
                        value={userEmail}
                        onChange={(e) => setEmail(e.target.value)}/>
                        <button onClick={handleButtonClick} className='bg-[#ff0000] text-white rounded-md font-bold w-[250px] my-6 ml-4 px-6 py-3'>
                            {loading ? t('aEnviar') : t('Notifica')}
                        </button>
                    </div>
                <p>{t('dataProtection')}</p>    
                </div>
            </div>
        </div>
    )
}

export default Newsletter;