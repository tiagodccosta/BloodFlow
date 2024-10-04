import React from "react";
import SinglePlan from '../../Assets/singlePlan.jpeg';
import { Link as RouterLink} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

const Cards = () => {

    const {t} = useTranslation(); 

    return(
        <div id="Plans" className="w-full py-[10rem] px-4 bg-white">
            <h1 className='uppercase md:text-3xl sm:text-2xl text-2xl font-bold text-black text-center -mt-20'>{t('cardsFree')}</h1>
            <p className='md:text-xl sm:text-sm text-sm text-gray-500 p-2 pb-5 text-center md:px-40 sm:px-20'>
                {t('cardsSlogan')}
            </p>
            <div className="max-w-[450px] mx-auto grid md:grid-cols-1 gap-24 mt-20">
                <div className="w-full shadow-2xl flex flex-col p-4 my-4 hover:scale-105 duration-300 relative border-2 border-solid rounded-lg animate-gradient-pulse">
                    <img className="w-20 mx-auto mt-[-3rem]" src={SinglePlan} alt="/" />
                    <h2 className="text-2xl font-bold text-center py-8">REGULAR</h2>
                    <p className="text-center text-4xl text-bold">0€</p>
                    <div className="text-center font-medium">
                        <p className="py-2 border-b mx-8 mt-8">{t('card1')} 🖥️</p>
                        <p className="py-2 border-b mx-8">{t('card2')} 📁📁📁</p>
                        <p className="py-2 border-b mx-8">{t('card3')} 🙋🏻‍♂️</p>
                        <p className="py-2 border-b mx-8">{t('card4')} 🏆</p>
                        <p className="py-2 border-b mx-8">{t('card5')} 🧠</p>
                    </div>
                    <button className='bg-black text-white rounded-md font-medium w-[200px] my-6 mx-auto px-6 py-3'>
                    <RouterLink to="/signup">{t('createAccount')}</RouterLink></button>
                </div>
            </div>    
        </div>
    )
}

export default Cards