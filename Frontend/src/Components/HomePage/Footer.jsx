import React from "react";
import BloodFlowLogo from "../../Assets/BloodflowLogo.png";


const Footer = () => {
    return (
        <div className="bg-black w-full py-16 flex flex-col items-center text-center text-white">
            <h3 className="text-2xl sm:text-4xl font-bold mb-4 max-w-[650px]">
                Ready to transform your blood test analysis with AI?
            </h3>
            <p className="text-sm sm:text-lg text-gray-400 mb-8 max-w-[650px] px-6">
                Contact us today to schedule a demo and see how our AI-driven solution can streamline your clinic’s blood test analysis process.
            </p>
            <a 
                href="https://calendly.com/tiago-costa-bloodflow" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-[#ff0000] hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-full transition-colors duration-300"
            >
                Book a call with us
            </a>
            
            <div className="bg-blue-800 w-full flex flex-col md:flex-row items-center justify-between text-left mt-36 px-6 md:px-12 lg:px-24">
                <img className="w-36 md:w-44" src={BloodFlowLogo} alt="BloodFlow Logo" />

                <div className="text-white-400 mt-6 md:mt-0">
                    <p className="font-semibold">BloodFlow</p>
                    <p>Rua da Prata 80</p>
                    <p>Lisbon, Portugal</p>
                    <p className="mt-4">info@bloodflow.pt</p>
                </div>
            </div>

        </div>
    );
}

export default Footer;