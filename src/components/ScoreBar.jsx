import React from 'react';

const ScoreBar = ({ label, score, maxScore = 20 }) => {
  const percentage = Math.min((score / maxScore) * 100, 100);

  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span>{label}: {score.toFixed(1)} / {maxScore}</span>
        <span>{percentage.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded h-3 overflow-hidden">
        <div
          className={`h-full ${percentage > 80 ? 'bg-red-500' : percentage > 50 ? 'bg-yellow-400' : 'bg-green-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ScoreBar;
