const ModernGlassPreloader = ({
  isLoading = true,
  loadingText = "Loading TikTok Data"
}) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-2xl bg-white/95">
      {/* Clean minimalist background with subtle pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-2 h-2 bg-slate-300 rounded-full animate-pulse opacity-40" />
        <div className="absolute top-40 right-32 w-1 h-1 bg-slate-400 rounded-full animate-pulse opacity-30" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-slate-300 rounded-full animate-pulse opacity-50" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-40 right-20 w-2 h-2 bg-slate-400 rounded-full animate-pulse opacity-30" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Main Loading Container */}
      <div className="relative z-10 text-center">
        <div className="relative p-10 rounded-2xl bg-white/80 backdrop-blur-lg border border-slate-200 shadow-xl">

          {/* Content */}
          <div className="relative z-10">
            {/* Clean Loading Icon */}
            <div className="relative mb-8">
              <div className="absolute inset-0 animate-spin">
                <div className="w-12 h-12 mx-auto border-3 border-slate-200 border-t-slate-800 rounded-full" />
              </div>
              <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
                <div className="w-4 h-4 bg-slate-800 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Loading Text */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-2">
                Loading
              </h2>
              <p className="text-slate-600 text-sm">
                Memuat data
              </p>
            </div>

            {/* Clean Progress Bar */}
            <div className="w-64 mx-auto mb-6">
              <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-slate-800 rounded-full animate-pulse" style={{ width: '70%' }} />
              </div>
            </div>

            {/* Loading Dots */}
            <div className="flex justify-center space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-slate-500 text-sm">
          Please wait...
        </p>
      </div>
    </div>
  );
};
export default ModernGlassPreloader 