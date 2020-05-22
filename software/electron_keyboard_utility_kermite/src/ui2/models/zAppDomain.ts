import { EditorModel } from './EditorModel';
import { PlayerModel } from './PlayerModel';
import { ProfilesModel } from './ProfilesModel';
import { SiteModel } from './SiteModel';

export const appDomain = new (class {
  readonly editorModel = new EditorModel();
  readonly playerModel = new PlayerModel(this.editorModel);
  readonly profilesModel = new ProfilesModel(this.editorModel);
  readonly siteModel = new SiteModel();

  initialize() {
    // this.siteModel.isWidgetMode = true;

    // debugTrace('start appDomain initialize');
    this.playerModel.initialize();
    this.profilesModel.initialize();
    // editorModel.loadProfileData(testProfileData);
  }

  terminate() {
    this.playerModel.finalize();
    this.profilesModel.finalize();
    // debugTrace('end appDomain terminate');
  }
})();

export const { editorModel, playerModel, profilesModel, siteModel } = appDomain;
