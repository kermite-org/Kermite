import React from 'react';
import { useDispatch } from 'react-redux';
import { IProfileManagerStatus } from '~contract/data';
import { IRealtimeKeyboardEvent } from '~contract/ipc';
import { editorSelectors, EditorState } from './state/editorSlice';
import { backendAgent, sendIpcPacketSync } from './state/ipc';
import { playerSlice } from './state/playerSlice';
import { profileAsyncActions } from './state/profileSlice';
import { store } from './state/store';

export function useRealtimeKeyboardEventReceiver() {
  const dispatch = useDispatch();
  React.useEffect(() => {
    const handler = (ev: IRealtimeKeyboardEvent) => {
      if (ev.type === 'keyStateChanged') {
        const { keyIndex, isDown } = ev;
        const keyId = `ku${keyIndex}`;
        dispatch(playerSlice.actions.setKeyPressed({ keyId, isDown }));
      }
    };
    backendAgent.keyEvents.subscribe(handler);
    return () => backendAgent.keyEvents.unsubscribe(handler);
  }, []);
}

export function useProfileManagerStateResources() {
  const dispatch = useDispatch();
  React.useEffect(() => {
    const handler = (payload: Partial<IProfileManagerStatus>) => {
      dispatch(profileAsyncActions.handleProfileManagerStatusEvents(payload));
    };
    backendAgent.profileStatusEvents.subscribe(handler);
    return () => {
      backendAgent.profileStatusEvents.unsubscribe(handler);
    };
  }, []);
}

export function saveDirtyEditModelOnClosing() {
  const editorState = store.getState().editor as EditorState;
  const isDirty = editorSelectors.isEditModelDirty(editorState);
  if (isDirty) {
    const latestEditModel = editorState.editModel;
    sendIpcPacketSync({ reserveSaveProfileTask: latestEditModel });
  }
}
