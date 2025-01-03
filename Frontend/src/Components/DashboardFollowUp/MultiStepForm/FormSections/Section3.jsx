import React, { useState, useEffect } from 'react';

const Section3 = ({ data, onNext, onPrevious, onSave, isLastStep }) => {
  const [inputs, setInputs] = useState({
    dateOfFollowUp: Array(8).fill(''),
    teacherCode: Array(8).fill(''),
    additionalPersonsAtFollowUp: Array(8).fill(''),
    commentsOnWomansHealth: '',
    commentsOnMansHealth: '',
  });

  useEffect(() => {
    if (data) {
      setInputs((prev) => ({
        ...prev,
        dateOfFollowUp: data?.dateOfFollowUp || Array(8).fill(''),
        teacherCode: data?.teacherCode || Array(8).fill(''),
        additionalPersonsAtFollowUp: data?.additionalPersonsAtFollowUp || Array(8).fill(''),
        commentsOnWomansHealth: data?.commentsOnWomansHealth || '',
        commentsOnMansHealth: data?.commentsOnMansHealth || '',
      }));
    }
  }, [data]);

  const handleChange = (e, field, index) => {
    const { value } = e.target;
    setInputs((prev) => {
      const updatedField = [...prev[field]];
      updatedField[index] = value; 
      return { ...prev, [field]: updatedField };
    });
  };

  const handleNext = () => {
    onNext(inputs);
  };

  const handleSave = () => {
    onSave(inputs);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 mt-4">Comments on General Health</h2>
      
      <div className="mb-4">
        <label htmlFor="commentsOnWomansHealth" className="block text-gray-700 font-medium mb-2">
          1{')'} Comments on Woman's General Health:
        </label>
        <textarea
          id="commentsOnWomansHealth"
          name="commentsOnWomansHealth"
          value={inputs.commentsOnWomansHealth || ''}
          onChange={(e) => setInputs((prev) => ({ ...prev, commentsOnWomansHealth: e.target.value }))}
          required
          className="w-full px-4 py-2 border rounded-md"
        ></textarea>
      </div>

      <div className="mb-4">
        <label htmlFor="commentsOnMansHealth" className="block text-gray-700 font-medium mb-2">
          2{')'} Comments on Man's General Health:
        </label>
        <textarea
          id="commentsOnMansHealth"
          name="commentsOnMansHealth"
          value={inputs.commentsOnMansHealth || ''}
          onChange={(e) => setInputs((prev) => ({ ...prev, commentsOnMansHealth: e.target.value }))}
          required
          className="w-full px-4 py-2 border rounded-md"
        ></textarea>
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border px-4 py-2">Field</th>
              {[...Array(8)].map((_, index) => (
                <th key={index} className="border px-4 py-2">Consult {index + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Date of Follow-Up</td>
              {[...Array(8)].map((_, index) => (
                <td key={index} className="border px-4 py-2">
                  <input
                    type="date"
                    value={inputs.dateOfFollowUp[index] || ''}
                    onChange={(e) => handleChange(e, 'dateOfFollowUp', index)}
                    className="w-full"
                  />
                </td>
              ))}
            </tr>
            <tr>
              <td className="border px-4 py-2">Teacher Code</td>
              {[...Array(8)].map((_, index) => (
                <td key={index} className="border px-4 py-2">
                  <input
                    type="text"
                    value={inputs.teacherCode[index] || ''}
                    onChange={(e) => handleChange(e, 'teacherCode', index)} 
                    className="w-full"
                  />
                </td>
              ))}
            </tr>
            <tr>
              <td className="border px-4 py-2">Additional Persons at Follow-Up</td>
              {[...Array(8)].map((_, index) => (
                <td key={index} className="border px-4 py-2">
                  <input
                    type="text"
                    value={inputs.additionalPersonsAtFollowUp[index] || ''}
                    onChange={(e) => handleChange(e, 'additionalPersonsAtFollowUp', index)} 
                    className="w-full"
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex justify-between">
        {onPrevious && (
          <button
            onClick={onPrevious}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Back
          </button>
        )}
        {!isLastStep ? (
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Save
          </button>
        )}
      </div>
    </div>
  );
};

export default Section3;
