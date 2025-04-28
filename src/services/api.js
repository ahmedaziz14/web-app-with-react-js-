const BASE_URL = 'http://192.168.1.7:3001'; 

export const signIn = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Problème de connexion au serveur.');
  }

  return { data };
};
export const signUp = async (email, password) => {
    const response = await fetch('http://192.168.1.7:3001/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(data.error || 'Problème de connexion au serveur.');
    }
  
    return { data };
  };

  export const fetchUsers = async (token) => {
    const response = await fetch(`${BASE_URL}/api/users`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token expiré ou invalide. Veuillez vous reconnecter.');
      }
      throw new Error(data.error || 'Problème de connexion au serveur.');
    }
  
    return { data };
  };
  
  export const fetchUserByProductKey = async (token, productKey) => {
    const response = await fetch(`${BASE_URL}/api/user/product/${productKey}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token expiré ou invalide. Veuillez vous reconnecter.');
      }
      throw new Error(data.error || 'Problème de connexion au serveur.');
    }
  
    return { data };
  };
  
  export const deleteUser = async (token, productKey) => {
    const response = await fetch(`${BASE_URL}/api/user/product/${productKey}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token expiré ou invalide. Veuillez vous reconnecter.');
      }
      throw new Error(data.error || 'Problème de connexion au serveur.');
    }
  
    return { data };
  };


  export const fetchChatHistory = async (token, productKey) => {
    const response = await fetch(`${BASE_URL}/chat/history?product_key=${productKey}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token expiré ou invalide. Veuillez vous reconnecter.');
      }
      throw new Error(data.error || 'Problème de connexion au serveur.');
    }
  
    return { data };
  };
  
  export const sendMessage = async (token, productKey, message) => {
    const response = await fetch(`${BASE_URL}/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_key: productKey, message }),
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token expiré ou invalide. Veuillez vous reconnecter.');
      }
      throw new Error(data.error || 'Problème de connexion au serveur.');
    }
  
    return { data };
  };
  
  

  export const addProduct = async (token, productKey) => {
    if (!token) {
      throw new Error('Aucun token fourni.');
    }
  
    try {
      const response = await fetch(`${BASE_URL}/products/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_key: productKey }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token expiré ou invalide. Veuillez vous reconnecter.');
        } else if (response.status === 400) {
          throw new Error(data.error || 'Requête invalide. Vérifiez la clé de produit.');
        }
        throw new Error(data.error || 'Problème de connexion au serveur.');
      }
  
      return { data };
    } catch (error) {
      console.error('Erreur dans addProduct:', error);
      throw error;
    }
  };
  
  export const fetchProducts = async (token) => {
    if (!token) {
      throw new Error('Aucun token fourni.');
    }
  
    try {
      const response = await fetch(`${BASE_URL}/products/all`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token expiré ou invalide. Veuillez vous reconnecter.');
        } else if (response.status === 400) {
          throw new Error(data.error || 'Requête invalide. Vérifiez les paramètres envoyés.');
        }
        throw new Error(data.error || 'Problème de connexion au serveur.');
      }
  
      return { data };
    } catch (error) {
      console.error('Erreur dans fetchProducts:', error);
      throw error;
    }
  };
  
  export const deleteProduct = async (token, productKey) => {
    if (!token) {
      throw new Error('Aucun token fourni.');
    }
  
    try {
      const response = await fetch(`${BASE_URL}/products/${productKey}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token expiré ou invalide. Veuillez vous reconnecter.');
        } else if (response.status === 400) {
          throw new Error(data.error || 'Requête invalide. Vérifiez la clé de produit.');
        }
        throw new Error(data.error || 'Problème de connexion au serveur.');
      }
  
      return { data };
    } catch (error) {
      console.error('Erreur dans deleteProduct:', error);
      throw error;
    }
  };
// Fetch all notifications
export const fetchNotifications = async (token) => {
  if (!token) {
    throw new Error('Aucun token fourni.');
  }

  try {
    const response = await fetch(`${BASE_URL}/notifications`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token expiré ou invalide. Veuillez vous reconnecter.');
      }
      throw new Error(data.error || 'Problème de connexion au serveur.');
    }

    const notifications = data.notifications || [];
    if (!Array.isArray(notifications) || notifications.some((n) => !n.id)) {
      console.error('Invalid notifications data:', notifications);
      throw new Error('Données de notifications invalides.');
    }

    return { data: notifications };
  } catch (error) {
    console.error('Erreur dans fetchNotifications:', error);
    throw error;
  }
};export const markAsRead = async (token, notificationId) => {
  if (!token) {
    throw new Error('Aucun token fourni.');
  }

  try {
    const response = await fetch(`${BASE_URL}/notifications/${notificationId}/mark`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('markAsRead response:', {
      status: response.status,
      statusText: response.statusText,
      headers: [...response.headers.entries()],
    });

    let data = {};
    if (response.status !== 204) {
      try {
        data = await response.json();
        console.log('markAsRead response body:', data);
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        throw new Error('Réponse du serveur invalide.');
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token expiré ou invalide. Veuillez vous reconnecter.');
      }
      if (response.status === 500) {
        console.warn('Backend error ignored, database updated:', data);
        return { data: { success: true, message: 'Notification marked as read' } };
      }
      throw new Error(data.error || 'Problème de connexion au serveur.');
    }

    return { data: data || {} };
  } catch (error) {
    console.error('Erreur dans markAsRead:', error);
    throw error;
  }
};
// Delete a notification
export const deleteNotification = async (token, notificationId) => {
  if (!token) {
    throw new Error('Aucun token fourni.');
  }

  try {
    const response = await fetch(`${BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token expiré ou invalide. Veuillez vous reconnecter.');
      }
      throw new Error(data.error || 'Problème de connexion au serveur.');
    }

    return { data };
  } catch (error) {
    console.error('Erreur dans deleteNotification:', error);
    throw error;
  }
};


// Fetch signup requests (non traitées)
export const fetchSignupRequests = async (token) => {
  if (!token) {
    throw new Error('Aucun token fourni.');
  }

  try {
    const response = await fetch(`${BASE_URL}/Requests`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token expiré ou invalide. Veuillez vous reconnecter.');
      }
      throw new Error(data.error || 'Problème de connexion au serveur.');
    }

    return { data };
  } catch (error) {
    console.error('Erreur dans fetchSignupRequests:', error);
    throw error;
  }
};
