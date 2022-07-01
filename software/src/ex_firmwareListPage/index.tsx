import { applyGlobalStyle, css, FC, jsx, render, rerender } from 'alumina';
import { IKrsFirmwaresSummaryJsonData } from '~/shared/defs/onlineResourceTypes';

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
  loadedData?: IKrsFirmwaresSummaryJsonData;
})();

async function fetchFirmwareListingData() {
  const url = 'https://assets.kermite.org/krs/resources2/index.firmwares.json';
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
  firmwareId: string;
  projectPath: string;
  variationName: string;
  targetMcu: 'rp2040';
  buildRevision: number;
  buildStatus: string;
  buildTimestamp: string;
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

  const firmwareItems: IFirmwareItem[] = loadedData.firmwares.map((it) => ({
    firmwareId: it.firmwareId,
    projectPath: it.firmwareProjectPath,
    // keyboardName: it.keyboardName,
    variationName: it.variationName,
    targetMcu: it.targetDevice,
    buildRevision: it.releaseBuildRevision,
    buildStatus: it.buildResult === 'success' ? 'ok' : 'ng',
    buildTimestamp: it.buildTimestamp,
    sourceUrl: `https://github.com/kermite-org/Kermite/tree/master/firmware/src/projects/${it.firmwareProjectPath}/${it.variationName}`,
    distUrl: `https://github.com/kermite-org/KermiteResourceStore/tree/master/resources2/firmwares/${it.firmwareProjectPath}`,
  }));

  return (
    <div class={cssPageRoot}>
      <h1>Kermite Firmware Build Status</h1>
      <div className="main-table-frame">
        <table>
          <thead>
            <tr>
              <th>firmware id</th>
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
                <td>{item.firmwareId}</td>
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
      <div className="text-info">last update: {lastUpdateTimeText}</div>
    </div>
  );
};

window.addEventListener('load', () => {
  console.log('firmware list page 220625a');
  applyGlobalStyle(globalCss);
  const appDiv = document.getElementById('app');
  render(() => <PageRoot />, appDiv);
  fetchFirmwareListingData();
});
