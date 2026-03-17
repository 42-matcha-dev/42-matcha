type Props = {
  showMenuButton?: boolean
  onMenuClick?: () => void
}

const Header = ({ showMenuButton, onMenuClick }: Props) => {
  return (
    <header className="flex items-center justify-between bg-primary h-16 text-white p-4 fixed top-0 left-0 w-full z-10">
      <h1 className="text-xl text-left font-bold">Matcha</h1>
      {showMenuButton && (
        <button className="md:hidden text-3xl" onClick={onMenuClick}>
          ☰
        </button>
      )}
    </header>
  )
}

export default Header
