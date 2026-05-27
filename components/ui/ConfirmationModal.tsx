import React from "react";
import { LucideIcon, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  description: string;
  icon?: LucideIcon;
  iconColor?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "primary" | "danger" | "warning" | "success" | "default";
  onConfirm: () => void;
  isDangerous?: boolean;
  warningMessage?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  icon: Icon,
  iconColor = "text-rose-400",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "danger",
  onConfirm,
  isDangerous = false,
  warningMessage,
}) => {
  const modalRef = React.useRef<HTMLDialogElement | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal();
      document.body.style.overflow = "hidden";
    } else {
      modalRef.current?.close();
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => onOpenChange(false);

  const confirmButtonStyles = {
    primary:
      "bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/20",
    danger: "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20",
    warning: "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20",
    success:
      "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20",
    default: "bg-zinc-700 hover:bg-zinc-600 text-white shadow-black/20",
  };

  return (
    <dialog
      ref={modalRef}
      className="modal bg-black/60 backdrop-blur-md"
      onCancel={handleClose}
    >
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/95 shadow-2xl shadow-black/40 backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900">
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {isDangerous && warningMessage && (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
              <div className="flex items-start gap-3">
                {Icon && (
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15">
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-sm font-semibold text-rose-300">
                    This action cannot be undone
                  </p>

                  <p className="text-sm leading-relaxed text-rose-200/80">
                    {warningMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-5">
          <button
            className="rounded-xl border border-white/10 bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            onClick={handleClose}
          >
            {cancelText}
          </button>

          <button
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 shadow-lg ${confirmButtonStyles[confirmColor]}`}
            onClick={() => {
              onConfirm();
              handleClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default ConfirmationModal;
