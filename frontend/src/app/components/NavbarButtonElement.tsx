
import Icon from '@mdi/react';

interface NavbarElementProps {
    path: string,
    size: number,
    title: string,
    color?: string,
    badgeCount?: number,
    onClick?: () => void
};

const NavbarButtonElement = ({ path, size, title, color, badgeCount, onClick}: NavbarElementProps) => {
  return (
    <button className="w-full flex flex-row items-center justify-start hover:bg-gray-100 cursor-pointer h-15 transition" onClick={onClick}>
      <div className="flex items-center pl-4">
        <div className="relative p-2">
            <Icon path={path} size={size} color={color} />
            {(badgeCount ?? 0) > 0 && (
              <span className="absolute -top-1 -right-1
                bg-red-500 text-white text-xs
                rounded-full px-1.5">
                {badgeCount}
              </span>
            )}
        </div>
        <p className="text-black p-2 text-lg font-medium tracking-wide">{title}</p>
      </div>
    </button>
  )
};

export default NavbarButtonElement;
