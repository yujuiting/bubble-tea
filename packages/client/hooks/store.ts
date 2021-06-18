import { useCallback } from 'react';
import * as redux from 'react-redux';
import { Dispatcher, RootState } from 'store';

export const useDispatch = () => redux.useDispatch<Dispatcher>();

export const useSelector: redux.TypedUseSelectorHook<RootState> = redux.useSelector;

export function useDispatcher<T extends (...args: any[]) => any>(actionCreator: T) {
  const dispatch = useDispatch();
  return useCallback((...args: Parameters<T>) => dispatch(actionCreator(...args)), [actionCreator, dispatch]);
}
