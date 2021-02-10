import { css, setup, styled } from 'goober';
import { h, FC } from 'qx';
import { ISelectorOption, uiTheme } from '~/ui-common';
import { GeneralSelector } from '~/ui-common/components';

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

const testOptions: ISelectorOption[] = [
  { value: '', label: 'no-user' },
  { value: 'user001', label: 'yamada' },
  { value: 'user002', label: 'tanaka' },
  { value: 'user003', label: 'suzuki' },
];

export const MockPageComponentDevelopment: FC = () => {
  return (
    <div css={cssRoot}>
      <Header>Configurations</Header>
      <GeneralSelector
        options={testOptions}
        value={'user001'}
        setValue={() => {}}
      />
    </div>
  );
};
