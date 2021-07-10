import { jsx, css } from 'qx';
import { degToRad } from '~/shared';
import { getKeySize } from '~/shared/modules/PlacementUnitHelper';
import { uiTheme } from '~/ui/common';
import { IPosition, startDragSession } from '~/ui/layouter/common';
import {
  editMutations,
  editReader,
  IEditKeyEntity,
} from '~/ui/layouter/models';
import { getKeyIdentifierText } from '~/ui/layouter/models/DomainRelatedHelpers';
import { unitValueToMm } from '~/ui/layouter/models/PlacementUnitHelperEx';

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

// no shrink
// const isoEnterPathMarkupText = [
//   'M -16.625, -19',
//   'L -16.625, 0',
//   'L -11.875, 0',
//   'L -11.875, 19',
//   'L 11.875, 19',
//   'L 11.875, -19',
//   'z',
// ].join(' ');

// shrink 0.5
const isoEnterPathMarkupText = [
  'M -16.125, -18.5',
  'L -16.125, -0.5',
  'L -11.375, -0.5',
  'L -11.375, 18.5',
  'L 11.375, 18.5',
  'L 11.375, -18.5',
  'z',
].join(' ');

export const KeyEntityCardSingle = (props: {
  ke: IEditKeyEntity;
  isMirror: boolean;
}) => {
  const { ke, isMirror } = props;
  const mirrorMultX = isMirror ? -1 : 1;

  const cssKeyRect = css`
    stroke-width: 0.5;
    fill: ${uiTheme.colors.clLayouterKeyFace};
    stroke: ${uiTheme.colors.clLayouterKeyEdge};
    cursor: pointer;

    &[data-selected] {
      stroke: #4bb;
    }

    &[data-ghost] {
      opacity: 0.3;
    }

    &:hover {
      opacity: 0.7;
    }
  `;

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

  const isSelected = ke.id === editReader.currentKeyEntity?.id;
  const isGhost = ke === editReader.ghost;

  const {
    coordUnit,
    sizeUnit,
    placementAnchor,
    showKeyId,
    showKeyIndex,
  } = editReader;

  const x = coordUnit.mode === 'KP' ? ke.x * coordUnit.x : ke.x;
  const y = coordUnit.mode === 'KP' ? ke.y * coordUnit.y : ke.y;

  const d = placementAnchor === 'topLeft' ? 1 : 0;

  const cssText = css`
    text-anchor: middle;
    dominant-baseline: central;
    user-select: none;
    pointer-events: none;
    fill: ${uiTheme.colors.clLayouterKeyLegend};
    &[data-selected] {
      fill: #4bb;
    }
  `;

  const showBoth = showKeyId && showKeyIndex;

  const keyIndex = isMirror ? ke.mirrorKeyIndex : ke.keyIndex;

  const identifierText = getKeyIdentifierText(
    ke,
    isMirror,
    editReader.isManualKeyIdMode,
  );

  const [keyW, keyH] = getKeySize(ke.shape, sizeUnit);

  const idTextsTransformSpec = `translate(${d * (keyW / 2 + 1)}, ${
    d * (keyH / 2 + 1)
  }) scale(0.2)`;
  const idTexts = (
    <g transform={idTextsTransformSpec}>
      <text
        y={showBoth ? -10 : 0}
        css={cssText}
        qxIf={showKeyId && !isGhost}
        data-selected={isSelected}
      >
        {identifierText}
      </text>
      <text
        y={showBoth ? 10 : 0}
        css={cssText}
        qxIf={showKeyIndex && !isGhost}
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

  const outerTransformSpec = `translate(${ox}, ${oy}) rotate(${orot}) translate(${x2}, ${y}) rotate(${angle2})`;

  if (ke.shape === 'ext circle') {
    const transformSpec = `translate(${d * 9.5}, ${d * 9.5})`;
    return (
      <g transform={outerTransformSpec}>
        <circle
          transform={transformSpec}
          cx={0}
          cy={0}
          r={9}
          css={cssKeyRect}
          data-selected={isSelected}
          data-ghost={isGhost}
          onMouseDown={onMouseDown}
        />
        {idTexts}
      </g>
    );
  }

  if (ke.shape === 'ext isoEnter') {
    const transformSpec = `translate(${d * 16.25}, ${d * 19})`;
    return (
      <g transform={outerTransformSpec}>
        <path
          transform={transformSpec}
          d={isoEnterPathMarkupText}
          css={cssKeyRect}
          data-selected={isSelected}
          data-ghost={isGhost}
          onMouseDown={onMouseDown}
        />
        {idTexts}
      </g>
    );
  }

  const transformSpec = `translate(
    ${d * (keyW / 2 + 0.5)}, ${d * (keyH / 2 + 0.5)})`;
  return (
    <g transform={outerTransformSpec}>
      <rect
        transform={transformSpec}
        x={-keyW / 2}
        y={-keyH / 2}
        width={keyW}
        height={keyH}
        css={cssKeyRect}
        data-selected={isSelected}
        data-ghost={isGhost}
        onMouseDown={onMouseDown}
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
