import React from 'react';
import Button from '../reusableComponents/Button';

export default function DeleteButton({ children = 'Delete', ...props }) {
    return (
        <Button
            variant="primary"
            className="px-6 py-3 bg-red-600 hover:bg-red-700 focus:ring-red-500"
            {...props}
        >
            {children}
        </Button>
    );
}