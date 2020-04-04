import { css } from 'goober';
import {
  IAssignOperation,
  ISingleAssignEntry,
  IKeyUnitPositionEntry,
} from '~defs/ProfileData';
import { VirtualKeyTexts } from '~defs/VirtualKeyTexts';
import { editorModel } from '~models/AppModel';
import { hx } from '~views/basis/qx';
import { UiTheme } from '~views/common/UiTheme';

function getAssignOperationText(op?: IAssignOperation): string {
  if (op?.type === 'keyInput' && op.virtualKey !== 'K_NONE') {
    return VirtualKeyTexts[op.virtualKey] || '';
  }
  if (op?.type === 'layerCall') {
    const layer = editorModel.profileModel.layers.find(
      (la) => la.layerId === op.targetLayerId
    );
    return (layer && layer.layerName) || '';
  }
  if (op?.type === 'modifierCall') {
    return VirtualKeyTexts[op.modifierKey] || '';
  }
  return '';
}

function getAssignEntryTexts(
  assign?: ISingleAssignEntry
): { primaryText: string; secondaryText: string } {
  if (assign) {
    // if (assign.type === 'single1' && assign.op) {
    //   return {
    //     primaryText: getAssignOperationText(assign.op),
    //     secondaryText: ''
    //   };
    // }
    if (assign.type === 'single2') {
      return {
        primaryText: getAssignOperationText(assign.primaryOp),
        secondaryText:
          assign.mode === 'dual'
            ? getAssignOperationText(assign.secondaryOp)
            : '',
      };
    }
  }
  return {
    primaryText: '',
    secondaryText: '',
  };
}

function makeKeyUnitViewModel(kp: IKeyUnitPositionEntry) {
  const keyUnitId = kp.id;
  const pos = { x: kp.x, y: kp.y, r: kp.r };
  const isCurrent = false; ///editorModel.currentKeyUnitId === keyUnitId;
  const setCurrent = () => {
    // editorModel.setCurrentKeyUnit(keyUnitId);
  };

  const curLayerId = 'la0'; //editorModel.currentLayerId
  const assign = editorModel.profileModel.assigns[`${curLayerId}.${keyUnitId}`];
  const { primaryText, secondaryText } = getAssignEntryTexts(assign);

  return {
    keyUnitId,
    pos,
    isCurrent,
    setCurrent,
    primaryText,
    secondaryText,
  };
}

export function KeyUnitCard({ kp }: { kp: IKeyUnitPositionEntry }) {
  const {
    keyUnitId,
    pos,
    isCurrent,
    setCurrent,
    primaryText,
    secondaryText,
  } = makeKeyUnitViewModel(kp);

  const cssKeyRect = css`
    cursor: pointer;
    fill: rgba(0, 0, 0, 0.5);
    &[data-current='true'] {
      fill: ${UiTheme.clSelectHighlight};
    }
  `;

  const cssKeyText = css`
    fill: #fff;
    pointer-events: none;
  `;

  const onMouseDown = (e: MouseEvent) => {
    setCurrent();
    e.stopPropagation();
  };

  const getFontSize = (text: string) => {
    if (text.length <= 3) {
      return '8px';
    } else {
      return '5px';
    }
  };

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.r}) `}
      key={keyUnitId}
    >
      <rect
        x={-9}
        y={-9}
        width={18}
        height={18}
        css={cssKeyRect}
        data-current={isCurrent}
        onMouseDown={onMouseDown}
      />
      <text
        css={cssKeyText}
        x={0}
        y={0}
        font-size={getFontSize(primaryText)}
        text-anchor="middle"
        dominant-baseline="center"
      >
        {primaryText}
      </text>

      <text
        css={cssKeyText}
        x={0}
        y={8}
        font-size={getFontSize(secondaryText)}
        text-anchor="middle"
        dominant-baseline="center"
      >
        {secondaryText}
      </text>
    </g>
  );
}

export function KeyUnitCardsPart() {
  return (
    <g>
      {editorModel.profileModel.keyboardShape.keyPositions.map((kp) => (
        <KeyUnitCard kp={kp} />
      ))}
    </g>
  );
}
