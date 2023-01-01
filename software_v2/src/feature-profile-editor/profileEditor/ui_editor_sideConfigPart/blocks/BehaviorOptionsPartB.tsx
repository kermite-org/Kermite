import { css, FC, jsx } from 'alumina';
import { texts } from '~/app-shared';
import { CheckBoxLine, ConfigurationButton } from '~/fe-shared';
import { profileEditorStore } from '../../../store';
import { profileEditorConfig } from '../../adapters';
import { assignerModel } from '../../models';

export const BehaviorOptionsPartB: FC = () => {
  const {
    readers: { showLayerDefaultAssign },
    actions: { openConfigurationPanel, openRoutingPanel, commitUiSetting },
  } = profileEditorStore;

  const { isUserProfileEditorView } = assignerModel;
  return (
    <div class={style}>
      <CheckBoxLine
        text={texts.assignerDisplaySettingsPart.showFallbackAssigns}
        checked={showLayerDefaultAssign}
        setChecked={(value) =>
          commitUiSetting({ showLayerDefaultAssign: value })
        }
        hint={texts.assignerDisplaySettingsPartHint.showFallbackAssigns}
        disabled={!profileEditorConfig.isEditProfileAvailable}
      />

      <div if={!isUserProfileEditorView} class="config-icons">
        <ConfigurationButton
          onClick={openConfigurationPanel}
          iconSpec="fa fa-cog"
          data-hint={texts.assignerTopBarHint.profileConfigurationButton}
          disabled={!profileEditorConfig.isEditProfileAvailable}
        />
        <ConfigurationButton
          onClick={openRoutingPanel}
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
