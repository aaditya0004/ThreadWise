import React from "react";
import { Link } from "react-router-dom";

const DashboardPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-10">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>

                    <Link 
                        to="/connect"
                        className="text-white bg-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-lg"
                    >
                        + Connect New Mailbox
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow p-8 text-center">
                    <p className="text-gray-500 text-lg">
                        You don't have any emails synced yet.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default DashboardPage;