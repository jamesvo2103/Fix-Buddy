import { useState } from 'react';
import { useDiagnosis } from '../hooks/useDiagnosis';
import { useAgent } from '../hooks/useAgent';
import DiagnosisForm from '../components/diagnosis/DiagnosisForm';
import ClarifyPrompt from '../components/diagnosis/ClarifyPrompt';
import ResultDisplay from '../components/diagnosis/ResultDisplay';
import SafetyAlert from '../components/diagnosis/SafetyAlert';
import Loader from '../components/shared/Loader';

export default function DiagnosisPage() {
  const { currentDiagnosis, loading, isBlocked } = useDiagnosis();
  const { callAgent, error } = useAgent();
  const [needsClarification, setNeedsClarification] = useState(false);

  const handleDiagnosis = async (formData) => {
    try {
      const result = await callAgent(formData);
      if (result.status === 'clarify') {
        setNeedsClarification(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loader />;
  if (isBlocked) return <SafetyAlert diagnosis={currentDiagnosis} />;
  if (needsClarification) return <ClarifyPrompt onAnswer={handleDiagnosis} />;
  if (currentDiagnosis) return <ResultDisplay diagnosis={currentDiagnosis} />;

  return <DiagnosisForm onSubmit={handleDiagnosis} error={error} />;
}
