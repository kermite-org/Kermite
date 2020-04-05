import { fallbackProfileData, IProfileData } from '~/defs/ProfileData';

interface IEditorState {
  loadedPorfileData: IProfileData;
  profileData: IProfileData;
  currentLayerId: string;
}

export const editorState: IEditorState = {
  loadedPorfileData: fallbackProfileData,
  profileData: fallbackProfileData,
  currentLayerId: '',
};
