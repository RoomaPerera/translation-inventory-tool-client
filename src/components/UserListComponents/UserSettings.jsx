import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';

// Reusable Modal Component
const Modal = ({ isOpen, onClose, title, message, type = 'success' }) => {
    if (!isOpen) return null;

    const bgColor = type === 'success' ? 'bg-green-50' : type === 'error' ? 'bg-red-50' : 'bg-blue-50';
    const textColor = type === 'success' ? 'text-green-800' : type === 'error' ? 'text-red-800' : 'text-blue-800';
    const iconColor = type === 'success' ? 'text-green-400' : type === 'error' ? 'text-red-400' : 'text-blue-400';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                <div className={`${bgColor} border border-opacity-25 rounded-md p-4`}>
                    <div className="flex items-center">
                        <div className={iconColor}>
                            {type === 'success' && (
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            )}
                            {type === 'error' && (
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        <div className="ml-3">
                            <h3 className={`text-sm font-medium ${textColor}`}>{title}</h3>
                            <p className={`text-sm ${textColor} mt-1`}>{message}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Reusable Pagination Component
const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const fromItem = (currentPage - 1) * itemsPerPage + 1;
    const toItem = Math.min(currentPage * itemsPerPage, totalItems);

    if (totalPages <= 1) return null;

    return (
        <nav className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6" aria-label="Pagination">
            <div className="hidden sm:block">
                <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{fromItem}</span> to <span className="font-medium">{toItem}</span> of{' '}
                    <span className="font-medium">{totalItems}</span> results
                </p>
            </div>
            <div className="flex flex-1 justify-between sm:justify-end">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </nav>
    );
};

// Reusable Role Select Component
const RoleSelect = ({ value, onChange, options = ['Admin', 'Developer', 'Translator'] }) => {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
            {options.map((role) => (
                <option key={role} value={role}>
                    {role}
                </option>
            ))}
        </select>
    );
};

const UserSettings = () => {
    const [users, setUsers] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');
    const [currentPage, setCurrentPage] = useState(1);
    const [pendingCurrentPage, setPendingCurrentPage] = useState(1);
    const [selectedRoles, setSelectedRoles] = useState({});
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });

    const itemsPerPage = 10;

    useEffect(() => {
        fetchData();
    }, []);

    // Initialize selected roles when pending users change
    useEffect(() => {
        const initialRoles = {};
        pendingUsers.forEach(user => {
            initialRoles[user._id] = user.role || 'Translator';
        });
        setSelectedRoles(initialRoles);
    }, [pendingUsers]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all users (returns data directly)
            const allUsers = await userService.getAllUsers();
            setUsers(allUsers);

            // Fetch pending users (returns response object)
            const pendingResponse = await userService.getPendingUsers();
            setPendingUsers(pendingResponse.data);

        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load user data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const showModal = (title, message, type = 'success') => {
        setModal({ isOpen: true, title, message, type });
        setTimeout(() => {
            setModal({ isOpen: false, title: '', message: '', type: 'success' });
            fetchData(); // Auto refresh after modal closes
        }, 2000);
    };

    const handleApproveUser = async (userId) => {
        try {
            const selectedRole = selectedRoles[userId] || 'Translator';
            await userService.approveUser(userId, { role: selectedRole });
            showModal('Success', 'User approved successfully!', 'success');
        } catch (err) {
            console.error('Error approving user:', err);
            showModal('Error', 'Failed to approve user. Please try again.', 'error');
        }
    };

    const handleRejectUser = async (userId) => {
        try {
            await userService.rejectUser(userId);
            showModal('Success', 'User rejected successfully!', 'success');
        } catch (err) {
            console.error('Error rejecting user:', err);
            showModal('Error', 'Failed to reject user. Please try again.', 'error');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await userService.deleteUser(userId);
                showModal('Success', 'User deleted successfully!', 'success');
            } catch (err) {
                console.error('Error deleting user:', err);
                showModal('Error', 'Failed to delete user. Please try again.', 'error');
            }
        }
    };

    const handleRoleChange = (userId, newRole) => {
        setSelectedRoles(prev => ({
            ...prev,
            [userId]: newRole
        }));
    };

    // Pagination logic for users list
    const totalUsers = users.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = users.slice(startIndex, endIndex);

    // Pagination logic for pending users list
    const totalPendingUsers = pendingUsers.length;
    const pendingStartIndex = (pendingCurrentPage - 1) * itemsPerPage;
    const pendingEndIndex = pendingStartIndex + itemsPerPage;
    const currentPendingUsers = pendingUsers.slice(pendingStartIndex, pendingEndIndex);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center">
                    <div className="text-red-400">
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                </div>
                <div className="mt-4">
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Modal */}
            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                message={modal.message}
                type={modal.type}
            />

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                        <button
                            onClick={() => {
                                setActiveTab('pending');
                                setCurrentPage(1);
                                setPendingCurrentPage(1);
                            }}
                            className={`${activeTab === 'pending'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            Pending Users ({pendingUsers.length})
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('all');
                                setCurrentPage(1);
                                setPendingCurrentPage(1);
                            }}
                            className={`${activeTab === 'all'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            All Users ({users.length})
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {/* Pending Users Tab */}
                    {activeTab === 'pending' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Pending Users
                                </h2>
                                <button
                                    onClick={fetchData}
                                    className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                    Refresh
                                </button>
                            </div>

                            {pendingUsers.length > 0 ? (
                                <div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Username
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Email
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Role
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {currentPendingUsers.map((user) => (
                                                    <tr key={user._id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {user.userName}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {user.email}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <RoleSelect
                                                                value={selectedRoles[user._id] || user.role || 'Translator'}
                                                                onChange={(newRole) => handleRoleChange(user._id, newRole)}
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                            <button
                                                                onClick={() => handleApproveUser(user._id)}
                                                                className="text-green-600 hover:text-green-900 transition-colors"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectUser(user._id)}
                                                                className="text-red-600 hover:text-red-900 transition-colors"
                                                            >
                                                                Reject
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination for Pending Users */}
                                    <Pagination
                                        currentPage={pendingCurrentPage}
                                        totalItems={totalPendingUsers}
                                        itemsPerPage={itemsPerPage}
                                        onPageChange={setPendingCurrentPage}
                                    />
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No pending users found.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* All Users Tab */}
                    {activeTab === 'all' && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                All Users
                            </h2>

                            {users.length > 0 ? (
                                <div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Username
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Role
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {currentUsers.map((user) => (
                                                    <tr key={user._id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {user.userName}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                                                                user.role === 'Developer' ? 'bg-blue-100 text-blue-800' :
                                                                    user.role === 'Translator' ? 'bg-orange-100 text-orange-800' :
                                                                        'bg-green-100 text-green-800'
                                                                }`}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <button
                                                                onClick={() => handleDeleteUser(user._id)}
                                                                className="text-red-600 hover:text-red-900 transition-colors"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    <Pagination
                                        currentPage={currentPage}
                                        totalItems={totalUsers}
                                        itemsPerPage={itemsPerPage}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No users found.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserSettings;