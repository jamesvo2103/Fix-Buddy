import { useState } from 'react';
import { useDiagnosis } from './useDiagnosis';
import axiosInstance from '../config/api';

export function useAgent() {
  const { setLoading, setIsBlocked, addDiagnosis } = useDiagnosis();
  const [error, setError] = useState(null);

  const callAgent = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.post('/api/agent', formData);
      
      if (response.data.blocked) {
        setIsBlocked(true);
      } else {
        addDiagnosis(response.data);
      }
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { callAgent, error };
}
