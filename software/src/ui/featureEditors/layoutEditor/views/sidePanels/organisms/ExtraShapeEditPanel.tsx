import { css, FC, jsx } from 'alumina';
import { HFlex, CheckBox, GeneralSelector } from '~/ui/components';
import {
  ConfigPanelBox,
  ConfigSubContent,
  ConfigSubHeader,
  ConfigVStack,
  GeneralConfigTextEditRow,
} from '~/ui/elements';
import { useClosureModel } from '~/ui/featureEditors/layoutEditor/common';
import {
  editMutations,
  editReader,
} from '~/ui/featureEditors/layoutEditor/models';
import { reflectValue } from '~/ui/utils';
import { createConfigTextEditModelDynamic } from '../models/slots/configTextEditModel';
import { makeSelectorModel } from '../models/slots/selectorModel';

function createExtraShapeTransformPropModel(propKey: 'x' | 'y' | 'scale') {
  const numberPatterns = [/^-?\d+\.?\d*$/];
  return createConfigTextEditModelDynamic(
    numberPatterns,
    10,
    editMutations.startEdit,
    (text) => {
      const value = parseFloat(text);
      editMutations.setExtraShapeAttributeValue(propKey, value);
    },
    editMutations.endEdit,
  );
}

function makeGroupIdSelectorModel() {
  const { extraShape, allTransGroups } = editReader;
  return makeSelectorModel<string>({
    sources: [
      ['', '--'],
      ...allTransGroups.map(
        (group) => [group.id, group.id] as [string, string],
      ),
    ],
    reader: () => extraShape.groupId,
    writer: (newValue: string) => {
      editMutations.setExtraShapeGroupId(newValue);
      editMutations.setCurrentTransGroupById(newValue);
    },
  });
}

function createExtraShapeEditPanelModel() {
  const { setExtraShapePathText } = editMutations;

  const vmX = createExtraShapeTransformPropModel('x');
  const vmY = createExtraShapeTransformPropModel('y');
  const vmScale = createExtraShapeTransformPropModel('scale');

  const vmInvertY = {
    get value() {
      return editReader.extraShape.invertY;
    },
    setValue(value: boolean) {
      editMutations.setExtraShapeInvertY(value);
    },
  };

  return () => {
    const { extraShape, extraShapePathValidationResult: pathValidationResult } =
      editReader;
    vmX.update(extraShape.x.toString());
    vmY.update(extraShape.y.toString());
    vmScale.update(extraShape.scale.toString());

    const vmGroupId = makeGroupIdSelectorModel();

    return {
      extraShape,
      vmX,
      vmY,
      vmScale,
      vmInvertY,
      vmGroupId,
      setExtraShapePathText,
      pathValidationResult,
    };
  };
}

export const ExtraShapeEditPanel: FC = () => {
  const {
    extraShape,
    setExtraShapePathText,
    vmX,
    vmY,
    vmScale,
    vmInvertY,
    vmGroupId,
    pathValidationResult,
  } = useClosureModel(createExtraShapeEditPanelModel);

  return (
    <ConfigPanelBox headerText="extra shape definition">
      <div class={cssPanelContent}>
        <div class="textarea-row">
          <div class="top-row">
            <label>path</label>
            <p
              class={[
                'validation-result',
                pathValidationResult === 'valid' && '--valid',
                pathValidationResult === 'error' && '--error',
              ]}
            >
              {pathValidationResult}
            </p>
          </div>
          <textarea
            value={extraShape.path}
            onInput={reflectValue(setExtraShapePathText)}
          />
        </div>
        <ConfigSubHeader>transform</ConfigSubHeader>
        <ConfigSubContent>
          <ConfigVStack>
            <GeneralConfigTextEditRow
              {...vmX}
              label="x"
              labelWidth={70}
              inputWidth={80}
            />
            <GeneralConfigTextEditRow
              {...vmY}
              label="y"
              labelWidth={70}
              inputWidth={80}
            />
            <GeneralConfigTextEditRow
              {...vmScale}
              label="scale"
              labelWidth={70}
              inputWidth={80}
            />
            <HFlex>
              <span style={{ width: '70px' }}>invert Y</span>
              <CheckBox
                checked={vmInvertY.value}
                setChecked={vmInvertY.setValue}
              />
            </HFlex>
            <HFlex>
              <span style={{ width: '70px' }}>groupId</span>
              <GeneralSelector {...vmGroupId} width={80} />
            </HFlex>
          </ConfigVStack>
        </ConfigSubContent>
      </div>
    </ConfigPanelBox>
  );
};

const cssPanelContent = css`
  > .textarea-row {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-bottom: 4px;

    > .top-row {
      display: flex;
      justify-content: space-between;
      > .validation-result {
        &.--valid {
          color: #0a0;
        }

        &.--error {
          color: red;
        }
      }
    }

    > textarea {
      width: 100%;
      height: 120px;
      overflow-y: auto;
      padding: 5px;
      resize: none;
    }
  }
`;
