import React from 'react';

const Spinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-t-4 border-red-600 border-solid rounded-full animate-spin"></div>
    </div>
  );
};

export default Spinner;
