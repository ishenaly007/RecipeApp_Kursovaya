import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // Адрес вашего бекенда

export const getCurrentUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('User is not authorized');
    }
    const response = await axios.get(`${API_URL}/users/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getRecipesByUserId = async (userId) => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('User is not authorized');
    }

    const response = await axios.get(`${API_URL}/recipes/user/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};

export const updateRecipe = async (id, updatedRecipe) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.put(`${API_URL}/recipes/${id}`, updatedRecipe, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error updating recipe:', error);
        throw error;
    }
};

export const deleteRecipeById = async (recipeId) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/recipes/${recipeId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getAllRecipes = async () => {
    try {
        const response = await axios.get(`${API_URL}/recipes`);
        console.log('Full response:', response);
        return response.data;
    } catch (error) {
        console.error('Error in getAllRecipes:', error);
        throw error;
    }
};

export const createRecipe = async (data, token) => {
    console.log('Auth token:', token);
    const response = await axios.post(`${API_URL}/recipes`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getRecipeById = async (id) => {
    const response = await axios.get(`${API_URL}/recipes/${id}`);
    return response.data;
};

export const searchRecipesByName = async (query) => {
    try {
        const response = await axios.get(`${API_URL}/recipes/search`, {
            params: {query},
        });
        return response.data;
    } catch (error) {
        console.error('Error searching recipes:', error);
        throw error;
    }
};

export const addIngredients = async (recipeId, ingredients, authToken) => {
    return await axios.post(
        `${API_URL}/recipes/${recipeId}/ingredients`,
        {ingredients},
        {
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        }
    );
};

export const getIngredientsByRecipe = async (recipeId) => {
    const response = await axios.get(`${API_URL}/recipes/${recipeId}/ingredients`);
    return response.data;
};

export const addSteps = async (recipeId, steps, token) => {
    const response = await axios.post(
        `${API_URL}/recipes/${recipeId}/steps`,
        {steps},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};

export const getStepsByRecipe = async (recipeId) => {
    const response = await axios.get(`${API_URL}/recipes/${recipeId}/steps`);
    return response.data;
};

export const getCommentsByRecipeId = async (recipeId) => {
    const response = await axios.get(`${API_URL}/recipes/${recipeId}/comments`);
    return response.data;
};

export const addComment = async (recipeId, text, token) => {
    const response = await axios.post(
        `${API_URL}/recipes/${recipeId}/comments`,
        {recipeId, text},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};

export const handleRegister = async (name, email, password) => {
    const response = await axios.post(`${API_URL}/users/register`, {
        name,
        email,
        password,
    });
    return response.data;
};

export const handleLogin = async (email, password) => {
    const response = await axios.post(`${API_URL}/users/login`, {email, password});
    const data = response.data;

    console.log('Token:', data.token);

    localStorage.setItem('token', data.token);
    console.log('Token after login:', data.token);
    return data;
};

export const getUserById = async (userId) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/users/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getRecipePhotos = async (recipeId) => {
    try {
        const response = await axios.get(`${API_URL}/recipes/${recipeId}/photos`);
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error('Error in getRecipePhotos:', error);
        throw error;
    }
};

export const addRecipePhotos = async (recipeId, formData, token) => {
    try {
        const response = await axios.post(
            `${API_URL}/recipes/${recipeId}/photos`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error adding photos:', error);
        throw error;
    }
};

export const getLikesCount = async (recipeId) => {
    const response = await axios.get(`${API_URL}/recipes/${recipeId}/like-count`);
    return response.data;
};

export const addLike = async (recipeId, token) => {
    const response = await axios.post(
        `${API_URL}/recipes/${recipeId}/like`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};

export const removeLike = async (recipeId, token) => {
    const response = await axios.delete(
        `${API_URL}/recipes/${recipeId}/like`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};

export const checkLikeStatus = async (recipeId, token) => {
    const response = await axios.get(
        `${API_URL}/recipes/${recipeId}/like-status`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }
    );
    return response.data.isLiked;
};
export const deleteRecipePhotos = async (photoId) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/recipes/photos/${photoId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};