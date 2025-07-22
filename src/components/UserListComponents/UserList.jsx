import React, { useEffect, useState } from 'react';
import { PlusIcon } from '@heroicons/react/solid';
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
    { value: 'Administrator', label: 'Admin' },
];

export default function UserSettings() {
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
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        try {
            await userService.deleteUser(deleteTarget._id);
            setUsers(u => u.filter(x => x._id !== deleteTarget._id));
            setDeleteTarget(null);
        } catch (err) {
            console.error(err);
        }
    };

    const saveLanguages = async (langs) => {
        try {
            await userService.modifyLanguages(langTarget._id, langs);
            alert('Languages updated');
            setLangTarget(null);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update');
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
                        <h2 className="text-2xl font-bold text-purple-700">Users</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage all users – filter by role, delete or edit translator languages.
                        </p>
                    </div>
                    <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                        <Select
                            label="Role"
                            options={ROLE_OPTIONS}
                            selected={selectedRole}
                            onSelect={setSelectedRole}
                        />
                        <Button variant="primary" className="flex items-center">
                            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                            Add User
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                        <thead className="bg-purple-600 text-white">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-semibold">User Name</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold">Role</th>
                                <th className="px-4 py-2 text-right text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="p-4 text-center text-gray-500">Loading…</td>
                                </tr>
                            ) : paged.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-4 text-center text-gray-500">No users found.</td>
                                </tr>
                            ) : paged.map(u => (
                                <tr key={u._id} className="border-b last:border-0">
                                    <td className="px-4 py-3 text-sm text-gray-800">{u.userName}</td>
                                    <td className="px-4 py-3 text-sm text-gray-800">{u.role}</td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <Button
                                            variant="secondary"
                                            onClick={() => setDeleteTarget(u)}
                                            className="px-3 py-1 text-xs"
                                        >
                                            Delete
                                        </Button>
                                        {u.role === 'Translator' && (
                                            <Button
                                                variant="link"
                                                onClick={() => setLangTarget(u)}
                                                className="px-2 py-1 text-xs"
                                            >
                                                Edit Languages
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={pageSize}
                    onPageChange={setCurrentPage}
                />
            </div>

            <ConfirmModal
                open={!!deleteTarget}
                title={`Delete ${deleteTarget?.userName}?`}
                message="This will mark the user as deleted and cannot be undone."
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