import React from "react";
import Laptop from '../Assets/analytics.jpg'

const Services = () => {
    return (
        <div id="Services" className='w-full bg-white py-16 px-4'>
            <h1 className="text-[#000000] font-bold text-center text-3xl md:pb-8">LEARN MORE ABOUT OUR SERVICES</h1>
            <div className='max-w-[1240px] mx-auto grid md:grid-cols-2'>
                <img className='w-[500px] mx-auto my-4' src={Laptop} alt="/" />
                <div className='flex flex-col justify-center'>
                    <p className='text-[#ff0000] font-bold'>BLOOD RESULTS ANALYTICS DASHBOARD</p>
                    <h1 className="md:text-4xl sm:text-3xl text-2xl font-bold py-2">Analyze Blood Results & Store Pacient Data Centrally</h1>
                    <p className='md:text-1xl sm:text-1xl text-1xl py-4'>BloodFlow is here to revolutionize how standartized blood work analysis are made. 
                        Using Artificial Inteligence to extract the fulcral data points and load them in our innovative interface. Store all your blood analysis in one single place across 
                        all health facilities. 
                    </p>
                    <button className='bg-black w-[200px] rounded-md font-bold my-6 mx-auto md:mx-0 py-3 text-[#ff0000]'>GET STARTED</button>
                </div>
            </div>
        </div>   
    )
}

export default Services