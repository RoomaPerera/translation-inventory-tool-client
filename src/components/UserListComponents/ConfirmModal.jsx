import React from 'react';
import DeleteButton from './DeleteButton';
import CancelButton from './CancelButton';

export default function ConfirmModal({
    open,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    onConfirm,
    onCancel
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
                onClick={onCancel}
            />
            {/* modal */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    <CancelButton onClick={onCancel} />
                    <DeleteButton onClick={onConfirm} />
                </div>
            </div>
        </div>
    );
}