import { css } from 'goober';
import { h } from '~lib/qx';
import { linerInterpolateValue } from '~funcs/Utils';
import { IWidgetKeyboardViewViewModel } from '~ui/viewModels/WidgetMainPageViewModel';
import { WidgetKeyUnitCardsPart } from '../organisms/WidgetKeyUnitCardsPart';

export function WidgetSvgKeyboardView({
  vm
}: {
  vm: IWidgetKeyboardViewViewModel;
}) {
  const cssSvg = css``;
  const winw = window.innerWidth;
  const sw = linerInterpolateValue(winw, 200, 900, 0.8, 0.3, true);

  return (
    <svg width="600" height="240" css={cssSvg} viewBox="-300 -120 600 240">
      <g
        transform="scale(2) translate(0, -53.5)"
        stroke-width={sw}
        stroke-linejoin="round"
      >
        <path
          d={vm.keyboardShape.bodyPathMarkupText}
          stroke="#003"
          fill="#89C"
        />
        <WidgetKeyUnitCardsPart vm={vm.cardsPartVM} />
      </g>
    </svg>
  );
}
