import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import AnimatedGradientText from '../magicui/shinyTextButton';
import { useTranslation } from 'react-i18next';
import Particles from '../magicui/particles';
import { ChevronRight } from "lucide-react";
import GradualSpacing from '../magicui/gradual-spacing';

const Hero = () => {
  const { t } = useTranslation();

  const [topButtonVisible, setTopButtonVisible] = useState(false);
  const [bottomButtonVisible, setBottomButtonVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);

  useEffect(() => {
    const topTimer = setTimeout(() => {
        setTopButtonVisible(true);
    }, 800);

    const bottomTimer = setTimeout(() => {
        setBottomButtonVisible(true);
        setSubtitleVisible(true);
    }, 1400);

    return () => {
        clearTimeout(topTimer);
        clearTimeout(bottomTimer);
    };
}, []);

  return (
    <div id="Home" className="relative text-black bg-white h-screen flex justify-center items-center overflow-hidden">
      {/* Particles background */}
      <Particles
        className="absolute inset-0"
        quantity={200} 
        ease={150} 
        color={'ff0000'}
        size={0.8}
        refresh
      />

      <div className="relative z-10 text-center -mt-40 max-w-[1050px]">
        <div className={`mb-8 transition-transform duration-500 ease-out ${topButtonVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`}>
            <a
              href="https://calendly.com/tiago-costa-bloodflow" target="_blank" rel="noopener noreferrer" className="inline-flex items-center" >
              <AnimatedGradientText>
              📅 <hr className="mx-2 h-4 w-[1px] shrink-0 bg-gray-300" />{" "}
                  <span
                  className="inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent"
                  >
                  {t('buttonHero')}
                  </span>{" "}
                <ChevronRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
              </AnimatedGradientText>
            </a>
          </div>
          
          <div className='mb-5 sm:mb-8'>
              <GradualSpacing className=" text-2xl sm:text-4xl md:text-6xl font-semibold text-transparent bg-gradient-to-b from-black/80 to-gray-400/80 bg-clip-text leading-none"
              text={t('title2')} />
          </div>

          <div className={`relative z-10 text-center max-w-[600px] mx-5 sm:mx-auto mb-5 transition-transform duration-500 ease-out ${subtitleVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
              <h1 className="text-sm sm:text-md md:text-lg font-semibold text-transparent bg-gradient-to-b from-black/80 to-gray-600/90 bg-clip-text leading-none">
                {t('subtitle')}
              </h1>
          </div>

          <div className={`mt-8 transition-transform duration-500 ease-out ${bottomButtonVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
              <button className='bg-[#ff1717] w-[350px] rounded-lg font-semibold hover:scale-y-105 hover:scale-x-105 ease-in-out duration-300 py-3 text-white'>
                  <RouterLink to="/signup">{t('buttonHero2')}</RouterLink>
              </button>
          </div>
        </div>
    </div>
  );
};

export default Hero;
