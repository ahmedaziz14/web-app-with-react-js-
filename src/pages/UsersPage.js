import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchUsers, fetchUserByProductKey, deleteUser } from '../services/api';
import { getToken, removeToken } from '../services/auth';
import '../styles/UsersPage.css';
import Lottie from 'lottie-react';
import notifAnimation from '../animations/notif.json' ; 
import RequestAnimation from '../animations/request.json' ; 
const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sortByName, setSortByName] = useState(false);
  const [token, setToken] = useState(null);
  const [alert, setAlert] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  // Récupérer le token au montage
  useEffect(() => {
    const initializeToken = async () => {
      const storedToken = await getToken();
      if (storedToken) {
        setToken(storedToken);
      } else {
        setAlert({ type: 'error', message: 'Aucun token trouvé, veuillez vous reconnecter.' });
        navigate('/signin', { replace: true });
      }
    };
    initializeToken();
  }, [navigate]);

  // Récupérer tous les utilisateurs
  const fetchAllUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetchUsers(token);
      let userList = response.data.users || [];
      if (sortByName) {
        userList = userList.sort((a, b) => a.name.localeCompare(b.name));
      }
      setUsers(userList);
      setAlert(null);
    } catch (error) {
      if (error.message.includes('Token expiré')) {
        await removeToken();
        setAlert({ type: 'error', message: error.message });
        navigate('/signin', { replace: true });
      } else {
        setAlert({ type: 'error', message: error.message || 'Échec de la récupération des utilisateurs.' });
        setUsers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Récupérer un utilisateur par clé produit
  const handleSearch = async () => {
    if (!searchKey.trim()) {
      fetchAllUsers();
      return;
    }
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetchUserByProductKey(token, searchKey);
      if (response.data.user) {
        setUsers([response.data.user]);
        setAlert(null);
      } else {
        setUsers([]);
        setAlert({ type: 'error', message: 'Aucun utilisateur trouvé.' });
      }
    } catch (error) {
      if (error.message.includes('Token expiré')) {
        await removeToken();
        setAlert({ type: 'error', message: error.message });
        navigate('/signin', { replace: true });
      } else {
        setAlert({ type: 'error', message: error.message || 'Échec de la recherche.' });
        setUsers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un utilisateur
  const handleDelete = async (productKey) => {
    if (!token) return;
    setLoading(true);
    try {
      await deleteUser(token, productKey);
      setUsers(users.filter((user) => user.product_key !== productKey));
      setAlert({ type: 'success', message: 'Utilisateur supprimé avec succès !' });
      setSelectedUser(null);
      setDeleteConfirm(null);
    } catch (error) {
      if (error.message.includes('Token expiré')) {
        await removeToken();
        setAlert({ type: 'error', message: error.message });
        navigate('/signin', { replace: true });
      } else {
        setAlert({ type: 'error', message: error.message || 'Échec de la suppression.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Charger les utilisateurs une fois le token disponible
  useEffect(() => {
    if (token) fetchAllUsers();
  }, [token, sortByName]);

  // Gérer le tri par nom
  const toggleSort = () => {
    setSortByName(!sortByName);
    setUsers((prevUsers) =>
      [...prevUsers].sort((a, b) =>
        sortByName ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)
      )
    );
  };

  return (
    <Box className="gradient-background" sx={{ minHeight: '100vh', p: 3 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto', bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, p: 3 }}>
        <Typography variant="h4" sx={{ color: '#333', textAlign: 'center', mb: 4 }}>
          Gestion des Utilisateurs
        </Typography>

        {alert && (
          <Alert severity={alert.type} onClose={() => setAlert(null)} sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Rechercher par clé de produit"
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          variant="outlined"
          sx={{ mb: 2, bgcolor: '#fff', borderRadius: 2 }}
        />
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="contained"
            color="success"
            onClick={handleSearch}
            disabled={loading}
            sx={{ flex: 1, borderRadius: 2, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Rechercher'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchAllUsers}
            disabled={loading}
            sx={{ flex: 1, borderRadius: 2, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Rafraîchir'}
          </Button>
        </Box>
        <Button
          variant="contained"
          sx={{ bgcolor: '#FF9800', mb: 2, borderRadius: 2, py: 1.5, '&:hover': { bgcolor: '#e68900' } }}
          onClick={toggleSort}
        >
          {sortByName ? 'Annuler le tri' : 'Trier par nom'}
        </Button>

        {loading && !users.length ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <CircularProgress color="success" />
          </Box>
        ) : users.length === 0 ? (
          <Typography sx={{ textAlign: 'center', mt: 4, color: '#666', fontSize: 18 }}>
            Aucun utilisateur trouvé
          </Typography>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto', bgcolor: '#fff', borderRadius: 2 }}>
            {users.map((user) => (
              <ListItem
                key={user.id}
                sx={{ borderBottom: '1px solid #ddd' }}
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() =>
                        navigate('/chat', {
                          state: { user_id: user.id, user_name: user.name, product_key: user.product_key, token },
                        })
                      }
                      sx={{ borderRadius: 2 }}
                    >
                      Chat
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => setDeleteConfirm({ productKey: user.product_key, name: user.name })}
                      sx={{ borderRadius: 2 }}
                    >
                      Supprimer
                    </Button>
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Avatar src={user.profile_picture || 'https://via.placeholder.com/50'} />
                </ListItemAvatar>
                <ListItemText
                  primary={user.name || 'Sans nom'}
                  secondary={user.interest || 'Aucun intérêt'}
                  onClick={() => setSelectedUser(user)}
                  sx={{ cursor: 'pointer' }}
                />
              </ListItem>
            ))}
          </List>
        )}

        <Fab
          color="success"
          onClick={() => navigate('/product')}
          sx={{ position: 'fixed', bottom: 30, right: 20 }}
        >
          +
        </Fab>

        <Fab
        
  color="primary"
  onClick={() => navigate('/notification')}
  sx={{
    position: 'fixed',
    bottom: 100,
    right: 20,
    backgroundColor: '#2196F3',
    width: 60,
    height: 60,
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
    '&:hover': { backgroundColor: '#1976d2' },
  }}
>
  <Lottie 
    animationData={notifAnimation}
    loop
    autoplay
    style={{ width: 40, height: 40 }}
  />

</Fab>

<Fab
        
        color="primary"
        onClick={() => navigate('/Request')}
        sx={{
          position: 'fixed',
          bottom: 170,
          right: 20,
          backgroundColor: '#2196F3',
          width: 60,
          height: 60,
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
          '&:hover': { backgroundColor: '#1976d2' },
        }}
      >
        <Lottie 
          animationData={RequestAnimation }
          loop
          autoplay
          style={{ width: 40, height: 40 }}
        />
      
      </Fab>

        <Dialog open={!!selectedUser} onClose={() => setSelectedUser(null)}>
          <DialogTitle>{selectedUser?.name}</DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Avatar
                src={selectedUser?.profile_picture || 'https://via.placeholder.com/100'}
                sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
              />
              <Typography>Intérêt : {selectedUser?.interest || 'N/A'}</Typography>
              <Typography>Plus d’infos : {selectedUser?.more_info || 'N/A'}</Typography>
              <Typography>Clé de produit : {selectedUser?.product_key || 'N/A'}</Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedUser(null)} color="success">
              Fermer
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
          <DialogTitle>Supprimer l’utilisateur</DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir supprimer {deleteConfirm?.name} ?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirm(null)}>Annuler</Button>
            <Button
              color="error"
              onClick={() => {
                handleDelete(deleteConfirm.productKey);
              }}
            >
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default UsersPage;