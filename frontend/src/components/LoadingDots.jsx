import React from 'react';

const LoadingDots = () => {
  return (
    <div className="min-w-[80px] flex justify-center">
      <div className="flex space-x-1 items-center">
        <div className="w-2 h-2 bg-white rounded-full animate-[bounce_0.7s_infinite]" />
        <div className="w-2 h-2 bg-white rounded-full animate-[bounce_0.7s_0.2s_infinite]" />
        <div className="w-2 h-2 bg-white rounded-full animate-[bounce_0.7s_0.4s_infinite]" />
      </div>
    </div>
  );
};

export default LoadingDots;