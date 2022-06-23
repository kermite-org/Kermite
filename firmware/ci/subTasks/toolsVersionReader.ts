import { execueteOneliner } from "../helpers";

export interface IEnvironmentVersions {
  OS: string;
  make: string;
  "arm-none-eabi-gcc": string;
}

function readOsVersion(): string {
  const isMacOS = process.platform === "darwin";
  const isLinux = process.platform === "linux";
  const isWindows = process.platform === "win32";

  if (isMacOS) {
    const namePart = execueteOneliner(`sw_vers -productName`);
    const versionPart = execueteOneliner(`sw_vers -productVersion`);
    return `${namePart} ${versionPart}`;
  } else if (isLinux) {
    return execueteOneliner(`lsb_release -d`)
      .replace("Description:", "")
      .trim();
  } else if (isWindows) {
    return execueteOneliner(`ver`);
  }
  return "";
}

function readArmNoneEabiGccVersion(): string {
  const text = execueteOneliner("arm-none-eabi-gcc --version");
  const m = text.match(/^arm-none-eabi-gcc \(.* (.+?)\) (.+?) (.+?) /m);
  return (m && `arm-none-eabi-gcc ${m[1]} ${m[2]} ${m[3]}`) || "";
}

export function readEnvironmentVersions(): IEnvironmentVersions {
  const osVersion = readOsVersion();
  const makeVersion = execueteOneliner(`make -v | grep "GNU Make"`);
  const armNoneEabiGccVersion = readArmNoneEabiGccVersion();
  return {
    OS: osVersion,
    make: makeVersion,
    "arm-none-eabi-gcc": armNoneEabiGccVersion,
  };
}
