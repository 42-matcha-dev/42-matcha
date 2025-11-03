import React from "react";

interface NextButtonProps {
    text: string,
    onClick?: () => void,
    type?: "button" | "submit" | "reset",
    disabled?: boolean
}

const NextButton = ({text, onClick, type = "submit", disabled = false}: NextButtonProps) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className="w-full text-white border bg-blue-500 rounded-2xl p-4 hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {text}
        </button>
    );
}

export default NextButton;
