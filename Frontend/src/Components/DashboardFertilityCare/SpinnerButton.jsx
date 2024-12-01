import React from 'react';

const SpinnerButton = ({ onClick, isLoading, children }) => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <button 
        onClick={onClick}
        disabled={isLoading}
        className="w-40 text-sm md:w-52 rounded-md cursor-pointer font-bold py-2 md:py-4 text-white mt-1 md:mt-4 bg-[#ff0000] flex items-center justify-center relative"
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-t-white border-r-white border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
        ) : null}
        <span className={`${isLoading ? 'opacity-0' : 'opacity-100'}`}>
          {children}
        </span>
      </button>
    </div>
  );
};

export default SpinnerButton;