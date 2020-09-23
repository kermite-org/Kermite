import { css } from 'goober';
import { PageSignature } from '~ui/models/UiStatusModel';
import { appDomain } from '~ui/models/zAppDomain';
import { h } from '~lib/qx';

const NavigationButton = (props: {
  faIconName: string;
  pageSig: PageSignature;
}) => {
  const { faIconName, pageSig } = props;
  const { settings } = appDomain.uiStatusModel;
  const isCurrent = settings.page === pageSig;

  const onClick = () => {
    settings.page = pageSig;
  };

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
