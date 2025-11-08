export default function Loader() {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-lg text-gray-600">Processing your request...</p>
          <p className="mt-2 text-sm text-gray-500">This may take a few seconds</p>
        </div>
      </div>
    );
  }
  