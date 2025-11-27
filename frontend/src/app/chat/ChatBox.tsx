import React from "react";
import { RiSendPlaneFill } from "react-icons/ri";

const ChatBox = () => {
    return (
        <section className="flex flex-col items-start justify-start hidden lg:block bg-white w-full">
            <header className="border-b border-yellow-400 w-[100%] h-[70px] p-4">
                <main className="flex flex-row">
                    <img
                        src="/default-avatar.png"
                        className="flex-shrink-0 border border-black w-11 h-11 rounded-full"
                        alt=""
                    />
                    <span>
                        <h3 className="font-semibold text-[#2A3D39] text-lg">Etienne Desaintjean</h3>
                        <p className="font-light text-[#2A3D39] text-sm">@edesaint</p>
                    </span>
                </main>
            </header>

            <main className="relative flex flex-col w-[100%] justify-between">
                <div className="flex flex-col space-y-4">
                    <div className="flex justify-start p-4">
                        <div className="bg-green-400 p-2 w-[200px] rounded-full">
                            <h3 className="text-black">Hey buddy</h3>
                        </div>
                        <p className="font-light text-[#2A3D39] text-sm">7 Feb 2023</p>
                    </div>
                    <div className="flex justify-end p-4">
                        <img
                            src="/default-avatar.png"
                            className="flex-shrink-0 border border-black w-11 h-11 rounded-full"
                            alt=""
                        />
                        <div className="flex flex-col">
                            <div className="bg-green-400 p-2 w-[200px] rounded-full">
                                <h3 className="text-black">Hey Bro wasup</h3>
                            </div>
                            <p className="font-light text-[#2A3D39] text-sm">7 Feb 2023</p>
                        </div>
                    </div>
                </div>
            </main>

            <div>
                <form action="" className="flex flex-row bg-white border border-black h-[45px] w-[100%] px-2 rounded-lg">
                    <input className="text-black w-full" type="text" placeholder="Ecris ton message..." />
                    <button className="p-4">
                        <RiSendPlaneFill color="black"/>
                    </button>
                </form>
            </div>
        </section>
    )
}

export default ChatBox;