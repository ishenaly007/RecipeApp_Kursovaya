import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getRecipeById, getIngredientsByRecipe, getStepsByRecipe, updateRecipe } from '../api/api';

const EditRecipe = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = location.state || {}; // Получаем ID из состояния
    const [recipe, setRecipe] = useState(null);
    const [ingredients, setIngredients] = useState([]);
    const [steps, setSteps] = useState([]);
    const [updatedRecipe, setUpdatedRecipe] = useState({ title: '', description: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRecipeData = async () => {
            try {
                const recipeData = await getRecipeById(id);
                const ingredientsData = await getIngredientsByRecipe(id);
                const stepsData = await getStepsByRecipe(id);

                setRecipe(recipeData);
                setIngredients(ingredientsData);
                setSteps(stepsData);

                setUpdatedRecipe({ title: recipeData.title, description: recipeData.description });
            } catch (err) {
                console.error('Error fetching recipe data:', err);
                setError('Error fetching recipe data');
            } finally {
                setLoading(false);
            }
        };

        fetchRecipeData();
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateRecipe(id, {
                ...updatedRecipe,
                ingredients,
                steps,
            });
            navigate(`/recipes/${id}`);
        } catch (err) {
            console.error('Error updating recipe:', err);
            setError('Error updating recipe');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="edit-recipe">
            <h2>Edit Recipe</h2>
            {recipe && (
                <form onSubmit={handleUpdate}>
                    <div>
                        <label>Name</label>
                        <input
                            type="text"
                            value={updatedRecipe.title}
                            onChange={(e) => setUpdatedRecipe({ ...updatedRecipe, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Description</label>
                        <textarea
                            value={updatedRecipe.description}
                            onChange={(e) => setUpdatedRecipe({ ...updatedRecipe, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <h3>Ingredients</h3>
                        {ingredients.map((ingredient, index) => (
                            <div key={ingredient.id}>
                                <label>Ingredient {index + 1}</label>
                                <input
                                    type="text"
                                    value={ingredient.name}
                                    onChange={(e) => {
                                        const updatedIngredients = [...ingredients];
                                        updatedIngredients[index].name = e.target.value;
                                        setIngredients(updatedIngredients);
                                    }}
                                />
                                <input
                                    type="text"
                                    value={ingredient.quantity}
                                    onChange={(e) => {
                                        const updatedIngredients = [...ingredients];
                                        updatedIngredients[index].quantity = e.target.value;
                                        setIngredients(updatedIngredients);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    <div>
                        <h3>Steps</h3>
                        {steps.map((step, index) => (
                            <div key={step.id}>
                                <label>Step {index + 1}</label>
                                <textarea
                                    value={step.description}
                                    onChange={(e) => {
                                        const updatedSteps = [...steps];
                                        updatedSteps[index] = {
                                            ...updatedSteps[index],
                                            description: e.target.value,
                                        };
                                        setSteps(updatedSteps);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    <button type="submit">Update Recipe</button>
                </form>
            )}
        </div>
    );
};

export default EditRecipe;