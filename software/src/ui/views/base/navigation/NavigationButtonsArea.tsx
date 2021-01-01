import { css } from 'goober';
import { makeNavigationViewModel } from '~ui/viewModels/NavigationViewModel';
import { NavigationButton } from './NavigationButton';
import { h } from '~qx';

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
