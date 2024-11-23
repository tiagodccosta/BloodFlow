import React, { useState, useEffect } from 'react';
import {AiOutlineClose, AiOutlineMenu} from 'react-icons/ai'
import BloodFlowLogo from "../../Assets/BloodflowLogo.png";
import { Link as RouterLink} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ukFlag from '../../Assets/uk_flag.png';
import ptFlag from '../../Assets/pt_flag.png';

const Navbar = () => {

    const { t } = useTranslation();
    const [nav, setNav] = useState(false);
    const [flag, setFlag] = useState(ukFlag);
    const [redirectUrl, setRedirectUrl] = useState('https://www.bloodflow.pt');

    const handleNav = () => {
        setNav(!nav);
    };

    useEffect(() => {
        const closeNavOnResize = () => {
            if (window.innerWidth > 768 && nav) {
                setNav(false);
            }
        };

        window.addEventListener('resize', closeNavOnResize);

        return () => {
            window.removeEventListener('resize', closeNavOnResize);
        };
    }, [nav]);

    useEffect(() => {
        const domain = window.location.hostname;

        if (domain === 'bloodflow.eu' || domain === 'www.bloodflow.eu') {
            setFlag(ptFlag);
            setRedirectUrl('https://www.bloodflow.pt');
        } else if (domain === 'bloodflow.pt' || domain === 'www.bloodflow.pt') {
            setFlag(ukFlag);
            setRedirectUrl('https://www.bloodflow.eu');
        }
    }, []);

    const handleFlagClick = () => {
        window.location.href = redirectUrl;
    };


    return (
        <div className='flex justify-between items-center h-24 max-w-[1400px] mx-auto px-4 lg:px-10 md:px-4 text-black font-bold'>
            <img className="w-44 mt-10 -ml-10 sm:-ml-4" src={BloodFlowLogo} alt="/" />
            <ul className='hidden lg:flex'> 
                <img className='w-10 h-10 mt-2 mr-4 cursor-pointer' src={flag} alt="\" onClick={handleFlagClick} />    
                <button className='bg-black w-[170px] ml-4 rounded-lg font-normal text-sm hover:scale-y-105 hover:scale-x-105 ease-in-out duration-300 mt-1 py-3 text-white'>
                <RouterLink to="/login">{t('navButton')}</RouterLink></button>
            </ul>
            <div onClick={handleNav} className='block lg:hidden'>
                {nav ? <AiOutlineClose size = {20} /> : <AiOutlineMenu size={20} />}
            </div>
            <div className={nav ? 'fixed left-0 top-0 w-[60%] h-full border-r border-r-gray-700 bg-white ease-in-out duration-500 z-50' : 'fixed left-[-100%]'}>
                <img className="w-44" src={BloodFlowLogo} alt="/" />
                <ul className='px-4'> 
                    <img className='w-10 h-10 ml-3 cursor-pointer' src={flag} alt="\" onClick={handleFlagClick} />     
                    <button className='bg-black w-[170px] ml-4 rounded-lg hover:scale-y-105 font-normal text-sm hover:scale-x-105 ease-in-out duration-300 mt-6 py-3 text-white'>
                    <RouterLink to="/login">{t('navButton')}</RouterLink></button>
                </ul>
            </div>
        </div>
    )
}

export default Navbar