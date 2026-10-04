import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

export const useRefetchDeckOnForeground = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        queryClient.refetchQueries({ queryKey: ['deck'] });
      }
    });
    return () => subscription.remove();
  }, [queryClient]);
};
