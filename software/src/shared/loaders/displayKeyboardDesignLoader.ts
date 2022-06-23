import {
  IDisplayKeyboardDesign,
  IDisplayKeyEntity,
  IDisplayKeyShape,
  IDisplayOutlineShape,
  IPersistKeyboardDesign,
  IPersistKeyboardDesignMirrorKeyEntity,
  IPersistKeyboardDesignRealKeyEntity,
} from '~/shared/defs';
import {
  convertUndefinedToDefaultValue,
  degToRad,
  flattenArray,
  rotateCoord,
  translateCoord,
} from '~/shared/funcs';
import { getIsoEnterShapePoints } from '~/shared/loaders/extendedKeyShapes';
import {
  getCoordUnitFromUnitSpec,
  getKeySize,
  getStdKeySize,
  ICoordUnit,
} from '~/shared/loaders/placementUnitHelper';

export namespace DisplayKeyboardDesignLoader {
  type ISourceDesign = IPersistKeyboardDesign;
  type ISourceOutlineShape = IPersistKeyboardDesign['outlineShapes'][0];
  type ISourceTransGroup = IPersistKeyboardDesign['transformationGroups'][0];

  type IRealKeyEntity = IPersistKeyboardDesignRealKeyEntity;
  type IMirrorKeyEntity = IPersistKeyboardDesignMirrorKeyEntity;

  function transformOutlineShape(
    shape: ISourceOutlineShape,
    isMirror: boolean,
    design: ISourceDesign,
  ): IDisplayOutlineShape {
    const mi = isMirror ? -1 : 1;

    const groupIndex = convertUndefinedToDefaultValue(shape.groupIndex, -1);
    const { groupX, groupY, groupAngle } = getGroupTransAmount(
      design.transformationGroups[groupIndex],
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

  function getGroupTransAmount(group: ISourceTransGroup | undefined) {
    const groupX = group?.x || 0;
    const groupY = group?.y || 0;
    const groupAngle = group?.angle || 0;
    return { groupX, groupY, groupAngle };
  }

  function getKeyShape(
    shapeSpec: string,
    sizeUnit: ICoordUnit,
  ): IDisplayKeyShape {
    // if (shapeSpec === 'ext circle') {
    //   return { type: 'circle', radius: 9 };
    // } else
    if (shapeSpec === 'ext isoEnter') {
      return {
        type: 'polygon',
        points: getIsoEnterShapePoints('center'),
      };
    }
    const [w, h] = getStdKeySize(shapeSpec, sizeUnit);
    return {
      type: 'rect',
      width: w,
      height: h,
    };
  }

  function transformKeyEntity(
    ke: IRealKeyEntity,
    mke: IMirrorKeyEntity | undefined,
    coordUnit: ICoordUnit,
    sizeUnit: ICoordUnit,
    design: ISourceDesign,
  ): IDisplayKeyEntity {
    const isMirror = !!mke;
    const mi = isMirror ? -1 : 1;

    const keyX = coordUnit.mode === 'KP' ? ke.x * coordUnit.x : ke.x;
    const keyY = coordUnit.mode === 'KP' ? ke.y * coordUnit.y : ke.y;

    const keyAngle = convertUndefinedToDefaultValue(ke.angle, 0);
    const keyShape = convertUndefinedToDefaultValue(ke.shape, 'std 1');
    const keyGroupIndex = convertUndefinedToDefaultValue(ke.groupIndex, -1);
    const { groupX, groupY, groupAngle } = getGroupTransAmount(
      design.transformationGroups[keyGroupIndex],
    );
    const groupRot = degToRad(groupAngle);

    const { placementAnchor } = design.setup;

    const [w, h] = getKeySize(keyShape, sizeUnit);

    const p = { x: 0, y: 0 };
    if (placementAnchor === 'topLeft') {
      let transX = (w / 2 + 0.5) * mi;
      const transY = h / 2 + 0.5;
      if (keyShape === 'ext isoEnter') {
        transX -= 2.1 * mi;
        if (!isMirror) {
          transX += 19.05 / 4;
        }
      }
      translateCoord(p, transX, transY);
    }

    translateCoord(p, keyX * mi, keyY);
    rotateCoord(p, groupRot * mi);
    translateCoord(p, groupX * mi, groupY);

    return {
      keyId: mke ? mke.keyId : ke.keyId,
      x: p.x,
      y: p.y,
      angle: (keyAngle + groupAngle) * mi,
      keyIndex: convertUndefinedToDefaultValue(
        mke ? mke.keyIndex : ke.keyIndex,
        -1,
      ),
      shapeSpec: keyShape,
      shape: getKeyShape(keyShape, sizeUnit),
    };
  }

  function getBoundingBox(
    keyEntities: IDisplayKeyEntity[],
    outlineShapes: IDisplayOutlineShape[],
  ) {
    const xs: number[] = [];
    const ys: number[] = [];

    keyEntities.forEach((ke) => {
      const { shape } = ke;
      // if (shape.type === 'circle') {
      //   xs.push(ke.x - shape.radius);
      //   xs.push(ke.x + shape.radius);
      //   ys.push(ke.y - shape.radius);
      //   ys.push(ke.y + shape.radius);
      // }
      if (shape.type === 'rect') {
        const keyX = ke.x;
        const keyY = ke.y;
        const keyRot = degToRad(ke.angle);

        const hw = shape.width / 2;
        const hh = shape.height / 2;
        const points = [
          [-hw, -hh],
          [-hw, hh],
          [hw, -hh],
          [hw, hh],
        ];
        points.forEach(([px, py]) => {
          const p = { x: px, y: py };
          rotateCoord(p, keyRot);
          translateCoord(p, keyX, keyY);
          xs.push(p.x);
          ys.push(p.y);
        });
      }
      if (shape.type === 'polygon') {
        const keyX = ke.x;
        const keyY = ke.y;
        const keyRot = degToRad(ke.angle);
        shape.points.forEach((p0) => {
          const p = { x: p0.x, y: p0.y };
          rotateCoord(p, keyRot);
          translateCoord(p, keyX, keyY);
          xs.push(p.x);
          ys.push(p.y);
        });
      }
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

  function getJoinedIfCenterEdgeSharedForMirrorShape(
    shape: ISourceOutlineShape,
    group: ISourceTransGroup,
  ): ISourceOutlineShape | undefined {
    if (group.angle === 0 && group.x === 0) {
      const { points } = shape;
      const sharedEdgePointIndex = points.findIndex((point, idx) => {
        const nextPoint = points[(idx + 1) % points.length];
        return point.x === 0 && nextPoint.x === 0;
      });
      if (sharedEdgePointIndex !== -1) {
        const sortedPoints = points.map(
          (_, idx) => points[(sharedEdgePointIndex + 1 + idx) % points.length],
        );
        const altSidePoints = sortedPoints
          .slice()
          .reverse()
          .slice(1, sortedPoints.length - 1)
          .map((p) => ({ x: -p.x, y: p.y }));
        const newPoints = [...sortedPoints, ...altSidePoints];
        return {
          groupIndex: shape.groupIndex,
          points: newPoints,
        };
      }
    }
    return undefined;
  }

  export function loadDisplayKeyboardDesign(
    design: IPersistKeyboardDesign,
  ): IDisplayKeyboardDesign {
    const coordUnit = getCoordUnitFromUnitSpec(design.setup.placementUnit);
    const sizeUnit = getCoordUnitFromUnitSpec(design.setup.keySizeUnit);

    const keyEntities = flattenArray(
      design.keyEntities.map((ke) => {
        if ('mirrorOf' in ke) {
          return [];
        } else {
          const groupIndex = convertUndefinedToDefaultValue(ke.groupIndex, -1);
          const group = design.transformationGroups[groupIndex];
          if (group?.mirror) {
            const mke = design.keyEntities.find(
              (k) => 'mirrorOf' in k && k.mirrorOf === ke.keyId,
            ) as IMirrorKeyEntity | undefined;
            return [
              transformKeyEntity(ke, undefined, coordUnit, sizeUnit, design),
              transformKeyEntity(ke, mke, coordUnit, sizeUnit, design),
            ];
          } else {
            return [
              transformKeyEntity(ke, undefined, coordUnit, sizeUnit, design),
            ];
          }
        }
      }),
    );

    const outlineShapes = flattenArray(
      design.outlineShapes.map((shape) => {
        if (shape.points.length < 3) {
          return [];
        }
        const groupIndex = convertUndefinedToDefaultValue(shape.groupIndex, -1);
        const group = design.transformationGroups[groupIndex];

        if (group?.mirror) {
          const joinedShape = getJoinedIfCenterEdgeSharedForMirrorShape(
            shape,
            group,
          );
          if (joinedShape) {
            return [transformOutlineShape(joinedShape, false, design)];
          }
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
      displayArea: boundingBox,
    };
  }
}
