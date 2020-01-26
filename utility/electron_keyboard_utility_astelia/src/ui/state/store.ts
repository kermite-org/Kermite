import { configureStore, combineReducers, Action } from '@reduxjs/toolkit';
import { playerSlice, PlayerState } from './playerSlice';
import { EditorState, editorSlice } from './editorSlice';
import { ProfileState, profileSlice } from './profileSlice';
import { ThunkAction } from 'redux-thunk';
import { SiteState, siteSlice } from './siteSlice';

export type AsyncDispatch = (
  action: Action | ThunkAction<any, any, any, any>
) => void;

export interface AppState {
  player: PlayerState;
  editor: EditorState;
  profile: ProfileState;
  site: SiteState;
}

type ReducerType<T> = { [K in keyof T]: (state: T[K], action: Action) => T[K] };

const appReducer: ReducerType<AppState> = {
  player: playerSlice.reducer,
  editor: editorSlice.reducer,
  profile: profileSlice.reducer,
  site: siteSlice.reducer
};

export const store = configureStore({
  reducer: combineReducers(appReducer)
});
