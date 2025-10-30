import React from "react";

interface BackButtonProps {
  text: string;
  onClick: () => void;
}

const BackButton = ({ text, onClick }: BackButtonProps) => {
    return (
        <div>
            <button 
                className="border bg-blue-500 rounded-2xl p-4 text-white hover:bg-blue-600"
                onClick={onClick}
            >
                {text}
            </button>
        </div>
    );
}

export default BackButton;
