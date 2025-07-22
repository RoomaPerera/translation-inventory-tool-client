import React from 'react';
import Button from '../../reusableComponents/Button';

export default function CancelButton({ children = 'Cancel', ...props }) {
    return (
        <Button
            variant="secondary"
            className="px-4 py-2"
            {...props}
        >
            {children}
        </Button>
    );
}