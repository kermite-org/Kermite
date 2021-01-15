import { css } from 'goober';
import { rerender, h } from 'qx';
import { IPosition, startDragSession } from '@ui-layouter/base';
import {
  editReader,
  unitValueToMm,
  editMutations,
  IKeyEntity,
  getStdKeySize,
} from '@ui-layouter/editor/store';

let temporaryChangingModeAddToMove = false;

export function startKeyEntityDragOperation(e: MouseEvent, useGhost: boolean) {
  const { sight, currentKeyEntity: ck, coordUnit } = editReader;

  if (!ck) {
    return;
  }

  const [kx, ky] = unitValueToMm(ck.x, ck.y, coordUnit);
  const destPos = { x: kx, y: ky };

  const moveCallback = (pos: IPosition, prevPos: IPosition) => {
    const deltaX = (pos.x - prevPos.x) * sight.scale;
    const deltaY = (pos.y - prevPos.y) * sight.scale;
    destPos.x += deltaX;
    destPos.y += deltaY;
    editMutations.setKeyPosition(destPos.x, destPos.y);
    rerender();
  };
  const upCallback = () => {
    editMutations.endKeyEdit();
    if (temporaryChangingModeAddToMove) {
      editMutations.setEditMode('add');
      temporaryChangingModeAddToMove = false;
    }
    rerender();
  };

  editMutations.startKeyEdit(useGhost);
  startDragSession(e, moveCallback, upCallback);
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

export const KeyEntityCard = ({ ke }: { ke: IKeyEntity }) => {
  const cssKeyRect = css`
    fill: rgba(255, 255, 255, 0.3);
    stroke-width: 0.5;
    stroke: #666;
    cursor: pointer;

    &[data-selected] {
      stroke: #4bb;
    }

    &[data-ghost] {
      opacity: 0.3;
    }
  `;

  const onMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      if (editReader.editorTarget !== 'key') {
        editMutations.setEditorTarget('key');
      }
      const { editorTarget } = editReader;

      if (editorTarget === 'key') {
        const { editMode } = editReader;
        if (editMode === 'select') {
          editMutations.setCurrentKeyEntity(ke.id);
          editMutations.setCurrentPointIndex(-1);
          e.stopPropagation();
        } else if (editMode === 'move' || editMode === 'add') {
          if (editMode === 'add') {
            editMutations.setEditMode('move');
            temporaryChangingModeAddToMove = true;
          }
          editMutations.setCurrentKeyEntity(ke.id);
          editMutations.setCurrentPointIndex(-1);
          startKeyEntityDragOperation(e, true);
          e.stopPropagation();
        } else if (editMode === 'delete') {
          editMutations.setCurrentKeyEntity(ke.id);
          editMutations.deleteCurrentKeyEntity();
        }
      }
    }
  };

  const isSelected = ke.id === editReader.currentKeyEntity?.id;
  const isGhost = ke === editReader.ghost;

  const {
    coordUnit,
    keySizeUnit,
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
    &[data-selected] {
      fill: #4bb;
    }
  `;

  const showBoth = showKeyId && showKeyIndex;
  const idTexts = (
    <g transform="scale(0.2)">
      <text
        y={showBoth ? -10 : 0}
        css={cssText}
        qxIf={showKeyId && !isGhost}
        data-selected={isSelected}
      >
        {ke.keyId}
      </text>
      <text
        y={showBoth ? 10 : 0}
        css={cssText}
        qxIf={showKeyIndex && !isGhost}
        data-selected={isSelected}
      >
        {ke.keyIndex === -1 ? '--' : ke.keyIndex}
      </text>
    </g>
  );

  if (ke.shape === 'ext circle') {
    const transformSpec = `translate(${x + d * 9.5}, ${y + d * 9.5}) rotate(${
      ke.r
    })`;
    return (
      <g transform={transformSpec}>
        <circle
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
    const transformSpec = `translate(${x + d * 16.25}, ${y + d * 19}) rotate(${
      ke.r
    })`;
    return (
      <g transform={transformSpec}>
        <path
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

  const [keyW, keyH] = getStdKeySize(ke.shape, coordUnit, keySizeUnit);
  const transformSpec = `translate(${x + d * (keyW / 2 + 0.5)}, ${
    y + d * (keyH / 2 + 0.5)
  }) rotate(${ke.r})`;
  return (
    <g transform={transformSpec}>
      <rect
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
