import { css, FC, jsx } from 'alumina';
import { Icon } from '~/ui/components/atoms';

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
}) => (
  <div
    css={style}
    className={className}
    onClick={onClick}
    data-active={isActive}
  >
    <Icon spec={iconSpec} size={16} sizeMi={21} />
  </div>
);

const style = css`
  color: #fff;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background: #888;

  &[data-active] {
    background: #0af;
  }

  &:hover {
    background: #0cf;
  }
`;
