import { jsx, css, FC } from 'alumina';
import { colors } from '~/ui/base';
import { GeneralButton } from '~/ui/components';
import { ConfigSubHeader } from '~/ui/elements';
import { editMutations } from '~/ui/featureEditors/LayoutEditor/models';
import { useTransGroupListPartModel } from '~/ui/featureEditors/LayoutEditor/views/sidePanels/models/TransGroupListPanel.model';

export const TransGroupListPart: FC = () => {
  const { canAddGroup, canDeleteGroup, addGroup, deleteGroup, groupItems } =
    useTransGroupListPartModel();

  return (
    <div>
      <ConfigSubHeader>
        <div css={cssHeaderRow}>
          <span>groups</span>
          <div className="buttonsBox">
            <GeneralButton
              disabled={!canAddGroup}
              onClick={addGroup}
              icon="add"
              size="unitSquare"
              className={cssOpButton}
            />
            <GeneralButton
              disabled={!canDeleteGroup}
              onClick={deleteGroup}
              icon="delete"
              size="unitSquare"
              className={cssOpButton}
            />
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

const cssHeaderRow = css`
  display: flex;
  justify-content: space-between;

  > .buttonsBox {
    display: flex;

    > * {
      margin-left: 4px;
    }
  }
`;

const cssListFrame = css`
  margin-top: 2px;
  /* border: solid 1px ${colors.clPrimary}; */
  display: flex;
  flex-wrap: wrap;
`;

const cssTransGroupListItemCard = css`
  width: 24px;
  height: 24px;
  margin: 2px;
  border: solid 1px ${colors.clPrimary};
  color: ${colors.clPrimary};
  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;
  &[data-active] {
    background: ${colors.clPrimary};
    color: ${colors.clDecal};
  }
`;

const cssOpButton = css`
  width: 18px !important;
  height: 18px !important;
`;
