import {
  convertUndefinedToMinusOne,
  degToRad,
  flattenArray,
  IDisplayKeyboardDesign,
  IDisplayKeyEntity,
  IDisplayKeyShape,
  IDisplayOutlineShape,
  IKeySizeUnit,
  IPersistKeyboardDesign,
  rotateCoord,
  translateCoord,
} from '~/shared';
import {
  getCoordUnitFromUnitSpec,
  getKeySize,
  getStdKeySize,
  ICoordUnit,
} from '~/ui-layouter/editor/store/PlacementUnitHelper';

export namespace DisplayKeyboardDesignLoader {
  type ISourceDesign = IPersistKeyboardDesign;
  type ISourceOutlineShape = IPersistKeyboardDesign['outlineShapes'][0];
  type ISourceKeyEntity = IPersistKeyboardDesign['keyEntities'][0];
  type ISourceTransGroup = IPersistKeyboardDesign['transGroups'][0];

  function transformOutlineShape(
    shape: ISourceOutlineShape,
    isMirror: boolean,
    design: ISourceDesign,
  ): IDisplayOutlineShape {
    const mi = isMirror ? -1 : 1;

    const groupIndex = convertUndefinedToMinusOne(shape.groupIndex);
    const { groupX, groupY, groupAngle } = getGroupTransAmount(
      design.transGroups[groupIndex],
    );
    const groupRot = degToRad(groupAngle);

    const points = shape.points.map((p0) => {
      const p = { x: p0.x * mi, y: p0.y };
      rotateCoord(p, groupRot * mi);
      translateCoord(p, groupX * mi, groupY);
      return p;
    });
    return {
      points,
    };
  }

  function getKeyIdentifierText2(
    ke: ISourceKeyEntity,
    isMirror: boolean,
    entityIndex: number,
  ): string {
    if (ke) {
      const ki = isMirror ? ke.mirrorKeyIndex : ke.keyIndex;
      if (ki !== -1) {
        return `key${ki}`;
      } else {
        return `key0${entityIndex}${isMirror ? 'm' : ''}`;
      }
    }
    return '';
  }

  function getGroupTransAmount(group: ISourceTransGroup | undefined) {
    const groupX = group?.x || 0;
    const groupY = group?.y || 0;
    const groupAngle = group?.angle || 0;
    return { groupX, groupY, groupAngle };
  }

  function getKeyShape(
    shapeSpec: string,
    coordUnit: ICoordUnit,
    keySizeUnit: IKeySizeUnit,
  ): IDisplayKeyShape {
    if (shapeSpec === 'ext circle') {
      return { type: 'circle', radius: 9 };
    } else if (shapeSpec === 'ext isoEnter') {
      // todo: パスを指定
      return { type: 'circle', radius: 12 };
    }
    const [w, h] = getStdKeySize(shapeSpec, coordUnit, keySizeUnit);
    return {
      type: 'rect',
      width: w,
      height: h,
    };
  }

  function transformKeyEntity(
    ke: ISourceKeyEntity,
    isMirror: boolean,
    coordUnit: ICoordUnit,
    design: ISourceDesign,
    entityIndex: number,
  ): IDisplayKeyEntity {
    const sourceKeyIndex = isMirror ? ke.mirrorKeyIndex : ke.keyIndex;
    const keyIndex = convertUndefinedToMinusOne(sourceKeyIndex);

    const mi = isMirror ? -1 : 1;

    const keyX = coordUnit.mode === 'KP' ? ke.x * coordUnit.x : ke.x;
    const keyY = coordUnit.mode === 'KP' ? ke.y * coordUnit.y : ke.y;

    const groupIndex = convertUndefinedToMinusOne(ke.groupIndex);
    const { groupX, groupY, groupAngle } = getGroupTransAmount(
      design.transGroups[groupIndex],
    );
    const groupRot = degToRad(groupAngle);

    const { keySizeUnit, placementAnchor } = design.setup;

    const [w, h] = getKeySize(ke.shape, coordUnit, keySizeUnit);

    const p = { x: 0, y: 0 };
    if (placementAnchor === 'topLeft') {
      translateCoord(p, w / 2 + 0.5, h / 2 + 0.5);
    }
    translateCoord(p, keyX, keyY);
    rotateCoord(p, groupRot * mi);
    translateCoord(p, groupX * mi, groupY);

    return {
      keyId: getKeyIdentifierText2(ke, isMirror, entityIndex),
      x: p.x,
      y: p.y,
      angle: (ke.angle + groupAngle) * mi,
      keyIndex,
      shape: getKeyShape(ke.shape, coordUnit, keySizeUnit),
    };
  }

  export function getBoundingBox(
    keyEntities: IDisplayKeyEntity[],
    outlineShapes: IDisplayOutlineShape[],
  ) {
    const xs: number[] = [];
    const ys: number[] = [];

    keyEntities.forEach((ke) => {
      // todo: キーのコーナーを４点追加する
      xs.push(ke.x);
      ys.push(ke.y);
    });

    outlineShapes.forEach((shape) => {
      shape.points.forEach((p) => {
        xs.push(p.x);
        ys.push(p.y);
      });
    });

    if (xs.length === 0 || ys.length === 0) {
      xs.push(-80);
      xs.push(80);
      ys.push(-60);
      ys.push(60);
    }

    const left = Math.min(...xs);
    const right = Math.max(...xs);
    const top = Math.min(...ys);
    const bottom = Math.max(...ys);
    // return { top, left, bottom, right };
    return {
      centerX: (left + right) / 2,
      centerY: (top + bottom) / 2,
      width: right - left,
      height: bottom - top,
    };
  }

  export function loadDisplayKeyboardDesign(
    design: IPersistKeyboardDesign,
  ): IDisplayKeyboardDesign {
    const coordUnit = getCoordUnitFromUnitSpec(design.setup.placementUnit);

    const keyEntities = flattenArray(
      design.keyEntities.map((ke, entityIndex) => {
        const groupIndex = convertUndefinedToMinusOne(ke.groupIndex);
        const group = design.transGroups[groupIndex];
        if (group?.mirror) {
          return [
            transformKeyEntity(ke, false, coordUnit, design, entityIndex),
            transformKeyEntity(ke, true, coordUnit, design, entityIndex),
          ];
        } else {
          return [
            transformKeyEntity(ke, false, coordUnit, design, entityIndex),
          ];
        }
      }),
    );

    const outlineShapes = flattenArray(
      design.outlineShapes.map((shape) => {
        const groupIndex = convertUndefinedToMinusOne(shape.groupIndex);
        const group = design.transGroups[groupIndex];
        // todo: X=0で左右の結合に対応する
        if (group?.mirror) {
          return [
            transformOutlineShape(shape, false, design),
            transformOutlineShape(shape, true, design),
          ];
        } else {
          return [transformOutlineShape(shape, false, design)];
        }
      }),
    );

    const boundingBox = getBoundingBox(keyEntities, outlineShapes);

    return {
      keyEntities,
      outlineShapes,
      boundingBox,
    };
  }
}
