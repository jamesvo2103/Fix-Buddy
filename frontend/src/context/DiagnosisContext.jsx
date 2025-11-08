import { createContext, useState, useCallback, useEffect } from 'react';

export const DiagnosisContext = createContext();

export function DiagnosisProvider({ children }) {
  const [currentDiagnosis, setCurrentDiagnosis] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [clarifyQuestion, setClarifyQuestion] = useState(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('diagnosisHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }
  }, []);

  const addDiagnosis = useCallback((diagnosis) => {
    const newDiagnosis = {
      ...diagnosis,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    setCurrentDiagnosis(newDiagnosis);
    const updated = [newDiagnosis, ...history.slice(0, 9)];
    setHistory(updated);
    localStorage.setItem('diagnosisHistory', JSON.stringify(updated));
  }, [history]);

  const clearDiagnosis = useCallback(() => {
    setCurrentDiagnosis(null);
    setIsBlocked(false);
    setClarifyQuestion(null);
  }, []);

  const deleteFromHistory = useCallback((id) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('diagnosisHistory', JSON.stringify(updated));
  }, [history]);

  return (
    <DiagnosisContext.Provider 
      value={{ 
        currentDiagnosis, 
        history, 
        loading, 
        isBlocked, 
        clarifyQuestion,
        addDiagnosis, 
        clearDiagnosis, 
        deleteFromHistory,
        setLoading, 
        setIsBlocked,
        setClarifyQuestion
      }}
    >
      {children}
    </DiagnosisContext.Provider>
  );
}
