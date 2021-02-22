import { css } from 'goober';
import { h } from 'qx';
import { uiTheme } from '~/ui-common';
import { GlobalHintDisplayText } from '~/ui-common/base/GlobalHint';
import { uiStatusModel } from '~/ui-common/sharedModels/UiStatusModel';
import { GlobalHintIconButton } from '~/ui-root/views/titleBar/elements/GlobalHintIconButton';

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
