import { createContext, useState, useCallback } from 'react';

export const DiagnosisContext = createContext();

export function DiagnosisProvider({ children }) {
  const [currentDiagnosis, setCurrentDiagnosis] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const addDiagnosis = useCallback((diagnosis) => {
    setCurrentDiagnosis(diagnosis);
    setHistory(prev => [diagnosis, ...prev.slice(0, 9)]); // Keep last 10
    localStorage.setItem('diagnosisHistory', JSON.stringify([diagnosis, ...history.slice(0, 9)]));
  }, [history]);

  const clearDiagnosis = useCallback(() => {
    setCurrentDiagnosis(null);
    setIsBlocked(false);
  }, []);

  return (
    <DiagnosisContext.Provider 
      value={{ 
        currentDiagnosis, 
        history, 
        loading, 
        isBlocked, 
        addDiagnosis, 
        clearDiagnosis, 
        setLoading, 
        setIsBlocked 
      }}
    >
      {children}
    </DiagnosisContext.Provider>
  );
}
