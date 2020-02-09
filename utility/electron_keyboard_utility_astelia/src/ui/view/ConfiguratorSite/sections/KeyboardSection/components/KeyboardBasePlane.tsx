import { css, jsx } from '@emotion/core';
import React from 'react';

export const KeyboardBasePlane = (props: {
  children: React.ReactNode;
  clearAssignSlotSelection(): void;
}) => {
  const { children, clearAssignSlotSelection } = props;

  const cssSvg = css`
    user-select: none;
  `;

  return (
    <svg
      width="600"
      height="240"
      viewBox="-300 -120 600 240"
      css={cssSvg}
      onClick={clearAssignSlotSelection}
    >
      <g
        transform="scale(2) translate(0, -53.5)"
        strokeWidth={0.3}
        strokeLinejoin="round"
      >
        {children}
      </g>
    </svg>
  );
};
