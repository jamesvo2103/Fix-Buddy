import { useDiagnosis } from '../../hooks/useDiagnosis';
import HistoryCard from './HistoryCard';

export default function HistoryList() {
  const { history } = useDiagnosis();

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Diagnoses Yet</h2>
        <p className="text-gray-600">Start by diagnosing your first item!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((diagnosis) => (
        <HistoryCard key={diagnosis.id} diagnosis={diagnosis} />
      ))}
    </div>
  );
}
