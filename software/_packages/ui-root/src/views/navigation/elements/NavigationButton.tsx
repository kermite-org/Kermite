import { css } from 'goober';
import { h } from 'qx';

const cssNavigationButton = css`
  color: rgba(255, 255, 255, 0.5);
  font-size: 30px;
  cursor: pointer;

  &[data-current] {
    color: #fff;
  }
`;

export const NavigationButton = (props: {
  faIconName: string;
  isCurrent: boolean;
  onClick: () => void;
}) => {
  const { faIconName, isCurrent, onClick } = props;
  return (
    <div onClick={onClick} css={cssNavigationButton} data-current={isCurrent}>
      <i class={`fa ${faIconName}`} />
    </div>
  );
};
