export default function IconBtn({ text, onclick, children, disabled, outline = false, customClasses, type, }) {
    return (
        <button
            disabled={disabled}
            onClick={onclick}
            className={`flex items-center justify-center outline-none ${outline ? "border border-white bg-richblack-100" : "bg-white"
                } cursor-pointer gap-x-2 rounded-md py-2 px-5 font-semibold text-richblack-900 hover:bg-black hover:text-white duration-300 ${customClasses}`}
            type={type}
        >
            {
                children ? (
                    <>
                        <span className={`${outline && "text-white"}`}>{text}</span>
                        {children}
                    </>
                ) :
                    (text)
            }
        </button>
    )
}