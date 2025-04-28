import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getToken } from '../services/auth';
import { fetchSignupRequests } from '../services/api'; // Tu vas ajouter cette fonction dans api.js
import '../styles/RequestPage.css'; // Crée un fichier similaire à NotificationsPage.css

const RequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [token, setToken] = useState(null);
  const [adminId, setAdminId] = useState(null);
  const [socket, setSocket] = useState(null);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    audioRef.current = new Audio('/animations/notification.mp3');
    audioRef.current.load();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.remove();
      }
    };
  }, []);

  const playNotificationSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(error => {
          console.error('Audio play failed:', error);
          toast.info('Click anywhere to enable sounds');
        });
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const decodeTokenManually = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Erreur lors du décodage du token', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const savedToken = getToken();
      if (!savedToken) {
        navigate('/login');
        return;
      }
      setToken(savedToken);
      const decoded = decodeTokenManually(savedToken);
      setAdminId(decoded.id);

      try {
        const data = await fetchSignupRequests(savedToken);
        setRequests(data);
      } catch (error) {
        console.error('Erreur lors du chargement des demandes:', error);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (token) {
      const newSocket = io(process.env.REACT_APP_BACKEND_URL, {
        auth: { token },
      });

      setSocket(newSocket);

      newSocket.on('signup-request', (newRequest) => {
        console.log('Nouvelle demande reçue:', newRequest);
        setRequests((prevRequests) => [newRequest, ...prevRequests]);
        playNotificationSound();
      });

      newSocket.on('signup-request-updated', ({ id, accepted }) => {
        console.log('Demande mise à jour:', id, accepted);
        setRequests((prevRequests) =>
          prevRequests.filter((request) => request.id !== id)
        );
        toast.success(`Demande ${accepted ? 'acceptée' : 'rejetée'} !`);
      });

      newSocket.on('signup-request-error', ({ message }) => {
        toast.error(`Erreur: ${message}`);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [token]);

  const handleAccept = (requestId) => {
    if (socket) {
      socket.emit('accept-signup-request', { requestId });
    }
  };

  const handleReject = (requestId) => {
    if (socket) {
      socket.emit('reject-signup-request', { requestId });
    }
  };

  return (
    <div className="requests-container">
      <ToastContainer />
      <h2>Demandes d'inscription</h2>
      {requests.length === 0 ? (
        <p>Aucune demande pour l'instant.</p>
      ) : (
        <AnimatePresence>
          {requests.map((request) => (
            <motion.div
              key={request.id}
              className="request-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <p><strong>Message:</strong> {request.message}</p>
              <p><em>Reçu le:</em> {new Date(request.created_at).toLocaleString()}</p>
              <div className="request-buttons">
                <button onClick={() => handleAccept(request.id)} className="accept-button">
                  Accepter
                </button>
                <button onClick={() => handleReject(request.id)} className="reject-button">
                  Rejeter
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
};

export default RequestsPage;
