
import { LoginForm } from "../components/login-form" // Declare the LoginForm variable

export default async function LoginPage() {
  
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-slate-400/10 to-blue-400/10 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-32 w-40 h-40 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 opacity-20 animate-float">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
            <path
              d="M8 2h8v4l-2 2v12a2 2 0 01-2 2h-4a2 2 0 01-2-2V8l-2-2V2z"
              stroke="currentColor"
              strokeWidth="2"
              fill="currentColor"
            />
          </svg>
        </div>
        <div className="absolute top-3/4 right-1/4 opacity-20 animate-float delay-1000">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-400">
            <path
              d="M8 2h8v4l-2 2v12a2 2 0 01-2 2h-4a2 2 0 01-2-2V8l-2-2V2z"
              stroke="currentColor"
              strokeWidth="2"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white">
              <path
                d="M8 2h8v4l-2 2v12a2 2 0 01-2 2h-4a2 2 0 01-2-2V8l-2-2V2z"
                stroke="currentColor"
                strokeWidth="2"
                fill="currentColor"
              />
              <circle cx="12" cy="14" r="2" fill="white" opacity="0.3" />
            </svg>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
