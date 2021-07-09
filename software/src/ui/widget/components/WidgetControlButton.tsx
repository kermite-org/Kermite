import { css, FC, jsx } from 'qx';

type Props = {
  className?: string;
  iconSpec: string;
  onClick: () => void;
};

export const WidgetControlButton: FC<Props> = ({
  className,
  iconSpec,
  onClick,
}) => {
  return (
    <div css={style} className={className} onClick={onClick}>
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
  font-size: 20px;
  background: #888;

  &:hover {
    background: #0cf;
  }
`;
