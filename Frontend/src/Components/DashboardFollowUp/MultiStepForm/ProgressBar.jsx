import React from 'react';

const ProgressBar = ({ step, totalSteps }) => {
    const progress = ((step + 1) / totalSteps) * 100;
    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
                className="bg-red-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    );
};

export default ProgressBar;
