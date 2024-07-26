import React, { useRef } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";

type PortalModalProps = {
  children: React.ReactNode;
  isEventOpen: boolean;
  closeEvent: () => void;
  removable?: boolean;
  portalTarget?: Element;
};

const PortalModal = ({
  children,
  isEventOpen,
  closeEvent,
  removable,
  portalTarget = document.body,
}: PortalModalProps) => {
  const ref = useRef<HTMLDivElement>(null);

  if (!isEventOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-10 flex items-center justify-center">
      <div className="relative " ref={ref}>
        {removable && (
          <div
            className="absolute top-2 z-20 right-4  cursor-pointer"
            onClick={() => {
              closeEvent();
            }}
          >
            <IoClose size={24} className="text-black" />
          </div>
        )}
        {children}
      </div>
    </div>,
    portalTarget,
  );
};

export default PortalModal;
