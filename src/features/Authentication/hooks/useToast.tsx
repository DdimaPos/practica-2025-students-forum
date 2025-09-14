'use client';

import {useEffect} from 'react';
import {toast} from 'sonner';
import {FormState} from '../types';

export const useFormStateToast = (
  state: FormState,
  successMessage?: string
) => {
  useEffect(() => {
    if (!state.message && !state.success) {
      return;
    }

    if (state.success) {
      toast.success(state.message || successMessage || 'Operation successful!');
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, successMessage]);
};
