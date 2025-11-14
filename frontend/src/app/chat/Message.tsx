import { div } from "framer-motion/client";

export default function Message() {
    return (
        <div className="w-full border-black">
            <form className="" action="submit">
                <input className="p-2 text-black border-black" type="text" />
                <button
                    className="p-2 text-white border-black rounded-lg bg-blue-500 hover:bg-blue-600"
                    type="button">
                        Send
                </button>
            </form>
        </div>
    )
}