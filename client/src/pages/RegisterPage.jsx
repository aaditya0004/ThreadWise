import React, {useState} from 'react';
import {Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import axios from 'axios';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate('');
    const [loading, setLoading] = useState(false);

    const hangleRegister = async (e) => {
        e.preventDefault();
        if(loading) return;
        setError('');

        // Basic client-side validation 
        if(password != confirmPassword){
            setError('Password do not match');
            return;
        }

        try{
            setLoading(true);

            // 1. Send register request to backend 
            const {data} = await axios.post('http://localhost:5000/api/users/register', {name, email, password});

            // 2. On Success, the backend retruns the same data structures as login (user + token)
            // so we can log them immediatedly
            localStorage.setItem('userInfo', JSON.stringify(data));

            // 3. Redirect to dashboard
            navigate('/dashboard');
        }
        catch(error){
            setError(error.response?.data?.message || 'Response failed');
        }
        finally{
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:5000/api/users/auth/google';
    }

    return (
        <div className='min-h-screen flex bg-gray-50'>
            {/* Left Side - Image/Branding */}
            <div className='hidden lg:flex bg-blue-600 text-white w-1/2 items-center justify-center p-12'>
                <div>
                    <h1 className='text-5xl font-bold mb-4'>Join ThreadWise</h1>
                    <p className='text-xl opacity-90'>Create your account today and start organizing your digital life.</p>
                </div>
            </div>

            {/* Right Side - form */}
            <div className='flex-1 flex items-center justify-center p-8'>
                <div className='w-full max-w-md bg-white p-8 rounded-lg shadow-lg'>
                    <h2 className='text-3xl font-bold text-gray-800 mb-6 text-center'>Create Account</h2>

                    {error && (
                        <div className='bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
                            {error}
                        </div>
                    )}

                    <form onSubmit={hangleRegister} className='space-y-4'>
                        <div>
                            <label className='block text-gray-700 text-sm font-bold mb-2'>Full Name</label>
                            <input 
                                type="text" 
                                placeholder='Enter your full name'
                                className='w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className='block text-gray-700 text-sm font-bold mb-2'>Email</label>
                            <input 
                                type="email" 
                                placeholder='Enter your email'
                                className='w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className='block text-gray-700 text-sm font-bold mb-2'>Password</label>
                            <input 
                                type="password" 
                                placeholder='Create a password'
                                className='w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className='block text-gray-700 text-sm font-bold mb-2'>Confirm Password</label>
                            <input 
                                type="password" 
                                placeholder='Confirm password'
                                className='w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                        >
                            {loading ? 'Signing Up...' : 'Sign Up'}
                        </button>
                    </form>

                    <div className='mt-6'>
                        <div className='relative'>
                            <div className='inset-0 absolute flex items-center'>
                                <div className='w-full border-t border-gray-300'></div>
                            </div>
                            <div className='relative flex justify-center text-sm'>
                                <span className='px-2 bg-white text-gray-500'>Or sign up with</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleGoogleLogin}
                            className='mt-4 w-full flex items-center justify-center border border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition'
                        >
                            <FcGoogle className="text-2xl mr-2" />
                            <span className="font-medium text-gray-700">Google</span>
                        </button>
                    </div>

                    <p className="mt-6 text-center text-gray-600 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 font-bold hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
};

export default RegisterPage;
