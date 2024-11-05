import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const FAQSection = () => {
    const { t } = useTranslation();

    const faqs = [
        {
            question: t('Question1'),
            answer: t('Answer1')
        },
        {
            question: t('Question2'),
            answer: t('Answer2')
        },
        {
            question: t('Question3'),
            answer: t('Answer3')
        },
        {
            question: t('Question4'),
            answer: t('Answer4')
        },
        {
            question: t('Question5'),
            answer: t('Answer5')
        }
    ];

    const [openIndex, setOpenIndex] = useState(null);

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="bg-black py-32 px-6 md:px-12 lg:px-24 text-center -mt-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-8">FAQs</h2>
            <div className="max-w-3xl mx-auto space-y-4 text-left">
                {faqs.map((faq, index) => (
                    <div key={index} className="bg-black rounded-lg overflow-hidden border border-gray-900 hover:border-gray-600">
                        <button 
                            onClick={() => toggleAccordion(index)}
                            className="w-full flex justify-between items-center p-4 text-white text-sm sm:text-md font-semibold focus:outline-none transition-all"
                        >
                            <span>{faq.question}</span>
                            <span className={`transform transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                                &#9660;
                            </span>
                        </button>
                        {openIndex === index && (
                            <div className="p-4 text-gray-300 text-xs sm:text-sm transition-opacity duration-300 ease-in-out">
                                {faq.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <button className='bg-[#ff1717] w-[200px] rounded-lg font-semibold hover:scale-y-105 hover:scale-x-105 ease-in-out duration-300 py-3 text-white mt-12'>
                <RouterLink to="/signup">{t('buttonHero2')}</RouterLink>
            </button>
        </div>
    );
};

export default FAQSection;