import NavLinks from './NavLinks'
// import Navbar from "../components/Navbar"
import ChatList from './ChatList'
import ChatBox from './ChatBox'

export default function Chat() {
  return (
    <div>
      {/* <Header /> */}
      <div className="flex md:flex-row flex-col items-start bg-black">
        <NavLinks />
        <ChatList />
        <ChatBox />
      </div>
    </div>
  )
}
