import { FC, jsx, css } from 'qx';

interface Props {
  spec: string;
  size?: number;
}

const style = (size?: number) => css`
  font-size: ${size ? `${size}px` : 'inherit'};
`;

export const Icon: FC<Props> = ({ spec, size }) =>
  spec.startsWith('fa ') ? (
    <i class={spec} css={style(size)} />
  ) : (
    <i class="material-icons" css={style(size)}>
      {spec}
    </i>
  );
