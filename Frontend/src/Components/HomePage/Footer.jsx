import React from "react";
import BloodFlowLogo from "../../Assets/BloodflowLogo.png";
import { useTranslation } from 'react-i18next';


const Footer = () => {

    const { t } = useTranslation();

    return (
        <div className="bg-black w-full h-full flex flex-col items-center text-center text-white pt-16">
            <h3 className="text-2xl sm:text-4xl font-bold mb-4 max-w-[650px]">
                {t('ReadyToTransform')}
            </h3>
            <p className="text-sm sm:text-lg text-gray-400 mb-8 max-w-[650px] px-6">
                {t('ReadyToTransform2')}
            </p>
            <a 
                href="https://calendly.com/tiago-costa-bloodflow" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-[#ff0000] hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-full transition-colors duration-300"
            >
                {t('BookDemo')}
            </a>
            
            <div className="bg-gray-900 w-full flex items-center justify-between text-left mt-36 px-6 md:px-12 lg:px-24 py-16">
                <img className="w-36 md:w-44" src={BloodFlowLogo} alt="BloodFlow Logo" />

                <div className="text-white-400 mt-6 md:mt-0">
                    <p className="font-semibold">BloodFlow</p>
                    <p>{t('footerAddress')}</p>
                    <p>{t('footerAddress2')}</p>
                    <p className="mt-4">{t('footerEmail')}</p>
                </div>
            </div>

        </div>
    );
}

export default Footer;