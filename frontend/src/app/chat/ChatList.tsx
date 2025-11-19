import React from "react";
import SearchModal from "./SearchModal";

const ElemList = () => {
    return (
        <div className="flex flex-row gap-24 border b">
            <div className="flex flex-row p-2 gap-2">
                <img src="/logo_apple.jpg" className="border border-black w-[56px] h-[52px] rounded-full" alt="" />
                <div>
                    <h3 className="font-semibold text-[17px] text-black">Etienne Desaintjean</h3>
                    <p className="font-light text-gray-500">please send me the pdf..</p>
                </div>
            </div>
            <p className="py-2 text-gray-500">feb 05 2025</p>
        </div>
    )
}

const ChatList = () => {
    return (
        <div className="border border-black bg-white ">
            <div className="flex flex-row gap-300">
                <button>
                    <img src="/logo_apple.jpg" className="border border-black w-[56px] h-[52px] rounded-full" alt="" />
                </button>
                <p className="text-black">Message (9)</p>
            </div>
            <ElemList />
            <SearchModal />
        </div>
    )
}

export default ChatList;