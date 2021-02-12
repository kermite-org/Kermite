import { css } from 'goober';
import { FC, h, Hook } from 'qx';
import { uiTheme } from '~/ui-common';
import { Icon } from '~/ui-common/components';

type Props = {
  headerText: string;
  children: any;
};

const style = css`
  > .header {
    display: flex;
    align-items: center;

    background: ${uiTheme.colors.clPrimary};
    border: solid 1px ${uiTheme.colors.clPrimary};
    color: ${uiTheme.colors.clDecal};
    padding: 2px 0;
    padding-left: 3px;
    font-size: 16px;

    > .caption {
      margin-left: 1px;
    }

    > .spacer {
      flex-grow: 1;
    }

    > .arrowBox {
      width: 20px;
      height: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 24px;
      cursor: pointer;
    }
  }

  > .body {
    border: solid 1px ${uiTheme.colors.clPrimary};
    border-top: none;
    padding: 6px 8px;
    > * + * {
      margin-top: 5px;
    }
  }
`;

export const ConfigPanelBox: FC<Props> = ({ headerText, children }) => {
  const [isOpen, setIsOpen] = Hook.useState(true);
  const toggleIsOpen = () => setIsOpen(!isOpen);

  return (
    <div css={style}>
      <div class="header">
        <Icon spec="article" />
        <span class="caption">{headerText}</span>
        <div class="spacer" />
        <div onClick={toggleIsOpen} class="arrowBox">
          <Icon spec={isOpen ? 'expand_less' : 'expand_more'} />
        </div>
      </div>
      <div class="body" qxIf={isOpen}>
        {children}
      </div>
    </div>
  );
};
