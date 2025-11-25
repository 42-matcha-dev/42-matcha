
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
    <button className="w-full flex flex-row items-center justify-start hover:bg-blue-300 h-15" onClick={onClick}>
      <div className="flex items-center gap-2">
        <div className="p-2">
            <Icon path={path} size={size} color={color} />
        </div>
        <p className="text-black p-2 text-[19px] font-medium">{title}</p>
      </div>
    </button>
  )
};

export default NavbarButtonElement;
