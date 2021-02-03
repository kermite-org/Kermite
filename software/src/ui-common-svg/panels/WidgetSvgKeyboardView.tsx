import { css } from 'goober';
import { h } from 'qx';
import { IDisplayKeyboardDesign, linerInterpolateValue } from '~/shared';
import { IWidgetKeyUnitCardsPartViewModel } from '~/ui-common-svg/KeyUnitCardsPart/WidgetKeyUnitCardsPartViewModel';
import { KeyboardBodyShape } from '~/ui-common-svg/keyboardBody/KeyboardBodyShape';
import { WidgetKeyUnitCardsPart } from '../KeyUnitCardsPart/WidgetKeyUnitCardsPart';

export function WidgetSvgKeyboardView(props: {
  keyboardDesign: IDisplayKeyboardDesign;
  cardsPartVM: IWidgetKeyUnitCardsPartViewModel;
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
          outlineShapes={props.keyboardDesign.outlineShapes}
          fillColor={'#89C'}
          strokeColor={'rgb(0, 0, 51)'}
        />
        <WidgetKeyUnitCardsPart vm={props.cardsPartVM} />
      </g>
    </svg>
  );
}
