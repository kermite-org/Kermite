import { css, FC, jsx } from 'qx';
import { texts } from '~/ui/base';
import { uiStatusModel } from '~/ui/commonModels';
import { CheckBoxLine } from '~/ui/components';
import { fieldSetter } from '~/ui/helpers';

const style = css`
  margin: 0 5px;
  > div + div {
    margin-top: 2px;
  }
`;

export const BehaviorOptionsPartB: FC = () => {
  const { settings } = uiStatusModel;

  return (
    <div css={style}>
      <CheckBoxLine
        text={texts.label_assigner_configs_showFallbackAssigns}
        checked={settings.showLayerDefaultAssign}
        setChecked={fieldSetter(settings, 'showLayerDefaultAssign')}
        hint={texts.hint_assigner_configs_showFallbackAssigns}
      />
    </div>
  );
};
