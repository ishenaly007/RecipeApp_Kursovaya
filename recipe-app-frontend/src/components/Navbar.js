import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './styles/Navbar.css'; // Подключаем CSS файл

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');

    if (['/login', '/register'].includes(location.pathname)) {
        return null;
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleProfile = () => {
        navigate('/profile'); // Переход на страницу профиля
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate('/search-results', { state: { query: searchQuery } });
            setSearchQuery(''); // Очистить поле поиска после отправки
        }
    };

    const handleHomeClick = () => {
        navigate('/'); // Переход на главную страницу
    };

    return (
        <nav className="navbar">
            <div className="navbar-title" onClick={handleHomeClick}>
                Recipe App
            </div>
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="search-button">
                    Search
                </button>
            </form>
            <div className="navbar-actions">
                <button onClick={handleProfile} className="profile-button">
                    Profile
                </button>
                <button onClick={handleLogout} className="logout-button">
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;