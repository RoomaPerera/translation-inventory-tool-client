import React, { useEffect, useState } from 'react';
import { PlusIcon, TrashIcon, LanguageIcon } from '@heroicons/react/24/solid';
import Button from '../../reusableComponents/Button';
import { Select } from '../../reusableComponents/Select';
import { Pagination } from '../../reusableComponents/Pagination';
import ConfirmModal from './ConfirmModal';
import LanguageModal from './LanguageModal';
import * as userService from '../../../services/userService';

const ROLE_OPTIONS = [
    { value: '', label: 'All Roles' },
    { value: 'Translator', label: 'Translator' },
    { value: 'Developer', label: 'Developer' },
    { value: 'Administrator', label: 'Administrator' },
];

export default function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [langTarget, setLangTarget] = useState(null);
    const pageSize = 5;
    const totalItems = users.length;

    useEffect(() => {
        fetchUsers();
    }, [selectedRole]);

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
            // Optionally refresh the user list to show updated data
            fetchUsers();
        } catch (err) {
            console.error('Failed to update languages:', err);
            alert(err.response?.data?.error || 'Failed to update languages');
        }
    };

    const startIdx = (currentPage - 1) * pageSize;
    const paged = users.slice(startIdx, startIdx + pageSize);

    // blur when modal open
    const containerClass = (deleteTarget || langTarget)
        ? 'filter blur-sm'
        : '';

    return (
        <div className="p-6">
            <div className={containerClass}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-purple-700">Active Users</h2>
                        <p className="mt-1 text-sm text-gray-600">
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