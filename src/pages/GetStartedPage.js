import React from 'react';
import Lottie from 'lottie-react';
import adminAnimation from '../animations/admin.json';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import '../styles/GetStartedPage.css';

const GetStartedPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signin');
  };

  return (
    <Box className="gradient-background" sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box sx={{ textAlign: 'center', maxWidth: 600 }}>
        <Lottie animationData={adminAnimation} loop={true} style={{ width: 300, height: 300, margin: '0 auto' }} />
        <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 'bold', mt: 2, mb: 2 }}>
          Welcome to Niotoshieled Admin App 
        </Typography>
        <Typography variant="body1" sx={{ color: '#d1d1d1', mb: 2, px: 4 }}>
          Unlock the future with your car in one tap.
        </Typography>
        <Button
          variant="contained"
          onClick={handleGetStarted}
          sx={{
            backgroundColor: '#FF6F61',
            borderRadius: '25px',
            padding: '15px 30px',
            boxShadow: '0px 10px 20px rgba(255, 111, 97, 0.3)',
            '&:hover': { backgroundColor: '#e55a50' },
          }}
        >
          <Typography sx={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
            Get Started
          </Typography>
        </Button>
      </Box>
    </Box>
  );
};

export default GetStartedPage;