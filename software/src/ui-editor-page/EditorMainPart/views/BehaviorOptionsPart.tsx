import { css } from 'goober';
import { h } from 'qx';
import { fieldSetter } from '~/ui-common';
import { uiStatusModel } from '~/ui-common/sharedModels/UiStatusModel';
import { CheckboxLine } from '~/ui-editor-page/components/fabrics/CheckboxLine';

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
      <CheckboxLine
        text="Show Layers Dynamic"
        checked={settings.showLayersDynamic}
        setChecked={fieldSetter(settings, 'showLayersDynamic')}
      />
      <CheckboxLine
        text="Show Fallback Assigns"
        checked={settings.showLayerDefaultAssign}
        setChecked={fieldSetter(settings, 'showLayerDefaultAssign')}
      />
    </div>
  );
};
