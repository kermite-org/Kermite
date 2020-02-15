import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SiteState {
  isWidgetMode: boolean;
}
const initialState: SiteState = {
  isWidgetMode: false
};

export const siteSlice = createSlice({
  name: '@@site',
  initialState,
  reducers: {
    setWidgetMode(state: SiteState, action: PayloadAction<boolean>) {
      state.isWidgetMode = action.payload;
    }
  }
});
