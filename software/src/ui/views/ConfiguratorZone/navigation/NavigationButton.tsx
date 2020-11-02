import { css } from 'goober';
import { h } from '~lib/qx';
import { models } from '~ui/models';
import { PageSignature } from '~ui/models/UiStatusModel';

export const NavigationButton = (props: {
  faIconName: string;
  pageSig: PageSignature;
}) => {
  const { faIconName, pageSig } = props;
  const { settings } = models.uiStatusModel;
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
