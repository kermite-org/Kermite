import { css, FC, jsx } from 'qx';

type Props = {
  className?: string;
  iconSpec: string;
  isActive?: boolean;
  onClick: () => void;
};

export const WidgetControlButton: FC<Props> = ({
  className,
  iconSpec,
  isActive,
  onClick,
}) => {
  return (
    <div
      css={style}
      className={className}
      onClick={onClick}
      data-active={isActive}
    >
      <i className={iconSpec} />
    </div>
  );
};

const style = css`
  color: #fff;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 16px;
  background: #888;

  &[data-active] {
    background: #0af;
  }

  &:hover {
    background: #0cf;
  }
`;
