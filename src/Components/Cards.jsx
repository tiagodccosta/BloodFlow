import React from "react";
import SinglePlan from '../Assets/singlePlan.jpeg';
import PremiumPlan from '../Assets/PremiumPlan.png';
import EnterprisePlan from '../Assets/Enterprise.png';


const Cards = () => {
    return(
        <div id="Cards" className="w-full py-[10rem] px-4 bg-white">
            <div className="max-w-[1240px] mx-auto grid md:grid-cols-3 gap-8">
                <div className="w-full shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-300 relative">
                    <img className="w-20 mx-auto mt-[-3rem] bg-white" src={SinglePlan} alt="/" />
                    <h2 className="text-2xl font-bold text-center py-8">SINGLE USER</h2>
                    <p className="text-center text-4xl text-bold">$15.99</p>
                    <div className="text-center font-medium">
                        <p className="py-2 border-b mx-8 mt-8">Bloodflow Analytics Dashboard</p>
                        <p className="py-2 border-b mx-8">Cross-Platform Storage of Test Results</p>
                        <p className="py-2 border-b mx-8">Only One Granted User</p>
                        <p className="py-2 border-b mx-8">Limited Storage</p>
                        <p className="py-2 border-b mx-8">No Access To Artifical Inteligence Analysis</p>
                    </div>
                    <button className='bg-black text-[#ff0000] rounded-md font-medium w-[200px] my-6 mx-auto px-6 py-3'>Buy Now</button>
                </div>

                <div className="w-full shadow-xl bg-gray-100 flex flex-col p-4 md:my-0 my-8 rounded-lg hover:scale-105 duration-300 relative">
                    <img className="w-20 mx-auto mt-[-3rem]" src={PremiumPlan} alt="/" />
                    <h2 className="text-2xl font-bold text-center py-8">PREMIUM USER</h2>
                    <p className="text-center text-4xl text-bold">$49.99</p>
                    <div className="text-center font-medium">
                        <p className="py-2 border-b mx-8 mt-8">Bloodflow Analytics Dashboard</p>
                        <p className="py-2 border-b mx-8">Cross-Platform Storage of Test Results</p>
                        <p className="py-2 border-b mx-8">Only One Granted User</p>
                        <p className="py-2 border-b mx-8">Unlimited Storage</p>
                        <p className="py-2 border-b mx-8">Artificial Inteligence Analysis</p>
                        <p className="py-2 border-b mx-8">Geo-Located Access To Nearby Medical Facilities</p>
                    </div>
                    <button className='bg-[#ff0000] text-black rounded-md font-medium w-[200px] my-6 mx-auto px-6 py-3'>Buy Now</button>
                </div>

                <div className="w-full shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-300 relative">
                    <img className="w-20 mx-auto mt-[-3rem] bg-white" src={EnterprisePlan} alt="/" />
                    <h2 className="text-2xl font-bold text-center py-8">ENTERPRISE</h2>
                    <p className="text-center text-4xl text-bold">$499.99</p>
                    <div className="text-center font-medium">
                        <p className="py-2 border-b mx-8 mt-8">Bloodflow Analytics Dashboard</p>
                        <p className="py-2 border-b mx-8">Cross-Platform Storage of Test Results</p>
                        <p className="py-2 border-b mx-8">Artificial Inteligence Analysis</p>
                        <p className="py-2 border-b mx-8">Unlimited Users</p>
                        <p className="py-2 border-b mx-8">Unlimited Storage</p>
                        <p className="py-2 border-b mx-8">Unlimited Pacients per User</p>
                    </div>
                    <button className='bg-black text-[#ff0000] rounded-md font-medium w-[200px] my-6 mx-auto px-6 py-3'>Buy Now</button>
                </div>
            </div>    
        </div>
    )
}

export default Cards