import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiRefreshCw,
  FiSearch,
  FiPlus,
  FiX,
  FiCalendar,
  FiUser,
  FiTag,
  FiTrash2,
  FiLogOut,
} from "react-icons/fi"; // Icons
import ChatAssistant from '../components/ChatAssistant';

const DashboardPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  // State for Search
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  // Modal State
  const [selectedEmail, setSelectedEmail] = useState(null);

  const navigate = useNavigate();

  // 1. Fetch data on Load
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    // Explicitly reset search state when fetching full dashboard
    setIsSearching(false);
    // We do NOT clear searchQuery here, in case the user wants to type while loading
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

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // If user clears the input manually, instantly revert to feed
    if (value === "") {
      setIsSearching(false);
      fetchDashboardData();
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
    // Show a "loading" toast that stays until we finish
    const loadingToast = toast.loading("Syncing emails with Gmail...");

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      // The backend returns the list of NEW emails fetched
      const { data: newEmails } = await axios.get(
        `http://localhost:5000/api/accounts/${accountId}/emails`,
        config
      );

      // Calculate stats
      const count = newEmails.length;
      const interestedCount = newEmails.filter(
        (e) => e.category === "Interested"
      ).length;

      // Dismiss the loading toast
      toast.dismiss(loadingToast);

      if (count === 0) {
        toast("No new emails found.", { icon: "🤷‍♂️" });
      } else {
        // Success Toast
        toast.success(`Synced ${count} new emails!`);

        // SPECIAL ALERT: If we found job leads, show a second, exciting toast!
        if (interestedCount > 0) {
          setTimeout(() => {
            toast(`🚀 Found ${interestedCount} potential job leads!`, {
              duration: 6000,
              icon: "🔥",
              style: {
                border: "1px solid #713200",
                padding: "16px",
                color: "#713200",
                fontWeight: "bold",
                background: "#FFFAEE",
              },
            });
          }, 500); // Small delay so they appear one after another
        }
      }

      // Refresh the feed
      if (!isSearching) {
        await fetchDashboardData();
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Sync failed. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  // 5. Handle Remove Account
  const handleRemoveAccount = async (accountId) => {
    if (!window.confirm("Are you sure you want to remove this account?"))
      return;

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      await axios.delete(
        `http://localhost:5000/api/accounts/${accountId}`,
        config
      );

      // Refresh the list
      fetchDashboardData();
      alert("Account removed successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to remove account");
    }
  };

  // 6. Handle Logout
  const handleLogout = () => {
    // Clear the user's data from the browser
    localStorage.removeItem("userInfo");
    // Redirect to login page
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {/* Navbar */}
      <div className="bg-white shadow p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-blue-600 hidden md:block">
          ThreadWise
        </h1>

        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4 relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search emails..."
            className="w-full bg-gray-100 border-none rounded-lg py-2 pl-10 pr-10 focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={searchQuery}
            onChange={handleInputChange}
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
          <Link
            to="/connect"
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm md:text-base"
          >
            <FiPlus /> <span className="hidden md:inline">Link Mailbox</span>
          </Link>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <FiRefreshCw />
          </button>
          {/* Vertical Divider */}
          <div className="h-6 w-px bg-gray-300 mx-1"></div>{" "}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition px-2"
            title="Sign Out"
          >
            <FiLogOut size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:block w-64 bg-white border-r p-4 overflow-y-auto">
          <h2 className="text-gray-500 font-bold uppercase text-xs mb-4">
            Connected Accounts
          </h2>
          {accounts.map((acc) => (
            <div
              key={acc._id}
              className="mb-4 p-3 bg-gray-50 rounded-lg border group relative"
            >
              {/* Header with Email and Delete Button */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-0.5 uppercase">
                    Google Workspace
                  </p>
                  <p
                    className="text-sm font-medium truncate w-32"
                    title={acc.email}
                  >
                    {acc.email}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveAccount(acc._id)}
                  className="text-gray-400 hover:text-red-500 transition p-1"
                  title="Remove Account"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>

              {/* Sync Button */}
              <button
                onClick={() => handleSync(acc._id)}
                disabled={syncing}
                className="w-full text-xs bg-white border border-gray-300 text-gray-700 py-1.5 rounded hover:bg-gray-50 transition flex justify-center items-center gap-2"
              >
                {syncing ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-700"></div>
                    Syncing...
                  </>
                ) : (
                  "Sync Emails"
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Feed */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold">
              {isSearching
                ? `Search Results for "${searchQuery}"`
                : "Inbox Feed"}
            </h2>
            <span className="text-sm text-gray-500">
              {emails.length} results
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : emails.length === 0 ? (
            <div className="text-center py-20 text-gray-500 border border-dashed rounded-xl">
              <p className="text-lg">No emails found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {emails.map((email, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedEmail(email)} // <--- CLICK HANDLER
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group hover:border-blue-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition">
                      {email.subject}
                    </h3>
                    <CategoryBadge category={email.category} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span className="flex items-center gap-1">
                      <FiUser /> {email.from}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiCalendar /> {new Date(email.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {email.snippet || email.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL COMPONENT */}
      {selectedEmail && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedEmail(null)}
        >
          <div
            className="bg-white w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-start bg-gray-50">
              <div className="flex-1 pr-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedEmail.subject}
                </h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-2 bg-white px-2 py-1 rounded border">
                    <FiUser className="text-blue-500" /> {selectedEmail.from}
                  </span>
                  <span className="flex items-center gap-2 bg-white px-2 py-1 rounded border">
                    <FiCalendar className="text-blue-500" />{" "}
                    {new Date(selectedEmail.date).toLocaleString()}
                  </span>
                  <CategoryBadge category={selectedEmail.category} />
                </div>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition"
              >
                <FiX size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-8 overflow-y-auto bg-white flex-1">
              <div className="prose max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
                {selectedEmail.body}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50 text-right">
              <button
                onClick={() => setSelectedEmail(null)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Assistant */}
      <ChatAssistant />
    </div>
  );
};

// Helper Component for Categories
const CategoryBadge = ({ category }) => {
  const styles = {
    Interested: "bg-green-100 text-green-800 border-green-200",
    "Not Interested": "bg-red-100 text-red-800 border-red-200",
    "Meeting Booked": "bg-purple-100 text-purple-800 border-purple-200",
    Spam: "bg-yellow-100 text-yellow-800 border-yellow-200",
    General: "bg-gray-100 text-gray-600 border-gray-200",
  };

  const style = styles[category] || styles["General"];

  return (
    <span
      className={`px-3 py-1 text-xs rounded-full font-bold border ${style} flex items-center gap-1`}
    >
      <FiTag size={10} /> {category || "General"}
    </span>
  );
};

export default DashboardPage;
