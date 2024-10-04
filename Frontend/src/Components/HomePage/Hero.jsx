import React from 'react';
import { Link as ScrollLink } from 'react-scroll';
import AnimatedGradientText from '../magicui/shinyTextButton';
import { useTranslation } from 'react-i18next';
import Particles from '../magicui/particles';
import { ChevronRight } from "lucide-react";
import GradualSpacing from '../magicui/gradual-spacing';

const Hero = () => {
  const { t } = useTranslation();

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

      <div className="relative z-10 text-center -mt-40 max-w-[1200px]">
            <GradualSpacing className=" text-3xl sm:text-5xl md:text-7xl font-semibold text-transparent bg-gradient-to-b from-black/80 to-gray-400/80 bg-clip-text leading-none"
             text={t('title2')} />
			<ScrollLink to="Services" smooth={true} duration={500} className="mt-6 inline-block">
				<AnimatedGradientText>
					🎉 <hr className="mx-2 h-4 w-[1px] shrink-0 bg-gray-300" />{" "}
						<span
						className="inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent"
						>
						{t('buttonHero')}
						</span>{" "}
					<ChevronRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
				</AnimatedGradientText>
			</ScrollLink>
      </div>
    </div>
  );
};

export default Hero;
