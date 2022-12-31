import { FC, jsx, AluminaNode } from 'alumina';
// import { uiActions } from '~/ui/store';

type Props = {
  to?: string;
  children?: AluminaNode;
};
export const LinkButton: FC<Props> = ({ to, children }) => (
  // <button onClick={() => uiActions.navigateTo(to as any)}>{children}</button>
  <button>{children}</button>
);
