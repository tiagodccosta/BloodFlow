import React from 'react';

const CircularChart = ({ score }) => {

  const completionAngle = (score / 7) * 360;

  const gradients = {
    red: (
      <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="40%" stopColor="#D83400" />
        <stop offset="100%" stopColor="#FF3D00" />
      </linearGradient>
    ),
    orange: (
      <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="40%" stopColor="#FF8000" />
        <stop offset="100%" stopColor="#FFC000" />
      </linearGradient>
    ),
    green: (
      <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="40%" stopColor="#00C834" />
        <stop offset="100%" stopColor="#00FF00" />
      </linearGradient>
    )
  };

  let gradientId;
  if (score < 4) {
    gradientId = "redGradient";
  } else if (score < 6.5) {
    gradientId = "orangeGradient";
  } else {
    gradientId = "greenGradient";
  }

  return (
    <svg width="200" height="200">
      {/* Background circle */}
      <circle
        cx="100"
        cy="100"
        r="80"
        fill="none"
        stroke="000000"
        strokeWidth="20"
      />

      <defs>
        {gradients.red}
        {gradients.orange}
        {gradients.green}
      </defs>

      <circle
        cx="100"
        cy="100"
        r="80"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="30"
        strokeDasharray={`${completionAngle}, 360`}
        transform="rotate(-90, 100, 100)"
      />
      {/* Text */}
      <text x="100" y="110" fontSize="34" textAnchor="middle">
        {score}
      </text>
    </svg>
  );
};

export default CircularChart;