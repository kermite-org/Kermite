import { css } from 'goober';
import { rerender, h } from 'qx';
import { degToRad } from '~/shared';
import { getStdKeySize } from '~/ui-common/modules/PlacementUnitHelper';
import { IPosition, startDragSession } from '~/ui-layouter/base';
import {
  editMutations,
  editReader,
  IEditKeyEntity,
} from '~/ui-layouter/editor/store';
import { getKeyIdentifierText } from '~/ui-layouter/editor/store/DomainRelatedHelpers';
import { unitValueToMm } from '~/ui-layouter/editor/store/PlacementUnitHelperEx';

let temporaryChangingModeAddToMove = false;

export function startKeyEntityDragOperation(
  e: MouseEvent,
  useGhost: boolean,
  isMirror: boolean,
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

export const KeyEntityCardSingle = (props: {
  ke: IEditKeyEntity;
  isMirror: boolean;
}) => {
  const { ke, isMirror } = props;
  const mirrorMultX = isMirror ? -1 : 1;

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
          editMutations.setCurrentKeyEntity(ke.id, isMirror);
          editMutations.setCurrentPointIndex(-1);
          e.stopPropagation();
        } else if (editMode === 'move' || editMode === 'add') {
          if (editMode === 'add') {
            editMutations.setEditMode('move');
            temporaryChangingModeAddToMove = true;
          }
          editMutations.setCurrentKeyEntity(ke.id, isMirror);
          editMutations.setCurrentPointIndex(-1);
          startKeyEntityDragOperation(e, true, isMirror);
          e.stopPropagation();
        } else if (editMode === 'delete') {
          editMutations.setCurrentKeyEntity(ke.id, isMirror);
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

  const keyIndex = isMirror ? ke.mirrorKeyIndex : ke.keyIndex;

  const identifierText = getKeyIdentifierText(
    ke,
    isMirror,
    editReader.isManualKeyIdMode,
  );
  const idTexts = (
    <g transform="scale(0.2)">
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

  const [keyW, keyH] = getStdKeySize(ke.shape, coordUnit, keySizeUnit);
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
    return <KeyEntityCardSingle ke={ke} isMirror={false} />;
  }
};
