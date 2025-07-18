import React from 'react';
import './Modal.css'; // Import the general modal styles

/* Specific styles for this modal */
const styles = `
.translation-form .form-group {
    margin-bottom: 20px;
}
.translation-form label {
    display: block;
    font-size: 14px;
    color: #555;
    margin-bottom: 8px;
}
.translation-form input[type="text"] {
    width: 100%;
    padding: 10px 0;
    border: none;
    border-bottom: 1px solid #ccc;
    font-size: 16px;
    outline: none;
    box-sizing: border-box; /* Important for width calculation */
}
.translation-form input[type="text"]:focus {
    border-bottom-color: #4a148c;
}
.translation-form .input-wrapper {
    position: relative;
}
.translation-form input[type="checkbox"] {
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    accent-color: #673ab7; /* Modern way to color checkboxes */
}
`;

const TranslationModal = ({ mode, isOpen, onClose }) => {
    if (!isOpen) return null;

    const title = mode === 'edit' ? 'Edit Translation' : 'Add Translation';

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <style>{styles}</style>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2>{title}</h2>
                        <div className="subtitle">Rubix</div>
                    </div>
                    <button onClick={onClose} className="modal-close-button">×</button>
                </div>
                <div className="modal-body">
                    <form className="translation-form">
                        <div className="form-group">
                            <label>Localization Key</label>
                            <input type="text" defaultValue="Hello" />
                        </div>
                        <div className="form-group">
                            <label>EN - English</label>
                            <input type="text" defaultValue="" placeholder="Enter English translation" />
                        </div>
                        <div className="form-group">
                            <label>ES - español</label>
                            <div className="input-wrapper">
                                <input type="text" defaultValue="Hola" />
                                <input type="checkbox" defaultChecked />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>JP - Japanese</label>
                            <input type="text" defaultValue="" placeholder="Enter Japanese translation" />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TranslationModal;