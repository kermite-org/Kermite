import { FC, jsx, QxNode } from 'qx';
import { uiActions } from '~/ui/commonStore';

type Props = {
  className?: string;
  to?: string;
  children?: QxNode;
  extraCss?: string;
};
export const LinkButton: FC<Props> = ({
  className,
  extraCss,
  to,
  children,
}) => (
  <div
    css={extraCss}
    className={className}
    onClick={() => uiActions.navigateTo(to as any)}
  >
    {children}
  </div>
);
