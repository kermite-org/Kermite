import { jsx, css } from 'qx';
import { fieldSetter } from '~/ui-common';
import { CheckBoxLine } from '~/ui-common/components';
import { uiStatusModel } from '~/ui-common/sharedModels/UiStatusModel';

const cssBehaviorOptionsPart = css`
  margin: 0 5px;
  > div + div {
    margin-top: 2px;
  }
`;

export const BehaviorOptionsPart = () => {
  const { settings } = uiStatusModel;

  return (
    <div css={cssBehaviorOptionsPart}>
      <CheckBoxLine
        text="Show Layers Dynamic"
        checked={settings.showLayersDynamic}
        setChecked={fieldSetter(settings, 'showLayersDynamic')}
        hint="デバイスのレイヤ状態に同期して表示するレイヤを切り替えます。"
      />
      <CheckBoxLine
        text="Show Fallback Assigns"
        checked={settings.showLayerDefaultAssign}
        setChecked={fieldSetter(settings, 'showLayerDefaultAssign')}
        hint="レイヤのデフォルトアサインを表示します。"
      />
    </div>
  );
};
