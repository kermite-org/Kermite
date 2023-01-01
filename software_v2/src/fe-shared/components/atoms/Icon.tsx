import { FC, jsx, css } from 'alumina';

interface Props {
  spec: string;
  size?: number;
  sizeMi?: number;
}

const style = (size?: number) => css`
  font-size: ${size ? `${size}px` : 'inherit'};
`;

export const Icon: FC<Props> = ({ spec, size, sizeMi }) =>
  spec.startsWith('fa ') || spec.startsWith('fas') || spec.startsWith('far') ? (
    <i class={[spec, style(size)]} />
  ) : (
    <i class={['material-icons', style(sizeMi || size)]}>{spec}</i>
  );
