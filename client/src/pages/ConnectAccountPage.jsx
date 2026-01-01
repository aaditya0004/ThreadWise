import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const ConnectAccountPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // Default to gmail s imap server, but allow user to change it 
    const [host, setHost] = useState('imap.gmail.com');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Get the user info (token) from the localStorage
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));

            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            // 2. Send the data to our backend 
            await axios.post('http://localhost:5000/api/accounts', 
                {
                    email,
                    imapPassword: password,  // the backend expects the imap password
                    imapHost: host,
                },
                config
            );

            // 3. Success -> go back to Dashboard
            navigate('/dashboard');
        }
        catch(error){
            console.log(error.response?.data); 
            setError(error.response?.data?.message || 'Failed to connect account');
        }
        finally{
            setLoading(false);
        }
    };

    return(
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="bg-white max-w-lg w-full p-8 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Link a Mailbox
                </h2>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Email Address</label>
                        <input 
                            type='email' 
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="aaditya@gmail.com"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-1">
                            App Password
                            <span className="text-xs text-gray-500 font-normal ml-2">
                                (Not Your Normal Password - IMAP Password)
                            </span>
                        </label>
                        <input 
                            type='password' 
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="xxxx xxxx xxxx xxxx"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Go to Google Account {'>'} Security {'>'} 2-Step Verification {'>'} App Passwords.
                        </p>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-1">IMAP Host</label>
                        <input 
                            type='text' 
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={host}
                            onChange={(e) => setHost(e.target.value)}
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-lg text-white font-bold transition duration-200 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {loading ? 'Verifying and connecting...' : 'Connect Mailbox'}
                        </button>
                    </div>
                </form>

                <button 
                    onClick={() => navigate('/dashboard')}
                    className="mt-4 w-full text-center text-gray-500 hover:text-gray-700 text-sm"
                >
                    Cancel
                </button>

            </div>
        </div>
    );
};


export default ConnectAccountPage;


