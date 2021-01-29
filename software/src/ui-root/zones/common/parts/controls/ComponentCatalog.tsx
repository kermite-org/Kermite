import { css } from 'goober';
import { h } from 'qx';
import { GeneralButton } from '../../../../../ui-common/parts/controls/GeneralButton';
import {
  GeneralSelector,
  IGeneralSelectorProps,
} from '../../../../../ui-common/parts/controls/GeneralSelector';

const testOptions: IGeneralSelectorProps['options'] = [
  { id: '', text: 'no-user' },
  { id: 'user001', text: 'yamada' },
  { id: 'user002', text: 'tanaka' },
  { id: 'user003', text: 'suzuki' },
];

const cssBase = css`
  /* margin: 20px; */

  > * + * {
    margin-top: 10px;
  }
  > .buttonsRow {
    display: flex;
    > * + * {
      margin-left: 10px;
    }
  }
`;

const buttonExtraCss = css`
  background: orange;
`;

export const ComponentCatalog = () => {
  const buttonHandler = () => {
    console.log('clicked');
  };

  let curUserId = 'user001';

  const setCurrentUserId = (userId: string) => {
    console.log(`user selected ${userId}`);
    curUserId = userId;
  };

  return () => (
    <div css={cssBase}>
      <div class="buttonsRow">
        <GeneralButton
          icon="fa fa-cog"
          handler={buttonHandler}
          form="unitSquare"
        />
        <GeneralButton
          text="foo"
          icon="fa fa-cog"
          className={buttonExtraCss}
          form="unit"
        />
        <GeneralButton icon="fa fa-cog" disabled form="unitSquare" />
        <GeneralButton text="OK" form="unit" />
        <GeneralButton text="Edit this" form="unit" />
        <GeneralButton text="Edit this" form="large" />
      </div>

      <GeneralSelector
        options={testOptions}
        choiceId={curUserId}
        setChoiceId={setCurrentUserId}
      />
    </div>
  );
};
