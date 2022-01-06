import { FC, jsx, AluminaNode } from 'alumina';
import { uiActions } from '~/ui/store';

type Props = {
  to?: string;
  children?: AluminaNode;
  extraCss?: string;
};
export const LinkButton: FC<Props> = ({ extraCss, to, children }) => (
  <button class={extraCss} onClick={() => uiActions.navigateTo(to as any)}>
    {children}
  </button>
);
