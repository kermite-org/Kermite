import { jsx, css } from 'qx';
import { uiTheme, uiStatusModel, GlobalHintDisplayText } from '~/ui/common';
import { GlobalHintIconButton } from '~/ui/root/views/titleBar/elements/GlobalHintIconButton';

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
