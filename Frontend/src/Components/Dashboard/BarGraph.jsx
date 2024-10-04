import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const MyBarChart = ({ data, selectedFileMetadata, onBarClick }) => {

  const formattedData = data.map(item => ({
    ...item,
    time: new Date(item.time).toLocaleDateString()
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={(item) => `${item.time} - ${item.name}`} 
          tickFormatter={(value) => value.split(" - ")[0]}
        />
        <YAxis domain={[0, 10]} />
        <Tooltip 
          formatter={(value) => [`Score: ${value}`]}
          labelFormatter={(label) => label.split(" - ")[1]}
        />
        <Legend />
        <Bar dataKey="score" fill="#ce3d3d" barSize={30}>
          {data.map((entry, index) => (
              <Cell
                  key={`cell-${index}`}
                  fill={selectedFileMetadata && entry.name === selectedFileMetadata.name ? 'url(#animatedGradient)' : '#ce3d3d'}
                  onClick={() => onBarClick(entry.name)}
                  style={{ cursor: 'pointer' }}
              />
          ))}
        </Bar>
        <defs>
          <linearGradient id="animatedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(0, 155, 213, 1)" /> {/* Blue */}
            <stop offset="100%" stopColor="rgba(22, 100, 169, 1)" /> {/* Cyan */}
            <animate attributeName="y1" values="0%;85%;25%" dur="2s" repeatCount="indefinite" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
};
  
  export default MyBarChart;