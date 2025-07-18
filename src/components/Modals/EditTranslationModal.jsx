import React from 'react';

const EditTranslationModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        // Backdrop
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
            {/* Modal Content */}
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 bg-brand-purple-base text-white">
                    <div>
                        <h2 className="text-lg font-semibold">Edit Translation</h2>
                        <div className="text-xs opacity-80">Rubix</div>
                    </div>
                    <button onClick={onClose} className="text-2xl font-bold leading-none">×</button>
                </div>
                
                {/* Modal Body */}
                <div className="p-6">
                    <form>
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-600 mb-1">Localization Key</label>
                            <input type="text" defaultValue="Hello" className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:border-brand-purple-base transition" />
                        </div>
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-600 mb-1">EN - English</label>
                            <input type="text" placeholder="Enter English translation" className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:border-brand-purple-base transition" />
                        </div>
                        <div className="mb-5 relative">
                            <label className="block text-sm font-medium text-gray-600 mb-1">ES - español</label>
                            <input type="text" defaultValue="Hola" className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:border-brand-purple-base transition" />
                            <input type="checkbox" defaultChecked className="absolute right-2 top-1/2 -translate-y-1/2 mt-2 w-5 h-5 accent-brand-purple-base" />
                        </div>
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-600 mb-1">JP - Japanese</label>
                            <input type="text" placeholder="Enter Japanese translation" className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:border-brand-purple-base transition" />
                        </div>
                        {/* You can add Save/Cancel buttons here if needed */}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditTranslationModal;