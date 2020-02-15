import { css, jsx } from '@emotion/core';
import { AssignCategory } from '~ui/state/editor';
import { UiTheme } from '~ui/view/ConfiguratorSite/UiTheme';
import { AssignModeButtonRaw } from './AssignSlotCards';
import { IKeyAssignEntry } from '~contract/data';

function AssignCategoryButton(props: {
  category: AssignCategory;
  currentAssign?: IKeyAssignEntry;
  currentAssignCategory: AssignCategory;
  setAssignCategory(assignCategory: AssignCategory): void;
  isSlotSelected: boolean;
}) {
  const {
    category,
    currentAssign,
    currentAssignCategory,
    setAssignCategory,
    isSlotSelected
  } = props;

  const isActive = currentAssignCategory === category || false;
  const onClick = () => {
    if (isSlotSelected) {
      setAssignCategory(category);
    }
  };
  return (
    <AssignModeButtonRaw
      text={category}
      isActive={isActive}
      onClick={onClick}
    />
  );
}

const assignCategories: AssignCategory[] = [
  'input',
  'hold',
  'text',
  'macro',
  'mouse'
];

export const AssingTypeSelectionPart = (props: {
  isSlotSelected: boolean;
  currentAssign?: IKeyAssignEntry;
  currentAssignCategory: AssignCategory;
  setAssignCategory(assignCategory: AssignCategory): void;
}) => {
  const {
    currentAssign,
    currentAssignCategory,
    setAssignCategory,
    isSlotSelected
  } = props;
  const cssBox = css`
    flex-shrink: 0;
    > * {
      margin: ${UiTheme.assignPallet.commonMargin};
    }
  `;

  return (
    <div css={cssBox}>
      {assignCategories.map(category => (
        <AssignCategoryButton
          key={category}
          category={category}
          currentAssign={currentAssign}
          currentAssignCategory={currentAssignCategory}
          setAssignCategory={setAssignCategory}
          isSlotSelected={isSlotSelected}
        />
      ))}
      <div>
        <label>
          <div>label</div>
          <div>
            <input type="text" style={{ width: '80px' }}></input>
          </div>
        </label>
      </div>
    </div>
  );
};
