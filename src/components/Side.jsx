// src/components/Side.jsx
import React from 'react';

const Side = () => {
  return (
    <div className="flex flex-col justify-center items-center w-1/2 min-h-screen bg-gradient-to-b from-indigo-700 via-blue-800 to-teal-500 text-white p-8">
      <img
        src="/GTN Logo 3.png"
        alt="GTN Logo"
        className="w-70 mb-12"
      />
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-extrabold mb-4">Welcome Back!</h1>
        <p className="text-lg leading-relaxed">
          Access your GTN Portal account to manage your projects, track progress, and collaborate seamlessly with your team.
        </p>
      </div>
    </div>
  );
};

export default Side;
