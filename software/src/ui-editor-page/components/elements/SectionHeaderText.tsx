import { css } from 'goober';
import { h } from 'qx';
import { Icon } from '~/ui-common/components';

export function SectionHeaderText(props: { text: string; icon: string }) {
  const cssSectionHeader = css`
    display: flex;
    align-items: center;
    padding: 6px 4px 4px;
    font-size: 18px;
  `;
  return (
    <div css={cssSectionHeader}>
      <Icon spec={props.icon} size={20} />
      <span>{props.text}</span>
    </div>
  );
}
