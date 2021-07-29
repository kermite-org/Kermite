import { jsx, css } from 'qx';
import { Icon } from '~/ui/components';

export function SectionHeaderText(props: {
  text: string;
  icon: string;
  hint?: string;
}) {
  const cssSectionHeader = css`
    display: flex;
    align-items: center;
    padding: 6px 4px 4px;
    font-size: 18px;
  `;
  return (
    <div css={cssSectionHeader} data-hint={props.hint}>
      <Icon spec={props.icon} size={20} />
      <span>{props.text}</span>
    </div>
  );
}
