import React from "react";
import { LucideIcon } from "lucide-react";

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
  iconColor = "text-danger",
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
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const handleClose = () => onOpenChange(false);

  return (
    <dialog
      ref={modalRef}
      className="modal backdrop-blur-sm"
      onCancel={handleClose}
    >
      <div className="modal-box border border-base-300 bg-base-100 shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-base-300 pb-2">
          {Icon && <Icon className={`h-5 w-5 ${iconColor}`}/>}
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>

        {/* Body */}
        <div className="py-4 space-y-4">
          {isDangerous && warningMessage && (
            <div className="bg-error/10 text-error p-4 rounded-lg border border-error/20">
              <div className="flex items-start gap-3">
                {Icon && (
                  <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconColor}`}/>
                )}
                <div>
                  <p className="font-medium">This action cannot be undone</p>
                  <p className="text-sm mt-1">{warningMessage}</p>
                </div>

              </div>
            </div>
          )}
          <p>{description}</p>

        </div>

        {/* footer */}
        <div className="modal-action border-t border-base-300 pt-3">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
            onClick={handleClose}
          >
            {cancelText}
          </button>
          <button
            className={`px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-${confirmColor}`}
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
