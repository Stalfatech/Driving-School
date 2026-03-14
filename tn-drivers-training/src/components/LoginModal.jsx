import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleLogin = async (e) => {
        // Prevent the browser from reloading the page
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log("Sending request to backend...");
            
            const response = await axios.post('http://127.0.0.1:8000/api/login', {
                email,
                password
            });

            console.log("Raw Response Data:", response.data);

            // Match your AuthController structure: response.data.success and response.data.access_token
            if (response.data.success === true || response.data.access_token) {
                const token = response.data.access_token;
                const user = response.data.user;

                // --- DATA STORAGE ---
                // We use 'access_token' to match the fetch call in Application.jsx
                localStorage.setItem('access_token', token);
                localStorage.setItem('user_role', user.role);
                localStorage.setItem('user_data', JSON.stringify(user));

                console.log("LocalStorage Updated Successfully!");
                console.log("Stored Token:", localStorage.getItem('access_token'));

                // --- UI FEEDBACK & REDIRECT ---
                onClose(); // Close the modal

                // Navigation based on role
                if (user.role === 'admin') {
                    navigate('/admin');
                } else if (user.role === 'instructor') {
                    navigate('/instructor');
                } else {
                    navigate('/student-dashboard');
                }
            } else {
                setError(response.data.message || 'Login failed: Unexpected response format.');
            }

        } catch (err) {
            console.error("Login Error Details:", err.response?.data);
            
            // Handle Laravel Validation Errors (422) or Auth Errors (401/403)
            const errorMessage = err.response?.data?.message || 'Invalid credentials or server error.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md relative">
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <h2 className="text-3xl font-bold text-gray-800 mb-6">Sign In</h2>
                
                {/* Error Message Display */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm border border-red-200">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                        <input 
                            type="email" 
                            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                        <input 
                            type="password" 
                            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Authenticating...
                            </span>
                        ) : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
