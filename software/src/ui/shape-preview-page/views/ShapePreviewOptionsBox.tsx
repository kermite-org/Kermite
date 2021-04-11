import { jsx, css, FC } from 'qx';
import { fieldSetter, CheckBoxLine } from '~/ui/common';
import { IShapeViewPersistState } from '~/ui/shape-preview-page/models';

interface IDisplayOptionSource {
  fieldKey: keyof IShapeViewPersistState;
  label: string;
}
const displayOptionsSource: IDisplayOptionSource[] = [
  {
    fieldKey: 'shapeViewShowKeyId',
    label: 'keyId',
  },
  {
    fieldKey: 'shapeViewShowKeyIndex',
    label: 'keyIndex',
  },
  {
    fieldKey: 'shapeViewShowBoundingBox',
    label: 'box',
  },
];

interface Props {
  settings: IShapeViewPersistState;
}

const style = css`
  display: flex;
  align-items: center;
  > * + * {
    margin-left: 10px;
  }

  > div {
    > label {
      display: flex;
      align-items: center;
      cursor: pointer;
      user-select: none;

      > span {
        display: inline-block;
        margin-left: 2px;
      }
    }
  }
`;

export const ShapePreviewOptionsBox: FC<Props> = ({ settings }) => (
  <div css={style}>
    {displayOptionsSource.map((om) => (
      <div key={om.fieldKey}>
        <CheckBoxLine
          checked={settings[om.fieldKey] as boolean}
          setChecked={fieldSetter(settings, om.fieldKey)}
          text={om.label}
        />
      </div>
    ))}
  </div>
);
