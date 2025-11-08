import { useState } from 'react';

export default function ClarifyPrompt({ question, onAnswer }) {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAnswer({ clarification: answer });
    } finally {
      setLoading(false);
      setAnswer('');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-gray-800 font-semibold">{question}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Provide more details..."
          rows="4"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onAnswer({ clarification: 'yes' })}
            disabled={loading}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition disabled:opacity-50"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => onAnswer({ clarification: 'no' })}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg transition disabled:opacity-50"
          >
            No
          </button>
          <button
            type="submit"
            disabled={loading || !answer}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? '...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}
