import { jsx, css } from 'alumina';
import { ISelectorOption } from '~/ui/base';
import { GeneralSelector, GeneralButton } from '~/ui/components/atoms';

const testOptions: ISelectorOption[] = [
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
          onClick={buttonHandler}
          size="unitSquare"
        />
        <GeneralButton
          text="foo"
          icon="fa fa-cog"
          class={buttonExtraCss}
          size="unit"
        />
        <GeneralButton icon="fa fa-cog" disabled size="unitSquare" />
        <GeneralButton text="OK" size="unit" />
        <GeneralButton text="Edit this" size="unit" />
        <GeneralButton text="Edit this" size="large" />
      </div>

      <GeneralSelector
        options={testOptions}
        value={curUserId}
        setValue={setCurrentUserId}
      />
    </div>
  );
};
