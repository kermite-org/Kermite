import { jsx, css } from 'alumina';
import { colors } from '~/fe-shared';
import { ButtonBase, Icon } from '../atoms';

export const SmallSymbolicActionButton = (props: {
  onClick?(): void;
  disabled?: boolean;
  icon: string;
}) => {
  const style = css`
    width: 20px;
    height: 20px;
    color: ${colors.clPrimary};
    font-size: 20px;
  `;
  return (
    <ButtonBase onClick={props.onClick} disabled={props.disabled} class={style}>
      <Icon spec={props.icon} />
    </ButtonBase>
  );
};

export const OperationButtonWithIcon = (props: {
  onClick?(): void;
  disabled?: boolean;
  icon: string;
  label: string;
  hint?: string;
}) => {
  const style = css`
    color: ${colors.clPrimary};
    font-size: 20px;
    font-weight: bold;
    > i {
      font-size: 24px;
    }
  `;
  return (
    <ButtonBase
      onClick={props.onClick}
      disabled={props.disabled}
      class={style}
      hint={props.hint}
    >
      <Icon spec={props.icon} />
      <span>{props.label}</span>
    </ButtonBase>
  );
};

export const OperationButtonOnlyIcon = (props: {
  onClick?(): void;
  disabled?: boolean;
  icon: string;
}) => {
  const style = css`
    color: ${colors.clPrimary};
    font-size: 28px;
  `;
  return (
    <ButtonBase onClick={props.onClick} disabled={props.disabled} class={style}>
      <Icon spec={props.icon} />
    </ButtonBase>
  );
};
