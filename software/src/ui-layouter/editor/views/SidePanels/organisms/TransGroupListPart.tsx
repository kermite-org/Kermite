import { uiTheme } from '@ui-layouter/base';
import { editMutations, editReader } from '@ui-layouter/editor/store';
import { css } from 'goober';
import { h } from 'qx';

const cssTransGroupListPart = css`
  > .headerRow {
    display: flex;
    justify-content: space-between;

    > .buttonsBox {
      display: flex;

      > button {
        width: 20px;
      }
    }
  }

  > .listFrame {
    border: solid 1px #ccc;
    display: flex;
    flex-wrap: wrap;
  }
`;

const cssTransGroupListItemCard = css`
  width: 24px;
  height: 24px;
  margin: 2px;
  border: solid 1px ${uiTheme.colors.primary};
  color: ${uiTheme.colors.primary};
  border-radius: 2px;
  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;
  &[data-active] {
    background: ${uiTheme.colors.primaryWeaken};
  }
`;

export const TransGroupListPart = () => {
  const { allTransGroups } = editReader;
  return (
    <div css={cssTransGroupListPart}>
      <div className="headerRow">
        <span>transformation groups</span>
        <div className="buttonsBox">
          <button
            disabled={editReader.allTransGroups.length <= 1}
            onClick={() => editMutations.deleteLastTransGroup()}
          >
            x
          </button>
          <button onClick={() => editMutations.addTransGroup()}>+</button>
        </div>
      </div>
      <div
        className="listFrame"
        onClick={() => editMutations.setCurrentTransGroupById(undefined)}
      >
        {allTransGroups.map((group) => (
          <div
            key={group.id}
            onClick={(e) => {
              editMutations.setCurrentTransGroupById(group.id);
              e.stopPropagation();
            }}
            data-active={editReader.currentTransGroupId === group.id}
            css={cssTransGroupListItemCard}
          >
            {group.id}
          </div>
        ))}
      </div>
    </div>
  );
};
