import React from 'react';
import { useState } from 'react';
import GradualSpacing from './gradual-spacing';

const GradualButton = ({ text, hoverText, className }) => {
    const [isHovered, setIsHovered] = useState(false);


    return (
      <button className={`inline-block ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>
        <GradualSpacing
          text={isHovered ? hoverText : text}
          framerProps={{
            hidden: { opacity: 0, scale: 0.9 },
            visible: { opacity: 1, scale: 1 },
          }}
        />
      </button>
    );
  };
  
  export default GradualButton;