import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ProfileState {
  currentProfileName: string;
  allProfileNames: string[];
}

const initialState: ProfileState = {
  currentProfileName: '',
  allProfileNames: []
};

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setAllProfileNames(state: ProfileState, action: PayloadAction<string[]>) {
      state.allProfileNames = action.payload;
    },
    setCurrentProfileName(state: ProfileState, action: PayloadAction<string>) {
      state.currentProfileName = action.payload;
    }
  }
});
