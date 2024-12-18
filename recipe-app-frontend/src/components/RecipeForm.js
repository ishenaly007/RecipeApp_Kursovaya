import React, {useEffect, useState} from 'react';
import {createRecipe, addIngredients, addSteps, addRecipePhotos, getRecipePhotos} from '../api/api';
import {useNavigate} from 'react-router-dom';
import './styles/RecipeForm.css';

const RecipeForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [ingredients, setIngredients] = useState([{name: '', quantity: ''}]);
    const [steps, setSteps] = useState([{stepNumber: 1, description: ''}]);
    const [photos, setPhotos] = useState([]); // Для хранения фото
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [authToken, setAuthToken] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        setAuthToken(localStorage.getItem('token'));
    }, []);

    const loadPhotos = async (recipeId) => {
        try {
            const response = await getRecipePhotos(recipeId, authToken);
            setPhotos(response.data); // Убедитесь, что сервер возвращает массив объектов с URL
        } catch (error) {
            console.error('Error loading photos:', error);
        }
    };

    const handleIngredientChange = (index, event) => {
        const newIngredients = [...ingredients];
        newIngredients[index][event.target.name] = event.target.value;
        setIngredients(newIngredients);
    };

    const handleStepChange = (index, event) => {
        const newSteps = [...steps];
        newSteps[index][event.target.name] = event.target.value;
        setSteps(newSteps);
    };

    const handleAddIngredient = () => {
        setIngredients([...ingredients, {name: '', quantity: ''}]);
    };

    const handleAddStep = () => {
        setSteps([...steps, {stepNumber: steps.length + 1, description: ''}]);
    };

    const handleDeleteIngredient = (index) => {
        if (ingredients.length > 1) {
            const newIngredients = ingredients.filter((_, i) => i !== index);
            setIngredients(newIngredients);
        }
    };

    const handleDeleteStep = (index) => {
        if (steps.length > 1) {
            const newSteps = steps.filter((_, i) => i !== index);
            setSteps(newSteps);
        }
    };

    const handleFileChange = (e) => {
        setPhotos([...e.target.files]); // Сохраняем выбранные файлы
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (ingredients.some(ing => !ing.name || !ing.quantity)) {
            alert("Please fill in all ingredient fields.");
            setLoading(false);
            return;
        }

        if (steps.some(step => !step.description)) {
            alert("Please fill in all step descriptions.");
            setLoading(false);
            return;
        }

        try {
            const recipeData = {title, description};
            const createdRecipe = await createRecipe(recipeData, authToken);

            if (ingredients.length > 0) {
                await addIngredients(createdRecipe.id, ingredients, authToken);
            }

            if (steps.length > 0) {
                await addSteps(createdRecipe.id, steps, authToken);
            }

            if (photos.length > 0) {
                const formData = new FormData();
                Array.from(photos).forEach((photo) => {
                    formData.append('photo', photo);
                });
                await addRecipePhotos(createdRecipe.id, formData, authToken);
            }

            loadPhotos(createdRecipe.id);

            navigate(`/recipes/${createdRecipe.id}`);

            setTitle('');
            setDescription('');
            setIngredients([{name: '', quantity: ''}]);
            setSteps([{stepNumber: 1, description: ''}]);
            setPhotos([]);
        } catch (error) {
            setError('Error creating recipe');
            console.error(error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="recipe-form">
            <h2>Create Recipe</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">Title</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>

                {/* Ingredients */}
                {ingredients.map((ingredient, index) => (
                    <div key={index}>
                        <label>Ingredient {index + 1}</label>
                        <input
                            type="text"
                            name="name"
                            value={ingredient.name}
                            onChange={(e) => handleIngredientChange(index, e)}
                            required
                            placeholder="Ingredient name"
                        />
                        <input
                            type="text"
                            name="quantity"
                            value={ingredient.quantity}
                            onChange={(e) => handleIngredientChange(index, e)}
                            placeholder="Quantity"
                        />
                        {ingredients.length > 1 && (
                            <button type="button" onClick={() => handleDeleteIngredient(index)}>Delete</button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={handleAddIngredient}>Add Ingredient</button>

                {/* Steps */}
                {steps.map((step, index) => (
                    <div key={index}>
                        <label>Step {index + 1}</label>
                        <textarea
                            name="description"
                            value={step.description}
                            onChange={(e) => handleStepChange(index, e)}
                            required
                            placeholder="Step description"
                        />
                        {steps.length > 1 && (
                            <button type="button" onClick={() => handleDeleteStep(index)}>Delete</button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={handleAddStep}>Add Step</button>

                {/* File Upload */}
                <div>
                    <label htmlFor="photos">Upload Photos</label>
                    <input
                        id="photos"
                        type="file"
                        multiple
                        onChange={handleFileChange}
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Recipe'}
                </button>
            </form>

            <div>
                <h3>Uploaded Photos</h3>
                {photos.length > 0 && photos.map((photo, index) => (
                    <img
                        key={index}
                        src={photo.photo_url || URL.createObjectURL(photo)} // Учитываем случай, если фото загружены или добавлены с клиента
                        alt={`Recipe Photo ${index + 1}`}
                        style={{width: 100, height: 100, margin: 5}}
                    />
                ))}
            </div>
        </div>
    );
};

export default RecipeForm;