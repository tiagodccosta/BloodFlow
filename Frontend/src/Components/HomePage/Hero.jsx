import React from 'react';
import { ReactTyped } from "react-typed";
import { Link as RouterLink} from 'react-router-dom';



const Hero = () => {

    return (
        <div id="Home" className='text-white bg-black'>
            <div className='max-w-[800px] mt-[-96px] w-full h-screen mx-auto text-center flex flex-col justify-center'>
                <p className='text-[#ff0000] font-bold p-2 pb-5'>GROWING WITH DATA ANALYTICS</p>
                <h1 className='md:text-3xl sm:text-2xl text-xl font-bold md:py-5 pr-2 pl-2 mx-5'>REVOLUTIONIZING BLOOD WORK ANALYSIS WITH ARTIFICIAL INTELIGENCE.</h1>
                <div className='flex justify-center items-center'>
                    <p className='md:text-2xl sm:text-xl text-sm font-bold py-4'>Fast, flexible, interactive results for</p>
                    <ReactTyped className='md:text-2xl sm:text-xl text-sm font-bold pl-2 text-gray-500'
                    strings={['blood analysis']} 
                    typeSpeed={100} 
                    backSpeed={120}
                    loop
                    />
                </div>
                <button className='bg-[#ff0000] w-[200px] rounded-md font-bold my-6 mx-auto py-3 text-black'>
                <RouterLink to="/signup">GET STARTED</RouterLink></button>
            </div>
        </div>
    )
}

export default Hero