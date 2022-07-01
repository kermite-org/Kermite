import { applyGlobalStyle, css, FC, jsx, render, rerender } from 'alumina';
import { flattenArray } from '~/shared';
import { IKrsSummaryJsonData } from '~/shared/defs/OnlineResourceTypes';

const globalCss = css`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html,
  body,
  #app {
    height: 100%;
  }

  body {
    overflow: auto;
  }

  #app {
    font-family: 'Roboto', sans-serif;
  }
`;

const state = new (class {
  error: string = '';
  loadedData?: IKrsSummaryJsonData;
})();

async function fetchFirmwareListingData() {
  const url = 'https://app.kermite.org/krs/resources/summary.json';
  try {
    console.log(`fetching ${url}`);
    const res = await fetch(url);
    const data = await res.json();
    console.log(`data loaded`);
    // console.log({ profileData });
    state.loadedData = data;
  } catch (err) {
    console.error(err);
    state.error = 'failed to fetch data';
  }
  rerender();
}

interface IFirmwareItem {
  projectPath: string;
  keyboardName: string;
  variationName: string;
  targetMcu: string;
  buildRevision: number;
  buildStatus: string;
  sourceUrl: string;
  distUrl: string;
}

const cssPageRoot = css`
  height: 100%;

  padding: 20px;

  > h1 {
    font-size: 30px;
  }

  > .main-table-frame {
    margin-top: 10px;

    > table {
      border-collapse: collapse;
      > thead {
        > tr {
          background: #aaa;
        }
      }
      > tbody {
        tr:nth-child(odd) {
          background: #eee;
        }
      }

      th,
      td {
        padding: 10px 10px;
      }
    }
  }

  > .text-info {
    margin-top: 20px;
    padding-left: 10px;
  }
`;

const PageRoot: FC = () => {
  if (state.error) {
    return <div>{state.error}</div>;
  }
  if (!state.loadedData) {
    return <div>loading</div>;
  }
  const { loadedData } = state;

  const lastUpdateTimeText = new Date(
    loadedData.info.updateAt,
  ).toLocaleString();

  const firmwareItems: IFirmwareItem[] = flattenArray(
    loadedData.projects.map((project) => {
      return project.firmwares.map((firmware) => ({
        projectPath: project.projectPath,
        keyboardName: project.keyboardName,
        variationName: firmware.variationName,
        targetMcu: firmware.targetDevice,
        buildRevision: firmware.buildRevision,
        buildStatus: 'ok',
        sourceUrl: `https://github.com/kermite-org/Kermite/tree/master/firmware/src/projects/${project.projectPath}/${firmware.variationName}`,
        distUrl: `https://github.com/kermite-org/KermiteResourceStore/tree/master/resources/variants/${project.projectPath}`,
      }));
    }),
  );

  return (
    <div css={cssPageRoot}>
      <h1>Kermite Firmware Build Status</h1>
      <div className="main-table-frame">
        <table>
          <thead>
            <tr>
              <th>keyboard name</th>
              <th>project path</th>
              <th>variation name</th>
              <th>target mcu</th>
              <th>source</th>
              <th>build</th>
              <th>rev</th>
              <th>status</th>
            </tr>
          </thead>
          <tbody>
            {firmwareItems.map((item) => (
              <tr key={item.projectPath + '_' + item.variationName}>
                <td>{item.keyboardName}</td>
                <td>{item.projectPath}</td>
                <td>{item.variationName}</td>
                <td>{item.targetMcu}</td>
                <td>
                  <a href={item.sourceUrl}>link</a>
                </td>
                <td>
                  <a href={item.distUrl}>link</a>
                </td>
                <td>{item.buildRevision}</td>
                <td>ok</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-info">last updation: {lastUpdateTimeText}</div>
    </div>
  );
};

window.addEventListener('load', () => {
  console.log('firmware list page 0629a');
  applyGlobalStyle(globalCss);
  const appDiv = document.getElementById('app');
  render(() => <PageRoot />, appDiv);
  fetchFirmwareListingData();
});
