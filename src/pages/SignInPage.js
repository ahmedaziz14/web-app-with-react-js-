import React, { useState } from 'react';
import Lottie from 'lottie-react';
import signupAnimation from '../animations/signup.json';
import { Box, Typography, TextField, Button, Alert, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../services/api';
import { setToken } from '../services/auth';
import '../styles/SignInPage.css';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setAlert({ type: 'error', message: 'Veuillez remplir tous les champs.' });
      return;
    }

    if (!isValidEmail(email)) {
      setAlert({ type: 'error', message: 'Veuillez entrer une adresse email valide.' });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const response = await signIn(email, password);
      await setToken(response.data.token);
      setAlert({ type: 'success', message: 'Connexion réussie !' });
      setTimeout(() => {
        navigate('/users', { replace: true });
      }, 1000);
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message || 'Problème de connexion au serveur.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="gradient-background" sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 400, p: 3, bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, textAlign: 'center' }}>
        <Lottie animationData={signupAnimation} loop={true} style={{ width: 200, height: 200, margin: '0 auto 20px' }} />
        <Typography variant="h5" sx={{ color: '#fff', mb: 2 }}>
          Connexion Admin
        </Typography>

        {alert && (
          <Alert severity={alert.type} onClose={() => setAlert(null)} sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          variant="outlined"
          sx={{
            mb: 2,
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            '& .MuiInputBase-input': { color: '#fff' },
            '& .MuiInputLabel-root': { color: '#aaa' },
            ...(email && { '& .MuiOutlinedInput-root': { borderColor: '#FF6F61' } }),
          }}
        />
        <TextField
          fullWidth
          label="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          variant="outlined"
          sx={{
            mb: 2,
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            '& .MuiInputBase-input': { color: '#fff' },
            '& .MuiInputLabel-root': { color: '#aaa' },
            ...(password && { '& .MuiOutlinedInput-root': { borderColor: '#FF6F61' } }),
          }}
        />
        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          disabled={loading || !email || !password || !isValidEmail(email)}
          sx={{
            bgcolor: email && password && isValidEmail(email) ? '#FF6F61' : '#444',
            borderRadius: '50px',
            py: 1.5,
            mt: 1,
            mb: 2,
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
            '&:hover': { bgcolor: email && password && isValidEmail(email) ? '#e55a50' : '#555' },
          }}
        >
          <Typography sx={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
            {loading ? 'Chargement...' : 'Se connecter'}
          </Typography>
        </Button>
        <Link
          href="/signup"
          sx={{ color: '#FF6F61', textDecoration: 'underline', fontSize: '16px' }}
          onClick={(e) => {
            e.preventDefault();
            navigate('/signup');
          }}
        >
          Pas de compte ? Inscrivez-vous
        </Link>
      </Box>
    </Box>
  );
};

export default SignInPage;