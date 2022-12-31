import { css, jsx } from 'alumina';
import { degToRad } from '~/app-shared';
import { getIsoEnterSvgPathSpecText, getKeySize } from '~/app-shared-2';
import { colors, uiTheme } from '~/fe-shared';
import { IPosition, startDragSession } from '../../../common';
import {
  IEditKeyEntity,
  editMutations,
  editReader,
  getKeyIdentifierText,
  unitValueToMm,
} from '../../../models';

export function startKeyEntityDragOperation(
  e: MouseEvent,
  isMirror: boolean,
  completeCallback: () => void,
) {
  const { sight, currentKeyEntity: ck, coordUnit } = editReader;

  if (!ck) {
    return;
  }

  const [kx, ky] = unitValueToMm(ck.x, ck.y, coordUnit);
  const destPos = { x: kx, y: ky };

  const moveCallback = (pos: IPosition, prevPos: IPosition) => {
    const deltaX = (pos.x - prevPos.x) * sight.scale;
    const deltaY = (pos.y - prevPos.y) * sight.scale;

    const mirrorMultX = isMirror ? -1 : 1;
    const group = editReader.getTransGroupById(ck.groupId);
    const theta = -degToRad(group?.angle || 0) * mirrorMultX;

    const deltaXM = deltaX * Math.cos(theta) - deltaY * Math.sin(theta);
    const deltaYM = deltaX * Math.sin(theta) + deltaY * Math.cos(theta);
    destPos.x += deltaXM * mirrorMultX;
    destPos.y += deltaYM;

    editMutations.setKeyPosition(destPos.x, destPos.y);
  };

  startDragSession(e, moveCallback, completeCallback);
}

const cssKeyRect = css`
  stroke-width: 0.5;
  fill: ${colors.clLayouterKeyFace};
  stroke: ${colors.clLayouterKeyEdge};
  cursor: pointer;

  &[data-selected] {
    stroke: #4bb;
  }

  &[data-pressed] {
    fill: #0f03;
  }

  &[data-ghost] {
    opacity: 0.3;
  }

  &:hover {
    opacity: 0.7;
  }

  transition: ${uiTheme.commonTransitionSpec};
`;

const cssText = css`
  text-anchor: middle;
  dominant-baseline: central;
  user-select: none;
  pointer-events: none;
  fill: ${colors.clLayouterKeyLegend};
  &[data-selected] {
    fill: #4bb;
  }
  transition: ${uiTheme.commonTransitionSpec};
`;

const KeyEntityCardSingle = (props: {
  ke: IEditKeyEntity;
  isMirror: boolean;
}) => {
  const { ke, isMirror } = props;
  const mirrorMultX = isMirror ? -1 : 1;

  const onMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      let { editMode } = editReader;

      if (editMode === 'shape') {
        editMutations.setEditMode('move');
        editMode = 'move';
      }

      if (editMode === 'select') {
        editMutations.setCurrentKeyEntity(ke.id, isMirror);
        editMutations.setCurrentPointIndex(-1);
        e.stopPropagation();
      } else if (editMode === 'move') {
        editMutations.setCurrentKeyEntity(ke.id, isMirror);
        editMutations.setCurrentPointIndex(-1);
        editMutations.startKeyEdit(true);
        startKeyEntityDragOperation(e, isMirror, () => {
          editMutations.endKeyEdit();
        });
        e.stopPropagation();
      } else if (editMode === 'key') {
        editMutations.setCurrentKeyEntity(ke.id, isMirror);
        editMutations.setCurrentPointIndex(-1);
        editMutations.startKeyEdit(true);
        startKeyEntityDragOperation(e, isMirror, () => {
          editMutations.endKeyEdit();
        });
        e.stopPropagation();
      } else if (editMode === 'delete') {
        editMutations.setCurrentKeyEntity(ke.id, isMirror);
        editMutations.deleteCurrentKeyEntity();
      }
    }
  };

  const isSelected =
    ke.id === editReader.currentKeyEntity?.id &&
    editReader.isCurrentKeyMirror === isMirror;
  const isGhost = ke === editReader.ghost;

  const { coordUnit, sizeUnit, placementAnchor, showKeyId, showKeyIndex } =
    editReader;

  const x = coordUnit.mode === 'KP' ? ke.x * coordUnit.x : ke.x;
  const y = coordUnit.mode === 'KP' ? ke.y * coordUnit.y : ke.y;

  const showBoth = showKeyId && showKeyIndex;

  const keyIndex = isMirror ? ke.mirrorKeyIndex : ke.keyIndex;

  const isPressed = editReader.pressedKeyIndices.includes(keyIndex);

  const identifierText = getKeyIdentifierText(
    ke,
    isMirror,
    editReader.isManualKeyIdMode,
  );

  const idTextsTransformSpec = `scale(0.2)`;
  const idTexts = (
    <g transform={idTextsTransformSpec}>
      <text
        y={showBoth ? -10 : 0}
        class={cssText}
        if={showKeyId && !isGhost}
        data-selected={isSelected}
      >
        {identifierText}
      </text>
      <text
        y={showBoth ? 10 : 0}
        class={cssText}
        if={showKeyIndex && !isGhost}
        data-selected={isSelected}
      >
        {keyIndex === -1 ? '--' : keyIndex}
      </text>
    </g>
  );

  const group = editReader.getTransGroupById(ke.groupId);

  const ox = (group ? group.x : 0) * mirrorMultX;
  const oy = group ? group.y : 0;
  const orot = (group ? group.angle : 0) * mirrorMultX;

  const x2 = x * mirrorMultX;
  const angle2 = ke.angle * mirrorMultX;

  let x3 = x2;
  let y3 = y;

  const [keyW, keyH] = getKeySize(ke.shape, sizeUnit);

  if (placementAnchor === 'topLeft') {
    x3 += (keyW / 2 + 0.5) * mirrorMultX;
    y3 += keyH / 2 + 0.5;
    if (ke.shape === 'ext isoEnter') {
      x3 -= 2.1 * mirrorMultX;
      if (!isMirror) {
        x3 += 19.05 / 4;
      }
    }
  }

  const outerTransformSpec = `translate(${ox}, ${oy}) rotate(${orot}) translate(${x3}, ${y3}) rotate(${angle2})`;

  // if (ke.shape === 'ext circle') {
  //   return (
  //     <g transform={outerTransformSpec}>
  //       <circle
  //         cx={0}
  //         cy={0}
  //         r={9}
  //         class={cssKeyRect}
  //         data-selected={isSelected}
  //         data-ghost={isGhost}
  //         onMouseDown={onMouseDown}
  //       />
  //       {idTexts}
  //     </g>
  //   );
  // }

  if (ke.shape === 'ext isoEnter') {
    return (
      <g transform={outerTransformSpec}>
        <path
          d={getIsoEnterSvgPathSpecText('center')}
          class={cssKeyRect}
          data-selected={isSelected}
          data-ghost={isGhost}
          data-pressed={isPressed}
          onPointerDown={onMouseDown}
        />
        {idTexts}
      </g>
    );
  }

  return (
    <g transform={outerTransformSpec}>
      <rect
        x={-keyW / 2}
        y={-keyH / 2}
        width={keyW}
        height={keyH}
        class={cssKeyRect}
        data-selected={isSelected}
        data-ghost={isGhost}
        data-pressed={isPressed}
        onPointerDown={onMouseDown}
      />
      {idTexts}
    </g>
  );
};

export const KeyEntityCard = ({ ke }: { ke: IEditKeyEntity }) => {
  const group = editReader.getTransGroupById(ke.groupId);
  if (group?.mirror) {
    return (
      <g>
        <KeyEntityCardSingle ke={ke} isMirror={false} />
        <KeyEntityCardSingle ke={ke} isMirror={true} />
      </g>
    );
  } else {
    return (
      <g>
        <KeyEntityCardSingle ke={ke} isMirror={false} />
      </g>
    );
  }
};
