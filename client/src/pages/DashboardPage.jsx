import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FiRefreshCw, FiSearch, FiPlus, FiX} from "react-icons/fi"; // Icons

const DashboardPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  // New State for Search
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // 1. Fetch data on Load
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      // Parallel requests: Get connected accounts AND recent emails
      const [accountsRes, emailsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/accounts", config),
        axios.get("http://localhost:5000/api/emails/feed", config),
      ]);
      console.log("ACCOUNTS:", accountsRes.data);

      setAccounts(accountsRes.data);
      setEmails(emailsRes.data);
    } catch (error) {
      console.error("Dashboard fetch error:", error.response?.data || error);
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return; // Don't search empty strings

    setLoading(true);
    setIsSearching(true); // We are now in "Search" mode

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      // Call our Search Endpoint
      const { data } = await axios.get(
        `http://localhost:5000/api/emails/search?q=${searchQuery}`,
        config
      );
      setEmails(data);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Clear Search
  const clearSearch = () => {
    setSearchQuery("");
    fetchDashboardData(); // Go back to the main feed
  };

  // 4. Handle Sync
  const handleSync = async (accountId) => {
    setSyncing(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.get(
        `http://localhost:5000/api/accounts/${accountId}/emails`,
        config
      );

      // If we are currently searching, don't refresh the feed, stay on results
      // Otherwise, refresh the feed
      if (!isSearching) {
        await fetchDashboardData();
      }
      alert("Sync complete!");
    } catch (error) {
      alert("Sync failed.");
    } finally {
      setSyncing(false);
    }
  };

  //Handle Sync Button
  /*     const handleSync = async (accountId) => {
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
    }; */

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <div className="bg-white shadow p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-blue-600 hidden md:block">ThreadWise</h1>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4 relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search emails (e.g. 'invoice', 'meeting')..."
            className="w-full bg-gray-100 border-none rounded-lg py-2 pl-10 pr-10 focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-3 text-gray-500 hover:text-red-500"
            >
              <FiX />
            </button>
          )}
        </form>

        <div className="flex gap-2 md:gap-4">
          <Link to="/connect" className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm md:text-base">
            <FiPlus /> <span className="hidden md:inline">Link Mailbox</span>
          </Link>
          <button 
            onClick={fetchDashboardData} 
            className="flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 text-sm md:text-base"
          >
            <FiRefreshCw />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:block w-64 bg-white border-r p-4 overflow-y-auto">
          <h2 className="text-gray-500 font-bold uppercase text-xs mb-4">Connected Accounts</h2>
          {accounts.map((acc) => (
            <div key={acc._id} className="mb-4 p-3 bg-gray-50 rounded-lg border">
              <p className="text-xs font-bold text-gray-400 mb-1 uppercase">Google Workspace</p>
              <p className="text-sm font-medium truncate mb-2">{acc.email}</p>
              <button 
                onClick={() => handleSync(acc._id)}
                disabled={syncing}
                className="w-full text-xs bg-white border border-gray-300 text-gray-700 py-1 rounded hover:bg-gray-50 transition"
              >
                {syncing ? 'Syncing...' : 'Sync Emails'}
              </button>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold">
              {isSearching ? `Search Results for "${searchQuery}"` : 'Inbox Feed'}
            </h2>
            <span className="text-sm text-gray-500">{emails.length} results</span>
          </div>

          {loading ? (
             <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : emails.length === 0 ? (
            <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-lg">No emails found.</p>
              {isSearching && <button onClick={clearSearch} className="text-blue-600 mt-2 hover:underline">Clear Search</button>}
            </div>
          ) : (
            <div className="space-y-4">
              {emails.map((email, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition">{email.subject}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-bold
                      ${email.category === 'Interested' ? 'bg-green-100 text-green-800' : 
                        email.category === 'Not Interested' ? 'bg-red-100 text-red-800' :
                        email.category === 'Meeting Booked' ? 'bg-purple-100 text-purple-800' :
                        email.category === 'Spam' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-600'}`}>
                      {email.category || 'General'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>{email.from}</span>
                    <span>{new Date(email.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">{email.snippet || email.body}</p>
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
