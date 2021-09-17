import { css, FC, jsx } from 'qx';
import { texts } from '~/ui/base';
import { commitUiSettings, commitUiState, uiState } from '~/ui/commonStore';
import { CheckBoxLine, ConfigurationButton } from '~/ui/components';
import { editorModel } from '~/ui/features/ProfileEditor/models/EditorModel';
import { profilesReader } from '~/ui/pages/editor-page/models';

export const BehaviorOptionsPartB: FC = () => {
  const { settings } = uiState;

  const { isUserProfileEditorView } = editorModel;
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

      <div qxIf={!isUserProfileEditorView} className="config-icons">
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
  margin: 0 5px;
  > div + div {
    margin-top: 2px;
  }

  > .config-icons {
    margin-top: 10px;
    display: flex;
    gap: 10px;
  }
`;
