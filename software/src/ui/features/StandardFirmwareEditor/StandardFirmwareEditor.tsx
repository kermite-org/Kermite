import { FC, jsx } from 'qx';
import { IKermiteStandardKeyboardSpec } from '~/shared';

export type Props = {
  firmwareConfig: IKermiteStandardKeyboardSpec | undefined;
  saveHandler(firmwareConfig: IKermiteStandardKeyboardSpec): void;
};

export const StandardFirmwareEditor: FC<Props> = ({ firmwareConfig }) => (
  <div>
    standard firmware editor
    {JSON.stringify(firmwareConfig)}
  </div>
);
