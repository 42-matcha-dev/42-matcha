
import NavLinks from ".//NavLinks";
// import Navbar from "../components/Navbar"
import ChatList from "./ChatList";
import ChatBox from "./ChatBox";

export default function Chat() {
    return (
        <div>
            <div className="bg-white h-[100vh]">
                <NavLinks />
                <ChatList />
                <ChatBox />
            </div>
        </div>
    )
};
