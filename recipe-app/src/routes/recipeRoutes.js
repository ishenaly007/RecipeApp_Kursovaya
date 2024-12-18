const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const {
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
    addRecipePhoto,
    getRecipePhotos,
    deleteRecipePhoto,
    addLike,
    removeLike,
    getLikesCount,
    checkLikeStatus,
    getRecipesByUserId,
    searchRecipesByName,
    upload
} = require('../controllers/recipeController');

router.post('/:recipeId/photos', authMiddleware, upload.array('photo'), addRecipePhoto);
router.get('/:recipeId/photos', getRecipePhotos);
router.delete('/photos/:photoId', authMiddleware, deleteRecipePhoto);

router.post('/', authMiddleware, createRecipe);
router.get('/', getAllRecipes);
router.get('/user/:userId', getRecipesByUserId);
router.get('/search', searchRecipesByName);
router.get('/:id', getRecipeById);
router.put('/:id', authMiddleware, updateRecipe);
//router.put('/:id', authMiddleware, updateRecipe);
router.delete('/:id', authMiddleware, deleteRecipe);

router.post('/:recipeId/ingredients', authMiddleware, addIngredients);
router.get('/:recipeId/ingredients', getIngredientsByRecipe);

router.post('/:recipeId/steps', authMiddleware, addSteps);
router.get('/:recipeId/steps', getStepsByRecipe);

router.post('/:recipeId/comments', authMiddleware, addComment);
router.get('/:recipeId/comments', getCommentsByRecipeId);

router.post('/:recipeId/like', authMiddleware, addLike);
router.delete('/:recipeId/like', authMiddleware, removeLike);
router.get('/:recipeId/like-count', getLikesCount);
router.get('/:recipeId/like-status', authMiddleware, checkLikeStatus);

module.exports = router;