import React from 'react';
import './Modal.css'; // Import the general modal styles

// Specific styles for this modal
const styles = `
.language-list {
    list-style: none;
    padding: 0;
    margin: 0;
}
.language-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
}
.language-item:last-child {
    border-bottom: none;
}
.language-name {
    font-size: 16px;
}
.language-action .assigned-button {
    background-color: #673ab7;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
}
.language-action .apply-button {
    background-color: white;
    color: #555;
    border: 1px solid #ccc;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
}
`;

const AddLanguageModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <style>{styles}</style>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2>Add Language</h2>
                        <div className="subtitle">Rubix</div>
                    </div>
                    <button onClick={onClose} className="modal-close-button">×</button>
                </div>
                <div className="modal-body">
                    <h3>Languages</h3>
                    <ul className="language-list">
                        <li className="language-item">
                            <span className="language-name">EN - English</span>
                            <div className="language-action">
                                <button className="assigned-button">Assigned</button>
                            </div>
                        </li>
                        <li className="language-item">
                            <span className="language-name">ES - español</span>
                            <div className="language-action">
                                <button className="apply-button">Apply</button>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AddLanguageModal;