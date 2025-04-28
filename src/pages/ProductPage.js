import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import productsAnimation from '../animations/products.json';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, addProduct, deleteProduct } from '../services/api';
import { getToken, removeToken } from '../services/auth';
import '../styles/ProductPage.css';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [productKeyInput, setProductKeyInput] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  // Récupérer le token
  useEffect(() => {
    const initializeToken = async () => {
      const storedToken = await getToken();
      console.log('Token initial récupéré:', storedToken);
      if (storedToken) {
        setToken(storedToken);
      } else {
        setAlert({ type: 'error', message: 'Aucun token trouvé, veuillez vous reconnecter.' });
        navigate('/signin', { replace: true });
      }
    };
    initializeToken();
  }, [navigate]);

  // Générer une clé aléatoire
  const generateRandomKey = () => {
    const key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setGeneratedKey(key);
    return key;
  };

  // Copier la clé dans le presse-papiers et la coller dans le champ
  const copyToClipboard = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setProductKeyInput(generatedKey);
      setAlert({ type: 'success', message: 'Clé copiée dans le presse-papiers !' });
    } else {
      setAlert({ type: 'error', message: 'Aucune clé générée à copier.' });
    }
  };

  // Ajouter une clé
  const handleAddProductKey = async () => {
    // Vérifier le token directement depuis localStorage
    const currentToken = await getToken();
    console.log('Token dans handleAddProductKey:', currentToken);
    if (!currentToken) {
      console.error('Token manquant dans handleAddProductKey');
      setAlert({ type: 'error', message: 'Token manquant. Veuillez vous reconnecter.' });
      navigate('/signin', { replace: true });
      return;
    }

    if (!productKeyInput) {
      setAlert({ type: 'error', message: 'Veuillez entrer une clé de produit.' });
      return;
    }

    setLoading(true);
    try {
      console.log('Ajout de la clé avec token:', currentToken);
      await addProduct(currentToken, productKeyInput);
      setProductKeyInput('');
      setGeneratedKey('');
      setAlert({ type: 'success', message: 'Clé de produit ajoutée avec succès !' });

      // Vérifier à nouveau le token avant fetchProductsList
      const tokenAfterAdd = await getToken();
      console.log('Token après ajout:', tokenAfterAdd);
      if (!tokenAfterAdd) {
        console.error('Token perdu après ajout');
        setAlert({ type: 'error', message: 'Token perdu après ajout. Veuillez vous reconnecter.' });
        navigate('/signin', { replace: true });
        return;
      }
      setToken(tokenAfterAdd); // Mettre à jour l'état
      await fetchProductsList(tokenAfterAdd);
    } catch (error) {
      console.error('Erreur lors de l’ajout de la clé:', error);
      if (error.message.includes('Token expiré') || error.message.includes('invalide')) {
        await removeToken();
        setToken(null);
        setAlert({ type: 'error', message: 'Token expiré ou invalide. Veuillez vous reconnecter.' });
        navigate('/signin', { replace: true });
      } else {
        setAlert({ type: 'error', message: error.message || 'Échec de l’ajout de la clé.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les produits
  const fetchProductsList = async (currentToken) => {
    const tokenToUse = currentToken || token;
    if (!tokenToUse) {
      console.error('Token manquant dans fetchProductsList');
      setAlert({ type: 'error', message: 'Token manquant. Veuillez vous reconnecter.' });
      navigate('/signin', { replace: true });
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching products with token:', tokenToUse);
      const response = await fetchProducts(tokenToUse);
      setProducts(response.data.products || []);
      setAlert(null);
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      if (error.message.includes('Token expiré') || error.message.includes('invalide')) {
        await removeToken();
        setToken(null);
        setAlert({ type: 'error', message: 'Token expiré ou invalide. Veuillez vous reconnecter.' });
        navigate('/signin', { replace: true });
      } else {
        setAlert({ type: 'error', message: error.message || 'Échec de la récupération des produits.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une clé
  const handleDeleteProduct = async (productKey) => {
    const currentToken = await getToken();
    console.log('Token dans handleDeleteProduct:', currentToken);
    if (!currentToken) {
      console.error('Token manquant dans handleDeleteProduct');
      setAlert({ type: 'error', message: 'Token manquant. Veuillez vous reconnecter.' });
      navigate('/signin', { replace: true });
      return;
    }

    setLoading(true);
    try {
      console.log('Suppression de la clé avec token:', currentToken);
      await deleteProduct(currentToken, productKey);
      await fetchProductsList(currentToken);
      setAlert({ type: 'success', message: 'Clé de produit supprimée avec succès !' });
    } catch (error) {
      console.error('Erreur lors de la suppression de la clé:', error);
      if (error.message.includes('Token expiré') || error.message.includes('invalide')) {
        await removeToken();
        setToken(null);
        setAlert({ type: 'error', message: 'Token expiré ou invalide. Veuillez vous reconnecter.' });
        navigate('/signin', { replace: true });
      } else {
        setAlert({ type: 'error', message: error.message || 'Échec de la suppression de la clé.' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      console.log('Appel de fetchProductsList avec token:', token);
      fetchProductsList(token);
    }
  }, [token]);

  return (
    <Box className="gradient-background" sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 600, p: 3, bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, textAlign: 'center' }}>
        <Lottie animationData={productsAnimation} loop={true} style={{ width: 200, height: 200, margin: '0 auto 20px' }} />
        <Typography variant="h5" sx={{ color: '#fff', mb: 2 }}>
          Gestion des Produits
        </Typography>

        {alert && (
          <Alert severity={alert.type} onClose={() => setAlert(null)} sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Clé de produit"
          value={productKeyInput}
          onChange={(e) => setProductKeyInput(e.target.value)}
          variant="outlined"
          sx={{
            mb: 2,
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            '& .MuiInputBase-input': { color: '#fff' },
            '& .MuiInputLabel-root': { color: '#ccc' },
            borderRadius: 2,
          }}
        />
        <Button
          fullWidth
          variant="contained"
          onClick={generateRandomKey}
          disabled={loading}
          sx={{
            bgcolor: '#FF6F61',
            borderRadius: '50px',
            py: 1.5,
            mb: 2,
            '&:hover': { bgcolor: '#e55a50' },
          }}
        >
          Générer une clé
        </Button>
        {generatedKey && (
          <Box sx={{ mb: 2, color: '#fff' }}>
            <Typography>Clé générée : {generatedKey}</Typography>
            <Button
              variant="contained"
              onClick={copyToClipboard}
              sx={{
                bgcolor: '#4CAF50',
                borderRadius: 2,
                mt: 1,
                '&:hover': { bgcolor: '#45a045' },
              }}
            >
              Copier
            </Button>
          </Box>
        )}
        <Button
          fullWidth
          variant="contained"
          onClick={handleAddProductKey}
          disabled={loading}
          sx={{
            bgcolor: '#FF6F61',
            borderRadius: '50px',
            py: 1.5,
            mb: 2,
            '&:hover': { bgcolor: '#e55a50' },
          }}
        >
          {loading ? 'Chargement...' : 'Ajouter la clé'}
        </Button>
        <List sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, maxHeight: 300, overflow: 'auto' }}>
          {products.map((item) => (
            <ListItem
              key={item.product_key}
              secondaryAction={
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleDeleteProduct(item.product_key)}
                  sx={{ borderRadius: 2 }}
                >
                  Supprimer
                </Button>
              }
            >
              <ListItemText primary={item.product_key} sx={{ color: '#fff' }} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default ProductPage;