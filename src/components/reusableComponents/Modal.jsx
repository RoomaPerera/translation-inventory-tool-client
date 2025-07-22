import React from 'react';
import '../../styles/modal.css'; // Use our existing modal styling

// A simpler, more direct modal that matches our existing style
const Modal = ({ isOpen, onClose, title, subtitle, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2>{title}</h2>
                        {subtitle && <div className="subtitle">{subtitle}</div>}
                    </div>
                    <button onClick={onClose} className="modal-close-button">×</button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
