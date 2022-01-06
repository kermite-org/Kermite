import { FC, jsx, css, useState, AluminaChildren } from 'alumina';
import { colors } from '~/ui/base';
import { Icon } from '~/ui/components/atoms';

type Props = {
  headerText: string;
  children: AluminaChildren;
  canToggleOpen?: boolean;
  initialOpen?: boolean;
};

export const ConfigPanelBox: FC<Props> = ({
  headerText,
  children,
  canToggleOpen = false,
  initialOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const toggleIsOpen = () => setIsOpen(!isOpen);

  return (
    <div class={style}>
      <div class="header">
        <Icon spec="article" />
        <span class="caption">{headerText}</span>
        <div class="spacer" />
        <div onClick={toggleIsOpen} class="arrowBox" if={canToggleOpen}>
          <Icon spec={isOpen ? 'expand_less' : 'expand_more'} />
        </div>
      </div>
      <div class="body" if={isOpen}>
        {children}
      </div>
    </div>
  );
};

const style = css`
  > .header {
    display: flex;
    align-items: center;

    background: ${colors.clPrimary};
    border: solid 1px ${colors.clPrimary};
    color: ${colors.clDecal};
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
    border: solid 1px ${colors.clPrimary};
    border-top: none;
    padding: 6px 8px;
    > * + * {
      margin-top: 5px;
    }
  }
`;
