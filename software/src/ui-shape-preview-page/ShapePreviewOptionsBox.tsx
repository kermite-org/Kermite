import { css } from 'goober';
import { h } from 'qx';
import { fieldSetter } from '~/ui-common';
import { CheckBoxLine } from '~/ui-common/components';
import { IUiSettings } from '~/ui-common/sharedModels/UiStatusModel';

interface IDisplayOptionSource {
  fieldKey: keyof IUiSettings;
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

const cssPreviewOptionsBox = css`
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

export function ShapePreviewOptionsBox(props: { settings: IUiSettings }) {
  const { settings } = props;
  return (
    <div css={cssPreviewOptionsBox}>
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
}
