import React from "react";

interface NextButtonProps {
    text: string,
    onClick?: () => void,
    type?: "button" | "submit" | "reset"
}

const NextButton = ({text, onClick, type = "submit"}: NextButtonProps) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className="w-full text-white border bg-blue-500 rounded-2xl p-4 hover:bg-blue-600 active:bg-blue-700"
        >
            {text}
        </button>
    );
}

export default NextButton;