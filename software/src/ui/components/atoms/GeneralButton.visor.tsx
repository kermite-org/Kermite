import { jsx } from 'alumina';
import { GeneralButton } from '~/ui/components/atoms/GeneralButton';

export const GeneralButtonExamples = {
  basic: <GeneralButton text="test" />,
  withIcon: <GeneralButton text="delete" icon="fa fa-trash" />,
  smallSquare: <GeneralButton icon="fa fa-link" size="unitSquare" />,
  smallSquareDisabled: (
    <GeneralButton icon="fa fa-link" disabled size="unitSquare" />
  ),
  ok: <GeneralButton text="OK" size="unit" />,
  multiWords: <GeneralButton text="Hello World !!" size="unit" />,
  large: <GeneralButton text="Edit this" size="large" />,
};
