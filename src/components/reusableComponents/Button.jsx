//components//Button.jsx
import React from "react";

const Button = ({
  children,
  variant = "primary",
  onClick,
  type = "button",
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-sm transition-colors duration-200 focus:outline-none";

    const variantClasses = {
        primary: 'bg-brand-purple-base hover:bg-opacity-90 text-white',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
        link: 'bg-transparent text-purple-600 hover:text-purple-800 underline',
    };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
