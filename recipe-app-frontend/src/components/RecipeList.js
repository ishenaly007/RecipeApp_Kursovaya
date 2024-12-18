import React, {useEffect, useState} from 'react';
import {getAllRecipes, getRecipePhotos, getLikesCount} from '../api/api';
import {Link} from 'react-router-dom';
import './styles/RecipeList.css';

const RecipeList = () => {
    const [recipes, setRecipes] = useState([]);
    const [likesCount, setLikesCount] = useState({});
    const [loading, setLoading] = useState(true);
    const [photos, setPhotos] = useState({});

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await getAllRecipes();
                if (Array.isArray(response)) {
                    setRecipes(response);

                    // Получаем количество лайков для каждого рецепта
                    for (let recipe of response) {
                        const likeCountResponse = await getLikesCount(recipe.id);
                        setLikesCount(prevLikesCount => ({
                            ...prevLikesCount,
                            [recipe.id]: likeCountResponse.likeCount
                        }));

                        const photosResponse = await getRecipePhotos(recipe.id);
                        setPhotos(prevPhotos => ({
                            ...prevPhotos,
                            [recipe.id]: photosResponse
                        }));
                    }
                } else {
                    console.error('Unexpected data format:', response);
                    setRecipes([]);
                }
            } catch (error) {
                console.error('Error fetching recipes:', error);
                setRecipes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!recipes.length) {
        return <p>No recipes found.</p>;
    }

    return (
        <div className="recipe-list">
            <h2>All Recipes</h2>
            <ul>
                {recipes.map(recipe => (
                    <li key={recipe.id} className="recipe-item">
                        <Link to={`/recipes/${recipe.id}`} className="recipe-link">
                            <h3>{recipe.title}</h3>
                        </Link>
                        <p><strong>Author:</strong> {recipe.author || 'Unknown'}</p>
                        <p><strong>Description:</strong> {recipe.description || 'No description available'}</p>

                        {/* Отображаем количество лайков */}
                        <p><strong>Likes:</strong> {likesCount[recipe.id] || 0}</p>

                        {/* Отображение фотографий */}
                        <div className="recipe-photos">
                            {photos[recipe.id] && photos[recipe.id].length > 0 ? (
                                photos[recipe.id].map(photo => (
                                    <img
                                        key={photo.id}
                                        src={`http://localhost:3000${photo.photo_url}`} // Обратите внимание на правильный путь
                                        alt="Recipe"
                                        className="recipe-photo"
                                    />
                                ))
                            ) : (
                                <p>No photos available</p>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RecipeList;