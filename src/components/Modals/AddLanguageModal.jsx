import React from 'react';

const AddLanguageModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        // Backdrop
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
            {/* Modal Content */}
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 bg-brand-purple-base text-white">
                    <div>
                        <h2 className="text-lg font-semibold">Add Language</h2>
                        <div className="text-xs opacity-80">Rubix</div>
                    </div>
                    <button onClick={onClose} className="text-2xl font-bold leading-none">×</button>
                </div>
                
                {/* Modal Body */}
                <div className="p-6">
                    <h3 className="text-base font-semibold mb-3">Languages</h3>
                    <ul className="list-none p-0 m-0">
                        <li className="flex justify-between items-center py-3 border-b border-gray-200">
                            <span className="text-base">EN - English</span>
                            <button className="bg-brand-purple-base text-white text-xs font-bold py-1 px-3 rounded">Assigned</button>
                        </li>
                        <li className="flex justify-between items-center py-3">
                            <span className="text-base">ES - español</span>
                            <button className="bg-white border border-gray-400 text-gray-700 text-xs font-bold py-1 px-3 rounded hover:bg-gray-100">Apply</button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AddLanguageModal;