import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getToken } from '../services/auth';
import { fetchSignupRequests } from '../services/api';
import '../styles/RequestPage.css';

const SignupRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [token, setToken] = useState(null);
  const [adminId, setAdminId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();
  const socketRef = useRef(null);

  // Initialize audio element
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
      const decoded = JSON.parse(jsonPayload);
      return {
        id: decoded.id || decoded.userId || decoded.sub || decoded.adminId,
        role: decoded.role
      };
    } catch (error) {
      console.error('Token decode error:', error);
      return { id: null, role: null };
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const storedToken = await getToken();
        if (!storedToken) {
          toast.error('Token not found.');
          navigate('/signin', { replace: true });
          return;
        }

        setToken(storedToken);
        const decoded = decodeTokenManually(storedToken);
        
        if (!decoded.id) {
          toast.error('Invalid ID in token, please reconnect.');
          navigate('/signin', { replace: true });
          return;
        }

        setAdminId(decoded.id);
      } catch (error) {
        console.error('Initialization error:', error);
        toast.error('Initialization failed. Please try again.');
        navigate('/signin', { replace: true });
      }
    };
    initialize();
  }, [navigate]);

  const handleFetchRequests = async (playSound = true) => {
    if (!token) return;
    
    setLoading(true);
    try {
      const { data } = await fetchSignupRequests(token);
      
      if (playSound && data.length > requests.length) {
        playNotificationSound();
      }
      setRequests(data);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to fetch requests');
      
      if (error.response?.status === 401) {
        navigate('/signin', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    if (!socketRef.current || !socketConnected) {
      toast.error('Not connected to server. Please wait...');
      return;
    }

    try {
      setRequests(prev => prev.filter(req => req.id !== requestId));
      
      socketRef.current.emit('accept-signup-request', { 
        requestId,
        adminId
      });
      
    } catch (error) {
      console.error('Accept error:', error);
      toast.error('Failed to send acceptance');
      handleFetchRequests(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (!socketRef.current || !socketConnected) {
      toast.error('Not connected to server. Please wait...');
      return;
    }

    try {
      setRequests(prev => prev.filter(req => req.id !== requestId));
      
      socketRef.current.emit('reject-signup-request', { 
        requestId,
        adminId
      });
      
    } catch (error) {
      console.error('Reject error:', error);
      toast.error('Failed to send rejection');
      handleFetchRequests(false);
    }
  };

  useEffect(() => {
    if (token && adminId) {
      handleFetchRequests(false);
    }
  }, [token, adminId]);

  useEffect(() => {
    if (!token || !adminId) return;

    socketRef.current = io('http://192.168.1.7:3001', { 
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    socketRef.current.on('connect', () => {
      console.log('Socket.IO connected');
      setSocketConnected(true);
      socketRef.current.emit('join-admin', { 
        adminId,
        role: 'admin' 
      });
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setSocketConnected(false);
    });

    socketRef.current.on('signup-request', (newRequest) => {
      console.log('New signup request:', newRequest);
      setRequests(prev => [newRequest, ...prev]);
      playNotificationSound();
      toast.info('New signup request received');
    });

    socketRef.current.on('signup-request-updated', ({ id, accepted }) => {
      toast.success(`Request ${accepted ? 'accepted' : 'rejected'} successfully`);
    });

    socketRef.current.on('signup-request-error', ({ requestId, message }) => {
      console.error('Request error:', message);
      toast.error(message);
      handleFetchRequests(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      toast.error('Connection error. Trying to reconnect...');
      setSocketConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token, adminId]);

  return (
    <div className="signup-requests-container">
      <ToastContainer 
        position="top-right" 
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <div className="gradient-background">
        <div className="header">
          <h1 className="title">Signup Requests</h1>
          <div className="connection-status">
            <span className={`status-indicator ${socketConnected ? 'connected' : 'disconnected'}`}>
              {socketConnected ? 'Connected' : 'Disconnected'}
            </span>
            <button
              onClick={() => handleFetchRequests(true)}
              className={`reload-button ${loading ? 'disabled' : ''}`}
              disabled={loading}
            >
              {loading ? <div className="spinner"></div> : 'Refresh'}
            </button>
          </div>
        </div>
        
        {requests.length === 0 && !loading ? (
          <div className="empty-container">
            <p className="empty-text">No signup requests</p>
          </div>
        ) : (
          <div className="requests-list">
            <AnimatePresence>
              {requests.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="request-item"
                >
                  <div className="request-content">
                    <p className="request-text">{item.message || 'New signup request'}</p>
                    <p className="request-meta">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                    {item.user_email && (
                      <p className="request-email">Email: {item.user_email}</p>
                    )}
                  </div>
                  <div className="actions">
                    <button
                      onClick={() => handleAcceptRequest(item.id)}
                      className="accept-button"
                      disabled={!socketConnected || item.processed_at}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectRequest(item.id)}
                      className="reject-button"
                      disabled={!socketConnected || item.processed_at}
                    >
                      Reject
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupRequestsPage;