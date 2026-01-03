import React from "react";

export const SplashScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
      <div className="relative">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-700 rounded-full blur-xl opacity-70 animate-pulse"></div>
        
        {/* Logo container */}
        <div className="relative flex flex-col items-center">
          {/* Logo icon */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/30">
              <div className="text-white">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="48" 
                  height="48" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="animate-pulse"
                >
                  <path d="M12 2v20" />
                  <path d="M4 12h16" />
                  <path d="M5 5l2 2" />
                  <path d="M17 5l2 2" />
                  <path d="M5 19l2-2" />
                  <path d="M17 19l2-2" />
                </svg>
              </div>
            </div>
            
            {/* Animated rings */}
            <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping opacity-75"></div>
            <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
          </div>
          
          {/* App name */}
          <h1 className="mt-6 text-3xl font-bold text-white tracking-wide">
            Notes App
          </h1>
          
          {/* Loading text */}
          <p className="mt-2 text-white/80 text-sm font-medium">
            Loading your workspace...
          </p>
          
          {/* Loading indicator */}
          <div className="mt-6 w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full animate-progress"></div>
          </div>
        </div>
      </div>
      
      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};