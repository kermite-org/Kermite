import { css, FC, jsx, useEffect, useState } from 'qx';
import { router } from '~/ui/base';
import { PagePaths } from '~/ui/commonModels';
import { NavigationStepList } from '~/ui/components/molecules/NavigationStepList';

type Props = {
  className?: string;
};

const steps = [0, 1, 2, 3, 4, 5];

const stepToPagePathMap: { [step: number]: PagePaths | undefined } = {
  0: undefined,
  1: '/projectSelection',
  2: '/firmwareUpdation',
  3: '/presetBrowser',
  4: '/editor',
  5: '/layouter',
};

const stepInstructionMap: { [step: number]: string } = {
  0: '',
  1: '使用するキーボードを選択します。',
  2: 'デバイスにファームウェアを書き込みます。',
  3: '使用するプリセットを選び、プロファイルを作成します。',
  4: 'キーマッピングを編集し、デバイスに書き込みます。',
  5: 'キーのレイアウトにバリエーションがある場合、ここでキーの配置を調整します。',
};

export const OnboadingPanel: FC<Props> = ({ className }) => {
  const [step, setStep] = useState(2);

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
      <div className="instruction-box">{stepInstructionMap[step]}</div>
    </div>
  );
};

const style = css`
  background: #c8d8e8;
  height: 200px;
  padding: 10px;

  > .step-list {
  }

  > .instruction-box {
    margin-top: 10px;
    color: #36a;
  }
`;
