const express = require('express');
const {
    registerUser, loginUser, getUserById, getAllUsers, updateUser, deleteUser, getCurrentUser
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', authMiddleware, getCurrentUser);
router.get('/:id', authMiddleware, getUserById);
router.get('/', authMiddleware, getAllUsers);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);


router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;
