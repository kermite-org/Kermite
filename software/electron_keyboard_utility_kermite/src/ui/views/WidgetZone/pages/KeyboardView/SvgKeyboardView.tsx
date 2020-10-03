import { css } from 'goober';
import { h } from '~lib/qx';
import { linerInterpolateValue } from '~funcs/Utils';
import { editorModel } from '~ui/models';
import { WidgetKeyUnitCardsPart } from './KeyUnitCardsPart';

export function SvgKeyboardView() {
  const cssSvg = css``;

  const winw = window.innerWidth;

  const sw = linerInterpolateValue(winw, 200, 900, 0.8, 0.3, true);

  const { keyboardShape } = editorModel.profileData;

  return (
    <svg width="600" height="240" css={cssSvg} viewBox="-300 -120 600 240">
      <g
        transform="scale(2) translate(0, -53.5)"
        stroke-width={sw}
        stroke-linejoin="round"
      >
        <path d={keyboardShape.bodyPathMarkupText} stroke="#003" fill="#89C" />
        <WidgetKeyUnitCardsPart />
      </g>
    </svg>
  );
}
