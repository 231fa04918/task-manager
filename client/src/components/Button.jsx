import clsx from "clsx";
import React from "react";

const Button = ({
    icon,
    label,
    type = "button",
    className = "",
    onClick = () => {},
    disabled = false,
}) => {
    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={clsx(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
        >
            {icon && <span className="text-lg">{icon}</span>}
            <span className="text-sm font-medium">{label}</span>
        </button>
    );
};

export default Button;
