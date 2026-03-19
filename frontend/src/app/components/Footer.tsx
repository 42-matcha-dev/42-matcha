const Footer = () => {
    return (
      <footer className="bg-secondary text-custom-light py-6 px-4 fixed bottom-0 left-0 w-full z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-semibold tracking-wide">Matcha</p>
          <p className="text-xs text-custom-medium">
            &copy; {new Date().getFullYear()} Matcha. All rights reserved.
          </p>
        </div>
      </footer>
    )
  }
  
  export default Footer
