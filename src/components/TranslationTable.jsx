import React, { useState } from 'react';
import { DestructiveButton } from './reusableComponents/DestructiveButton'; // Import the new button
import Button from './reusableComponents/Button';
import ConfirmModal from './UserListComponents/ConfirmModal';

const TranslationTable = ({ translations = [], onEdit, onDelete }) => {
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        translationId: null,
        translationKey: ''
    });

    const handleDeleteClick = (translation) => {
        setConfirmModal({
            open: true,
            translationId: translation._id,
            translationKey: translation.translationKey
        });
    };

    const handleConfirmDelete = () => {
        if (confirmModal.translationId) {
            onDelete(confirmModal.translationId);
        }
        setConfirmModal({ open: false, translationId: null, translationKey: '' });
    };

    const handleCancelDelete = () => {
        setConfirmModal({ open: false, translationId: null, translationKey: '' });
    };

    return (
        <div className="overflow-x-auto"> {/* Ensures table is responsive */}
            <table className="min-w-full">
                <thead className="bg-brand-purple-base text-white">
                    <tr>
                        <th className="p-4 text-left text-sm font-semibold">Product</th>
                        <th className="p-4 text-left text-sm font-semibold">Key</th>
                        <th className="p-4 text-left text-sm font-semibold">Language</th>
                        <th className="p-4 text-left text-sm font-semibold">Translation</th>
                        <th className="p-4 text-left text-sm font-semibold">Status</th>
                        <th className="p-4 text-left text-sm font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {translations.length > 0 ? (
                        translations.map((t) => (
                            <tr key={t._id} className="hover:bg-gray-50">
                                <td className="p-4 whitespace-nowrap text-sm text-gray-700">{t.product}</td>
                                <td className="p-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.translationKey}</td>
                                <td className="p-4 whitespace-nowrap text-sm text-gray-500 uppercase">{t.language}</td>
                                <td className="p-4 whitespace-nowrap text-sm text-gray-700">{t.translatedText}</td>
                                <td className="p-4 whitespace-nowrap text-sm">
                                    <span className={`py-1 px-3 text-xs font-bold rounded-full text-white ${t.status === "approved" ? "bg-green-500" : "bg-yellow-500"
                                        }`}>
                                        {t.status}
                                    </span>
                                </td>
                                <td className="p-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <Button
                                        onClick={() => onEdit(t)}
                                        className="!py-1 !px-3 border border-gray-300 bg-white !text-gray-700 hover:bg-gray-100"
                                    >
                                        Edit
                                    </Button>
                                    <DestructiveButton
                                        onClick={() => handleDeleteClick(t)}
                                        variant="outline"
                                        className="!py-1 !px-3"
                                    >
                                        Delete
                                    </DestructiveButton>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center p-8 text-gray-500">
                                No translations found for the current selection.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <ConfirmModal
                open={confirmModal.open}
                title="Delete Translation"
                message={`Are you sure you want to delete the translation for "${confirmModal.translationKey}"? This action cannot be undone.`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </div>
    );
};

export default TranslationTable;