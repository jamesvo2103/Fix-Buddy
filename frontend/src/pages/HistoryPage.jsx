import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import HistoryList from '../components/history/HistoryList';

export default function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login', { state: { from: '/history' } });
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Diagnosis History</h1>
      <p className="text-gray-600 mb-8">View your past diagnoses and repairs</p>
      <HistoryList />
    </div>
  );
}
