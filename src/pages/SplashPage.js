import React, { useEffect } from 'react';
import Lottie from 'lottie-react';
import splashAnimation from '../animations/splash.json';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import '../styles/SplashPage.css';

const SplashPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/get-started', { replace: true });
    }, 3000);

    return () => clearTimeout(timer); // Cleanup timer
  }, [navigate]);

  return (
    <Box className="gradient-background" sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Lottie animationData={splashAnimation} loop={false} style={{ width: 300, height: 300 }} />
    </Box>
  );
};

export default SplashPage;