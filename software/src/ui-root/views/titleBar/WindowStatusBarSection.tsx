import { css } from 'goober';
import { h } from 'qx';
import { uiTheme } from '~/ui-common';
import { GlobalHintDisplayText } from '~/ui-common/base/GlobalHint';
import { Icon } from '~/ui-common/components';

export const WindowStatusBarSection = () => {
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
  return (
    <div css={style}>
      <Icon spec="info" size={18} />
      <GlobalHintDisplayText />
    </div>
  );
};
