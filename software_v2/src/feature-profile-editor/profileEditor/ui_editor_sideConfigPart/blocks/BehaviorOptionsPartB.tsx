import { FC, css, jsx } from 'alumina';
import { texts } from '~/app-shared';
import { CheckBoxLine, ConfigurationButton } from '~/fe-shared';
// import { profilesReader } from '~/ui/pages/assignerPage/models';
// import { commitUiSettings, commitUiState, uiState } from '~/ui/store';
import { profileEditorConfig } from '../../adapters';
import { assignerModel } from '../../models';

export const BehaviorOptionsPartB: FC = () => {
  const { settings, commitUiSettings, commitUiState } = profileEditorConfig;

  const { isUserProfileEditorView } = assignerModel;
  return (
    <div class={style}>
      <CheckBoxLine
        text={texts.assignerDisplaySettingsPart.showFallbackAssigns}
        checked={settings.showLayerDefaultAssign}
        setChecked={(value) =>
          commitUiSettings({ showLayerDefaultAssign: value })
        }
        hint={texts.assignerDisplaySettingsPartHint.showFallbackAssigns}
        disabled={!profileEditorConfig.isEditProfileAvailable}
      />

      <div if={!isUserProfileEditorView} class="config-icons">
        <ConfigurationButton
          onClick={() => commitUiState({ profileConfigModalVisible: true })}
          iconSpec="fa fa-cog"
          data-hint={texts.assignerTopBarHint.profileConfigurationButton}
          disabled={!profileEditorConfig.isEditProfileAvailable}
        />
        <ConfigurationButton
          onClick={() => commitUiState({ profileRoutingPanelVisible: true })}
          iconSpec="fa fa-list"
          disabled={!profileEditorConfig.isEditProfileAvailable}
        />
      </div>
    </div>
  );
};

const style = css`
  > div + div {
    margin-top: 2px;
  }

  > .config-icons {
    margin-top: 10px;
    display: flex;
    gap: 10px;
  }
`;
