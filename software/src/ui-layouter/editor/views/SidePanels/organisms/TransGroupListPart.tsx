import { uiTheme } from '@ui-layouter/base';
import { editMutations } from '@ui-layouter/editor/store';
import { ConfigSubHeader } from '@ui-layouter/editor/views/SidePanels/atoms';
import { useTransGroupListPartModel } from '@ui-layouter/editor/views/SidePanels/models/TransGroupListPanel.model';
import { css } from 'goober';
import { h } from 'qx';

const cssHeaderRow = css`
  display: flex;
  justify-content: space-between;

  > .buttonsBox {
    display: flex;

    > button {
      width: 20px;
    }
  }
`;

const cssListFrame = css`
  margin-top: 2px;
  border: solid 1px #ccc;
  display: flex;
  flex-wrap: wrap;
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
  const {
    canAddGroup,
    canDeleteGroup,
    addGroup,
    deleteGroup,
    groupItems,
  } = useTransGroupListPartModel();

  return (
    <div>
      <ConfigSubHeader>
        <div css={cssHeaderRow}>
          <span>groups</span>
          <div className="buttonsBox">
            <button disabled={!canDeleteGroup} onClick={deleteGroup}>
              x
            </button>
            <button disabled={!canAddGroup} onClick={addGroup}>
              +
            </button>
          </div>
        </div>
      </ConfigSubHeader>
      <div
        css={cssListFrame}
        onClick={() => editMutations.setCurrentTransGroupById(undefined)}
      >
        {groupItems.map((item) => (
          <div
            key={item.id}
            onClick={(e) => {
              item.setActive();
              e.stopPropagation();
            }}
            data-active={item.isActive}
            css={cssTransGroupListItemCard}
          >
            {item.id}
          </div>
        ))}
      </div>
    </div>
  );
};
