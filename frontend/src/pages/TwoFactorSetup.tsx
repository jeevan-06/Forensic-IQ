import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldAlert, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function TwoFactorSetup() {
  const [provisioningUri, setProvisioningUri] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch current user and setup 2FA uri
    const setup2FA = async () => {
      try {
        const userRes = await api.get('/auth/me');
        setUsername(userRes.data.username);
        
        const res = await api.post(`/auth/2fa/setup?username=${userRes.data.username}`);
        setProvisioningUri(res.data.provisioning_uri);
      } catch (err: any) {
        setError('Failed to initialize 2FA setup');
      }
    };
    setup2FA();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/auth/2fa/enable?username=${username}&code=${totpCode}`);
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid TOTP code');
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark relative overflow-hidden flex flex-col items-center justify-center font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyber-neonBlue/10 via-cyber-dark to-cyber-dark pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-10 max-w-md w-full relative z-10 border-cyber-neonGreen/30"
      >
        <div className="flex justify-center mb-6">
          {success ? (
            <CheckCircle className="w-16 h-16 text-cyber-neonGreen drop-shadow-[0_0_15px_rgba(57,255,20,0.6)]" />
          ) : (
            <ShieldAlert className="w-16 h-16 text-cyber-neonGreen drop-shadow-[0_0_15px_rgba(57,255,20,0.6)]" />
          )}
        </div>
        
        <h2 className="text-2xl font-black mb-4 text-center tracking-wider text-white">
          {success ? 'SECURITY UPGRADED' : 'CONFIGURE 2FA'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {success ? (
          <p className="text-center text-gray-300">2FA successfully enabled. Redirecting to dashboard...</p>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-gray-400 text-sm text-center mb-6">
              Scan this QR code with Google Authenticator or Authy to secure your connection.
            </p>
            
            <div className="bg-white p-4 rounded-xl mb-6">
              {provisioningUri ? (
                <QRCodeSVG value={provisioningUri} size={200} />
              ) : (
                <div className="w-[200px] h-[200px] flex items-center justify-center text-gray-500">Loading...</div>
              )}
            </div>

            <form onSubmit={handleVerify} className="w-full">
              <input
                type="text"
                placeholder="ENTER 6-DIGIT CODE"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                maxLength={6}
                className="w-full bg-cyber-dark/50 border border-cyber-neonGreen/50 rounded-lg py-3 px-4 text-white text-center tracking-[0.5em] font-mono text-xl focus:outline-none focus:border-cyber-neonGreen transition-colors mb-4"
                required
              />
              <button type="submit" className="w-full btn-cyber border-cyber-neonGreen/30 hover:border-cyber-neonGreen hover:text-cyber-neonGreen font-bold tracking-widest">
                VERIFY & ENABLE
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
