import React, { useEffect, useState } from 'react';
import {
    PlusIcon,
    TrashIcon,
    LanguageIcon,
    UserGroupIcon,
    ClockIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/react/24/solid';
import Button from '../../reusableComponents/Button';
import { Select } from '../reusableComponents/Select';
import { Pagination } from '../reusableComponents/Pagination';
import ConfirmModal from './ConfirmModal';
import LanguageModal from './LanguageModal';
import * as userService from '../../services/userService';

const ROLE_OPTIONS = [
    { value: '', label: 'All Roles' },
    { value: 'Translator', label: 'Translator' },
    { value: 'Developer', label: 'Developer' },
    { value: 'Administrator', label: 'Administrator' },
];

const ROLE_OPTIONS_FOR_PENDING = [
    { value: 'Translator', label: 'Translator' },
    { value: 'Developer', label: 'Developer' },
    { value: 'Administrator', label: 'Administrator' },
];

const STATUS_OPTIONS = [
    { value: 'approved', label: 'Approve' },
    { value: 'rejected', label: 'Reject' },
];

export default function UserSettings() {
    const [activeTab, setActiveTab] = useState('active');

    // Active Users State
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [langTarget, setLangTarget] = useState(null);

    // Pending Users State
    const [pendingUsers, setPendingUsers] = useState([]);
    const [pendingLoading, setPendingLoading] = useState(false);
    const [processing, setProcessing] = useState({});

    const pageSize = 5;
    const totalItems = users.length;

    useEffect(() => {
        if (activeTab === 'active') {
            fetchUsers();
        } else {
            fetchPendingUsers();
        }
    }, [activeTab, selectedRole]);

    // Active Users Functions
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = selectedRole
                ? await userService.getUsersByRole(selectedRole)
                : await userService.getAllUsers();
            setUsers(data);
            setCurrentPage(1);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            alert('Failed to fetch users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            await userService.deleteUser(deleteTarget._id);
            setUsers(u => u.filter(x => x._id !== deleteTarget._id));
            setDeleteTarget(null);
            alert(`User ${deleteTarget.userName} has been deleted successfully.`);
        } catch (err) {
            console.error('Failed to delete user:', err);
            alert(err.response?.data?.error || 'Failed to delete user');
        }
    };

    const saveLanguages = async (langs) => {
        if (!langTarget) return;

        try {
            await userService.modifyLanguages(langTarget._id, langs);
            alert(`Languages updated for ${langTarget.userName}`);
            setLangTarget(null);
            fetchUsers();
        } catch (err) {
            console.error('Failed to update languages:', err);
            alert(err.response?.data?.error || 'Failed to update languages');
        }
    };

    // Pending Users Functions
    const fetchPendingUsers = async () => {
        setPendingLoading(true);
        try {
            const response = await userService.getPendingUsers();
            const users = response.data.map(user => ({
                ...user,
                selectedRole: user.role,
                selectedStatus: 'approved'
            }));
            setPendingUsers(users);
        } catch (err) {
            console.error('Failed to fetch pending users:', err);
        } finally {
            setPendingLoading(false);
        }
    };

    const updateUserField = (userId, field, value) => {
        setPendingUsers(prev =>
            prev.map(user =>
                user._id === userId
                    ? { ...user, [field]: value }
                    : user
            )
        );
    };

    const handleSubmit = async (user) => {
        setProcessing(prev => ({ ...prev, [user._id]: true }));

        try {
            const isApproved = user.selectedStatus === 'approved';

            if (isApproved) {
                await userService.approveUser(user._id);
            } else {
                await userService.rejectUser(user._id);
            }

            setPendingUsers(prev => prev.filter(u => u._id !== user._id));

            const action = isApproved ? 'approved' : 'rejected';
            alert(`User ${user.userName} has been ${action} successfully.`);

        } catch (err) {
            console.error('Failed to update user status:', err);
            alert(err.response?.data?.error || 'Failed to update user status');
        } finally {
            setProcessing(prev => ({ ...prev, [user._id]: false }));
        }
    };

    // Pagination for active users
    const startIdx = (currentPage - 1) * pageSize;
    const paged = users.slice(startIdx, startIdx + pageSize);

    // Blur when modal open
    const containerClass = (deleteTarget || langTarget) ? 'filter blur-sm' : '';

    const tabs = [
        {
            id: 'active',
            name: 'Active Users',
            icon: UserGroupIcon,
            count: users.length
        },
        {
            id: 'pending',
            name: 'Pending Approvals',
            icon: ClockIcon,
            count: pendingUsers.length
        }
    ];

    return (
        <div className="p-6">
            <div className={containerClass}>
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-purple-700">User Management</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage user accounts, approvals, and permissions.
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`${activeTab === tab.id
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200`}
                                >
                                    <Icon className="h-5 w-5 mr-2" />
                                    {tab.name}
                                    {tab.count > 0 && (
                                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${activeTab === tab.id
                                            ? 'bg-purple-100 text-purple-600'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Active Users Tab */}
                {activeTab === 'active' && (
                    <div>
                        {/* Controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Active Users</h3>
                                <p className="text-sm text-gray-600">
                                    Manage all active users – filter by role, delete users, or edit translator languages.
                                </p>
                            </div>
                            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                                <div className="w-48">
                                    <Select
                                        label="Filter by Role"
                                        options={ROLE_OPTIONS}
                                        selected={selectedRole}
                                        onSelect={setSelectedRole}
                                    />
                                </div>
                                <Button variant="primary" className="flex items-center bg-purple-600 hover:bg-purple-700">
                                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                    Add User
                                </Button>
                            </div>
                        </div>

                        {/* Active Users Table */}
                        <div className="bg-white shadow ring-1 ring-black ring-opacity-5 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-purple-600 text-white">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                User Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                Languages
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent mr-3"></div>
                                                        <span className="text-gray-500">Loading users...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : paged.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                    {selectedRole ? `No ${selectedRole.toLowerCase()}s found.` : 'No users found.'}
                                                </td>
                                            </tr>
                                        ) : paged.map(user => (
                                            <tr key={user._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.userName}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'Administrator'
                                                        ? 'bg-red-100 text-red-800'
                                                        : user.role === 'Developer'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-green-100 text-green-800'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.role === 'Translator' ? (
                                                        user.languages && user.languages.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {user.languages.slice(0, 3).map(lang => (
                                                                    <span key={lang} className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                                                                        {lang}
                                                                    </span>
                                                                ))}
                                                                {user.languages.length > 3 && (
                                                                    <span className="text-xs text-gray-400">
                                                                        +{user.languages.length - 3} more
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 italic">No languages assigned</span>
                                                        )
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        {user.role === 'Translator' && (
                                                            <Button
                                                                variant="link"
                                                                onClick={() => setLangTarget(user)}
                                                                className="px-3 py-1 text-xs flex items-center"
                                                                title="Edit Languages"
                                                            >
                                                                <LanguageIcon className="h-4 w-4 mr-1" />
                                                                Languages
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="secondary"
                                                            onClick={() => setDeleteTarget(user)}
                                                            className="px-3 py-1 text-xs flex items-center text-red-600 hover:text-red-800"
                                                            title="Delete User"
                                                        >
                                                            <TrashIcon className="h-4 w-4 mr-1" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalItems > pageSize && (
                            <div className="mt-6">
                                <Pagination
                                    currentPage={currentPage}
                                    totalItems={totalItems}
                                    itemsPerPage={pageSize}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Pending Users Tab */}
                {activeTab === 'pending' && (
                    <div>
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Pending User Approvals</h3>
                            <p className="text-sm text-gray-600">
                                Review and approve or reject pending user registrations.
                            </p>
                        </div>

                        {pendingLoading ? (
                            <div className="bg-white rounded-lg shadow p-8 text-center">
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent mr-3"></div>
                                    <span className="text-gray-500">Loading pending users...</span>
                                </div>
                            </div>
                        ) : pendingUsers.length === 0 ? (
                            <div className="bg-white rounded-lg shadow p-8 text-center">
                                <CheckIcon className="mx-auto h-12 w-12 text-green-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending users</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    All user registrations have been processed.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white shadow ring-1 ring-black ring-opacity-5 rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-purple-600 text-white">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                    User Details
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                    Role
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                    Action
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                    Submit
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {pendingUsers.map((user) => (
                                                <tr key={user._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {user.userName}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {user.email}
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                Registered: {new Date(user.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="w-40">
                                                            <Select
                                                                options={ROLE_OPTIONS_FOR_PENDING}
                                                                selected={user.selectedRole}
                                                                onSelect={(value) =>
                                                                    updateUserField(user._id, 'selectedRole', value)
                                                                }
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="w-32">
                                                            <Select
                                                                options={STATUS_OPTIONS}
                                                                selected={user.selectedStatus}
                                                                onSelect={(value) =>
                                                                    updateUserField(user._id, 'selectedStatus', value)
                                                                }
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Button
                                                            variant={user.selectedStatus === 'approved' ? 'primary' : 'secondary'}
                                                            onClick={() => handleSubmit(user)}
                                                            disabled={processing[user._id]}
                                                            className={`px-4 py-2 text-sm ${user.selectedStatus === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                                        >
                                                            {processing[user._id] ? (
                                                                <div className="flex items-center">
                                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                                                    Processing...
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {user.selectedStatus === 'approved' ? (
                                                                        <>
                                                                            <CheckIcon className="h-4 w-4 mr-1" />
                                                                            Approve
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <XMarkIcon className="h-4 w-4 mr-1" />
                                                                            Reject
                                                                        </>
                                                                    )}
                                                                </>
                                                            )}
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            <ConfirmModal
                open={!!deleteTarget}
                title={`Delete ${deleteTarget?.userName}?`}
                message={`This will mark ${deleteTarget?.userName} as deleted and cannot be undone. The user will no longer be able to access the system.`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            <LanguageModal
                open={!!langTarget}
                userName={langTarget?.userName}
                initial={langTarget?.languages || []}
                onSave={saveLanguages}
                onCancel={() => setLangTarget(null)}
            />
        </div>
    );
}