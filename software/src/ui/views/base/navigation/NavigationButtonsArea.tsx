import { css } from 'goober';
import { h } from '~lib/qx';
import { makeNavigationViewModel } from '~ui/viewModels/NavigationViewModel';
import { NavigationButton } from './NavigationButton';

const cssNavigationButtonsArea = css`
  margin-top: 10px;

  > * + * {
    margin-top: 5px;
  }
`;

export const NavigationButtonsArea = () => {
  const vm = makeNavigationViewModel();
  return (
    <div css={cssNavigationButtonsArea}>
      {vm.entries.map((entry) => (
        <NavigationButton vm={entry} key={entry.pageSig} />
      ))}
    </div>
  );
};
