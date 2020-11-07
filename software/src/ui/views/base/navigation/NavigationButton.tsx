import { css } from 'goober';
import { h } from '~lib/qx';
import { NavigationEntryViewModel } from '~ui/viewModels/NavigationViewModel';

export const NavigationButton = (props: { vm: NavigationEntryViewModel }) => {
  const { faIconName, isCurrent, onClick } = props.vm;

  const cssNavigationButton = css`
    color: rgba(255, 255, 255, 0.5);
    font-size: 30px;
    cursor: pointer;

    &[data-current] {
      color: #fff;
    }
  `;

  return (
    <div onClick={onClick} css={cssNavigationButton} data-current={isCurrent}>
      <i class={`fa ${faIconName}`} />
    </div>
  );
};
