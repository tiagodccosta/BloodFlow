import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const FAQSection = () => {
    const { t } = useTranslation();

    const faqs = [
        {
            question: "Who manages the integration process?",
            answer: "Our dedicated AI integration specialists will work closely with your clinic to ensure a smooth, fast setup process with minimal downtime."
        },
        {
            question: "How long does the setup take?",
            answer: "Our integration typically takes between 1-2 weeks, depending on your current system’s configuration and readiness."
        },
        {
            question: "How accurate is the AI analysis?",
            answer: "Our AI technology is thoroughly tested and benchmarked to deliver accuracy levels that match or exceed traditional manual analysis, ensuring reliable results for your clinic."
        },
        {
            question: "Is there ongoing support?",
            answer: "Yes, our team provides continuous support and maintenance to keep your system running smoothly, with regular software updates and troubleshooting assistance."
        },
        {
            question: "Can the system handle fluctuating patient volumes?",
            answer: "Absolutely. Our AI solution is designed to scale effortlessly with your clinic’s demand, so you get fast, reliable analysis even during peak times."
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
                            className="w-full flex justify-between items-center p-4 text-white text-md font-semibold focus:outline-none transition-all"
                        >
                            <span>{faq.question}</span>
                            <span className={`transform transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                                &#9660;
                            </span>
                        </button>
                        {openIndex === index && (
                            <div className="p-4 text-gray-300 text-sm transition-opacity duration-300 ease-in-out">
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