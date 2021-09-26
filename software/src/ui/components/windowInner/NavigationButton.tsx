import { jsx, css, FC } from 'qx';
import { uiTheme } from '~/ui/base';
import { PagePaths } from '~/ui/commonModels';
import { Icon } from '~/ui/components/atoms';

type Props = {
  vm: {
    pagePath: PagePaths;
    pageName: string;
    iconSpec: string;
    isCurrent: boolean;
    onClick: () => void;
    hint: string;
  };
};

export const NavigationButton: FC<Props> = ({
  vm: { iconSpec, pageName, isCurrent, onClick, hint },
}) => (
  <div onClick={onClick} css={style} data-current={isCurrent} data-hint={hint}>
    <Icon spec={iconSpec} />
    <span>{pageName}</span>
  </div>
);

const style = css`
  width: 100%;
  height: 45px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;

  > i {
    font-size: 24px;
  }

  > span {
    font-size: 10px;
  }

  &[data-current] {
    color: #fff;
    background: #fff3;
  }
  &:hover {
    color: #fff;
  }

  transition: ${uiTheme.commonTransitionSpec};
`;
