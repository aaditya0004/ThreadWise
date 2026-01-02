import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FiRefreshCw, FiSearch, FiPlus } from 'react-icons/fi'; // Icons

const DashboardPage = () => {
    const [accounts, setAccounts] = useState([]);
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);

    // 1. Fetch data on Load 
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // Parallel requests: Get connected accounts AND recent emails
            const [accountsRes, emailsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/accounts', config),
                axios.get('http://localhost:5000/api/emails/feed', config)
            ]);
            console.log('ACCOUNTS:', accountsRes.data);

            setAccounts(accountsRes.data);
            setEmails(emailsRes.data);
        } 
        catch (error) {
            console.error('Dashboard fetch error:', error.response?.data || error);
            console.error('Error fetching dashboard data', error);
        } 
        finally {
            setLoading(false);
        }
    };

    // 2. Handle Sync Button
    const handleSync = async (accountId) => {
        setSyncing(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // Call the backend to fetch from Gmail & Index to Elasticsearch
            await axios.get(`http://localhost:5000/api/accounts/${accountId}/emails`, config);
      
            // After sync, refresh the feed to show new items
            await fetchDashboardData();
            alert('Sync complete! New emails added.');
        } 
        catch (error) {
            alert('Sync failed. Check console.');
            console.error(error);
        } finally {
            setSyncing(false);
        }
    };

    return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <div className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">ThreadWise</h1>
        <div className="flex gap-4">
          <Link to="/connect" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <FiPlus /> Link Mailbox
          </Link>
          <button 
            onClick={fetchDashboardData} 
            className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <FiRefreshCw /> Refresh Feed
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Accounts */}
        <div className="w-64 bg-white border-r p-4 overflow-y-auto">
          <h2 className="text-gray-500 font-bold uppercase text-xs mb-4">Connected Accounts</h2>
          {accounts.length === 0 ? (
            <p className="text-sm text-gray-400">No accounts linked.</p>
          ) : (
            accounts.map((acc) => (
              <div key={acc._id} className="mb-4 p-3 bg-gray-50 rounded-lg border">
                <p className="text-sm font-medium truncate">{acc.email}</p>
                <button 
                  onClick={() => handleSync(acc._id)}
                  disabled={syncing}
                  className="mt-2 w-full text-xs bg-green-100 text-green-700 py-1 rounded hover:bg-green-200 transition"
                >
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Main Feed: Emails */}
        <div className="flex-1 p-8 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6">Inbox Feed</h2>

          {loading ? (
             <p>Loading emails...</p>
          ) : emails.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg">Your feed is empty.</p>
              <p>Link an account and click "Sync Now" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {emails.map((email, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800">{email.subject}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-bold
                      ${email.category === 'Interested' ? 'bg-green-100 text-green-800' : 
                        email.category === 'Not Interested' ? 'bg-red-100 text-red-800' :
                        email.category === 'Meeting Booked' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-600'}`}>
                      {email.category || 'General'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">From: {email.from}</p>
                  <p className="text-gray-600 line-clamp-2">{email.snippet || email.body}</p>
                  <p className="text-xs text-gray-400 mt-4">
                    {new Date(email.date).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default DashboardPage;