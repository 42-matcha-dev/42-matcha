
import NavLinks from "./NavLinks";
// import Navbar from "../components/Navbar"
import ChatList from "./ChatList";
import ChatBox from "./ChatBox";

export default function Chat() {
    return (
        <div className="flex lg:flex-row flex-col items-start bg-black">
            <NavLinks />
            <ChatList />
            <ChatBox />
        </div>
    )
};
