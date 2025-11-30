import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {FcGoogle} from 'react-icons/fc';
import axios from 'axios';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try{
            const {data} = await axios.post('http://localhost:5000/api/users/login', {email, password});

            // Save the token to LocalStorage so we stay logged in even if we refresh
            localStorage.setItem('userInfo', JSON.stringify(data));

            // Redirect to Dashboard;
            navigate('/dashboard');
        }
        catch(error){
            setError(error.response?.data?.message || "Login Failed");
        }
    };

    const handleGoogleLogin = () => {
        // We simply refirect the browser to our backend endpoint
        // backend handles the redirect to google 
        window.location.href = 'http://localhost:5000/api/users/auth/google';
    }


    return (
        <div className='min-h-screen flex bg-gray-50'>
            {/* Left Side -> Image/Branding */}
            <div className='hidden lg:flex w-1/2 bg-blue-600 items-center justify-center text-white p-12'>
                <div>
                    <h1 className='text-5xl font-bold mb-4'>ThreadWise</h1>
                    <p className='test-xl opacity-90'>
                        Unify your inboxes. AI-powered organization for the modern professional.
                    </p>
                </div>
            </div>

            {/* Right Side -> Form */}
            <div className='flex-1 flex items-center justify-center p-8'>
                <div className='w-full max-w-md bg-white p-8 rounded-lg shadow-lg'>
                    <h2 className='text-3xl font-bold text-gray-800 mb-6 text-center'>
                        Welcome Back
                    </h2>
                    {error && (
                        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className='space-y-4'>
                        <div>
                            <label className='block text-gray-700 text-sm font-bold mb-2'>Email</label>
                            <input 
                                type="Email"
                                placeholder='Enter Your Email'
                                className='w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className='block text-gray-700 text-sm font-bold mb-2'>Password</label>
                            <input 
                                type="password"
                                placeholder='Enter Your Password'
                                className='w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type='submit'
                            className='w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200'
                        >
                            Sign In
                        </button>
                    </form>

                    <div className='mt-6'>
                        <div className='relative'>
                            <div className='absolute inset-0 flex items-center'>
                                <div className='w-full border-t border-gray-300'></div>
                            </div>
                            <div className='relative flex justify-center text-sm'>
                                <span className='px-2 bg-white text-gray-500'>Or continue with</span>
                            </div>
                        </div>
                        <button
                            onClick={handleGoogleLogin}
                            className='mt-4 w-full flex items-center justify-center border border-gray-300 rounded-lg p-2 hover:bg-gray-500 transition'
                        >
                            <FcGoogle className='text-2xl mr-2' />
                            <span className='font-medium text-gray-700'>Google</span>
                        </button>
                    </div>
                    <p className='mt-6 text-center text-gray-600 text-sm'>
                        Don't have an account?{' '}
                        <Link to={'/register'} className='text-blue-600 font font-bold hover:underline'>
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;