import { css, setup, styled } from 'goober';
import { h, FC } from 'qx';
import { ISelectorOption, uiTheme } from '~/ui-common';
import {
  GeneralButton,
  GeneralInput,
  GeneralSelector,
} from '~/ui-common/components';

setup(h);

const cssRoot = css`
  height: 100%;
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clForegroud};
  padding: 10px;
  > * + * {
    margin-top: 5px;
  }
`;

const Header = styled('div')`
  color: ${uiTheme.colors.clPrimary};
  font-size: 18px;
`;

const Row = styled('div')`
  display: flex;
  > * + * {
    margin-left: 10px;
  }
`;

const HBox = styled('div')`
  display: flex;
`;

const testOptions: ISelectorOption[] = [
  { value: '', label: 'no-user' },
  { value: 'user001', label: 'yamada' },
  { value: 'user002', label: 'tanaka' },
  { value: 'user003', label: 'suzuki' },
];

const dummyHandler = () => {};

export const MockPageComponentDevelopment: FC = () => {
  return (
    <div css={cssRoot}>
      <Header>Configurations</Header>
      <Row>
        <GeneralSelector
          options={testOptions}
          value={'user001'}
          setValue={() => {}}
        />

        <HBox>
          <GeneralSelector
            options={testOptions}
            value={'user001'}
            setValue={() => {}}
            width={160}
          />
          <GeneralButton icon="fa fa-link" form="unitSquare" />
        </HBox>
      </Row>

      <Row>
        <GeneralButton icon="fa fa-cog" form="unitSquare" />
        <GeneralButton
          text="foo"
          icon="fa fa-cog"
          // className={buttonExtraCss}
          form="unit"
        />
        <GeneralButton icon="fa fa-cog" disabled form="unitSquare" />
        <GeneralButton text="OK" form="unit" />
        <GeneralButton text="Edit this" form="unit" />
        <GeneralButton text="Edit this" form="large" />
      </Row>
      <Row>
        <GeneralInput value="hoge" setValue={dummyHandler} />
        <GeneralInput value="hoge" setValue={dummyHandler} width={100} />
      </Row>
    </div>
  );
};
