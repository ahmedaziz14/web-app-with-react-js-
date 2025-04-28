const TOKEN_KEY = 'adminToken';

export const getToken = async () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    return null;
  }
};

export const setToken = async (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Erreur lors du stockage du token:', error);
  }
};

export const removeToken = async () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Erreur lors de la suppression du token:', error);
  }
};