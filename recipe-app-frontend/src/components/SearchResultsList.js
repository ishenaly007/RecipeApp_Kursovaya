import React, { useEffect, useState } from 'react';
import { searchRecipesByName, getRecipePhotos, getLikesCount } from '../api/api';
import { Link, useLocation } from 'react-router-dom';
import './styles/SearchResultsList.css';

const SearchResultsList = () => {
    const location = useLocation();
    const { query } = location.state || { query: '' };
    const [recipes, setRecipes] = useState([]);
    const [likesCount, setLikesCount] = useState({});
    const [loading, setLoading] = useState(true);
    const [photos, setPhotos] = useState({});

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                const response = await searchRecipesByName(query);
                if (Array.isArray(response)) {
                    setRecipes(response);
                    
                    for (let recipe of response) {
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
                } else {
                    console.error('Unexpected data format:', response);
                    setRecipes([]);
                }
            } catch (error) {
                console.error('Error fetching search results:', error);
                setRecipes([]);
            } finally {
                setLoading(false);
            }
        };

        if (query) {
            fetchSearchResults();
        } else {
            setLoading(false);
            setRecipes([]);
        }
    }, [query]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!recipes.length) {
        return <p>No results found for "{query}".</p>;
    }

    return (
        <div className="recipe-list">
            <h2>Результаты по поиску "{query}"</h2>
            <ul>
                {recipes.map((recipe) => (
                    <li key={recipe.id} className="recipe-item">
                        <Link to={`http://localhost:3001/recipes/${recipe.id}`} className="recipe-link">
                            <h3>{recipe.title}</h3>
                        </Link>
                        <p><strong>Автор:</strong> {recipe.author || 'Неизвестен'}</p>
                        <p><strong>Описание:</strong> {recipe.description || 'Описание отсутствует'}</p>

                        {/* Отображаем количество лайков */}
                        <p><strong>Лайков:</strong> {likesCount[recipe.id] || 0}</p>

                        {/* Отображение фотографий */}
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
                                <p>Нет доступных фотографий</p>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SearchResultsList;