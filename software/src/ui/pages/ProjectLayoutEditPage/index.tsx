import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import { IPageSpec_ProjectLayoutEdit, pageActions } from '~/ui/commonModels';

type Props = {
  spec: IPageSpec_ProjectLayoutEdit;
};

export const ProjectLayoutEditPage: FC<Props> = ({ spec }) => (
  <div css={style}>
    <div>project layout edit page {spec.layoutName}</div>
    <button onClick={() => pageActions.navigateTo('/projectEdit')}>back</button>
  </div>
);

const style = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 15px;
`;
