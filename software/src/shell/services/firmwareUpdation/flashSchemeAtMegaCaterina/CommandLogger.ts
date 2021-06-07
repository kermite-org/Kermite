export class CommandLogger {
  logText: string = '';

  reset() {
    this.logText = '';
  }

  log(text: string) {
    console.log(text);
    this.logText += `${text}\r\n`;
  }

  flush(): string {
    return this.logText;
  }
}
