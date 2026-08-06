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
                    <button className="btn-primary flex-1" onClick={modalData?.btn1Handler}>
                        {modalData?.btn1Text}
                    </button>
                    <button className="btn-secondary flex-1" onClick={modalData?.btn2Handler}>
                        {modalData?.btn2Text}
                    </button>
                </div>
            </div>
        </div>
    )
}
