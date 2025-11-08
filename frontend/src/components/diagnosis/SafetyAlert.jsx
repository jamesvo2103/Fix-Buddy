import { useNavigate } from 'react-router-dom';

export default function SafetyAlert({ diagnosis }) {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-red-50 border-4 border-red-500 p-8 rounded-lg text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-3xl font-bold text-red-700 mb-3">This Repair is Too Risky for DIY</h1>
        <p className="text-red-600 mb-6 text-lg">
          {diagnosis.itemName} repairs involving {diagnosis.reason || 'this type of issue'} should only be done by professionals.
        </p>

        <div className="bg-white border border-red-200 p-4 rounded-lg mb-6">
          <p className="text-gray-700 mb-4">
            <strong>Why?</strong> Working with this requires specialized training and equipment to ensure safety.
          </p>
        </div>

        {/* Nearby Professional Shops */}
        {diagnosis.nearbyShops && diagnosis.nearbyShops.length > 0 && (
          <div className="bg-white p-6 rounded-lg mb-6 text-left">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📍 Recommended Professional Services</h3>
            <div className="space-y-3">
              {diagnosis.nearbyShops.map((shop, i) => (
                <div key={i} className="border border-green-200 bg-green-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-800">{shop.name}</p>
                  <p className="text-sm text-gray-600">{shop.address}</p>
                  <p className="text-sm text-green-600 mt-2">📞 {shop.phone || 'Contact for quote'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/diagnosis')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition"
          >
            Try Another Item
          </button>
          <button
            onClick={() => navigate('/history')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition"
          >
            View History
          </button>
        </div>
      </div>
    </div>
  );
}
