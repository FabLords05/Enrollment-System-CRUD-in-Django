import React from 'react';
import Icon from './Icon';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string; // 🟢 1. Added optional maxWidth prop
}

// 🟢 2. Give it a default value of max-w-[520px] so old modals don't break
export default function Modal({ title, onClose, children, footer, maxWidth = "max-w-[520px]" }: ModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* 🟢 3. Inject the dynamic maxWidth here */}
      <div className={`bg-white rounded-2xl w-full ${maxWidth} max-h-[88vh] overflow-y-auto shadow-2xl flex flex-col animate-[fadeIn_0.2s_ease-out]`}>
        
        <div className="p-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <span className="text-[15px] font-bold text-ustpDarkBlue">{title}</span>
          <button 
            className="w-[26px] h-[26px] rounded-md bg-gray-100 border-none cursor-pointer flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
            onClick={onClose}
          >
            <Icon name="close" size={13} />
          </button>
        </div>

        <div className="p-5">
          {children}
        </div>

        {footer && (
          <div className="p-4 border-t border-gray-200 flex justify-end gap-2 bg-gray-50 rounded-b-2xl">
            {footer}
          </div>
        )}
        
      </div>
    </div>
  );
}