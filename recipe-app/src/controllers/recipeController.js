const pool = require('../db/db');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const memoryStorage = multer.memoryStorage();
const upload = multer({storage: memoryStorage});

const createRecipe = async (req, res) => {
    const {title, description} = req.body;
    const userId = req.user.id;

    try {
        const newRecipe = await pool.query('INSERT INTO recipes (title, description, user_id) VALUES ($1, $2, $3) RETURNING *', [title, description, userId]);
        res.status(201).json(newRecipe.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

const getAllRecipes = async (req, res) => {
    try {
        const recipes = await pool.query(`SELECT r.id, r.title, r.description, r.user_id, r.created_at,
                    COALESCE(l.like_count, 0) AS like_count, u.name as author 
             FROM recipes r 
             JOIN users u ON r.user_id = u.id
             LEFT JOIN (SELECT recipe_id, COUNT(*) AS like_count FROM likes GROUP BY recipe_id) l 
             ON r.id = l.recipe_id
             ORDER BY like_count DESC`);
        res.status(200).json(recipes.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

const getRecipesByUserId = async (req, res) => {
    const {userId} = req.params;

    try {
        const recipes = await pool.query(`SELECT r.id, r.title, r.description, r.user_id, r.created_at,
                    COALESCE(l.like_count, 0) AS like_count, u.name as author 
             FROM recipes r 
             JOIN users u ON r.user_id = u.id
             LEFT JOIN (SELECT recipe_id, COUNT(*) AS like_count FROM likes GROUP BY recipe_id) l 
             ON r.id = l.recipe_id
             WHERE r.user_id = $1
             ORDER BY like_count DESC`, [userId]);
        res.status(200).json(recipes.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

const getRecipeById = async (req, res) => {
    const {id} = req.params;

    try {
        const recipe = await pool.query(`SELECT r.id, r.title, r.description, r.user_id, r.created_at, 
                    COALESCE(l.like_count, 0) AS like_count,
                    u.name AS author 
             FROM recipes r 
             JOIN users u ON r.user_id = u.id
             LEFT JOIN (SELECT recipe_id, COUNT(*) AS like_count FROM likes GROUP BY recipe_id) l 
             ON r.id = l.recipe_id
             WHERE r.id = $1`, [id]);

        if (recipe.rows.length === 0) {
            return res.status(404).json({message: 'Recipe not found'});
        }

        res.status(200).json(recipe.rows[0]);
    } catch (error) {
        console.error(error);
        console.error('Error updating recipe:', error.message);
        console.error('Stack trace:', error.stack);
        res.status(500).json({message: 'Server error'});
    }
};

const updateRecipe = async (req, res) => {
    const { recipeId } = req.params;
    const { title, description, ingredients, steps } = req.body;

    if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
    }

    try {
        await pool.query('BEGIN');
        await pool.query(
            'UPDATE recipes SET title = $1, description = $2 WHERE id = $3',
            [title, description, recipeId]
        );

        if (ingredients) {
            for (const ingredient of ingredients) {
                if (ingredient.id) {
                    await pool.query(
                        'UPDATE ingredients SET name = $1, quantity = $2 WHERE id = $3',
                        [ingredient.name, ingredient.quantity, ingredient.id]
                    );
                } else {
                    await pool.query(
                        'INSERT INTO ingredients (recipe_id, name, quantity) VALUES ($1, $2, $3)',
                        [recipeId, ingredient.name, ingredient.quantity]
                    );
                }
            }
        }

        if (steps) {
            for (const step of steps) {
                if (step.id) {
                    await pool.query(
                        'UPDATE steps SET step_number = $1, description = $2 WHERE id = $3',
                        [step.step_number, step.description, step.id]
                    );
                } else {
                    await pool.query(
                        'INSERT INTO steps (recipe_id, step_number, description) VALUES ($1, $2, $3)',
                        [recipeId, step.step_number, step.description]
                    );
                }
            }
        }
        await pool.query('COMMIT');
        res.status(200).json({ message: 'Recipe updated successfully' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ message: 'Failed to update recipe' });
    }
};

const searchRecipesByName = async (req, res) => {
    const {query} = req.query;

    if (!query || query.trim() === '') {
        return res.status(400).json({message: 'Search query is required'});
    }

    try {
        const recipes = await pool.query(`SELECT r.id, r.title, r.description, r.user_id, r.created_at,
                    COALESCE(l.like_count, 0) AS like_count, u.name as author 
             FROM recipes r 
             JOIN users u ON r.user_id = u.id
             LEFT JOIN (SELECT recipe_id, COUNT(*) AS like_count FROM likes GROUP BY recipe_id) l 
             ON r.id = l.recipe_id
             WHERE r.title ILIKE $1
             ORDER BY like_count DESC`, [`%${query}%`]);

        res.status(200).json(recipes.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};
const deleteRecipe = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // Начать транзакцию
        await pool.query('BEGIN');

        // Удалить лайки, связанные с рецептом
        await pool.query('DELETE FROM likes WHERE recipe_id = $1', [id]);

        // Удалить комментарии, связанные с рецептом
        await pool.query('DELETE FROM comments WHERE recipe_id = $1', [id]);

        // Удалить фотографии, связанные с рецептом
        await pool.query('DELETE FROM recipe_photos WHERE recipe_id = $1', [id]);

        // Удалить шаги, связанные с рецептом
        await pool.query('DELETE FROM steps WHERE recipe_id = $1', [id]);

        // Удалить ингредиенты, связанные с рецептом
        await pool.query('DELETE FROM ingredients WHERE recipe_id = $1', [id]);

        // Удалить сам рецепт
        const recipe = await pool.query(
            'DELETE FROM recipes WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        // Если рецепт не найден или пользователь не авторизован
        if (recipe.rows.length === 0) {
            await pool.query('ROLLBACK'); // Откатить транзакцию
            return res.status(404).json({ message: 'Recipe not found or not authorized' });
        }

        // Завершить транзакцию
        await pool.query('COMMIT');

        res.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        // В случае ошибки откатить транзакцию
        await pool.query('ROLLBACK');
        console.error('Error deleting recipe:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const addIngredients = async (req, res) => {
    const {recipeId} = req.params;
    const {ingredients} = req.body;

    console.log("Received ingredients:", ingredients);

    if (!Array.isArray(ingredients) || ingredients.some(ing => !ing.name || !ing.quantity)) {
        console.error("Invalid ingredients format:", ingredients);
        return res.status(400).json({message: 'Ingredients must be a non-empty array of valid objects'});
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({message: 'Ingredients must be a non-empty array'});
    }

    try {
        const values = ingredients
            .map(({name, quantity}) => `(${recipeId}, '${name}', '${quantity || ''}')`)
            .join(',');

        const query = `
            INSERT INTO ingredients (recipe_id, name, quantity)
            VALUES ${values}
            RETURNING *;
        `;

        const result = await pool.query(query);
        res.status(201).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

const getIngredientsByRecipe = async (req, res) => {
    const {recipeId} = req.params;

    try {
        const result = await pool.query('SELECT id, name, quantity FROM ingredients WHERE recipe_id = $1', [recipeId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

const addSteps = async (req, res) => {
    const {recipeId} = req.params;
    const {steps} = req.body;

    if (!steps || !Array.isArray(steps) || steps.length === 0) {
        return res.status(400).json({message: 'Steps are required and should be an array'});
    }

    try {
        const values = steps
            .map(({stepNumber, description}) => {
                if (stepNumber === undefined || description === undefined) {
                    throw new Error('Each step must contain stepNumber and description');
                }
                return `(${recipeId}, ${stepNumber}, '${description}')`;
            })
            .join(',');

        const query = `
            INSERT INTO steps (recipe_id, step_number, description)
            VALUES ${values}
            RETURNING *;
        `;

        const result = await pool.query(query);
        res.status(201).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

const getStepsByRecipe = async (req, res) => {
    const {recipeId} = req.params;

    try {
        const result = await pool.query('SELECT id, step_number, description FROM steps WHERE recipe_id = $1 ORDER BY step_number', [recipeId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

const addComment = async (req, res) => {
    const {recipeId, text} = req.body;
    const userId = req.user.id;

    if (!text) {
        return res.status(400).json({message: "Comment text is required"});
    }

    try {
        const newComment = await pool.query(`INSERT INTO comments (recipe_id, user_id, text) 
             VALUES ($1, $2, $3) 
             RETURNING id, recipe_id, user_id, text, created_at`, [recipeId, userId, text]);

        const authorQuery = await pool.query(`SELECT name FROM users WHERE id = $1`, [userId]);
        const author = authorQuery.rows[0]?.name || "Anonymous";

        res.status(201).json({
            ...newComment.rows[0], author,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error"});
    }
};

const getCommentsByRecipeId = async (req, res) => {
    const {recipeId} = req.params;

    try {
        const commentsQuery = `
            SELECT c.id, c.text, COALESCE(u.name, 'Anonymous') AS author, c.created_at
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.recipe_id = $1
            ORDER BY c.created_at DESC
        `;

        const result = await pool.query(commentsQuery, [recipeId]);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({message: 'Server error'});
    }
};

//------------------------------------------------
const searchRecipes = async (req, res) => {
    const {query} = req.query;

    try {
        const result = await pool.query(`SELECT * FROM recipes WHERE LOWER(title) LIKE LOWER($1)`, [`%${query}%`]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

const filterRecipesByRating = async (req, res) => {
    const {minRating} = req.query;

    try {
        const result = await pool.query(`SELECT * FROM recipes WHERE average_rating >= $1 ORDER BY average_rating DESC`, [minRating]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

const filterRecipesByIngredient = async (req, res) => {
    const {ingredient} = req.query;

    try {
        const result = await pool.query(`SELECT DISTINCT recipes.*
            FROM recipes
            JOIN ingredients ON recipes.id = ingredients.recipe_id
            WHERE LOWER(ingredients.name) LIKE LOWER($1)`, [`%${ingredient}%`]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

const searchAndFilterRecipes = async (req, res) => {
    const {query, minRating, ingredient} = req.query;

    let baseQuery = `SELECT DISTINCT recipes.* FROM recipes`;
    let conditions = [];
    let values = [];
    let counter = 1;

    if (ingredient) {
        baseQuery += ` JOIN ingredients ON recipes.id = ingredients.recipe_id`;
        conditions.push(`LOWER(ingredients.name) LIKE LOWER($${counter++})`);
        values.push(`%${ingredient}%`);
    }

    if (query) {
        conditions.push(`LOWER(recipes.title) LIKE LOWER($${counter++})`);
        values.push(`%${query}%`);
    }

    if (minRating) {
        conditions.push(`recipes.average_rating >= $${counter++}`);
        values.push(minRating);
    }

    if (conditions.length > 0) {
        baseQuery += ` WHERE ` + conditions.join(' AND ');
    }

    baseQuery += ` ORDER BY recipes.average_rating DESC`;

    try {
        const result = await pool.query(baseQuery, values);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

const addRecipePhoto = async (req, res) => {
    const {recipeId} = req.params;

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({message: 'No files uploaded'});
    }

    try {
        const recipe = await pool.query('SELECT id FROM recipes WHERE id = $1', [recipeId]);
        if (recipe.rows.length === 0) {
            return res.status(404).json({message: 'Recipe not found'});
        }

        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, {recursive: true});
        }

        const photoUrls = [];
        for (let file of req.files) {
            const filePath = path.join(uploadsDir, file.originalname);
            fs.writeFileSync(filePath, file.buffer);

            const photoUrl = `/uploads/${file.originalname}`;
            const newPhoto = await pool.query('INSERT INTO recipe_photos (recipe_id, photo_url) VALUES ($1, $2) RETURNING *', [recipeId, photoUrl]);
            photoUrls.push(newPhoto.rows[0]);
        }

        res.status(201).json(photoUrls);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

const getRecipePhotos = async (req, res) => {
    const {recipeId} = req.params;

    try {
        const photos = await pool.query('SELECT id, photo_url FROM recipe_photos WHERE recipe_id = $1', [recipeId]);

        res.status(200).json(photos.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

const deleteRecipePhoto = async (req, res) => {
    const {photoId} = req.params;

    try {
        const photo = await pool.query('SELECT id FROM recipe_photos WHERE id = $1', [photoId]);
        if (photo.rows.length === 0) {
            return res.status(404).json({message: 'Photo not found'});
        }

        await pool.query('DELETE FROM recipe_photos WHERE id = $1', [photoId]);
        res.status(200).json({message: 'Photo deleted successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

const addLike = async (req, res) => {
    const {recipeId} = req.params;
    const userId = req.user.id;

    try {
        const existingLike = await pool.query('SELECT * FROM likes WHERE recipe_id = $1 AND user_id = $2', [recipeId, userId]);

        if (existingLike.rows.length > 0) {
            return res.status(400).json({message: 'You have already liked this recipe'});
        }

        await pool.query('INSERT INTO likes (recipe_id, user_id) VALUES ($1, $2)', [recipeId, userId]);

        res.status(201).json({message: 'Like added successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

const getLikesCount = async (req, res) => {
    const {recipeId} = req.params;

    try {
        const result = await pool.query('SELECT COUNT(*) AS like_count FROM likes WHERE recipe_id = $1', [recipeId]);

        res.status(200).json({likeCount: result.rows[0].like_count});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

const removeLike = async (req, res) => {
    const {recipeId} = req.params;
    const userId = req.user.id;

    try {
        const result = await pool.query('DELETE FROM likes WHERE recipe_id = $1 AND user_id = $2 RETURNING *', [recipeId, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({message: 'Like not found'});
        }

        res.status(200).json({message: 'Like removed successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

const checkLikeStatus = async (req, res) => {
    const {recipeId} = req.params;
    const userId = req.user.id;

    try {
        const existingLike = await pool.query('SELECT * FROM likes WHERE recipe_id = $1 AND user_id = $2', [recipeId, userId]);

        const isLiked = existingLike.rows.length > 0;
        res.status(200).json({isLiked});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

module.exports = {
    createRecipe,
    getAllRecipes,
    getRecipeById,
    updateRecipe,
    deleteRecipe,
    addIngredients,
    getIngredientsByRecipe,
    addSteps,
    getStepsByRecipe,
    addComment,
    getCommentsByRecipeId,
    searchRecipes,
    filterRecipesByRating,
    filterRecipesByIngredient,
    searchAndFilterRecipes,
    addRecipePhoto,
    getRecipePhotos,
    deleteRecipePhoto,
    upload,
    addLike,
    getLikesCount,
    removeLike,
    checkLikeStatus,
    getRecipesByUserId,
    searchRecipesByName
};