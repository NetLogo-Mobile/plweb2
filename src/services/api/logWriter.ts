// This function is toally weitten by ChatGPT-4

export type LogSession = {
  type: 0;
  region: string;
  userID: string;
  deviceID: string;
  version: string;
  timezone: number;
  language: string;
  screenSize: number;
  timestamp: number;
  relativeTime: number; // The difference between the timestamp of this event and the timestamp of the start of the session.
};

export type LogPage = {
  type: 1;
  pageLink: string;
  timestamp: number;
  relativeTime: number;
};

export type LogEvent = {
  type: 2;
  category: string;
  action: string;
  label: string;
  extra?: Record<string, string>;
  timestamp: number;
  relativeTime: number;
};

export type LogItem = LogSession | LogPage | LogEvent;

/**
 * Logger class for collecting, formatting, and sending user interaction logs.
 *
 * Supports logging sessions, page views, and events, and provides methods for
 * generating human-readable explanations and binary representations of logs.
 *
 * @remarks
 * - Log types:
 *   - 0: Session
 *   - 1: Page
 *   - 2: Event
 */
class Logger {
  logs: LogItem[] = [];
  private startTime = Date.now();
  logSession(session: Omit<LogSession, "type" | "relativeTime">) {
    const now = Date.now();
    this.logs.push({ type: 0, ...session, relativeTime: 0 });
    this.startTime = now;
    setInterval(
      async () => {
        await this.sendLogs();
      },
      1000 * 60 * 3,
    );
  }
  logPageView(page: Omit<LogPage, "type" | "relativeTime">) {
    const now = Date.now();
    this.logs.push({ type: 1, ...page, relativeTime: now - this.startTime });
    window.$ErrorLogger.writeLog(page.pageLink);
  }
  logEvent(event: Omit<LogEvent, "type" | "relativeTime">) {
    const now = Date.now();
    this.logs.push({ type: 2, ...event, relativeTime: now - this.startTime });
    window.$ErrorLogger.writeLog(event.category + event.action + event.label);
  }
  static writeTime(relativeTime: number) {
    const ms = relativeTime % 1000;
    const totalSeconds = Math.floor(relativeTime / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
  }
  getExplanations(): string {
    return this.logs
      .map((log) => {
        if (log.type === 0) {
          return `Session (${log.version}, Timezone ${log.timezone}, Region ${log.region}):\nStarted at UTC ${new Date(log.timestamp).toISOString().replace("T", " ").slice(0, 19)};\nClient on Web, with an estimated screen size of ${log.screenSize}\n#######################`;
        } else if (log.type === 1) {
          return `* ${Logger.writeTime(log.relativeTime)}: ${log.pageLink}`;
        } else if (log.type === 2) {
          let txt = `- ${Logger.writeTime(log.relativeTime)}: ${log.category}, ${log.action}, ${log.label}`;
          if (log.extra && Object.keys(log.extra).length) {
            for (const k in log.extra) {
              txt += `\n  + ${k}: ${log.extra[k]}`;
            }
          }
          return txt;
        }
        return "";
      })
      .join("\n");
  }
  // eslint-disable-next-line complexity
  getBinary(): Uint8Array {
    const buffer: number[] = [];
    const writeByte = (v: number) => buffer.push(v & 0xff);
    const writeSByte = (v: number) => buffer.push(v < 0 ? 256 + v : v);
    const writeUInt32 = (v: number) => {
      for (let i = 0; i < 4; i++) buffer.push((v >> (i * 8)) & 0xff);
    };
    const writeString = (str: string) => {
      const utf8 = new TextEncoder().encode(str);
      writeUInt32(utf8.length);
      buffer.push(...utf8);
    };
    for (const log of this.logs) {
      writeByte(log.type);
      if (log.type === 0) {
        writeString(log.userID || "");
        writeString(log.deviceID || "");
        writeSByte(log.timezone || 0);
        writeString(log.language || "");
        writeSByte(4);
        writeString(log.version || "");
        writeUInt32(Math.round((log.screenSize || 0) * 10));
      } else if (log.type === 1) {
        writeUInt32(log.relativeTime || 0);
        writeString(log.pageLink || "");
      } else if (log.type === 2) {
        writeUInt32(log.relativeTime || 0);
        writeString(log.category || "*");
        writeString(log.action || "*");
        writeString(log.label || "*");
        const keys = Object.keys(log.extra || {});
        writeSByte(keys.length);
        for (const k of keys) {
          writeString(k);
          const val: string = (log.extra && log.extra[k]) ?? "";
          writeString(val);
        }
      }
    }
    return new Uint8Array(buffer);
  }
  private async sendLogs() {
    const binary = this.getBinary();
    const arrayBuffer = new Uint8Array(binary).buffer;
    const response = await fetch("https://plogger.plweb.cloud/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: new Blob([arrayBuffer]),
    });
    if (!response.ok && response.status !== 200) {
      console.error("Failed to send logs:", response);
    } else {
      this.logs = [];
    }
  }
}

export const LogManager = new Logger();
