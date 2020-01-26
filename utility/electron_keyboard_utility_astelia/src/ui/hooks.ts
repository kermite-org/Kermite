import { useDispatch } from 'react-redux';
import { Dispatch } from '@reduxjs/toolkit';
import React from 'react';

export function useMapDispatchToProps<T>(proc: (dispatch: Dispatch) => T) {
  const dispatch = useDispatch();
  return React.useMemo(() => proc(dispatch), []);
}

export function useGetLatest<T>(val: T): () => T {
  const ref = React.useRef(val);
  ref.current = val;
  return () => ref.current;
}
