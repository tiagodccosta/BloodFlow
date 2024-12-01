import React, { useState, useEffect } from 'react';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../firebase';
import ProgressBar from './ProgressBar';
import Section1 from './FormSections/Section1';
import Section2 from './FormSections/Section2';

const MultiStepForm = ({ patientId, consultationNumber }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({});
    const sections = [Section1, Section2];

    const fetchFormData = async () => {
        try {
            const filePath = `FertilityCareFollowUp/${patientId}/consultations/consult${consultationNumber}.json`;
            const fileRef = ref(storage, filePath);
            const url = await getDownloadURL(fileRef);

            const response = await fetch(url);
            const data = await response.json();

            setFormData(data);
        } catch (error) {
            console.error('No existing form data:', error);
        }
    };

    useEffect(() => {
        fetchFormData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId, consultationNumber]);


    const handleSave = async () => {
        try {
            const filePath = `FertilityCareFollowUp/${patientId}/consultations/consult${consultationNumber}.json`;
            const fileRef = ref(storage, filePath);

            await uploadString(fileRef, JSON.stringify(formData));
            alert('Data saved successfully!');
        } catch (error) {
            console.error('Error saving form data:', error);
        }
    };

    const handleNext = (newData) => {
        setFormData((prev) => ({ ...prev, ...newData }));
        if (currentStep === sections.length - 1) {
            handleSave();
        } else {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if(currentStep === 0) return;
        setCurrentStep((prev) => prev - 1);
    };

    const CurrentSection = sections[currentStep];

    return (
        <div>
            <ProgressBar step={currentStep} totalSteps={sections.length} />
            <CurrentSection
                data={formData}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onSave={handleSave}
                isLastStep={currentStep === sections.length - 1}
                consultationNumber={consultationNumber}
            />
        </div>
    );
};

export default MultiStepForm;
