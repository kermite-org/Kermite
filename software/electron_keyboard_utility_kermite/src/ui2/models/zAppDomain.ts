import { EditorModel } from './EditorModel';
import { PlayerModel } from './PlayerModel';
import { ProfilesModel } from './ProfilesModel';
import { SiteModel } from './SiteModel';
import { backendAgent } from './dataSource/ipc';
import { KeyboardConfigModel } from './KeyboardConfigModel';
import { ApplicationSettingsModel } from './ApplicationSettingsModel';
import { DeviceStatusModel } from './DeviceStatusModel';

export const appDomain = new (class {
  readonly editorModel = new EditorModel();
  readonly playerModel = new PlayerModel(this.editorModel);
  readonly profilesModel = new ProfilesModel(this.editorModel);
  readonly siteModel = new SiteModel();
  readonly keyboardConfigModel = new KeyboardConfigModel();
  readonly settingsModel = new ApplicationSettingsModel();
  readonly deviceStatusModel = new DeviceStatusModel();

  initialize() {
    //debug
    (async () => {
      const kbd = await backendAgent.getKeyboardConfig();
      const env = await backendAgent.getEnvironmentConfig();
      const st = await backendAgent.getSettings();
      console.log({ kbd, env, st });
    })();

    // this.siteModel.isWidgetMode = true;

    // debugTrace('start appDomain initialize');
    this.playerModel.initialize();
    this.profilesModel.initialize();
    // editorModel.loadProfileData(testProfileData);
    this.siteModel.initialize();
    this.keyboardConfigModel.intialize();
    this.settingsModel.initialize();
    this.deviceStatusModel.initialize();
  }

  terminate() {
    this.deviceStatusModel.finalinze();
    this.settingsModel.finalize();
    this.keyboardConfigModel.finalize();
    this.playerModel.finalize();
    this.profilesModel.finalize();
    // debugTrace('end appDomain terminate');
    this.siteModel.finalize();
  }
})();

export const { editorModel, playerModel, profilesModel, siteModel } = appDomain;
