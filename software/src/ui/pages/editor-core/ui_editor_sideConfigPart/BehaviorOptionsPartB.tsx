import { css, FC, jsx } from 'qx';
import { texts } from '~/ui/base';
import { commitUiSettings, uiState } from '~/ui/commonStore';
import { CheckBoxLine } from '~/ui/components';
import { profilesReader } from '~/ui/pages/editor-page/models';

export const BehaviorOptionsPartB: FC = () => {
  const { settings } = uiState;

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
    </div>
  );
};

const style = css`
  margin: 0 5px;
  > div + div {
    margin-top: 2px;
  }
`;
