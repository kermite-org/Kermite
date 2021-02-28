import { h, css } from 'qx';
import { makeNavigationViewModel } from '~/ui-root/views/navigation/NavigationButtonsArea.model';
import { NavigationButton } from './elements/NavigationButton';

const cssNavigationButtonsArea = css`
  width: 100%;
`;

export const NavigationButtonsArea = () => {
  const vm = makeNavigationViewModel();
  return (
    <div css={cssNavigationButtonsArea}>
      {vm.entries.map((entry) => (
        <NavigationButton vm={entry} key={entry.pagePath} />
      ))}
    </div>
  );
};
