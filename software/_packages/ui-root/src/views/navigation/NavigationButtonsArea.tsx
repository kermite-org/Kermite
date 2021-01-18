import { css } from 'goober';
import { h } from 'qx';
import { makeNavigationViewModel } from '~/views/navigation/NavigationButtonArea.model';
import { NavigationButton } from '~/views/navigation/elements/NavigationButton';

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
        <NavigationButton key={entry.pageSig} {...entry} />
      ))}
    </div>
  );
};
