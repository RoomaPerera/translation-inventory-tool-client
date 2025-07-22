import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react'; // npm install @headlessui/react
import { XIcon } from '@heroicons/react/outline'; // npm install @heroicons/react

// Props:
// - isOpen: boolean to control visibility
// - onClose: function to close modal
// - title: modal header title
// - subtitle: optional subtitle below the title
// - children: modal body content
const Modal = ({ isOpen, onClose, title, subtitle, children }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        {/* Modal Panel */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="bg-indigo-700 px-6 py-4 flex justify-between items-center">
                  <div>
                    <Dialog.Title as="h3" className="text-lg font-bold text-white">
                      {title}
                    </Dialog.Title>
                    {subtitle && <p className="text-sm text-indigo-200">{subtitle}</p>}
                  </div>
                  <button onClick={onClose} className="text-indigo-200 hover:text-white">
                    <XIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6">
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
