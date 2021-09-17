import { css, FC, jsx } from 'qx';
import { fallbackProjectLayoutEntry, IProjectLayoutEntry } from '~/shared';
import { uiTheme } from '~/ui/base';
import { IPageSpec_ProjectLayoutEdit } from '~/ui/commonModels';
import { projectPackagesWriter, uiReaders } from '~/ui/commonStore';
import { RouteHeaderBar } from '~/ui/components/organisms/RouteHeaderBar/RouteHeaderBar';
import {
  LayouterGeneralComponent,
  LayouterGeneralComponent_OutputPropsSupplier,
  UiLayouterCore,
} from '~/ui/features';
import { useMemoEx } from '~/ui/helpers';

type Props = {
  spec: IPageSpec_ProjectLayoutEdit;
};

const helpers = {
  getSourceLayoutEntryOrCreate(layoutName: string): IProjectLayoutEntry {
    const projectInfo = uiReaders.editTargetProject;
    const layoutEntry = projectInfo?.layouts.find(
      (it) => it.layoutName === layoutName,
    );
    return layoutEntry || fallbackProjectLayoutEntry;
  },
};

export const ProjectLayoutEditPage: FC<Props> = ({ spec: { layoutName } }) => {
  const sourceLayoutEntry = useMemoEx(helpers.getSourceLayoutEntryOrCreate, [
    layoutName,
  ]);
  const { isModified, emitSavingDesign } =
    LayouterGeneralComponent_OutputPropsSupplier;

  const saveHandler = () => {
    const newLayoutEntry: IProjectLayoutEntry = {
      ...sourceLayoutEntry,
      data: emitSavingDesign(),
    };
    projectPackagesWriter.saveLocalProjectLayout(newLayoutEntry);
    // uiActions.closeSubPage();
    UiLayouterCore.rebase();
  };
  return (
    <div css={style}>
      <RouteHeaderBar
        title={`edit project layout: ${sourceLayoutEntry.layoutName}`}
        backPagePath="/projectResource"
        canSave={isModified}
        saveHandler={saveHandler}
      />
      <LayouterGeneralComponent layout={sourceLayoutEntry.data} />
    </div>
  );
};

const style = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  display: flex;
  flex-direction: column;
`;
