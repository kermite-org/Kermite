import { css, FC, jsx } from 'alumina';
import { texts } from '~/ui/base';
import { CheckBoxLine } from '~/ui/components';
import { ConfigurationButton } from '~/ui/elements';
import { assignerModel } from '~/ui/featureEditors/ProfileEditor/models/AssignerModel';
import { profilesReader } from '~/ui/pages/assigner-page/models';
import { commitUiSettings, commitUiState, uiState } from '~/ui/store';

export const BehaviorOptionsPartB: FC = () => {
  const { settings } = uiState;

  const { isUserProfileEditorView } = assignerModel;
  return (
    <div css={style}>
      <CheckBoxLine
        text={texts.label_assigner_configs_showFallbackAssigns}
        checked={settings.showLayerDefaultAssign}
        setChecked={(value) =>
          commitUiSettings({ showLayerDefaultAssign: value })
        }
        hint={texts.hint_assigner_configs_showFallbackAssigns}
        disabled={!profilesReader.isEditProfileAvailable}
      />

      <div if={!isUserProfileEditorView} className="config-icons">
        <ConfigurationButton
          onClick={() => commitUiState({ profileConfigModalVisible: true })}
          iconSpec="fa fa-cog"
          data-hint={texts.hint_assigner_topBar_profileConfigurationButton}
          disabled={!profilesReader.isEditProfileAvailable}
        />
        <ConfigurationButton
          onClick={() => commitUiState({ profileRoutingPanelVisible: true })}
          iconSpec="fa fa-list"
          disabled={!profilesReader.isEditProfileAvailable}
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
