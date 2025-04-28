import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getToken } from '../services/auth';
import { fetchNotifications, markAsRead, deleteNotification } from '../services/api';
import '../styles/NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [token, setToken] = useState(null);
  const [adminId, setAdminId] = useState(null);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio('/animations/notification.mp3');
    audioRef.current.load(); // Preload the audio file

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.remove();
      }
    };
  }, []);

  // Play notification sound with user interaction check
  const playNotificationSound = () => {
    try {
      if (audioRef.current) {
        // Reset audio position if already playing
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(error => {
          console.error('Audio play failed:', error);
          toast.info('Click anywhere to enable notification sounds');
        });
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  // Decode JWT token
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
      console.error('Token decode error:', error);
      return {};
    }
  };

  // Initialize token and adminId
  useEffect(() => {
    const initialize = async () => {
      const storedToken = await getToken();
      if (storedToken) {
        setToken(storedToken);
        const decoded = decodeTokenManually(storedToken);
        const id = decoded.id || decoded.adminId || decoded.sub;
        if (id) {
          setAdminId(id);
        } else {
          toast.error('Invalid ID, please reconnect.');
          navigate('/signin', { replace: true });
        }
      } else {
        toast.error('Token not found.');
        navigate('/signin', { replace: true });
      }
    };
    initialize();
  }, [navigate]);

  // Fetch notifications
  const handleFetchNotifications = async (playSound = true) => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await fetchNotifications(token);
      if (playSound && data.length > notifications.length) {
        playNotificationSound();
      }
      setNotifications(data);
    } catch (error) {
      toast.error(error.message || 'Unknown error.');
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    if (!token) {
      toast.error('No token available.');
      navigate('/signin', { replace: true });
      return;
    }
    try {
      const { data } = await markAsRead(token, notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      if (data.success) {
        handleFetchNotifications(false);
      }
    } catch (error) {
      console.error('Error in handleMarkAsRead:', error);
      if (error.message.includes('Token expired or invalid')) {
        toast.error('Session expired. Please reconnect.');
        navigate('/signin', { replace: true });
      } else {
        toast.error(error.message || 'Network error.');
        handleFetchNotifications(false);
      }
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId) => {
    if (!token) {
      toast.error('No token available.');
      navigate('/signin', { replace: true });
      return;
    }
    try {
      await deleteNotification(token, notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      toast.error(error.message || 'Delete failed.');
    }
  };

  // Fetch notifications on token/adminId change
  useEffect(() => {
    if (token && adminId) {
      handleFetchNotifications(false);
    }
  }, [token, adminId]);

  // Initialize Socket.IO
  useEffect(() => {
    if (!token || !adminId) return;
    const socket = io('http://192.168.1.7:3001', { auth: { token } });

    socket.on('connect', () => {
      console.log('Socket.IO connected');
      socket.emit('join', adminId);
    });

    socket.on('new-notification', (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      playNotificationSound();
    });

    socket.on('notification-marked-as-read', (id) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    });

    socket.on('notification-deleted', (id) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO error:', error);
      toast.error('Socket.IO connection failed.');
    });

    return () => {
      socket.disconnect();
    };
  }, [token, adminId]);

  return (
    <div className="notifications-container" onClick={playNotificationSound}>
      <ToastContainer position="top-right" autoClose={3000} />
      <div
        className="gradient-background"
        style={{
          background: 'linear-gradient(135deg, #FF9A9E, #FAD0C4, #A18CD1, #FBC2EB)',
        }}
      >
        <div className="header">
          <h1 className="title">Notifications</h1>
          <button
            onClick={() => handleFetchNotifications(true)}
            className={`reload-button ${loading ? 'disabled' : ''}`}
            disabled={loading}
          >
            {loading ? <div className="spinner"></div> : 'Refresh'}
          </button>
        </div>
        {notifications.length === 0 && !loading ? (
          <div className="empty-container">
            <p className="empty-text">No notifications</p>
          </div>
        ) : (
          <div className="notifications-list">
            <AnimatePresence>
              {notifications.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`notification-item ${item.is_read ? 'read' : 'unread'}`}
                >
                  <p className="notification-text">{item.message || 'No message'}</p>
                  <div className="actions">
                    {!item.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(item.id)}
                        className="mark-button"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(item.id)}
                      className="delete-button"
                    >
                      Delete
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

export default NotificationsPage;