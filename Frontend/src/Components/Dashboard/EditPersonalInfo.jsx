import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const EditPersonalInfo = ({ show, onClose, userInfo, userId }) => {
  const [formData, setFormData] = useState(userInfo);
  const { t } = useTranslation();

  useEffect(() => {
    if (userInfo) {
      setFormData(userInfo);
    }
  }, [userInfo]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try{
        const userDoc = doc(db, "users", userId);
        await setDoc(userDoc, {
            username: formData.username,
            healthNumber: formData.healthNumber,
            dateOfBirth: userInfo.dateOfBirth,
            medicalCondition: formData.medicalCondition,
        });

        toast.success(t('dadosAtualizadosPopup'));
        onClose();
        window.location.reload();
    }
    catch(error){
        toast.error(t('dadosAtualizadosPopupError'));
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm confirm-dialog">
      <div className="bg-white rounded-lg overflow-hidden max-w-md mx-auto md:max-w-2xl w-full md:w-3/4 shadow-lg">
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">{t('editarInfo')}</h2>
          <form onSubmit={handleSave}>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">{t('nome')}</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">{t('snsNumber')}</label>
              <input
                type="text"
                name="healthNumber"
                value={formData.healthNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">{t('condicaoMedica')}</label>
              <input
                type="text"
                name="medicalCondition"
                value={formData.medicalCondition}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                onClick={handleSave}
                className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-sm mr-4"
              >
                {t('save')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold text-sm"
              >
                {t('cancelar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPersonalInfo;