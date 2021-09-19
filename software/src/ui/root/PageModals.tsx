import { FC, jsx } from 'qx';
import { uiState } from '~/ui/commonStore';

export const PageModals: FC = () => {
  const { pageModalSpec: modalSpec } = uiState;
  if (modalSpec) {
    return <div></div>;
  }
  return null;
};
