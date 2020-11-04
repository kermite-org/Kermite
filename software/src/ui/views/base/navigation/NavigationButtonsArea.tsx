import { css } from 'goober';
import { h } from '~lib/qx';
import { NavigationViewModel } from '~ui/viewModels/NavigationViewModel';
import { NavigationButton } from './NavigationButton';

export const NavigationButtonsArea = (props: { vm: NavigationViewModel }) => {
  const cssNavigationButtonsArea = css`
    margin-top: 10px;

    > * + * {
      margin-top: 5px;
    }
  `;

  return (
    <div css={cssNavigationButtonsArea}>
      {props.vm.entries.map((entry) => (
        <NavigationButton vm={entry} key={entry.pageSig} />
      ))}
    </div>
  );
};
