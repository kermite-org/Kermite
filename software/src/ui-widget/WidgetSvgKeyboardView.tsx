import { css } from 'goober';
import { h } from 'qx';
import { linerInterpolateValue } from '~/shared';
import { KeyboardBodyShape } from '~/ui-common/sharedViews/keyboardSvg/KeyboardBodyShape';
import { IWidgetKeyboardViewViewModel } from '~/ui-widget/WidgetMainPageViewModel';
import { WidgetKeyUnitCardsPart } from './WidgetKeyUnitCardsPart';

export function WidgetSvgKeyboardView({
  vm,
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
        <KeyboardBodyShape
          outlineShapes={vm.keyboardDesign.outlineShapes}
          fillColor={'#89C'}
          strokeColor={'rgb(0, 0, 51)'}
        />
        <WidgetKeyUnitCardsPart vm={vm.cardsPartVM} />
      </g>
    </svg>
  );
}
