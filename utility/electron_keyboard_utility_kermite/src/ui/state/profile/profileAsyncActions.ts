import { IProfileManagerCommand, IProfileManagerStatus } from '~defs/ipc';
import { editorSlice, editorSelectors } from '../editor';
import { sendProfileManagerCommands } from '../ipc';
import { AppState, AsyncDispatch, IGetState } from '../store';
import { profileSlice } from './profileSlice';
import { processCreateProfileDialog } from '~ui/extraModals';
import { modalTextInput, modalConfirm } from '~ui/basicModals';

function getSaveCommandIfDirty(
  getState: () => AppState
): IProfileManagerCommand | undefined {
  const editorState = getState().editor;
  const isDirty = editorSelectors.isEditModelDirty(editorState);
  if (isDirty) {
    return { saveCurrentProfile: { editModel: editorState.editModel } };
  }
  return undefined;
}

export const profileAsyncActions = {
  handleProfileManagerStatusEvents(payload: Partial<IProfileManagerStatus>) {
    return async (dispatch: AsyncDispatch) => {
      const {
        currentProfileName,
        allProfileNames,
        loadedEditModel,
        errorMessage
      } = payload;
      if (currentProfileName) {
        dispatch(
          profileSlice.actions.setCurrentProfileName(currentProfileName)
        );
      }
      if (allProfileNames) {
        dispatch(profileSlice.actions.setAllProfileNames(allProfileNames));
      }
      if (loadedEditModel) {
        dispatch(editorSlice.actions.loadEditModel(loadedEditModel));
      }
      if (errorMessage) {
        alert(errorMessage);
      }
    };
  },

  createProfile() {
    return async (dispatch: AsyncDispatch, getState: IGetState) => {
      const res = await processCreateProfileDialog(undefined);
      if (!res) {
        return;
      }
      const { newProfileName, breedName } = res;

      if (getState().profile.allProfileNames.includes(newProfileName)) {
        alert(
          `Profile ${newProfileName} already exists. Please specify another name.`
        );
        return;
      }
      const saveCommand = getSaveCommandIfDirty(getState);
      const createCommand = {
        creatProfile: { name: newProfileName, breedName }
      };
      sendProfileManagerCommands(saveCommand, createCommand);
    };
  },
  loadProfile(profName: string) {
    return async (dispatch: AsyncDispatch, getState: IGetState) => {
      const curProfName = getState().profile.currentProfileName;
      if (profName === curProfName) {
        return;
      }
      const saveCommand = getSaveCommandIfDirty(getState);
      const loadCommand = { loadProfile: { name: profName } };
      sendProfileManagerCommands(saveCommand, loadCommand);
    };
  },
  renameProfile() {
    return async (dispatch: AsyncDispatch, getState: IGetState) => {
      const curProfName = getState().profile.currentProfileName;

      const newProfileName = await modalTextInput({
        message: 'input new profile name',
        defaultText: curProfName
      });
      if (!newProfileName) {
        return;
      }
      const saveCommand = getSaveCommandIfDirty(getState);
      const renameCommand = {
        renameProfile: { name: curProfName, newName: newProfileName }
      };
      sendProfileManagerCommands(saveCommand, renameCommand);
    };
  },
  deleteProfile() {
    return async (dispatch: AsyncDispatch, getState: IGetState) => {
      const curProfName = getState().profile.currentProfileName;

      const ok = await modalConfirm(
        `Profile ${curProfName} will be deleted. Are you sure?`
      );
      if (!ok) {
        return;
      }
      const deleteCommand = { deleteProfile: { name: curProfName } };
      sendProfileManagerCommands(deleteCommand);
    };
  },
  saveProfile() {
    return async (dispatch: AsyncDispatch, getState: IGetState) => {
      const saveCommand = getSaveCommandIfDirty(getState);
      if (saveCommand) {
        sendProfileManagerCommands(saveCommand);
      }
    };
  }
};
