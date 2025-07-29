import React, { useEffect, useState } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import Button from '../../reusableComponents/Button';
import { Select } from '../../reusableComponents/Select';
import * as userService from '../../../services/userService';

const ROLE_OPTIONS = [
    { value: 'Translator', label: 'Translator' },
    { value: 'Developer', label: 'Developer' },
    { value: 'Administrator', label: 'Administrator' },
];

const STATUS_OPTIONS = [
    { value: 'approved', label: 'Approve' },
    { value: 'rejected', label: 'Reject' },
];

export default function PendingUsers() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState({});

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        setLoading(true);
        try {
            const response = await userService.getPendingUsers();
            const users = response.data.map(user => ({
                ...user,
                selectedRole: user.role, // Default to their registered role
                selectedStatus: 'approved' // Default to approved
            }));
            setPendingUsers(users);
        } catch (err) {
            console.error('Failed to fetch pending users:', err);
        } finally {
            setLoading(false);
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

            // Remove the user from the pending list
            setPendingUsers(prev => prev.filter(u => u._id !== user._id));

            // Show success message
            const action = isApproved ? 'approved' : 'rejected';
            alert(`User ${user.userName} has been ${action} successfully.`);

        } catch (err) {
            console.error('Failed to update user status:', err);
            alert(err.response?.data?.error || 'Failed to update user status');
        } finally {
            setProcessing(prev => ({ ...prev, [user._id]: false }));
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <p className="text-gray-500">Loading pending users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-purple-700">Pending User Approvals</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Review and approve or reject pending user registrations.
                </p>
            </div>

            {pendingUsers.length === 0 ? (
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
                                                    options={ROLE_OPTIONS}
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
    );
}