import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import RecipeList from './components/RecipeList';
import RecipeForm from './components/RecipeForm';
import RecipeDetails from './components/RecipeDetails';
import Register from './components/Register';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import Navbar from './components/Navbar';
import UserProfile from './components/UserProfile';
import SearchResultsList from "./components/SearchResultsList";
import EditRecipe from "./components/EditRecipe";

const App = () => {
    return (
        <Router>
            <Navbar/>
            <div className="app-container">
                <nav className="app-nav">
                    <a href="/" className="nav-link">Home</a> |
                    <a href="/create" className="nav-link">Create Recipe</a>
                </nav>
                <div className="app-content">
                    <Routes>
                        <Route path="/" element={<ProtectedRoute><RecipeList/></ProtectedRoute>}/>
                        <Route path="/profile" element={<ProtectedRoute><UserProfile/></ProtectedRoute>}/>
                        <Route path="/create" element={<ProtectedRoute><RecipeForm/></ProtectedRoute>}/>
                        <Route path="/recipes/edit" element={<ProtectedRoute><EditRecipe/></ProtectedRoute>}/>
                        <Route path="/recipes/:id" element={<ProtectedRoute><RecipeDetails/></ProtectedRoute>}/>
                        <Route path="/search-results" element={<SearchResultsList/>}/>
                        <Route path="/register" element={<Register/>}/>
                        <Route path="/login" element={<Login/>}/>
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;