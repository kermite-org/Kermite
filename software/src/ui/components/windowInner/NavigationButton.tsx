import { jsx, css, FC } from 'alumina';
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
  <div
    onClick={onClick}
    css={style}
    class={isCurrent && '--active'}
    data-hint={hint}
  >
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
  color: #fff8;
  cursor: pointer;
  position: relative;

  &:before {
    display: block;
    position: absolute;
    content: '';
    width: 3px;
    left: 0;
    top: 0;
    bottom: 0;
    margin: auto 0;
    background: #fc0;
    height: 0;
    transition: all 0.15s;
  }

  > i {
    font-size: 22px;
  }

  > span {
    margin-top: 2px;
    font-size: 9px;
  }

  &:hover {
    color: #fffc;
  }

  &.--active {
    color: #fff;
    background: #fff2;

    &:before {
      height: 100%;
    }
  }

  transition: all 0.3s;
`;
