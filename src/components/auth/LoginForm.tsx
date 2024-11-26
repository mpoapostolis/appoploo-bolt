import { Ship, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginForm() {
  const handleDummyLogin = () => {
    localStorage.setItem('appoploo-auth', 'true');
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
      {/* Floating ships background animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-10"
            initial={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              scale: 0.5,
              rotate: 0
            }}
            animate={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              scale: [0.5, 0.8, 0.5],
              rotate: 360
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Ship className="w-12 h-12 text-white" />
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-4 space-y-8 p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 relative z-10"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="mx-auto w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6"
          >
            <Ship className="h-10 w-10 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2">Appoploo</h2>
          <p className="text-blue-100 text-sm">
            Maritime Fleet Management Platform
          </p>
        </div>

        <button
          onClick={handleDummyLogin}
          className="w-full flex items-center justify-center px-4 py-3 bg-white/10 text-white rounded-xl 
                     hover:bg-white/20 transition-colors duration-200 border border-white/20"
        >
          <LogIn className="h-5 w-5 mr-2" />
          Continue with Demo Account
        </button>

        <p className="text-center text-sm text-blue-100">
          Experience the future of maritime fleet management
        </p>
      </motion.div>
    </div>
  );
}