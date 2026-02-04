type ModalProps = {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
    if(!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <div className="relative z-10 animate-scaleIn">
                    {children}
                </div>
            </div>
        </div>
    )
}