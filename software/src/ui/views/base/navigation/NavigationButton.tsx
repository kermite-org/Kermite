import { css } from 'goober';
import { NavigationEntryViewModel } from '~ui/viewModels/NavigationViewModel';
import { h } from '~qx';

const cssNavigationButton = css`
  color: rgba(255, 255, 255, 0.5);
  font-size: 30px;
  cursor: pointer;

  &[data-current] {
    color: #fff;
  }
`;

export const NavigationButton = (props: { vm: NavigationEntryViewModel }) => {
  const { faIconName, isCurrent, onClick } = props.vm;
  return (
    <div onClick={onClick} css={cssNavigationButton} data-current={isCurrent}>
      <i class={`fa ${faIconName}`} />
    </div>
  );
};
