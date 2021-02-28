import { FC, h, css } from 'qx';

interface IButtonBase {
  onClick?(): void;
  disabled?: boolean;
  extraCss?: string;
  className?: string;
  children?: any;
  active?: boolean;
  hint?: string;
}

const baseCss = css`
  font-size: 15px;
  cursor: pointer;
  user-select: none;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    opacity: 0.7;
  }

  &.disabled {
    pointer-events: none;
    cursor: inherit;
    opacity: 0.5;
  }
`;

export const ButtonBase: FC<IButtonBase> = ({
  onClick,
  disabled,
  extraCss,
  className,
  children,
  active,
  hint,
}) => (
  <div
    classNames={[
      baseCss,
      extraCss,
      (disabled && 'disabled') || undefined,
      (active && 'active') || undefined,
      className,
    ]}
    onClick={onClick}
    data-hint={hint}
  >
    {children}
  </div>
);
