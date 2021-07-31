import { css, FC, jsx, useEffect, useState } from 'qx';
import { router } from '~/ui/base';
import { onboadingPanelDisplayStateModel, PagePaths } from '~/ui/commonModels';
import { Icon } from '~/ui/components';
import { NavigationStepList } from '~/ui/components/molecules/NavigationStepList';

type Props = {
  className?: string;
};

const steps = [0, 1, 2, 3, 4, 5];

const stepToPagePathMap: { [step: number]: PagePaths | undefined } = {
  0: '/home',
  1: '/projectSelection',
  2: '/firmwareUpdation',
  3: '/presetBrowser',
  4: '/editor',
  5: '/layouter',
};

const stepInstructionMap: { [step: number]: string } = {
  0: 'Step0: ホーム画面です。',
  1: 'Step1: 使用するキーボードを選択します。',
  2: 'Step2: デバイスにファームウェアを書き込みます。',
  3: 'Step3: 使用するプリセットを選び、プロファイルを作成します。',
  4: 'Step4: キーマッピングを編集し、デバイスに書き込みます。',
  5: 'Step5: キーのレイアウトにバリエーションがある場合、ここでキーの配置を調整します。',
};

export const OnboadingPanel: FC<Props> = ({ className }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const pagePath = stepToPagePathMap[step];
    if (pagePath) {
      router.navigateTo(pagePath);
    }
  }, [step]);

  return (
    <div css={style} className={className}>
      <NavigationStepList
        className="step-list"
        steps={steps}
        currentStep={step}
        setCurrentStep={setStep}
      />
      <div className="instruction-part">
        <p>ステップを順番に進めてキーボードのセットアップを行いましょう</p>
        <p>{stepInstructionMap[step]}</p>
      </div>
      <div
        className="close-button"
        onClick={onboadingPanelDisplayStateModel.close}
      >
        <Icon spec="fa fa-times" />
      </div>
    </div>
  );
};

const style = css`
  height: 110px;
  padding: 10px 15px;
  position: relative;

  > .step-list {
  }

  > .instruction-part {
    margin-top: 10px;
    line-height: 1.5em;
  }

  > .close-button {
    position: absolute;
    right: 0;
    top: 0;
    margin: 12px;
    cursor: pointer;
  }
`;
