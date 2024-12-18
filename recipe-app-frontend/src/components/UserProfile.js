import React, { useEffect, useState } from 'react';
import { getCurrentUser, getRecipesByUserId, getRecipePhotos, getLikesCount, deleteRecipeById } from '../api/api';
import { Link, useNavigate } from 'react-router-dom';
import './styles/UserProfile.css';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [likesCount, setLikesCount] = useState({});
    const [photos, setPhotos] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);

                const recipesData = await getRecipesByUserId(currentUser.id);
                setRecipes(recipesData);

                for (let recipe of recipesData) {
                    const likeCountResponse = await getLikesCount(recipe.id);
                    setLikesCount((prevLikesCount) => ({
                        ...prevLikesCount,
                        [recipe.id]: likeCountResponse.likeCount,
                    }));

                    const photosResponse = await getRecipePhotos(recipe.id);
                    setPhotos((prevPhotos) => ({
                        ...prevPhotos,
                        [recipe.id]: photosResponse,
                    }));
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                setError('Error fetching user profile');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleDelete = async (recipeId) => {
        try {
            const confirmDelete = window.confirm('Are you sure you want to delete this recipe?');
            if (!confirmDelete) return;

            await deleteRecipeById(recipeId);
            setRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe.id !== recipeId));
        } catch (error) {
            console.error('Error deleting recipe:', error);
            setError('Error deleting recipe');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="user-profile">
            {user && (
                <>
                    <h2>{user.name}'s Profile</h2>
                    <p><strong>Email:</strong> {user.email}</p>

                    <h3>Your Recipes</h3>
                    {recipes.length > 0 ? (
                        <ul>
                            {recipes.map((recipe) => (
                                <li key={recipe.id} className="recipe-item">
                                    <Link
                                        to={`/recipes/${recipe.id}`}
                                        state={{ id: recipe.id }}
                                        className="recipe-link"
                                    >
                                        <h4>{recipe.title}</h4>
                                    </Link>
                                    <p><strong>Description:</strong> {recipe.description || 'No description available'}</p>
                                    <p><strong>Likes:</strong> {likesCount[recipe.id] || 0}</p>
                                    <div className="recipe-photos">
                                        {photos[recipe.id] && photos[recipe.id].length > 0 ? (
                                            photos[recipe.id].map((photo) => (
                                                <img
                                                    key={photo.id}
                                                    src={`http://localhost:3000${photo.photo_url}`}
                                                    alt="Recipe"
                                                    className="recipe-photo"
                                                />
                                            ))
                                        ) : (
                                            <p>No photos available</p>
                                        )}
                                    </div>
                                    {user.id === recipe.user_id && (
                                        <div className="recipe-actions">
                                            <Link
                                                to={`/recipes/edit`}
                                                state={{ id: recipe.id }}
                                                className="edit-recipe-link"
                                            >
                                                <button>Edit Recipe</button>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(recipe.id)}
                                                className="delete-recipe-button"
                                            >
                                                Delete Recipe
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>You haven't uploaded any recipes yet.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default UserProfile;