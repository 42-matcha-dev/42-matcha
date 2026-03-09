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
            className="w-full text-white font-semibold border bg-secondary rounded-xl p-4 hover:bg-secondary-hover active:bg-secondary-active disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-secondary"
        >
            {text}
        </button>
    );
}

export default NextButton;
