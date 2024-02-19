import React, { useState } from 'react';
import {AiOutlineClose, AiOutlineMenu} from 'react-icons/ai'

const Navbar = () => {

    const [nav, setNav] = useState(false);

    const handleNav = () => {
        setNav(!nav);
    };

    return (
        <div className='flex justify-between items-center h-24 max-w-[1640px] mx-auto px-4 text-white'>
            <h1 className='text-3xl font-bold text-[#ff0000]'>bloodflow.</h1>
            <ul className='hidden md:flex'>
                <li className='p-4'>Home</li>
                <li className='p-4'>Our Services</li>
                <li className='p-4'>Contacts</li>
                <button className='bg-white w-[160px] ml-4 rounded-md font-bold  mt-1 py-2 text-[#ff0000] hover:bg-[#ff0000] hover:text-white transition duration-300'>Sign In</button>
            </ul>
            <div on onClick={handleNav} className='block md:hidden'>
                {nav ? <AiOutlineClose size = {20} /> : <AiOutlineMenu size={20} />}
            </div>
            <div className={nav ? 'fixed left-0 top-0 w-[60%] h-full border-r border-r-gray-700 bg-black ease-in-out duration-500' : 'fixed left-[-100%]'}>
                <h1 className='w-full text-3xl font-bold text-[#ff0000] m-8'>bloodflow</h1>
                <ul className='uppercase p-4'>
                    <li className='p-6'>Home</li>
                    <li className='p-6'>Our Services</li>
                    <li className='p-6'>Contacts</li>
                    <button className='bg-white w-[150px] ml-4 rounded-md font-bold mt-6 py-3 text-[#ff0000] hover:bg-[#ff0000] hover:text-white transition duration-300'>Sign In</button>
            </ul>
            </div>
        </div>
    )
}

export default Navbar