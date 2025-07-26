import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import userService from '../services/userService';
import { Pagination } from '../components/reusableComponents/Pagination';
//import ConfirmModal from '../components/UserListComponents/ConfirmModal';
//import LanguageModal from '../components/UserListComponents/LanguageModal';
//import Button from '../components/reusableComponents/Button';

// New User Management Component
const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [langTarget, setLangTarget] = useState(null);
    const pageSize = 10;

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await userService.getAllUsers();
            setUsers(res.data);
        } catch (err) {
            setError('Failed to fetch users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await userService.deleteUser(deleteTarget._id);
            setDeleteTarget(null);
            fetchUsers(); // Refresh list
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete user');
        }
    };

    const saveLanguages = async (langs) => {
        if (!langTarget) return;
        try {
            await userService.assignLanguagesToUser(langTarget._id, langs);
            alert('Languages updated');
            setLangTarget(null);
            fetchUsers(); // Refresh list
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update languages');
        }
    };

    const paginatedUsers = users.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">User Management</h3>
            {loading && <p>Loading users...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && (
                <>
                    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600">Username</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600">Email</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600">Role</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600">Status</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedUsers.map((u) => (
                                    <tr key={u._id}>
                                        <td className="p-4 whitespace-nowrap text-sm text-gray-700">{u.userName}</td>
                                        <td className="p-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                                        <td className="p-4 whitespace-nowrap text-sm text-gray-500">{u.role}</td>
                                        <td className="p-4 whitespace-nowrap text-sm text-gray-500">{u.roleStatus}</td>
                                        <td className="p-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            {u.role === 'Translator' && (
                                                <Button onClick={() => setLangTarget(u)} className="!py-1 !px-2 !text-xs !bg-blue-100 !text-blue-700 hover:!bg-blue-200">Languages</Button>
                                            )}
                                            <Button onClick={() => setDeleteTarget(u)} className="!py-1 !px-2 !text-xs !bg-red-100 !text-red-700 hover:!bg-red-200">Delete</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination currentPage={currentPage} totalItems={users.length} itemsPerPage={pageSize} onPageChange={setCurrentPage} />
                </>
            )}
            <ConfirmModal open={!!deleteTarget} title={`Delete ${deleteTarget?.userName}?`} message="This will mark the user as deleted. This action cannot be undone." onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
            <LanguageModal open={!!langTarget} userName={langTarget?.userName} initial={langTarget?.languages || []} onSave={saveLanguages} onCancel={() => setLangTarget(null)} />
        </div>
    );
}

// Main Settings Page
const Settings = () => {
    const { user } = useAuthContext();
    return (
        <main className="flex-grow p-5 bg-brand-bg-main min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Settings</h2>
                <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-800">User Profile</h3>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-600">Username</label>
                        <input type="text" value={user?.userName || ''} readOnly className="mt-1 p-2 w-full max-w-sm bg-gray-100 border border-gray-300 rounded-md" />
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-600">Role</label>
                        <input type="text" value={user?.role || ''} readOnly className="mt-1 p-2 w-full max-w-sm bg-gray-100 border border-gray-300 rounded-md capitalize" />
                    </div>
                </div>
                {/* Conditionally render UserManagement for Admins */}
                {user?.role === 'Admin' && <UserManagement />}
            </div>
        </main>
    );
};

export default Settings;