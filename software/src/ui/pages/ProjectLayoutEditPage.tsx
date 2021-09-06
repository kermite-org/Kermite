import { css, FC, jsx } from 'qx';
import { fallbackProjectLayoutEntry, IProjectLayoutEntry } from '~/shared';
import { uiTheme } from '~/ui/base';
import { IPageSpec_ProjectLayoutEdit } from '~/ui/commonModels';
import { projectPackagesWriter, uiActions, uiReaders } from '~/ui/commonStore';
import { RouteHeaderBar } from '~/ui/components/organisms/RouteHeaderBar/RouteHeaderBar';
import {
  LayouterGeneralComponent,
  LayouterGeneralComponent_OutputPropsSupplier,
} from '~/ui/features';
import { useMemoEx } from '~/ui/helpers';

type Props = {
  spec: IPageSpec_ProjectLayoutEdit;
};

const readers = {
  getSourceLayoutEntryOrCreate(layoutName: string): IProjectLayoutEntry {
    const projectInfo = uiReaders.editTargetProject;
    const layoutEntry = projectInfo?.layouts.find(
      (it) => it.layoutName === layoutName,
    );
    return layoutEntry || fallbackProjectLayoutEntry;
  },
};

export const ProjectLayoutEditPage: FC<Props> = ({ spec: { layoutName } }) => {
  const sourceLayoutEntry = useMemoEx(readers.getSourceLayoutEntryOrCreate, [
    layoutName,
  ]);
  const { isModified, emitSavingDesign } =
    LayouterGeneralComponent_OutputPropsSupplier;

  const saveHandler = () => {
    projectPackagesWriter.saveLocalProjectLayout({
      ...sourceLayoutEntry,
      data: emitSavingDesign(),
    });
    uiActions.closeSubPage();
  };
  return (
    <div css={style}>
      <RouteHeaderBar
        title={`edit project layout: ${sourceLayoutEntry.layoutName}`}
        backPagePath="/projectEdit"
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
