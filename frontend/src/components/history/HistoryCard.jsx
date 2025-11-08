import React, { useState } from 'react';
import PropTypes from 'prop-types';

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const HistoryCard = ({ diagnosis, deleteFromHistory }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{diagnosis.itemName}</h3>
            <p className="text-sm text-gray-600 mt-1">{formatDate(diagnosis.timestamp)}</p>
          </div>
          <div className="text-right">
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
              {diagnosis.repairabilityScore}%
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 hover:text-blue-700 font-semibold mb-4 transition"
        >
          {expanded ? '▼ Hide Details' : '▶ Show Details'}
        </button>

        {expanded && (
          <div className="space-y-3 mb-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Issues Found:</p>
              <p className="text-gray-800">{diagnosis.issues?.map(i => i.name).join(', ') || 'N/A'}</p>
            </div>
            {diagnosis.diySteps && diagnosis.diySteps.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 font-semibold">Steps:</p>
                <ol className="list-decimal list-inside text-gray-800 space-y-1">
                  {diagnosis.diySteps.slice(0, 3).map((step, i) => (
                    <li key={i} className="text-sm">{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => deleteFromHistory(diagnosis.id)}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 rounded-lg transition"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

HistoryCard.propTypes = {
  diagnosis: PropTypes.shape({
    id: PropTypes.string.isRequired,
    itemName: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    repairabilityScore: PropTypes.number.isRequired,
    issues: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired
    })),
    diySteps: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  deleteFromHistory: PropTypes.func.isRequired
};

export default HistoryCard;