import React, { useState, useEffect } from 'react';

const Section2 = ({ data, onNext, onPrevious, onSave, isLastStep }) => {
    const [inputs, setInputs] = useState({
        numOfPregnancies: '',
        numOfLiveBirths: '',
        numOfChildrenNowLiving: '',
        dateOfLastPAP: '',
        papRecommended: '',
        shortestToLongestMenstrualCycle: {
            shortest: '',
            longest: '',
        },
        mostRecentMethodOfFamilyPlanning: '',
        reproductiveCategoryAt1stFup: '',
        changeInReproductiveCategory: '',
        namesAndAgesOfChildren: '',
    });

    useEffect(() => {
        setInputs((prev) => ({
            ...prev,
            ...data,
            shortestToLongestMenstrualCycle: {
                ...prev.shortestToLongestMenstrualCycle,
                ...data?.shortestToLongestMenstrualCycle,
            },
        }));
    }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('shortestToLongestMenstrualCycle')) {
      const field = name.split('.')[1];
      setInputs((prev) => ({
        ...prev,
        shortestToLongestMenstrualCycle: {
          ...prev.shortestToLongestMenstrualCycle,
          [field]: value,
        },
      }));
    } else {
      setInputs((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = () => {
    onNext(inputs);
  };

  const handleSave = () => {
    onSave(inputs);
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 mt-4">Woman's Reproductive History</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700"># of Pregnancies</label>
          <input
            type="number"
            name="numOfPregnancies"
            value={inputs.numOfPregnancies}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700"># of live births</label>
          <input
            type="number"
            name="numOfLiveBirths"
            value={inputs.numOfLiveBirths}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700"># of children now living</label>
          <input
            type="number"
            name="numOfChildrenNowLiving"
            value={inputs.numOfChildrenNowLiving}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700">Date of last PAP</label>
          <input
            type="date"
            name="dateOfLastPAP"
            value={inputs.dateOfLastPAP}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700">Pap Recommended</label>
          <div className="flex items-center space-x-2">
            <label>
              <input
                type="radio"
                name="papRecommended"
                value="Y"
                checked={inputs.papRecommended === 'Y'}
                onChange={handleChange}
                className="mr-2"
              />
              Y
            </label>
            <label>
              <input
                type="radio"
                name="papRecommended"
                value="N"
                checked={inputs.papRecommended === 'N'}
                onChange={handleChange}
                className="mr-2"
              />
              N
            </label>
          </div>
        </div>
        <div>
          <label className="block text-gray-700">Shortest to longest menstrual cycle (in days)</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              name="shortestToLongestMenstrualCycle.shortest"
              value={inputs.shortestToLongestMenstrualCycle.shortest}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded"
            />
            <input
              type="text"
              name="shortestToLongestMenstrualCycle.longest"
              value={inputs.shortestToLongestMenstrualCycle.longest}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded"
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-700">Most recent method of family planning</label>
          <input
            type="text"
            name="mostRecentMethodOfFamilyPlanning"
            value={inputs.mostRecentMethodOfFamilyPlanning}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700">Reproductive Category at 1st F-up</label>
          <select
            name="reproductiveCategoryAt1stFup"
            value={inputs.reproductiveCategoryAt1stFup}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded"
          >
            <option value="">Select</option>
            <option value="1">Regular Cycles (21-38 days)</option>
            <option value="1s">Regular Cycles - sterilized</option>
            <option value="2">Long Cycles (generally {'>'} 38 days)</option>
            <option value="3">Breastfeeding-Total</option>
            <option value="4">Breastfeeding-Weaning</option>
            <option value="5">Post-Pill (within past year)</option>
          </select>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Change in reproductive category to:</label>
        <input
          type="text"
          name="changeInReproductiveCategory"
          value={inputs.changeInReproductiveCategory}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Names & Ages of Children:</label>
        <textarea
          name="namesAndAgesOfChildren"
          value={inputs.namesAndAgesOfChildren}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded"
        ></textarea>
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

export default Section2;