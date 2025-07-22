import React from 'react';
import Button from '../../reusableComponents/Button';

export default function DeleteButton({ children = 'Delete', ...props }) {
    return (
        <Button
            variant="primary"
            className="px-6 py-3"
            {...props}
        >
            {children}
        </Button>
    );
}