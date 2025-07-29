import React, { useState } from 'react';
import { DestructiveButton } from './reusableComponents/DestructiveButton'; // Import the new button
import Button from './reusableComponents/Button';
import ConfirmModal from './UserListComponents/ConfirmModal';

const TranslationTable = ({ user, translations = [], onEdit, onDelete, currentPage = 1, itemsPerPage = 10 }) => {
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

    const handleConfirmDelete = async () => {
        if (confirmModal.translationId) {
            try {
                await onDelete(confirmModal.translationId);
            } catch (err) {
                // Error handling is now done in the parent component
                console.error('Delete failed:', err);
            }
        }
        setConfirmModal({ open: false, translationId: null, translationKey: '' });
    };

    const handleCancelDelete = () => {
        setConfirmModal({ open: false, translationId: null, translationKey: '' });
    };

    // Helper function to check if translator can edit this translation
    const canEditTranslation = (translation) => {
        // Admin and Developer can edit all translations
        if (!user || user.role === 'Admin' || user.role === 'Developer') {
            return true;
        }
        
        // Translator can only edit translations in their assigned languages
        if (user.role === 'Translator') {
            const userLanguages = user.languages || [];
            return userLanguages.includes(translation.language.toUpperCase());
        }
        
        return false;
    };

    return (
        <div className="overflow-x-auto"> {/* Ensures table is responsive */}
            <table className="min-w-full">
                <thead className="bg-brand-purple-base text-white">
                    <tr>
                        <th className="p-4 text-left text-sm font-semibold">No.</th>
                        <th className="p-4 text-left text-sm font-semibold">Key</th>
                        <th className="p-4 text-left text-sm font-semibold">Language</th>
                        <th className="p-4 text-left text-sm font-semibold">Translation</th>
                        <th className="p-4 text-left text-sm font-semibold">Status</th>
                        <th className="p-4 text-left text-sm font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {translations.length > 0 ? (
                        translations.map((t, index) => {
                            const canEdit = canEditTranslation(t);
                            const isTranslatorWithRestrictedAccess = user?.role === 'Translator' && !canEdit;
                            // Calculate the actual row number considering pagination
                            const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                            
                            return (
                                <tr 
                                    key={t._id} 
                                    className={`hover:bg-gray-50 ${
                                        isTranslatorWithRestrictedAccess ? 'bg-gray-25 opacity-75' : ''
                                    }`}
                                    title={isTranslatorWithRestrictedAccess 
                                        ? `This translation is in ${t.language.toUpperCase()} - you can only edit: ${user.languages?.join(', ')}` 
                                        : ''}
                                >
                                    <td className="p-4 whitespace-nowrap text-sm text-gray-700 font-medium">{rowNumber}</td>
                                    <td className="p-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.translationKey}</td>
                                    <td className={`p-4 whitespace-nowrap text-sm uppercase ${
                                        isTranslatorWithRestrictedAccess ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                        {t.language}
                                        {user?.role === 'Translator' && (
                                            <span className="ml-2">
                                                {canEdit ? '' : ''}
                                            </span>
                                        )}
                                    </td>
                                <td className="p-4 whitespace-nowrap text-sm text-gray-700">{t.translatedText}</td>
                                <td className="p-4 whitespace-nowrap text-sm">
                                    <span className={`py-1 px-3 text-xs font-bold rounded-full text-white ${t.status === "approved" ? "bg-green-500" : "bg-yellow-500"
                                        }`}>
                                        {t.status}
                                    </span>
                                </td>
                                <td className="p-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    {(() => {
                                        const canEdit = canEditTranslation(t);
                                        return (
                                            <Button
                                                onClick={() => canEdit ? onEdit(t) : null}
                                                disabled={!canEdit}
                                                className={`!py-1 !px-3 border transition-colors duration-150 ${
                                                    canEdit 
                                                        ? 'border-gray-300 bg-white !text-gray-700 hover:bg-gray-50' 
                                                        : 'border-gray-200 bg-gray-100 !text-gray-400 cursor-not-allowed'
                                                }`}
                                                title={!canEdit && user?.role === 'Translator' 
                                                    ? `You can only edit translations in your assigned languages: ${user.languages?.join(', ')}` 
                                                    : ''}
                                            >
                                                Edit
                                            </Button>
                                        );
                                    })()}
                                    {/* Only show Delete button for Admin and Developer */}
                                    {user && (user.role === 'Admin' || user.role === 'Developer') && (
                                        <DestructiveButton
                                            onClick={() => handleDeleteClick(t)}
                                            variant="outline"
                                            className="!py-1 !px-3"
                                        >
                                            Delete
                                        </DestructiveButton>
                                    )}
                                </td>
                            </tr>
                            );
                        })
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