import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PlayerState {
  pressedKeyFlags: { [keyId: string]: boolean };
}

const initialState: PlayerState = {
  pressedKeyFlags: {}
};

export const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setKeyPressed(
      state,
      action: PayloadAction<{
        keyId: string;
        isDown: boolean;
      }>
    ) {
      const { keyId, isDown } = action.payload;
      if (isDown) {
        state.pressedKeyFlags[keyId] = true;
      } else {
        delete state.pressedKeyFlags[keyId];
      }
    }
  }
});
