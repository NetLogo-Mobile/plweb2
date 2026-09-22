// see repository CIVITAS-John/Quantum-Intermediates ( ask @CIVITAS-John for access )
// Up till now, nobody kowns whether it works, as the log-uploading API well repond with 200 nomatter what.

export type LogSession = {
  type: 0
  region: string
  userID: string
  deviceID: string
  version: string
  timezone: number
  language: string
  screenSize: number
  timestamp: number
  relativeTime: number // The difference between the timestamp of this event and the timestamp of the start of the session.
}

export type LogPage = {
  type: 1
  pageLink: string
  timestamp: number
  relativeTime: number
}

export type LogEvent = {
  type: 2
  category: string
  action: string
  label: string
  extra?: Record<string, string>
  timestamp: number
  relativeTime: number
}

export type LogItem = LogSession | LogPage | LogEvent

class BinaryWriter {
  private buffer: number[] = []

  writeByte(value: number) {
    this.buffer.push(value & 0xff)
  }

  writeSignedByte(value: number) {
    this.buffer.push(value < 0 ? 256 + value : value)
  }

  writeUInt32(value: number) {
    for (let index = 0; index < 4; index++) {
      this.buffer.push((value >> (index * 8)) & 0xff)
    }
  }

  writeString(value: string) {
    const utf8 = new TextEncoder().encode(value)
    this.writeUInt32(utf8.length)
    this.buffer.push(...utf8)
  }

  toUint8Array() {
    return new Uint8Array(this.buffer)
  }
}

function writeSession(writer: BinaryWriter, log: LogSession) {
  writer.writeString(log.userID ?? '')
  writer.writeString(log.deviceID ?? '')
  writer.writeSignedByte(log.timezone ?? 0)
  writer.writeString(log.language ?? '')
  writer.writeSignedByte(4)
  writer.writeString(log.version ?? '')
  writer.writeUInt32(Math.round((log.screenSize ?? 0) * 10))
}

function writePage(writer: BinaryWriter, log: LogPage) {
  writer.writeUInt32(log.relativeTime ?? 0)
  writer.writeString(log.pageLink ?? '')
}

function writeEvent(writer: BinaryWriter, log: LogEvent) {
  writer.writeUInt32(log.relativeTime ?? 0)
  writer.writeString(log.category ?? '*')
  writer.writeString(log.action ?? '*')
  writer.writeString(log.label ?? '*')
  const entries = Object.entries(log.extra ?? {})
  writer.writeSignedByte(entries.length)
  for (const [key, value] of entries) {
    writer.writeString(key)
    writer.writeString(value)
  }
}

function writeLog(writer: BinaryWriter, log: LogItem) {
  writer.writeByte(log.type)
  if (log.type === 0) writeSession(writer, log)
  else if (log.type === 1) writePage(writer, log)
  else writeEvent(writer, log)
}

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
  logs: LogItem[] = []
  private startTime = Date.now()
  private uploadTimer: ReturnType<typeof setInterval> | null = null
  private sending = false

  logSession(session: Omit<LogSession, 'type' | 'relativeTime'>) {
    const now = Date.now()
    this.logs.push({ type: 0, ...session, relativeTime: 0 })
    this.startTime = now
    this.startUploadTimer()
  }
  logPageView(page: Omit<LogPage, 'type' | 'relativeTime'>) {
    const now = Date.now()
    this.logs.push({ type: 1, ...page, relativeTime: now - this.startTime })
    window.$ErrorLogger.writeLog(page.pageLink)
  }
  logEvent(event: Omit<LogEvent, 'type' | 'relativeTime'>) {
    const now = Date.now()
    this.logs.push({ type: 2, ...event, relativeTime: now - this.startTime })
    window.$ErrorLogger.writeLog(event.category + event.action + event.label)
  }
  static writeTime(relativeTime: number) {
    const ms = relativeTime % 1000
    const totalSeconds = Math.floor(relativeTime / 1000)
    const seconds = totalSeconds % 60
    const minutes = Math.floor(totalSeconds / 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
  }
  getExplanations(): string {
    return this.logs
      .map((log) => {
        if (log.type === 0) {
          return `Session (${log.version}, Timezone ${log.timezone}, Region ${log.region}):\nStarted at UTC ${new Date(log.timestamp).toISOString().replace('T', ' ').slice(0, 19)};\nClient on Web, with an estimated screen size of ${log.screenSize}\n#######################`
        } else if (log.type === 1) {
          return `* ${Logger.writeTime(log.relativeTime)}: ${log.pageLink}`
        } else if (log.type === 2) {
          let txt = `- ${Logger.writeTime(log.relativeTime)}: ${log.category}, ${log.action}, ${log.label}`
          if (log.extra && Object.keys(log.extra).length) {
            for (const k in log.extra) {
              txt += `\n  + ${k}: ${log.extra[k]}`
            }
          }
          return txt
        }
        return ''
      })
      .join('\n')
  }
  getBinary(): Uint8Array {
    const writer = new BinaryWriter()
    this.logs.forEach((log) => writeLog(writer, log))
    return writer.toUint8Array()
  }

  stop() {
    if (!this.uploadTimer) return
    clearInterval(this.uploadTimer)
    this.uploadTimer = null
  }

  private startUploadTimer() {
    if (this.uploadTimer) return
    this.uploadTimer = setInterval(() => {
      void this.sendLogs()
    }, 1000 * 60 * 3)
  }

  private async sendLogs() {
    if (this.sending || this.logs.length === 0) return
    this.sending = true
    const binary = this.getBinary()
    const arrayBuffer = new Uint8Array(binary).buffer
    try {
      const response = await fetch('https://plogger.plweb.cloud/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: new Blob([arrayBuffer]),
      })
      if (!response.ok) {
        console.error('Failed to send logs:', response)
      } else {
        this.logs = []
      }
    } catch (error) {
      console.error('Failed to send logs:', error)
    } finally {
      this.sending = false
    }
  }
}

export const LogManager = new Logger()
