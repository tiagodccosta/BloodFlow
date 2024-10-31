import React from "react";
import Laptop from '../../Assets/analytics.jpg'
import { Link as RouterLink} from 'react-router-dom';
import TextReveal from '../magicui/text-reveal';
import BorderBeam from '../magicui/border-beam';
import DotPattern from '../magicui/dot-pattern';
import Dashboard from "../../Assets/dashboardBloodFlow.png";
import { useTranslation } from "react-i18next";
import wslisbon from "../../Assets/wslisbon.jpg";
import SLUX from "../../Assets/SULx_01.png";
import UFLX from "../../Assets/uflx.jpg";
import wsimpact from "../../Assets/wsImpactNew.png";

const Services = () => {

    const { t } = useTranslation();

    return (
        <div id="Services" className='w-full bg-white py-16 px-4'>

            <h1 className="text-[#000000] font-bold text-center text-lg sm:text-2xl pb-8 mt-10 sm:pb-8">🚀 {t('backed')} 🚀</h1>
            <div className='max-w-[1240px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-44'>
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

            <h1 className="text-[#000000] font-bold text-center text-3xl md:pb-8">{t('sabeMaisServices')}</h1>
            <div className='max-w-[1240px] mx-auto mb-20 grid md:grid-cols-2'>
                <img className='w-[500px] mx-auto my-4' src={Laptop} alt="Laptop" />
                <div className='flex flex-col justify-center ml-4'>
                    <p className='text-[#ff0000] font-bold'>
                        {t('dashboardServices')}
                    </p>
                    <h1 className="md:text-4xl sm:text-3xl text-2xl font-bold py-2">{t('analiseServices')}</h1>
                    <p className='md:text-1xl sm:text-1xl text-1xl py-4'>
                        {t('textServices')}
                    </p>
                    <button className='bg-black w-[200px] rounded-md font-bold mt-3 mb-14 mx-auto md:mx-0 py-3 text-white hover:bg-[#ff0000] hover:text-white transition duration-300'>
                        <RouterLink to="/signup">{t('createAccount')}</RouterLink>
                    </button>
                </div>
            </div>
            
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

            {/* 
                TODO: Create another section where we can show and explain more
                about the servides we offer.

                Like a 3 step with images and text of how BloodFlow works.

                1 - We collect your essencial information for our analysis
                2 - Centralize all your data in one place
                3 - In seconds you can have a full analysis of your blood test results
            */}      

        </div>
    )
};

export default Services