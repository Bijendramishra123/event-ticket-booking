import { useState, useEffect, useRef } from 'react';

export const useTimer = (initialSeconds, onExpire) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (seconds <= 0 && isRunning) {
      setIsRunning(false);
      if (onExpire) {
        onExpire();
      }
      clearInterval(timerRef.current);
    }
  }, [seconds, isRunning, onExpire]);

  const start = () => {
    if (seconds <= 0) return;
    setIsRunning(true);
    timerRef.current = setInterval(() => {
      setSeconds(prev => Math.max(0, prev - 1));
    }, 1000);
  };

  const pause = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const reset = (newSeconds) => {
    pause();
    setSeconds(newSeconds);
    setIsRunning(false);
  };

  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    seconds,
    isRunning,
    start,
    pause,
    reset,
    formatTime,
    isExpired: seconds <= 0
  };
};

export default useTimer;