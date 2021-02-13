import { css } from 'goober';
import { h } from 'qx';
import { Icon } from '~/ui-common/components';
import { NavigationEntryViewModel } from '~/ui-root/views/navigation/NavigationButtonsArea.model';

const cssNavigationButton = css`
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
`;

export const NavigationButton = (props: { vm: NavigationEntryViewModel }) => {
  const { iconSpec, pageName, isCurrent, onClick } = props.vm;
  return (
    <div onClick={onClick} css={cssNavigationButton} data-current={isCurrent}>
      <Icon spec={iconSpec} />
      <span>{pageName}</span>
    </div>
  );
};
