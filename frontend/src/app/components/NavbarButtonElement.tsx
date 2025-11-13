
import React from "react";
import Icon from '@mdi/react';

interface NavbarElementProps {
    path: string,
    size: number
    title: string,
    color?: string
    onClick?: () => void
};

const NavbarButtonElement = ({ path, size, title, color, onClick}: NavbarElementProps) => {
  return (
    <button className="w-full flex flex-row rounded-lg m-2 border-black hover:bg-blue-300" onClick={onClick}>
        <div className="p-2">
            <Icon path={path} size={size} color={color} />
        </div>
        <p className="text-black text-left p-2 text-[19px] font-medium">{title}</p>
    </button>
  )
};

export default NavbarButtonElement;
