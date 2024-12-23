import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './styles/RecipeDetails.css';
import {
    getRecipeById,
    getIngredientsByRecipe,
    getStepsByRecipe,
    getCommentsByRecipeId,
    addComment,
    getRecipePhotos,
    getLikesCount,
    addLike,
    removeLike,
    checkLikeStatus
} from '../api/api';

const RecipeDetails = () => {
    const { id } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [ingredients, setIngredients] = useState([]);
    const [steps, setSteps] = useState([]);
    const [comments, setComments] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [likesCount, setLikesCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState('');

    useEffect(() => {
        const fetchRecipeDetails = async () => {
            try {
                const recipeData = await getRecipeById(id);
                setRecipe(recipeData);

                const ingredientsData = await getIngredientsByRecipe(id);
                setIngredients(ingredientsData);

                const stepsData = await getStepsByRecipe(id);
                setSteps(stepsData);

                const commentsData = await getCommentsByRecipeId(id);
                setComments(commentsData || []);

                const photosData = await getRecipePhotos(id);
                setPhotos(photosData || []);

                const likesData = await getLikesCount(id);
                setLikesCount(likesData.likeCount);

                const token = localStorage.getItem('token');
                if (token) {
                    const likeStatus = await checkLikeStatus(id, token);
                    setIsLiked(likeStatus);
                }
            } catch (error) {
                console.error('Error fetching recipe details:', error);
                setError('Error fetching recipe details');
            } finally {
                setLoading(false);
            }
        };

        fetchRecipeDetails();
    }, [id]);

    const handleLikeToggle = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('You must be logged in to like this recipe.');

            if (isLiked) {
                await removeLike(id, token);
                setLikesCount((prev) => Number(prev) - 1);
            } else {
                await addLike(id, token);
                setLikesCount((prev) => Number(prev) + 1);
            }

            setIsLiked(!isLiked);
        } catch (err) {
            console.error('Error toggling like:', err);
            setError(err.response?.data?.message || 'Error toggling like');
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('You must be logged in to add a comment.');

            const addedComment = await addComment(id, newComment, token);
            setComments((prev) => [addedComment, ...prev]);
            setNewComment('');
        } catch (err) {
            console.error('Error adding comment:', err);
            setError(err.response?.data?.message || 'Error adding comment');
        }
    };

    const openModal = (photoUrl) => {
        setSelectedPhoto(photoUrl);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="recipe-details">
            <h2>{recipe.title}</h2>
            <p><strong>Автор:</strong> {recipe.author}</p>
            <p><strong>Описание:</strong> {recipe.description}</p>

            {/* Photos */}
            {photos.length > 0 && (
                <div className="recipe-photos">
                    {photos.map((photo, index) => (
                        <img
                            key={index}
                            src={`http://localhost:3000${photo.photo_url}`}
                            alt={`Recipe Photo ${index + 1}`}
                            className="recipe-photo"
                            onClick={() => openModal(`http://localhost:3000${photo.photo_url}`)}
                        />
                    ))}
                </div>
            )}

            {/* Likes */}
            <div className="recipe-likes">
                <button className={`like-button ${isLiked ? 'liked' : ''}`} onClick={handleLikeToggle}>
                    <span role="img" aria-label="heart">❤️</span>
                </button>
                <p>{likesCount} лайков</p>
            </div>

            <h3>Ингредиенты</h3>
            {ingredients.length > 0 ? (
                <ul>
                    {ingredients.map((ingredient) => (
                        <li key={ingredient.id}>
                            {ingredient.name} - {ingredient.quantity}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Нет добавленных ингредиентов.</p>
            )}

            <h3>Шаги готовки</h3>
            {steps.length > 0 ? (
                <ol>
                    {steps.map((step) => (
                        <li key={step.step_number}>{step.description}</li>
                    ))}
                </ol>
            ) : (
                <p>Нет добавленных шагов.</p>
            )}

            <h3>Комментарии</h3>
            <form onSubmit={handleCommentSubmit}>
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Добавить комментарий"
                    required
                />
                <button type="submit">Добавить</button>
            </form>
            {comments.length > 0 ? (
                <ul>
                    {comments.map((comment) => (
                        <li key={comment.id}>
                            <strong>{comment.author}</strong>: {comment.text}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Нет доступных комментариев.</p>
            )}

            {isModalOpen && (
                <div className="modal" onClick={closeModal}>
                    <div className="modal-content">
                        <img src={selectedPhoto} alt="Full view" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecipeDetails;