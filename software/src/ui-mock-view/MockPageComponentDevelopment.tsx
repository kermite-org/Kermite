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
import {
  OperationButtonOnlyIcon,
  OperationButtonWithIcon,
  SmallSymbolicActionButton,
} from '~/ui-common/components/fabrics/Buttons';
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

// const dummyHandler = () => {};

function useSelectorModel(options: ISelectorOption[]) {
  const [value, setValue] = Hook.useState(options[0].value);
  return { options, value, setValue };
}

function useCheckboxModel(initialChecked: boolean) {
  const [checked, setChecked] = Hook.useState(initialChecked);
  return { checked, setChecked };
}

function useInputModel(initialText: string) {
  const [value, setValue] = Hook.useState(initialText);
  return { value, setValue };
}

export const MockPageComponentDevelopment: FC = () => {
  return (
    <div css={cssRoot}>
      <Header>Configurations</Header>
      <Row>
        <GeneralSelector {...useSelectorModel(testOptions)} />
        <GeneralSelector {...useSelectorModel(testOptions)} disabled />
        <HBox>
          <GeneralSelector {...useSelectorModel(testOptions)} width={160} />
          <GeneralButton icon="fa fa-link" size="unitSquare" />
        </HBox>
      </Row>

      <Row>
        <GeneralButton icon="fa fa-cog" size="unitSquare" />
        <GeneralButton text="foo" icon="fa fa-cog" size="unit" />
        <GeneralButton icon="fa fa-cog" disabled size="unitSquare" />
        <GeneralButton text="OK" size="unit" />
        <GeneralButton text="Delete" size="unit" />
        <GeneralButton text="Edit this" size="large" />
      </Row>
      <Row>
        <GeneralInput {...useInputModel('hoge')} />
        <GeneralInput {...useInputModel('hoge')} width={100} />
      </Row>
      <Row>
        <CheckBox {...useCheckboxModel(false)} />
        <CheckBox {...useCheckboxModel(true)} />
        <CheckBox {...useCheckboxModel(false)} disabled />
        <CheckBox {...useCheckboxModel(true)} disabled />
      </Row>
      <Row>
        <GeneralInput {...useInputModel('test')} width={100} />
        <CheckBoxLine {...useCheckboxModel(false)} text="show key index" />
      </Row>
      <VStack>
        <GeneralInput {...useInputModel('test')} width={100} />
        <GeneralInput {...useInputModel('test')} width={100} disabled />
        <CheckBoxLine
          {...useCheckboxModel(true)}
          text="show key index"
          disabled
        />
        <GeneralInput {...useInputModel('test')} width={100} invalid />
      </VStack>
      <VStack>
        <RibbonSelector {...useSelectorModel(testOptions2)} buttonWidth={50} />
        <RibbonSelector {...useSelectorModel(testOptions3)} />
        <RibbonSelector {...useSelectorModel(testOptions3)} disabled />
      </VStack>
      <Row>
        <SmallSymbolicActionButton icon="fa fa-cog" />
        <SmallSymbolicActionButton icon="fa fa-cog" disabled />
        <SmallSymbolicActionButton icon="fa fa-plus" />
        <SmallSymbolicActionButton icon="fa fa-pen-square" />
        <SmallSymbolicActionButton icon="fa fa-times" />
        <SmallSymbolicActionButton icon="fa fa-long-arrow-alt-up" />
        <SmallSymbolicActionButton icon="fa fa-long-arrow-alt-down" />
      </Row>
      <Row>
        <OperationButtonWithIcon icon="fa fa-save" label="save" />
        <OperationButtonWithIcon icon="fa fa-upload" label="write" />
      </Row>
      <Row>
        <OperationButtonOnlyIcon icon="fa fa-cog" />
        <OperationButtonOnlyIcon icon="fa fa-undo" />
        <OperationButtonOnlyIcon icon="fa fa-redo" />
      </Row>
    </div>
  );
};
