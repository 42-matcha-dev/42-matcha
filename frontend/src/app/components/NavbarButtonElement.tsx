
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
    <button className="w-full flex flex-row items-center justify-start hover:bg-blue-300 h-15" onClick={onClick}>
      <div className="flex items-center gap-2">
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
        <p className="text-black p-2 text-[19px] font-medium">{title}</p>
      </div>
    </button>
  )
};

export default NavbarButtonElement;
