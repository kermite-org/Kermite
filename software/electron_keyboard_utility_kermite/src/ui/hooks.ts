import { useDispatch } from 'react-redux';
// import { Dispatch } from '@reduxjs/toolkit';
import React from 'react';
import { AsyncDispatch } from './state/store';
import { Dispatch } from 'redux';

export function useMapDispatchToProps<T, D extends Dispatch | AsyncDispatch>(
  proc: (dispatch: D) => T
): T {
  const dispatch = useDispatch() as any;
  return React.useMemo(() => proc(dispatch), []);
}

export function useGetLatest<T>(val: T): () => T {
  const ref = React.useRef(val);
  ref.current = val;
  return () => ref.current;
}
