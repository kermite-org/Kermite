import { FC, jsx, AluminaNode } from 'alumina';
import { uiActions } from '~/ui/store';

type Props = {
  className?: string;
  to?: string;
  children?: AluminaNode;
  extraCss?: string;
};
export const LinkButton: FC<Props> = ({
  className,
  extraCss,
  to,
  children,
}) => (
  <button
    css={extraCss}
    className={className}
    onClick={() => uiActions.navigateTo(to as any)}
  >
    {children}
  </button>
);
