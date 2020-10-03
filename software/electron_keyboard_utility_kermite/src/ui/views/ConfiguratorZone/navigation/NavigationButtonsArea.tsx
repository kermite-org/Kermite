import { css } from 'goober';
import { h } from '~lib/qx';
import { NavigationButton } from './NavigationButton';

export const NavigationButtonsArea = () => {
  const cssNavigationButtonsArea = css`
    margin-top: 10px;

    > * + * {
      margin-top: 5px;
    }
  `;

  return (
    <div css={cssNavigationButtonsArea}>
      <NavigationButton pageSig="editor" faIconName="fa-keyboard" />
      <NavigationButton pageSig="firmwareUpdation" faIconName="fa-microchip" />
      <NavigationButton pageSig="shapePreview" faIconName="fa-book" />
    </div>
  );
};
