const pool = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    const {name, email, password} = req.body;

    try {
        // Проверка существующего пользователя
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({message: 'Email already registered'});
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создание пользователя
        const newUser = await pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *', [name, email, hashedPassword]);

        // Генерация токена
        const token = jwt.sign({id: newUser.rows[0].id}, process.env.SECRET_KEY, {
            expiresIn: '1h',
        });

        res.status(201).json({token, user: newUser.rows[0]});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

const loginUser = async (req, res) => {
    const {email, password} = req.body;

    try {
        // Проверяем существование пользователя
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({message: 'Invalid email or password'});
        }

        // Сравниваем пароль
        const isPasswordValid = await bcrypt.compare(password, user.rows[0].password);
        if (!isPasswordValid) {
            return res.status(400).json({message: 'Invalid email or password'});
        }

        // Генерируем токен
        const token = jwt.sign({id: user.rows[0].id}, process.env.SECRET_KEY, {expiresIn: '1h'});

        res.status(200).json({token, user: {id: user.rows[0].id, name: user.rows[0].name, email: user.rows[0].email}});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

const getUserById = async (req, res) => {
    const { id } = req.params;
    console.log('ID parameter:', id); // Логируем id
    try {
        const user = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [id]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Получение всех пользователей
const getAllUsers = async (req, res) => {
    try {
        const users = await pool.query('SELECT id, name, email FROM users');
        res.status(200).json(users.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

// Обновление данных пользователя
const updateUser = async (req, res) => {
    const {id} = req.params;
    const {name, email, password} = req.body;

    try {
        // Хеширование пароля (если он был обновлен)
        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

        const updateQuery = `
            UPDATE users
            SET 
                name = COALESCE($1, name),
                email = COALESCE($2, email),
                password = COALESCE($3, password)
            WHERE id = $4
            RETURNING id, name, email;
        `;

        const values = [name, email, hashedPassword, id];
        const updatedUser = await pool.query(updateQuery, values);

        if (updatedUser.rows.length === 0) {
            return res.status(404).json({message: 'User not found'});
        }

        res.status(200).json(updatedUser.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

// Удаление пользователя
const deleteUser = async (req, res) => {
    const {id} = req.params;

    try {
        const deleteQuery = 'DELETE FROM users WHERE id = $1 RETURNING id';
        const deletedUser = await pool.query(deleteQuery, [id]);

        if (deletedUser.rows.length === 0) {
            return res.status(404).json({message: 'User not found'});
        }

        res.status(200).json({message: `User with id ${id} deleted`});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization token missing or invalid' });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const userId = decoded.id;

        const user = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [userId]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser,
    getCurrentUser
};