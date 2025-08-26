import React from "react";

const FullScreenLogoLoader = () => {
  return (
    <div className="bg-black h-screen w-screen flex flex-col items-center justify-center">
      {/* Logo */}
      <img
        src="/capitalkvAILogo.png" // Replace with the path to your logo
        alt="Logo"
        className="w-28 h-28 border-1 border-white rounded-lg p-5  animate-pulse"
      />
      {/* Text */}
      <p className="mt-4 text-white text-md font-medium">Loading...</p>
    </div>
  );
};

export default FullScreenLogoLoader;
