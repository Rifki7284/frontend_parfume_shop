import React, { useState, useEffect } from 'react';

const ClientPreloader = () => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setFadeOut(true), 500);
          setTimeout(() => setIsVisible(false), 1500);
          return 100;
        }
        return prev + Math.random() * 8 + 2;
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 bg-gradient-to-br from-stone-50 via-amber-50 to-rose-50 flex flex-col items-center justify-center z-50 transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(45deg, #8B5A2B 1px, transparent 1px),
                           linear-gradient(-45deg, #8B5A2B 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-md mx-auto px-8">
        
        {/* Minimalist logo area */}
        <div className="mb-16">
          {/* Simple geometric perfume bottle silhouette */}
          <div className="relative mx-auto w-16 h-24 mb-8">
            {/* Bottle outline - minimal and elegant */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-16 border-2 border-red-800 rounded-t-lg">
              {/* Liquid level indicator */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-red-800 transition-all duration-700 ease-out"
                style={{ height: `${progress * 0.6}%` }}
              />
            </div>
            {/* Cap */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-8 border-2 border-red-800 rounded-sm" />
          </div>

          {/* Brand name */}
          <h1 className="text-4xl md:text-5xl font-light text-red-900 mb-2 tracking-[0.2em]" 
              style={{ fontFamily: 'serif' }}>
            WANGY
          </h1>
          
          <div className="w-24 h-px bg-red-800 mx-auto mb-3" />
          
          <p className="text-red-700 text-sm tracking-[0.15em] font-light uppercase">
            Signature Collection
          </p>
        </div>

        {/* Progress indicator - minimal and sophisticated */}
        <div className="mb-12">
          <div className="flex justify-between items-center text-xs text-red-700 mb-4 font-light">
            <span className="tracking-wide">Loading</span>
            <span className="tracking-wide">{Math.round(progress)}%</span>
          </div>
          
          {/* Clean progress bar */}
          <div className="relative w-full h-px bg-red-200">
            <div 
              className="absolute left-0 top-0 h-full bg-red-800 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Minimal loading indicator */}
        <div className="flex justify-center items-center space-x-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 bg-red-700 rounded-full opacity-40"
              style={{
                animation: `pulse 2s infinite`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </div>

        {/* Completion state */}
        {progress === 100 && (
          <div className="mt-8 animate-fade-in">
            <div className="w-6 h-6 border border-red-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" 
                 style={{ animationDuration: '2s' }} />
            <p className="text-red-700 text-sm tracking-wide font-light">
              Experience Awaits
            </p>
          </div>
        )}
      </div>

      {/* Subtle corner decorations */}
      <div className="absolute top-8 left-8 w-8 h-8 border-l border-t border-red-200" />
      <div className="absolute top-8 right-8 w-8 h-8 border-r border-t border-red-200" />
      <div className="absolute bottom-8 left-8 w-8 h-8 border-l border-b border-red-200" />
      <div className="absolute bottom-8 right-8 w-8 h-8 border-r border-b border-red-200" />

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { 
            opacity: 0.4; 
            transform: scale(1);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.2);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ClientPreloader;