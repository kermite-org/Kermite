import { jsx, FC, css, styled, useState } from 'qx';
import { ISelectorOption, uiTheme } from '~/ui/base';
import {
  GeneralButton,
  GeneralInput,
  GeneralSelector,
  Icon,
  RibbonSelector,
  CheckBox,
  CheckBoxLine,
  OperationButtonOnlyIcon,
  OperationButtonWithIcon,
  SmallSymbolicActionButton,
} from '~/ui/components';

const cssRoot = css`
  height: 100%;
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clForeground};
  padding: 10px;
  > * + * {
    margin-top: 5px;
  }
`;

const Header = styled.div`
  color: ${uiTheme.colors.clPrimary};
  font-size: 18px;
`;

const Row = styled.div`
  display: flex;
  > * + * {
    margin-left: 10px;
  }
`;

const HBox = styled.div`
  display: flex;
`;

const VStack = styled.div`
  > * + * {
    margin-top: 4px;
  }
`;

const testOptions: ISelectorOption[] = [
  { value: 'user001', label: 'yamada' },
  { value: 'user002', label: 'tanaka' },
  { value: 'user003', label: 'suzuki' },
];

const testOptions2: ISelectorOption[] = ['select', 'move', 'add', 'delete'].map(
  (it) => ({ label: it, value: it }),
);

const testOptions3: ISelectorOption[] = ['manual', 'auto'].map((it) => ({
  label: it,
  value: it,
}));

// const dummyHandler = () => {};

const cssIconsContainer = css`
  display: flex;
  font-size: 30px;
`;

function useSelectorModel(options: ISelectorOption[]) {
  const [value, setValue] = useState(options[0].value);
  return { options, value, setValue };
}

function useCheckboxModel(initialChecked: boolean) {
  const [checked, setChecked] = useState(initialChecked);
  return { checked, setChecked };
}

function useInputModel(initialText: string) {
  const [value, setValue] = useState(initialText);
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
        <GeneralButton icon="settings" size="unitSquare" />
        <GeneralButton text="foo" icon="settings" size="unit" />
        <GeneralButton icon="settings" disabled size="unitSquare" />
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
        <SmallSymbolicActionButton icon="settings" />
        <SmallSymbolicActionButton icon="settings" disabled />
        <SmallSymbolicActionButton icon="add_box" />
        <SmallSymbolicActionButton icon="edit" />
        <SmallSymbolicActionButton icon="delete" />
        <SmallSymbolicActionButton icon="north" />
        <SmallSymbolicActionButton icon="south" />
      </Row>
      <Row>
        <OperationButtonWithIcon icon="save" label="save" />
        <OperationButtonWithIcon icon="double_arrow" label="write" />
      </Row>
      <Row>
        <OperationButtonOnlyIcon icon="settings" />
        <OperationButtonOnlyIcon icon="undo" />
        <OperationButtonOnlyIcon icon="redo" />
      </Row>
      <Row>
        <Icon spec="settings" size={20} />
        <Icon spec="fa fa-cog" size={20} />
        <Icon spec="settings" size={40} />
        <Icon spec="fa fa-cog" size={40} />
        <div css={cssIconsContainer}>
          <Icon spec="settings" />
          <Icon spec="fa fa-cog" />
          <Icon spec="settings" size={20} />
          <Icon spec="fa fa-cog" size={20} />
          <Icon spec="settings" size={40} />
          <Icon spec="fa fa-cog" size={40} />
        </div>
      </Row>
    </div>
  );
};
