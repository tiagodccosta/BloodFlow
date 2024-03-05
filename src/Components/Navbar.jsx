import React, { useState, useEffect } from 'react';
import {AiOutlineClose, AiOutlineMenu} from 'react-icons/ai'
import { Link as ScrollLink } from 'react-scroll';
import BloodFlowLogo from "../Assets/BloodflowLogo.png";


const Navbar = () => {

    const [nav, setNav] = useState(false);

    const handleNav = () => {
        setNav(!nav);
    };

    const handleScrollToSection = () => {
        if (nav) {
            setNav(false);
        }
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

    return (
        <div className='flex justify-between items-center h-24 max-w-[1640px] mx-auto px-4 text-white'>
            <img className="w-44 mt-16" src={BloodFlowLogo} alt="/" />
            <ul className='hidden md:flex'>
                <li className='p-4 cursor-pointer'><ScrollLink to="Home" smooth={true} duration={500} onClick={handleScrollToSection}>Home</ScrollLink></li>
                <li className='p-4 cursor-pointer'><ScrollLink to="Services" smooth={true} duration={500} onClick={handleScrollToSection}>Services</ScrollLink></li>
                <li className='p-4 cursor-pointer'>Contacts</li>
                <button className='bg-white w-[160px] ml-4 rounded-md font-bold  mt-1 py-2 text-[#ff0000] hover:bg-[#ff0000] hover:text-white transition duration-300'>Sign In</button>
            </ul>
            <div on onClick={handleNav} className='block md:hidden'>
                {nav ? <AiOutlineClose size = {20} /> : <AiOutlineMenu size={20} />}
            </div>
            <div className={nav ? 'fixed left-0 top-0 w-[60%] h-full border-r border-r-gray-700 bg-black ease-in-out duration-500' : 'fixed left-[-100%]'}>
                <img className="w-44" src={BloodFlowLogo} alt="/" />
                <ul className='uppercase p-4'>
                    <li className='p-6 cursor-pointer'><ScrollLink to="Home" smooth={true} duration={500} onClick={handleScrollToSection}>Home</ScrollLink></li>
                    <li className='p-6 cursor-pointer'><ScrollLink to="Services" smooth={true} duration={500} onClick={handleScrollToSection}>Services</ScrollLink></li>
                    <li className='p-6 cursor-pointer'>Contacts</li>
                    <button className='bg-white w-[150px] ml-4 rounded-md font-bold mt-6 py-3 text-[#ff0000] hover:bg-[#ff0000] hover:text-white transition duration-300'>Sign In</button>
            </ul>
            </div>
        </div>
    )
}

export default Navbar