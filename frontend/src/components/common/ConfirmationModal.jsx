import IconBtn from "./IconBtn"

export default function ConfirmationModal({ modalData }) {
    return (
        <div className="fixed inset-0 z-[1000] !mt-0 grid place-items-center overflow-auto bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="w-11/12 max-w-[400px] rounded-xl border border-white border-opacity-20 bg-black p-8 shadow-lg">
                <p className="text-3xl font-bold text-white mb-4">
                    {modalData?.text1}
                </p>
                
                <p className="mt-2 mb-6 text-lg leading-relaxed text-gray-300">
                    {modalData?.text2}
                </p>
                
                <div className="flex items-center gap-x-4">
                    <IconBtn
                        onclick={modalData?.btn1Handler}
                        text={modalData?.btn1Text}
                        className="bg-white text-black hover:bg-gray-200 transition-colors duration-300"
                    />
                    <button
                        className="cursor-pointer rounded-lg bg-black text-white border border-white
                                   py-3 px-6 font-semibold hover:bg-white hover:text-black
                                   transition-all duration-300 ease-in-out"
                        onClick={modalData?.btn2Handler}
                    >
                        {modalData?.btn2Text}
                    </button>
                </div>
            </div>
        </div>
    )
}