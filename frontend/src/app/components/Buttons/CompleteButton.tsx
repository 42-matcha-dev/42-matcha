import React from "react";

interface CompleteButtonProps {
  text: string;
  onClick: () => void;
}

const CompleteButton = ({ text, onClick }: CompleteButtonProps) => {
    return (
        <div>
            <button 
                className="border bg-green-500 rounded-2xl p-4 text-white hover:bg-green-600"
                onClick={onClick}
            >
                {text}
            </button>
        </div>
    );
}

export default CompleteButton;
