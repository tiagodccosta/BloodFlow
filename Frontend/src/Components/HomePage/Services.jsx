import React from "react";
/*
import Laptop from '../../Assets/analytics.jpg'
import { Link as RouterLink} from 'react-router-dom';
import TextReveal from '../magicui/text-reveal';
import BorderBeam from '../magicui/border-beam';
import DotPattern from '../magicui/dot-pattern';
import Dashboard from "../../Assets/dashboardBloodFlow.png";
*/
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import wslisbon from "../../Assets/wslisbon.jpg";
import SLUX from "../../Assets/SULx_01.png";
import UFLX from "../../Assets/uflx.jpg";
import wsimpact from "../../Assets/wsImpactNew.png";

const Services = () => {

    const { t } = useTranslation();

    return (
        <div id="Services" className='w-full bg-white py-16'>

            <h1 className="text-[#000000] font-bold text-center text-lg sm:text-2xl pb-8 mt-10 sm:pb-8">🚀 {t('backed')} 🚀</h1>
            <div className='max-w-[1240px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-24'>
                <div className='flex justify-center'>
                    <a href="https://www.startuplisboa.com/" target="_blank" rel="noopener noreferrer">
                        <img className='w-[130px] h-[80px] sm:mt-8 my-4' src={SLUX} alt="WS Lisbon" />
                    </a>
                </div>

                <div className='flex justify-center'>
                    <a href="https://unicornfactorylisboa.com/" target="_blank" rel="noopener noreferrer">
                        <img className='w-[220px] my-4 -mt-3' src={UFLX} alt="WS Lisbon" />
                    </a>
                </div>

                <div className='flex justify-center'>
                    <a href="https://websummit.com/appearances/lis24/9d50ce9f-6b8f-41a9-a7aa-b4a6afa4e0df/bloodflow/" target="_blank" rel="noopener noreferrer">
                        <img className='w-[150px] my-4' src={wslisbon} alt="WS Lisbon" />
                    </a>
                </div>

                <div className='flex justify-center'>
                    <a href="https://websummit.com/appearances/lis24/9d50ce9f-6b8f-41a9-a7aa-b4a6afa4e0df/bloodflow/" target="_blank" rel="noopener noreferrer">
                        <img className='w-[150px] my-4 -mt-1' src={wsimpact} alt="WS Impact" />
                    </a>
                </div>
            </div>

            <h1 className="text-[#ce3d3d] font-bold text-center text-2xl sm:text-4xl md:pb-8">{t('sabeMaisServices')}</h1>
            <h2 className="text-black font-bold text-center text-md sm:mb-12 sm:text-xl pb-8 mt-6 sm:mt-4">{t('sabeMaisServices2')}</h2>

            <div className="max-w-[1240px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 mb-16">
                <div className="relative flex flex-wrap">
                <div className="absolute inset-0 bg-gray-800 rounded-md shadow-lg transform translate-x-2 translate-y-2"></div>
                    <div className="bg-gradient-to-br from-[#ce3d3d] to-red-500 text-center text-white/90 font-semibold px-6 py-12 shadow-2xl rounded-md border-2 border-black transform transition-transform duration-300 hover:-translate-y-1 hover:-translate-x-1">
                        <p><span className="font-bold">{t('card1Prob')}</span>{t('card1ProbText')}</p>
                    </div>
                </div>

                <div className="relative flex flex-wrap">
                    <div className="absolute inset-0 bg-gray-800 rounded-md shadow-lg transform translate-x-2 translate-y-2"></div>
                    <div className="bg-gradient-to-br from-[#ce3d3d] to-red-500 text-center text-white/90 font-semibold px-6 py-12 shadow-2xl rounded-md border-2 border-black transform transition-transform duration-300 hover:-translate-y-1 hover:-translate-x-1">
                        <p><span className="font-bold">{t('card2Prob')}</span>{t('card2ProbText')}</p>
                    </div>
                </div>

                <div className="relative flex flex-wrap">
                    <div className="absolute inset-0 bg-gray-800 rounded-md shadow-md transform translate-x-2 translate-y-2"></div>
                    <div className="bg-gradient-to-br from-[#ce3d3d] to-red-500 text-center text-white/90 px-6 py-12 shadow-2xl rounded-md border-2 border-black transform transition-transform duration-300 hover:-translate-y-1 hover:-translate-x-1">
                        <p><span className="font-bold">{t('card3Prob')}</span>{t('card3ProbText')}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-[950px] mx-auto py-12 px-6">
                <h2 className="text-[#ce3d3d] font-bold text-center text-2xl sm:text-4xl md:pb-8">{t('Solution')}</h2>

                <div className="grid mt-16 sm:grid-cols-1 gap-10 sm:mt-10">
                    <div className="flex flex-col sm:flex-row items-center mb-24 sm:mb-32">
                        <div className="w-32 h-32 md:w-52 md:h-52 bg-red-300 rounded-lg mb-4 sm:mb-0 sm:mr-12 flex items-center justify-center flex-shrink-0">
                                <span className="text-xl font-bold text-red-600">1</span>
                        </div>
                            
                        <div className="text-center sm:text-left">
                            <h3 className="text-2xl sm:text-4xl font-semibold mb-6">{t('card1Sol')}</h3>
                            <p className="text-gray-600 text-lg sm:text-xl">
                                {t('card1SolText')}
                            </p>
                            <a href="https://calendly.com/tiago-costa-bloodflow" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                                <p className="text-red-500 text-lg sm:text-xl mt-6 cursor-pointer hover:underline decoration-red-500">
                                    {t('BookDemo')}
                                </p>
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row-reverse items-center mb-24 sm:mb-32">
                        <div className="w-32 h-32 md:w-52 md:h-52 bg-red-300 rounded-lg mb-4 sm:mb-0 sm:ml-12 flex items-center justify-center flex-shrink-0">
                            <span className="text-xl font-bold text-red-600">2</span>
                        </div>
                        <div className="text-center sm:text-left">
                            <h3 className="text-2xl sm:text-4xl font-semibold mb-6">{t('card2Sol')}</h3>
                            <p className="text-gray-600 text-lg sm:text-xl">
                                {t('card2SolText')}
                            </p>
                            <button className='bg-[#ff1717] w-[200px] rounded-lg font-semibold hover:scale-y-105 hover:scale-x-105 ease-in-out duration-300 py-3 text-white mt-6'>
                                <RouterLink to="/signup">{t('buttonHero2')}</RouterLink>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center mb-24 sm:mb-32">
                        <div className="w-32 h-32 md:w-52 md:h-52 bg-red-300 rounded-lg mb-4 sm:mb-0 sm:mr-12 flex items-center justify-center flex-shrink-0">
                            <span className="text-xl font-bold text-red-600">3</span>
                        </div>
                        <div>
                            <div className="text-center sm:text-left">
                                <h3 className="text-2xl sm:text-4xl font-semibold mb-6">{t('card3Sol')}</h3>
                                <p className="text-gray-600 text-lg sm:text-xl">
                                    {t('card3SolText')}
                                </p>
                                <button className='bg-[#ff1717] w-[200px] rounded-lg font-semibold hover:scale-y-105 hover:scale-x-105 ease-in-out duration-300 py-3 text-white mt-6'>
                                    <RouterLink to="/signup">{t('buttonHero2')}</RouterLink>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-black pt-32 pb-24 px-6 md:px-12 lg:px-24 text-center">
                <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-16">
                    Annual Savings for Our Clients
                </h2>
                <div className="flex flex-col md:flex-row items-center justify-center">
                    <div className="flex flex-col items-center bg-gray-800 shadow-lg shadow-gray-600 rounded-lg p-8 md:w-1/3 m-4">
                        <span className="text-5xl font-bold text-[#38ff72]">€29,000+</span>
                        <p className="mt-4 text-lg text-gray-300 text-center">
                            Average yearly savings per clinic with 500 blood tests per month
                        </p>
                    </div>
                    <div className="flex-1 sm:text-left text-center mt-8 md:mt-0">
                        <p className="text-lg sm:text-xl text-gray-400">
                            With BloodFlow, clinics save on labor, reduce errors, and streamline workflows through automated blood test analysis. This efficiency leads to substantial annual savings, allowing clinics to focus on delivering exceptional patient care.
                        </p>
                        <a href="https://calendly.com/tiago-costa-bloodflow" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                            <p className="text-[#ff0000] text-lg sm:text-xl mt-6 cursor-pointer hover:underline decoration-[#ff0000]">
                                {t('BookDemo')}
                            </p>
                        </a>
                    </div>
                </div>
            </div>

            <div className="bg-black py-16 px-6 md:px-12 lg:px-24 text-center">
                <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-2">
                    Tailored Pricing for Your Success
                </h2>
                <p className="text-gray-400 text-lg mb-12">
                    Customizable plans to suit your clinic's needs
                </p>
                    
                <div className="mx-auto items-center bg-white rounded-lg px-8 py-12 w-full max-w-[400px] shadow-lg shadow-gray-400">
                    <h3 className="text-3xl font-semibold text-gray-900 mb-2">Request a Quote</h3>
                    <p className="text-gray-600 mb-6">Price based on your needs</p>

                    <hr className="border-t border-gray-300 w-3/4 mx-auto my-8" />

                    <ul className="text-left text-gray-600 space-y-4 mb-8 mt-10">
                        <li>☑️ Full API integration with your system</li>
                        <li>☑️ Automated AI blood test analysis</li>
                        <li>☑️ Comprehensive reporting</li>
                        <li>☑️ Ongoing technical support</li>
                    </ul>

                    <hr className="border-t border-gray-300 w-3/4 mx-auto my-8 mb-12" />

                    <a 
                        href="https://calendly.com/tiago-costa-bloodflow" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-white font-semibold bg-[#ff0000] hover:bg-red-600 py-2 px-6 rounded-full transition-colors duration-300"
                    >
                        Request a Quote
                    </a>
                </div>
            </div>

            {/*}
            <DotPattern 
                width={20} height={20} cx={1} cy={1} cr={1} 
                style={{
                    maskImage: 'linear-gradient(to bottom right, white, white, transparent)'
                  }}
                >  

                <div className="flex justify-center items-center min-h-screen bg-white">
                    <h1 className="text-[#ce3d3d] font-bold text-center text-5xl mt-10 md:mt-10 sm:mt-10 absolute top-0 left-0 right-0 md:text-6xl">
                        {t('dashboardBloodFlow')}
                    </h1>
                    <p className="text-[#000000] font-bold text-center text-md mt-44 md:mt-30 sm:mt-28 absolute top-0 left-0 right-0 md:text-2xl">
                        {t('servicesSlogan')}
                    </p>
                    <div className="relative rounded-xl sm:mt-20">
                    <img
                        src={Dashboard}
                        alt=""
                        className="w-[1000px] rounded-[inherit] border object-contain shadow-xl dark:block"
                    />
                    <div className="absolute bottom-0 left-0 right-0 w-full h-24 rounded-b-[inherit] shadow-lg shadow-neutral-500" />
                        <div className="w-full">
                            <BorderBeam
                            size={500}
                            duration={12}
                            delay={9}
                            />
                        </div>
                    </div>
                </div>
            </DotPattern>

            <div className="z-10 flex min-h-[16rem] items-center justify-center bg-white text-gray-500">
                <TextReveal text={t('servicesScroll')} />
            </div>  
            */}

        </div>
    )
};

export default Services