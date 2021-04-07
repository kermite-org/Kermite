import { jsx, css } from 'qx';
import { fieldSetter, texts } from '~/ui/common';
import { CheckBoxLine } from '~/ui/common/components';
import { uiStatusModel } from '~/ui/common/sharedModels/UiStatusModel';

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
        text={texts.label_assigner_configs_showLayersDynamic}
        checked={settings.showLayersDynamic}
        setChecked={fieldSetter(settings, 'showLayersDynamic')}
        hint={texts.hint_assigner_configs_showLayersDynamic}
      />
      <CheckBoxLine
        text={texts.label_assigner_configs_showFallbackAssigns}
        checked={settings.showLayerDefaultAssign}
        setChecked={fieldSetter(settings, 'showLayerDefaultAssign')}
        hint={texts.hint_assigner_configs_showFallbackAssigns}
      />
    </div>
  );
};
