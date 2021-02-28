import { FC, jsx, css } from 'qx';

interface Props {
  spec: string;
  size?: number;
}

const cssIcon = (size?: number) => css`
  font-size: ${size ? `${size}px` : 'inherit'};
`;

export const Icon: FC<Props> = ({ spec, size }) =>
  spec.startsWith('fa ') ? (
    <i class={spec} css={cssIcon(size)} />
  ) : (
    <i class="material-icons" css={cssIcon(size)}>
      {spec}
    </i>
  );
