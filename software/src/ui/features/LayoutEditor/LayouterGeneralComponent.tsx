import { FC, useEffect, jsx, css } from 'qx';
import { IPersistKeyboardDesign } from '~/shared';
import { uiTheme } from '~/ui/base';
import { UiLayouterCore } from '~/ui/features/LayoutEditor/LayouterCore';

type Props = {
  layout: IPersistKeyboardDesign;
  saveLayout: (value: IPersistKeyboardDesign) => void;
};

export const LayouterGeneralComponent: FC<Props> = ({ layout, saveLayout }) => {
  useEffect(() => {
    UiLayouterCore.loadEditDesign(layout);
  }, [layout]);

  const isModified = UiLayouterCore.getIsModified();

  const onSaveButton = () => {
    const savingData = UiLayouterCore.emitSavingDesign();
    saveLayout(savingData);
  };

  return (
    <div css={style}>
      <div className="topRow">
        <button onClick={onSaveButton} disabled={!isModified}>
          save
        </button>
      </div>
      <div className="mainRow">
        <UiLayouterCore.Component />
      </div>
    </div>
  );
};

const style = css`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${uiTheme.colors.clBackground};

  > .topRow {
    flex-shrink: 0;
  }

  > .mainRow {
    flex-grow: 1;
  }
`;
