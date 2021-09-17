import { css, FC, jsx } from 'qx';
import { GlobalHintDisplayText, uiTheme } from '~/ui/base';
import { GlobalHintIconButton } from '~/ui/components';
import { commitUiSettings, uiState } from '~/ui/store';

export const GlobalHintDisplay: FC = () => {
  const { settings } = uiState;
  const showHint = settings.showGlobalHint;
  const toggleShowHint = () =>
    commitUiSettings({ showGlobalHint: !settings.showGlobalHint });
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
  > :nth-child(2) {
    margin-left: 2px;
  }
`;
