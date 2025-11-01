import React from "react";

interface BackButtonProps {
  text: string;
  onClick: () => void;
}

const BackButton = ({ text, onClick }: BackButtonProps) => {
    return (
        <div>
            <button 
                className="w-full border bg-white rounded-2xl p-4 text-black hover:bg-gray-300"
                onClick={onClick}
            >
                {text}
            </button>
        </div>
    );
}

export default BackButton;
