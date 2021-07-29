import { jsx, css } from 'qx';
import { uiTheme, GlobalHintDisplayText } from '~/ui/base';
import { uiStatusModel } from '~/ui/commonModels';
import { GlobalHintIconButton } from '~/ui/components';

export const WindowStatusBarSection = () => {
  const { settings } = uiStatusModel;
  const showHint = settings.showGlobalHint;
  const toggleShowHint = () =>
    (settings.showGlobalHint = !settings.showGlobalHint);

  return (
    <div css={style}>
      <GlobalHintIconButton isActive={showHint} onClick={toggleShowHint} />
      <GlobalHintDisplayText qxIf={showHint} />
    </div>
  );
};

const style = css`
  font-size: 14px;
  color: ${uiTheme.colors.clDecal};
  display: flex;
  align-items: center;
  height: 100%;
  margin-left: 4px;
  > :nth-child(2) {
    margin-left: 2px;
  }
`;
