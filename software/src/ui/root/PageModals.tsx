import { FC, jsx } from 'qx';
import { uiState } from '~/ui/store';

export const PageModals: FC = () => {
  const { pageModalSpec: modalSpec } = uiState;
  if (modalSpec) {
    return <div></div>;
  }
  return null;
};
