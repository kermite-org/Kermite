import { css, FC, jsx, QxChildren } from 'qx';
import { colors } from '~/ui/base';

export const SectionFrame: FC<{
  title: string;
  children: QxChildren;
  inactive?: boolean;
  contentClassName?: string;
}> = ({ title, children, inactive, contentClassName }) => {
  const style = css`
    border: solid 1px ${colors.clPrimary};
    padding: 5px;

    &.--inactive {
      opacity: 0.5;
      pointer-events: none;
    }
  `;
  return (
    <div css={style} class={inactive && '--inactive'}>
      <div class="title">{title}</div>
      <div classNames={['body', contentClassName]}>{children}</div>
    </div>
  );
};

export const SectionPanel: FC<{ title: string; children?: QxChildren }> = ({
  title,
  children,
}) => {
  const style = css`
    background: ${colors.clPanelBox};
    padding: 7px;
    border: solid 1px ${colors.clPrimary};

    > h2 {
      font-size: 16px;
    }
    overflow-y: auto;
  `;
  return (
    <div class={style}>
      <h2>{title}</h2>
      {children}
    </div>
  );
};
