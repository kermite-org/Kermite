import { css } from 'goober';
import { h } from 'qx';
import {
  GeneralSelector,
  IGeneralSelectorProps,
  GeneralButton,
} from '~/ui-common/components';

const testOptions: IGeneralSelectorProps['options'] = [
  { value: '', label: 'no-user' },
  { value: 'user001', label: 'yamada' },
  { value: 'user002', label: 'tanaka' },
  { value: 'user003', label: 'suzuki' },
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
        value={curUserId}
        setValue={setCurrentUserId}
      />
    </div>
  );
};
