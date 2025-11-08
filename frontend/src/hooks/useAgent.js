import { useState } from 'react';
import { useDiagnosis } from './useDiagnosis';
import axiosInstance from '../config/api';

export function useAgent() {
  const { setLoading, setIsBlocked, setClarifyQuestion, addDiagnosis } = useDiagnosis();
  const [error, setError] = useState(null);

  const callAgent = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.post('/api/agent', formData);
      
      if (response.data.status === 'clarify') {
        setClarifyQuestion(response.data.question);
        return { status: 'clarify', question: response.data.question };
      }
      
      if (response.data.blocked) {
        setIsBlocked(true);
        addDiagnosis(response.data);
        return response.data;
      }
      
      addDiagnosis(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error processing request';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { callAgent, error };
}
