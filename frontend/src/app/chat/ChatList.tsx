import React from "react";
import SearchModal from "./SearchModal";
import { RiMore2Fill } from "react-icons/ri";
import chatData from "../data/chat";

const MessageList = () => {
    return (
        <button className="flex flex-row gap-24 px-5 pb-2">
            <div className="flex flex-row p-2 items-center gap-2">
                <img src="/default-avatar.png" className="border border-black w-[56px] h-[52px] rounded-full" alt="" />
                <span className="flex flex-col items-start">
                    <h3 className="font-semibold text-[17px] text-black">Laura piot</h3>
                    <p className="font-light text-gray-500">please send me the pdf..</p>
                </span>
            </div>
            <p className="py-2 text-gray-500">feb 05 2025</p>
        </button>
    )
}

const ChatList = () => {
    console.log(chatData);
    return (
        <div className="border border-black bg-white h-[100vh] ">
            <div className="flex items-center justify-between p-4 border-b border-b-1 border-[#898989b9]">
                <div className="flex flex-row p-2 gap-2">
                    <img src="/default-avatar.png" className="border border-black w-[56px] h-[52px] rounded-full" alt="" />
                    <span>
                        <h3 className="font-semibold text-[17px] text-black">Etienne Desaintjean</h3>
                        <p className="font-light text-gray-500">@edesaint</p>
                    </span>
                </div>
                <button className="bg-[#D9F2ED] w-[35px] h-[35px] p-2 items-center justify-center rounded-lg">
                    <RiMore2Fill  color="01AA85" className="w-[18px] h-[18px]" />
                </button>
            </div>
            <div className="w-[100%] px-5 mt-[10px]">
                <div className="flex flex-row items-center justify-between">
                    <p className="text-black">Message (9)</p>
                    <SearchModal />
                </div>
            </div>
            <main>
                <MessageList />
                <MessageList />
                <MessageList />
            </main>
        </div>
    )
}

export default ChatList;