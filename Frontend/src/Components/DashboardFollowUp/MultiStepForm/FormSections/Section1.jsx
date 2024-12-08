import React, { useState, useEffect } from 'react';

const Section1 = ({ data, onNext, onPrevious, onSave, isLastStep }) => {
    const [inputs, setInputs] = useState({
        formNumber: '',
        id: '',
        womanName: '',
        manName: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        womanTelephone: '',
        manTelephone: '',
        womanEmail: '',
        lengthOfMarriage: '',
        womanMaritalStatus: '',
        manMaritalStatus: '',
        womanAge: '',
        manAge: '',
        numOfMarriages: {
            woman: '',
            man: '',
        },
    });

    useEffect(() => {
        setInputs((prev) => ({
            ...prev,
            ...data,
            numOfMarriages: {
                ...prev.numOfMarriages,
                ...data?.numOfMarriages,
            },
        }));
    }, [data]);


  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('numOfMarriages')) {
        const field = name.split('.')[1];
        setInputs((prev) => ({
            ...prev,
            numOfMarriages: {
                ...prev.numOfMarriages,
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

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 mt-4">General Information</h2>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
            <label className="block text-gray-700">Form #</label>
            <input
                type="text"
                name="formNumber"
                value={inputs.formNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded"
            />
        </div>
        <div>
            <label className="block text-gray-700">I.D. #</label>
            <input
                type="text"
                name="id"
                value={inputs.id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded"
            />
        </div>
        <div>
            <label className="block text-gray-700">Woman's Name</label>
            <input
                type="text"
                name="womanName"
                value={inputs.womanName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded"
            />
        </div>
        <div>
            <label className="block text-gray-700">Age</label>
            <input
                type="number"
                name="womanAge"
                value={inputs.womanAge}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded"
            />
        </div>
        <div>
            <label className="block text-gray-700">Marital Status</label>
            <input
                type="text"
                name="womanMaritalStatus"
                value={inputs.womanMaritalStatus}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded"
            />
        </div>
        <div>
            <label className="block text-gray-700">Man's Name</label>
            <input
                type="text"
                name="manName"
                value={inputs.manName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded"
            />
        </div>
        <div>
            <label className="block text-gray-700">Age</label>
            <input
                type="number"
                name="manAge"
                value={inputs.manAge}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded"
            />
         </div>
        <div>
            <label className="block text-gray-700">Marital Status</label>
            <input
                type="text"
                name="manMaritalStatus"
                value={inputs.manMaritalStatus}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded"
            />
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block text-gray-700">Address</label>
                <input
                    type="text"
                    name="address"
                    value={inputs.address}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded"
                />
            </div>
        <div>
            <label className="block text-gray-700">City</label>
            <input
                type="text"
                name="city"
                value={inputs.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded"
            />
        </div>
        <div>
            <label className="block text-gray-700">State</label>
            <input
                type="text"
                name="state"
                value={inputs.state}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded"
            />
        </div>
        <div>
            <label className="block text-gray-700">Zip</label>
            <input
                type="text"
                name="zip"
                value={inputs.zip}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded"
            />
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block text-gray-700">Woman's Telephone</label>
                <input
                    type="tel"
                    name="womanTelephone"
                    value={inputs.womanTelephone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded"
                />
            </div>
        <div>
            <label className="block text-gray-700">Man's Telephone</label>
            <input
                type="tel"
                name="manTelephone"
                value={inputs.manTelephone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded"
            />
        </div>
        <div>
            <label className="block text-gray-700">Woman's e-mail</label>
            <input
                type="email"
                name="womanEmail"
                value={inputs.womanEmail}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded"
            />
        </div>
        <div>
            <label className="block text-gray-700">If married, length of present marriage</label>
            <input
                type="text"
                name="lengthOfMarriage"
                value={inputs.lengthOfMarriage}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded"
            />
        </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block text-gray-700">Number of marriage for each - Woman</label>
                <input
                    type="number"
                    name="numOfMarriages.woman"
                    value={inputs.numOfMarriages.woman}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded"
                />
            </div>
        <div>
            <label className="block text-gray-700">Number of marriage for each - Man</label>
            <input
                type="number"
                name="numOfMarriages.man"
                value={inputs.numOfMarriages.man}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded"
            />
        </div>
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
                onClick={onSave}
                className="px-4 py-2 bg-red-600 text-white rounded"
            >
                Save
            </button>
            )}
        </div>
    </div>
  );
};

export default Section1;