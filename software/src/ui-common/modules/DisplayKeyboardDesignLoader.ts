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
      if (ki !== undefined) {
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

  const isoEnterPathPoints = [
    [-16.125, -18.5],
    [-16.125, -0.5],
    [-11.375, -0.5],
    [-11.375, 18.5],
    [11.375, 18.5],
    [11.375, -18.5],
  ];

  function getKeyShape(
    shapeSpec: string,
    coordUnit: ICoordUnit,
    keySizeUnit: IKeySizeUnit,
  ): IDisplayKeyShape {
    if (shapeSpec === 'ext circle') {
      return { type: 'circle', radius: 9 };
    } else if (shapeSpec === 'ext isoEnter') {
      return {
        type: 'polygon',
        points: isoEnterPathPoints.map(([x, y]) => ({ x, y })),
      };
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
    translateCoord(p, keyX * mi, keyY);
    rotateCoord(p, groupRot * mi);
    translateCoord(p, groupX * mi, groupY);

    return {
      keyId: getKeyIdentifierText2(ke, isMirror, entityIndex),
      x: p.x,
      y: p.y,
      angle: (ke.angle + groupAngle) * mi,
      keyIndex,
      shapeSpec: ke.shape,
      shape: getKeyShape(ke.shape, coordUnit, keySizeUnit),
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
      if (shape.type === 'circle') {
        xs.push(ke.x - shape.radius);
        xs.push(ke.x + shape.radius);
        ys.push(ke.y - shape.radius);
        ys.push(ke.y + shape.radius);
      }
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
        if (shape.points.length < 3) {
          return [];
        }
        const groupIndex = convertUndefinedToMinusOne(shape.groupIndex);
        const group = design.transGroups[groupIndex];

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

    // todo: boundinbBoxにマージンを付加してdisplayAreaとする

    return {
      keyEntities,
      outlineShapes,
      displayArea: boundingBox,
    };
  }
}
