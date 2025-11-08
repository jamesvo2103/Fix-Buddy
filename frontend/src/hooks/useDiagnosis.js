import { useContext } from 'react';
import { DiagnosisContext } from '../context/DiagnosisContext';

export function useDiagnosis() {
  const context = useContext(DiagnosisContext);
  if (!context) {
    throw new Error('useDiagnosis must be used within DiagnosisProvider');
  }
  return context;
}
