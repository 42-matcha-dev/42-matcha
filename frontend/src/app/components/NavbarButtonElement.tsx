
import React from "react";
import Icon from '@mdi/react';

interface NavbarElementProps {
    path: string,
    size: number
    title: string,
    color?: string
};

const NavbarButtonElement = ({ path, size, title, color}: NavbarElementProps) => {
  return (
    <button className="w-full flex flex-row hover:bg-gray-300">
        <div className="p-2">
            <Icon className="" path={path} size={size} color={color} />
        </div>
        <p className="text-black text-left p-2 text-[22px] font-medium">{title}</p>
    </button>
  )
};

export default NavbarButtonElement;