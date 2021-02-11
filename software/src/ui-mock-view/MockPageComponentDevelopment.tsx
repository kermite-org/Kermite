import { css, setup, styled } from 'goober';
import { h, FC, Hook } from 'qx';
import { ISelectorOption, uiTheme } from '~/ui-common';
import {
  GeneralButton,
  GeneralInput,
  GeneralSelector,
} from '~/ui-common/components';
import { CheckBox } from '~/ui-common/components/controls/CheckBox';
import { RibbonSelector } from '~/ui-common/components/controls/RibbonSelector';
import { CheckBoxLine } from '~/ui-common/components/fabrics/CheckBoxLine';

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

const VStack = styled('div')`
  > * + * {
    margin-top: 4px;
  }
`;

const testOptions: ISelectorOption[] = [
  { value: 'user001', label: 'yamada' },
  { value: 'user002', label: 'tanaka' },
  { value: 'user003', label: 'suzuki' },
];

const testOptions2: ISelectorOption[] = [
  'select',
  'move',
  'add',
  'delete',
].map((it) => ({ label: it, value: it }));

const testOptions3: ISelectorOption[] = ['manual', 'auto'].map((it) => ({
  label: it,
  value: it,
}));

const dummyHandler = () => {};

function useSelectorProps(options: ISelectorOption[]) {
  const [value, setValue] = Hook.useState(options[0].value);
  return { options, value, setValue };
}

export const MockPageComponentDevelopment: FC = () => {
  return (
    <div css={cssRoot}>
      <Header>Configurations</Header>
      <Row>
        <GeneralSelector {...useSelectorProps(testOptions)} />
        <GeneralSelector {...useSelectorProps(testOptions)} disabled />
        <HBox>
          <GeneralSelector {...useSelectorProps(testOptions)} width={160} />
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
        <GeneralButton text="Delete" form="unit" />
        <GeneralButton text="Edit this" form="large" />
      </Row>
      <Row>
        <GeneralInput value="hoge" setValue={dummyHandler} />
        <GeneralInput value="hoge" setValue={dummyHandler} width={100} />
      </Row>
      <Row>
        <CheckBox checked={false} setChecked={dummyHandler} />
        <CheckBox checked={true} setChecked={dummyHandler} />
      </Row>
      <Row>
        <GeneralInput value="test" setValue={dummyHandler} width={100} />
        <CheckBoxLine
          checked={false}
          setChecked={dummyHandler}
          text="show key index"
        />
      </Row>
      <VStack>
        <GeneralInput value="test" setValue={dummyHandler} width={100} />
        <GeneralInput value="test" setValue={dummyHandler} width={100} />
        <CheckBoxLine
          checked={false}
          setChecked={dummyHandler}
          text="show key index"
        />
        <GeneralInput value="test" setValue={dummyHandler} width={100} />
      </VStack>
      <VStack>
        <RibbonSelector {...useSelectorProps(testOptions2)} buttonWidth={50} />
        <RibbonSelector {...useSelectorProps(testOptions3)} />
        <RibbonSelector {...useSelectorProps(testOptions3)} disabled />
      </VStack>
    </div>
  );
};
