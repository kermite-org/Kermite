import { css } from 'goober';
import { h } from 'qx';

export function SectionHeaderText(props: { text: string }) {
  const cssSectionHeader = css`
    padding: 6px;
  `;
  return <div css={cssSectionHeader}>{props.text}</div>;
}