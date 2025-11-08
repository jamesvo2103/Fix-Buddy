import { useDiagnosis } from '../hooks/useDiagnosis';
import { useAgent } from '../hooks/useAgent';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import DiagnosisForm from '../components/diagnosis/DiagnosisForm';
import ClarifyPrompt from '../components/diagnosis/ClarifyPrompt';
import ResultDisplay from '../components/diagnosis/ResultDisplay';
import SafetyAlert from '../components/diagnosis/SafetyAlert';
import Loader from '../components/shared/Loader';

export default function DiagnosisPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentDiagnosis, loading, isBlocked, clarifyQuestion } = useDiagnosis();
  const { callAgent, error } = useAgent();

  // Check loading before auth redirect
  if (loading) return <Loader />;

  if (!user) {
    navigate('/login', { state: { from: '/diagnosis' } });
    return null;
  }

  const handleDiagnosis = async (formData) => {
    try {
      await callAgent(formData);
    } catch (err) {
      console.error('Diagnosis error:', err);
    }
  };

  const handleClarification = async (answer) => {
    try {
      await callAgent({
        ...currentDiagnosis,
        clarification: answer
      });
    } catch (err) {
      console.error('Clarification error:', err);
    }
  };

  // Render states in order of priority
  if (isBlocked && currentDiagnosis) {
    return <SafetyAlert diagnosis={currentDiagnosis} />;
  }

  if (clarifyQuestion) {
    return <ClarifyPrompt 
      question={clarifyQuestion} 
      onAnswer={handleClarification} 
    />;
  }

  if (currentDiagnosis) {
    return <ResultDisplay diagnosis={currentDiagnosis} />;
  }

  return <DiagnosisForm onSubmit={handleDiagnosis} error={error} />;
}