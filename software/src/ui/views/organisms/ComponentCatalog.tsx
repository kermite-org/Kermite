import { css } from 'goober';
import { h } from '~lib/qx';
import { GeneralButton } from '../controls/GeneralButton';
import {
  GeneralSelector2,
  IGeneralSelector2Props
} from '../controls/GeneralSelector2';

const testOptions: IGeneralSelector2Props['options'] = [
  { value: '', text: 'no-user' },
  { value: 'user001', text: 'yamada' },
  { value: 'user002', text: 'tanaka' },
  { value: 'user003', text: 'suzuki' }
];

const cssBase = css`
  margin: 20px;
  > .buttonsRow {
    display: flex;
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
        <GeneralButton icon="fa fa-cog" handler={buttonHandler} />
        <GeneralButton text="foo" icon="fa fa-cog" extraCss={buttonExtraCss} />
        <GeneralButton icon="fa fa-cog" disabled />
        <GeneralButton text="OK" />
      </div>

      <GeneralSelector2
        options={testOptions}
        value={curUserId}
        setValue={setCurrentUserId}
      />
    </div>
  );
};
