import { css, FC, jsx, QxChildren } from 'qx';

export const FieldItem: FC<{
  title: string;
  children: QxChildren;
  indent?: boolean;
}> = ({ title, children, indent }) => {
  const styleChildren = css`
    display: flex;
    align-items: center;
    gap: 5px;
  `;
  return (
    <tr>
      <td style={(indent && 'padding-left:15px') || ''}>{title}</td>
      <td>
        <div css={styleChildren}>{children}</div>
      </td>
    </tr>
  );
};
