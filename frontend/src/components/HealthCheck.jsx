import { useEffect, useState } from 'react';
import { checkHealth } from '../services/api';

const HealthCheck = () => {
  const [status, setStatus] = useState('checking');
  const [lastCheck, setLastCheck] = useState(null);

  const performHealthCheck = async () => {
    try {
      const response = await checkHealth();
      setStatus('healthy');
      setLastCheck(new Date().toLocaleTimeString());
      console.log('✅ Health check passed:', response.data);
    } catch (error) {
      setStatus('unhealthy');
      setLastCheck(new Date().toLocaleTimeString());
      console.error('❌ Health check failed:', error.message);
    }
  };

  useEffect(() => {
    performHealthCheck();
    const interval = setInterval(() => {
      performHealthCheck();
    }, 120000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm ${
        status === 'healthy' ? 'bg-emerald-500/20 text-emerald-400' :
        status === 'unhealthy' ? 'bg-red-500/20 text-red-400' :
        'bg-slate-500/20 text-slate-400'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          status === 'healthy' ? 'bg-emerald-400 animate-pulse' :
          status === 'unhealthy' ? 'bg-red-400' :
          'bg-slate-400 animate-pulse'
        }`}></div>
        <span className="text-xs font-medium">
          {status === 'healthy' ? 'Connected' :
           status === 'unhealthy' ? 'Disconnected' :
           'Checking...'}
        </span>
        {lastCheck && (
          <span className="text-xs opacity-60">
            {lastCheck}
          </span>
        )}
      </div>
    </div>
  );
};

export default HealthCheck;
