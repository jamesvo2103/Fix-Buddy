import { useState } from 'react';
import { useDiagnosis } from '../../hooks/useDiagnosis';
import { useNavigate } from 'react-router-dom';

export default function ResultDisplay({ diagnosis }) {
  const navigate = useNavigate();
  const { clearDiagnosis } = useDiagnosis();
  const [readAloudActive, setReadAloudActive] = useState(false);

  const handleReadAloud = () => {
    if ('speechSynthesis' in window && diagnosis.diySteps) {
      const text = diagnosis.diySteps.map((step, i) => `Step ${i + 1}: ${step}`).join('. ');
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
      setReadAloudActive(true);
    }
  };

  const handleNewDiagnosis = () => {
    clearDiagnosis();
    navigate('/diagnosis');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold">{diagnosis.itemName}</h1>
        <p className="text-green-100 mt-2">Repairability Score: {diagnosis.repairabilityScore}%</p>
      </div>

      {/* Issues */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Likely Issues</h2>
        <div className="space-y-3">
          {diagnosis.issues && diagnosis.issues.map((issue, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">{issue.name}</span>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">{issue.probability}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DIY Steps */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">DIY Repair Steps</h2>
          <button
            onClick={handleReadAloud}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            🔊 Read Aloud
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Estimated Time</p>
              <p className="text-2xl font-bold text-blue-600">{diagnosis.estimatedTime || '2-3 hrs'}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Cost</p>
              <p className="text-2xl font-bold text-green-600">${diagnosis.estimatedCost || '20-50'}</p>
            </div>
          </div>

          {/* Safety Warning */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-4">
            <p className="text-red-800 font-semibold">⚠️ Safety Notice</p>
            <p className="text-red-700 text-sm mt-2">{diagnosis.safetyNote || 'Always ensure power is disconnected before repair.'}</p>
          </div>

          {/* Steps */}
          <ol className="space-y-4 list-none">
            {diagnosis.diySteps && diagnosis.diySteps.map((step, i) => (
              <li key={i} className="bg-gray-50 p-4 rounded-lg">
                <span className="bg-blue-600 text-white font-bold w-8 h-8 rounded-full inline-flex items-center justify-center mr-4">{i + 1}</span>
                <span className="text-gray-800">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Parts & Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Tools Needed</h3>
          <ul className="space-y-2">
            {diagnosis.toolsNeeded && diagnosis.toolsNeeded.map((tool, i) => (
              <li key={i} className="flex items-center gap-2 text-gray-700">
                <span className="text-blue-600">✓</span> {tool}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Parts Needed</h3>
          <ul className="space-y-2">
            {diagnosis.partsNeeded && diagnosis.partsNeeded.map((part, i) => (
              <li key={i} className="flex items-center gap-2 text-gray-700">
                <span className="text-green-600">•</span> {part}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Nearby Repair Shops */}
      {diagnosis.nearbyShops && diagnosis.nearbyShops.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📍 Nearby Repair Shops</h3>
          <div className="space-y-3">
            {diagnosis.nearbyShops.map((shop, i) => (
              <div key={i} className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition">
                <p className="font-semibold text-gray-800">{shop.name}</p>
                <p className="text-sm text-gray-600">{shop.address}</p>
                <p className="text-sm text-blue-600 mt-1">⭐ {shop.rating} ({shop.reviews} reviews)</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tutorial Videos */}
      {diagnosis.tutorialLinks && diagnosis.tutorialLinks.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📺 Tutorial Videos</h3>
          <div className="space-y-3">
            {diagnosis.tutorialLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-gray-200 p-4 rounded-lg hover:bg-blue-50 transition"
              >
                <p className="font-semibold text-blue-600 hover:underline">{link.title}</p>
                <p className="text-sm text-gray-600">{link.source}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center pt-6">
        <button
          onClick={handleNewDiagnosis}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition"
        >
          New Diagnosis 🔧
        </button>
        <button
          onClick={() => navigate('/history')}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition"
        >
          View History 📋
        </button>
      </div>
    </div>
  );
}
