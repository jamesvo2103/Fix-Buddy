export default function Modal({ isOpen, title, children, onClose, onConfirm, confirmText = 'Confirm' }) {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
          <div className="px-6 py-4">
            {children}
          </div>
          <div className="bg-gray-100 px-6 py-4 rounded-b-lg flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition"
            >
              Cancel
            </button>
            {onConfirm && (
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition"
              >
                {confirmText}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  