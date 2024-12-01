import React, { useState, useEffect } from 'react';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../firebase';
import { toast } from 'react-toastify';
import ProgressBar from './ProgressBar';
import Section1 from './FormSections/Section1';
import Section2 from './FormSections/Section2';

const MultiStepForm = ({ patientId, consultationNumber, onFormComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({});
    const sections = [Section1, Section2];

    useEffect(() => {
        const fetchExistingFormData = async () => {
            if (!patientId || !consultationNumber) return;

            try {
                const filePath = `FertilityCareFollowUp/${patientId}/consult.json`;
                const fileRef = ref(storage, filePath);
                const url = await getDownloadURL(fileRef);

                const response = await fetch(url);
                const data = await response.json();

                setFormData(data);
            } catch (error) {
                // If no existing data, keep form data empty
                console.log('No existing form data', error);
                setFormData({});
            }
        };

        setCurrentStep(0);
        fetchExistingFormData();
    }, [patientId, consultationNumber]);

    const handleSave = async (newData) => {
        try {
            const updatedFormData = {
                ...formData,
                ...newData,
                consultationNumber: consultationNumber
            };

            const filePath = `FertilityCareFollowUp/${patientId}/consultation${consultationNumber}.json`;
            const fileRef = ref(storage, filePath);

            await uploadString(fileRef, JSON.stringify(updatedFormData));
            
            toast.success(`Consultation ${consultationNumber} form saved successfully!`);
            
            // Notify parent component that form is complete
            if (onFormComplete) {
                onFormComplete();
            }
        } catch (error) {
            console.error('Error saving form data:', error);
            toast.error('Failed to save form data');
        }
    };

    const handleNext = (newData) => {
        setFormData((prev) => ({ 
            ...prev, 
            ...newData 
        }));
        
        if (currentStep === sections.length - 1) {
            handleSave(newData);
        } else {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if(currentStep === 0) return;
        setCurrentStep((prev) => prev - 1);
    };

    // Render logic
    const renderContent = () => {
        // Render form sections
        const CurrentSection = sections[currentStep];
        return (
            <>
                <ProgressBar step={currentStep} totalSteps={sections.length} />
                <CurrentSection
                    data={formData}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    onSave={handleSave}
                    isLastStep={currentStep === sections.length - 1}
                    consultationNumber={consultationNumber}
                />
            </>
        );
    };

    return (
        <div className="form-container">
            {renderContent()}
        </div>
    );
};

export default MultiStepForm;