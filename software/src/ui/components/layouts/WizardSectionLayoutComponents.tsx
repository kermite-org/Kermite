import { css, FC, jsx, AluminaChildren } from 'alumina';
import { colors } from '~/ui/base';

export const WizardSectionFrame: FC<{
  title: string;
  children: AluminaChildren;
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
    <div class={[style, inactive && '--inactive']}>
      <div class="title">{title}</div>
      <div class={['body', contentClassName]}>{children}</div>
    </div>
  );
};

export const WizardSectionPanel: FC<{
  title: string;
  children?: AluminaChildren;
}> = ({ title, children }) => {
  const style = css`
    background: ${colors.clPanelBox};
    padding: 7px;
    border: solid 1px ${colors.clPrimary};
    display: flex;
    flex-direction: column;

    > h2 {
      font-size: 16px;
      flex-shrink: 0;
    }

    > div {
      flex-grow: 1;
    }
  `;
  return (
    <div class={style}>
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
};

export const WizardSectionPanelWithCenterContent: FC<{
  title: string;
  children?: AluminaChildren;
  contentWidth: number;
  contentHeight: number;
}> = ({ title, children, contentWidth, contentHeight }) => {
  const style = css`
    background: ${colors.clPanelBox};
    border: solid 1px ${colors.clPrimary};
    display: flex;
    justify-content: center;
    align-items: center;
    > .content {
      width: ${contentWidth}px;
      height: ${contentHeight}px;
      padding: 7px;

      > h2 {
        font-size: 16px;
      }
    }

    overflow-y: auto;
  `;
  return (
    <div class={style}>
      <div class="content">
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
};
