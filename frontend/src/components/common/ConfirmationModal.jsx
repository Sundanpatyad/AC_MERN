export default function ConfirmationModal({ modalData }) {
    return (
        <div className="fixed inset-0 z-[1000] !mt-0 grid place-items-center overflow-auto bg-[var(--c-overlay)] backdrop-blur-sm p-4">
            <div className="w-full max-w-[400px] rounded-2xl border border-line bg-surface p-6 shadow-xl">
                <p className="text-xl font-semibold text-fg">
                    {modalData?.text1}
                </p>

                <p className="mt-2 mb-6 text-sm leading-relaxed text-muted">
                    {modalData?.text2}
                </p>

                <div className="flex items-center gap-3">
                    <button
                        className="btn-primary flex-1 disabled:opacity-60"
                        onClick={modalData?.btn1Handler}
                        disabled={modalData?.btn1Loading}
                    >
                        {modalData?.btn1Loading ? (
                            <span className="inline-flex items-center gap-2">
                                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
                                {modalData?.btn1Text}
                            </span>
                        ) : (
                            modalData?.btn1Text
                        )}
                    </button>
                    <button
                        className="btn-secondary flex-1 disabled:opacity-60"
                        onClick={modalData?.btn2Handler}
                        disabled={modalData?.btn1Loading}
                    >
                        {modalData?.btn2Text}
                    </button>
                </div>
            </div>
        </div>
    )
}
