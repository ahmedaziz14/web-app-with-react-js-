import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { fetchChatHistory, sendMessage } from '../services/api';
import { getToken, removeToken } from '../services/auth';
import notificationSound from '../animations/notification-2-269292.mp3';
import '../styles/ChatPage.css';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [token, setToken] = useState(null);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user_id, user_name = 'Utilisateur', product_key, token: paramToken } = location.state || {};

  // Jouer un son
  const playMessageSound = () => {
    const audio = new Audio(notificationSound);
    audio.play().catch((error) => console.error('Erreur lors de la lecture du son:', error));
  };

  // Initialiser le token
  useEffect(() => {
    const initializeToken = async () => {
      try {
        if (paramToken) {
          setToken(paramToken);
        } else {
          const storedToken = await getToken();
          if (storedToken) {
            setToken(storedToken);
          } else {
            setAlert({ type: 'error', message: 'Aucun token trouvé, veuillez vous reconnecter.' });
            navigate('/signin', { replace: true });
          }
        }
      } catch (error) {
        setAlert({ type: 'error', message: 'Échec de la récupération du token.' });
        navigate('/signin', { replace: true });
      }
    };
    initializeToken();
  }, [paramToken, navigate]);

  // Gérer WebSocket et historique
  useEffect(() => {
    if (!token || !product_key) return;

    // Connexion WebSocket
    const newSocket = io('http://192.168.1.8:3001', { auth: { token } });
    newSocket.on('connect', () => console.log('Connecté au WebSocket'));
    newSocket.on('connect_error', () => {
      setAlert({ type: 'error', message: 'Échec de la connexion au WebSocket.' });
    });
    newSocket.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
      playMessageSound();
    });
    setSocket(newSocket);

    // Récupérer l’historique
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await fetchChatHistory(token, product_key);
        setMessages(response.data.messages || []);
        setAlert(null);
      } catch (error) {
        if (error.message.includes('Token expiré')) {
          await removeToken();
          setAlert({ type: 'error', message: error.message });
          navigate('/signin', { replace: true });
        } else {
          setAlert({ type: 'error', message: error.message || 'Échec de la récupération de l’historique.' });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();

    // Nettoyage
    return () => {
      newSocket.disconnect();
    };
  }, [token, product_key, navigate]);

  // Envoyer un message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !product_key) return;
    try {
      await sendMessage(token, product_key, newMessage);
      setNewMessage('');
      playMessageSound();
      setAlert(null);
    } catch (error) {
      if (error.message.includes('Token expiré')) {
        await removeToken();
        setAlert({ type: 'error', message: error.message });
        navigate('/signin', { replace: true });
      } else {
        setAlert({ type: 'error', message: error.message || 'Échec de l’envoi du message.' });
      }
    }
  };

  return (
    <Box className="chat-container">
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: '#333' }}>
        Chat avec {user_name}
      </Typography>

      {alert && (
        <Alert severity={alert.type} onClose={() => setAlert(null)} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List className="messages-list">
          {messages.map((item) => (
            <ListItem
              key={item.created_at}
              className={item.is_admin ? 'admin-message' : 'user-message'}
            >
              <ListItemText primary={item.message} />
            </ListItem>
          ))}
        </List>
      )}

      <Box className="input-container">
        <TextField
          fullWidth
          placeholder="Écrire un message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          variant="outlined"
          sx={{ bgcolor: '#fff', borderRadius: 2, mr: 2 }}
        />
        <Button
          variant="contained"
          color="success"
          onClick={handleSendMessage}
          sx={{ borderRadius: 2, px: 4 }}
        >
          Envoyer
        </Button>
      </Box>
    </Box>
  );
};

export default ChatPage;