import { EditorModel } from './EditorModel';
import { testProfileData } from '../defs/testProfileData';

export class AppModel {
  readonly editorModel = new EditorModel();
  debugObject?: any;

  initialize() {
    this.editorModel.setProfileData(testProfileData);
  }

  terminate() {}
}
export const appModel = new AppModel();
export const editorModel = appModel.editorModel;
