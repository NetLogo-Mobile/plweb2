import { ref } from "vue";
import storageManager from "./storage";
import { showNotification } from "@popup/naiveui";

/**
 * 增强的错误日志系统
 * 记录详细的错误信息和上下文，便于调试
 */

export interface ErrorContext {
  type: "vue" | "window" | "promise" | "custom" | "api" | "network";
  message: string;
  stack?: string;
  component?: string;
  source?: string;
  lineno?: number;
  colno?: number;
  method?: string;
  url?: string;
  statusCode?: number;
  responseData?: any;
  requestData?: any;
  userAgent?: string;
  userId?: string;
  timestamp?: number;
  breadcrumbs?: Breadcrumb[];
  [key: string]: any;
}

export interface Breadcrumb {
  timestamp: number;
  category: string;
  message: string;
  data?: any;
}

export interface ErrorLog extends ErrorContext {
  id: string;
  timestamp: number;
  sessionId: string;
}

class ErrorLogger {
  private logs = ref<ErrorLog[]>([]);
  private maxLogs = 1000;
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs = 50;
  private sessionId: string;
  private debugMode = true;
  private maxJsonDepth = 4;
  // For deduplication and reducing notification spam
  private lastErrorSignature?: string;
  private lastErrorTime = 0;
  private lastErrorCount = 0;
  private dedupInterval = 2500; // milliseconds

  constructor(app: any) {
    this.sessionId = this.generateSessionId();
    this.initDebugMode();

    // Always load logs from storage so they survive refreshes (sanitization performed on save)
    this.loadLogsFromStorage();

    this.setupGlobalHandlers(app);
  }

  private initDebugMode() {
    const debugConfig = storageManager.getObj("userConfig").value?.debugger;
    this.debugMode = debugConfig === "on" || debugConfig === "export";
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 限制 JSON 深度，最多保留 4 层
   */
  private limitJsonDepth(obj: any, depth = 0): any {
    if (depth >= this.maxJsonDepth) {
      if (typeof obj === "object" && obj !== null) {
        return `[Object - max depth ${this.maxJsonDepth} reached]`;
      }
      return obj;
    }

    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj !== "object") {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.slice(0, 10).map((item) => this.limitJsonDepth(item, depth + 1));
    }

    const result: any = {};
    const keys = Object.keys(obj).slice(0, 20);
    
    for (const key of keys) {
      try {
        result[key] = this.limitJsonDepth(obj[key], depth + 1);
      } catch {
        result[key] = "[Error reading property]";
      }
    }

    if (Object.keys(obj).length > 20) {
      result["..."] = `[${Object.keys(obj).length - 20} more properties]`;
    }

    return result;
  }

  private loadLogsFromStorage() {
    try {
      const stored = localStorage.getItem("error_logs");
      if (stored) {
        this.logs.value = JSON.parse(stored);
        // 不适用StorageManager是为了防止其本身也有错误
        // We don't use StorageManager to avoid potential errors from it
      }
    } catch (e) {
      console.error("Failed to load error logs from storage", e);
    }
  }

  private saveLogsToStorage() {
    try {
      // Serialize only a sanitized, serializable snapshot to avoid losing logs due to
      // unserializable Error objects or circular references.
      const toStore = this.logs.value.slice(-this.maxLogs).map((log) => {
        return {
          id: log.id,
          timestamp: log.timestamp,
          sessionId: log.sessionId,
          userAgent: log.userAgent,
          userId: log.userId,
          url: log.url,
          type: log.type,
          message: log.message,
          // keep only the first line of stack to save space and still be useful
          stack: log.stack ? String(log.stack).split("\n")[0] : undefined,
          statusCode: log.statusCode,
          responseData: log.responseData,
          requestData: log.requestData,
          breadcrumbs: log.breadcrumbs,
        };
      });

      localStorage.setItem("error_logs", JSON.stringify(toStore));
    } catch (e) {
      console.error("Failed to save error logs to storage", e);
    }
  }

  private setupGlobalHandlers(app: any) {
    // Vue error handler
    app.config.errorHandler = (err: any, _vm: any, info: any) => {
      this.captureError({
        type: "vue",
        message: err?.message || String(err),
        stack: err?.stack,
        // pass original Error so console can expand it
        error: err,
        component: info,
        breadcrumbs: [...this.breadcrumbs],
      });
    };

    // Window error handler
    window.onerror = (message, source, lineno, colno, error) => {
      this.captureError({
        type: "window",
        message: String(message),
        stack: error?.stack,
        // pass original error object so console can expand it
        error,
        source,
        lineno,
        colno,
        breadcrumbs: [...this.breadcrumbs],
      });
      // Allow browser to also show its default error logging
      return false;
    };

    // Unhandled promise rejection
    window.addEventListener("unhandledrejection", (event) => {
      this.captureError({
        type: "promise",
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        // pass original rejection reason so console can expand it
        error: event.reason,
        breadcrumbs: [...this.breadcrumbs],
      });
      // Do not call event.preventDefault() so the browser's default logging remains visible
    });
  }

  /**
   * 捕获错误并记录（含去重与精简输出）
   */
  captureError(context: ErrorContext) {
    // Only store non-vital custom logs when debug mode is on
    if (!this.debugMode && context.type !== "vue" && context.type !== "window" && context.type !== "promise") {
      return;
    }

    // Prepare sanitized log for storage
    const errorLog: ErrorLog = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      userId: storageManager.getObj("userInfo")?.value?.ID || "unknown",
      url: window.location.href,
      ...context,
      responseData: context.responseData ? this.limitJsonDepth(context.responseData) : context.responseData,
      requestData: context.requestData ? this.limitJsonDepth(context.requestData) : context.requestData,
      breadcrumbs: context.breadcrumbs?.map(bc => ({
        ...bc,
        data: bc.data ? this.limitJsonDepth(bc.data) : bc.data,
      })) || [],
    };

    // Deduplication: if the same message+stack appears within dedupInterval, treat as duplicate
    const signature = `${context.message || ''}||${context.stack || ''}`;
    const now = Date.now();
    const isDuplicate = signature === this.lastErrorSignature && (now - this.lastErrorTime) < this.dedupInterval;

    // push to storage regardless
    if (this.logs.value.length >= this.maxLogs) this.logs.value.shift();
    this.logs.value.push(errorLog);
    this.saveLogsToStorage();

    if (isDuplicate) {
      this.lastErrorCount++;
      // skip console and notification for duplicates to avoid spam
      return;
    }

    // If previous error repeated multiple times, emit a compact summary to console
    if (this.lastErrorCount > 1) {
      console.info(`(Previous error repeated ${this.lastErrorCount} times)`);
    }

    // Reset counters for new signature
    this.lastErrorSignature = signature;
    this.lastErrorTime = now;
    this.lastErrorCount = 1;

    // Show a concise notification for critical errors
    if (this.isErrorCritical(context.type)) {
      this.showErrorNotification(errorLog, this.lastErrorCount);
    }

    // Console output: be concise to avoid double noise (browser already prints native errors)
    const rawContext = { ...context };
    console.groupCollapsed(`%c[${context.type.toUpperCase()}] ${context.message}`, "color: red; font-weight: bold");
    if (rawContext.error) {
      // print the original Error object so it can be expanded when needed
      console.error("Error object:", rawContext.error);
    } else if (context.stack) {
      console.error("Stack:", context.stack);
    }
    if (this.debugMode) {
      console.debug("Full context (sanitized):", errorLog);
    }
    console.groupEnd();
  }

  /**
   * 添加面包屑（导航轨迹）
   */
  addBreadcrumb(category: string, message: string, data?: any) {
    const breadcrumb: Breadcrumb = {
      timestamp: Date.now(),
      category,
      message,
      data: data ? this.limitJsonDepth(data) : undefined,
    };

    this.breadcrumbs.push(breadcrumb);
    
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  /**
   * 记录自定义日志
   */
  writeLog(message: any, category = "info", data?: any) {
    if (!this.debugMode) return;

    const messageStr = typeof message === "string" ? message : JSON.stringify(this.limitJsonDepth(message));
    this.addBreadcrumb(category, messageStr, data);

    this.captureError({
      type: "custom",
      message: messageStr,
      breadcrumbs: [...this.breadcrumbs],
    });
  }

  /**
   * 记录 API 错误
   */
  captureApiError(method: string, path: string, statusCode: number, responseData?: any, requestData?: any) {
    this.captureError({
      type: "api",
      message: `API Error: ${method} ${path}`,
      method,
      url: path,
      statusCode,
      responseData: responseData ? this.limitJsonDepth(responseData) : undefined,
      requestData: requestData ? this.limitJsonDepth(requestData) : undefined,
      breadcrumbs: [...this.breadcrumbs],
    });
  }

  private isErrorCritical(type: string): boolean {
    return ["vue", "window", "promise"].includes(type);
  }

  private showErrorNotification(errorLog: ErrorLog, repeatCount = 1) {
    const shortDescription = repeatCount > 1 ? `Occurred ${repeatCount} times` : "";

    showNotification({
      title: "Error",
      content: errorLog.message,
      description: shortDescription,
    });

    // Only print the full sanitized details when debug mode is enabled to avoid noise
    if (this.debugMode) {
      console.group(`Error details: ${errorLog.id}`);
      console.log("Sanitized context:", errorLog);
      const raw = (errorLog as any).error;
      if (raw) console.log("Original error:", raw);
      console.groupEnd();
    }
  }

  /**
   * 获取所有日志
   */
  getLogs() {
    return this.logs.value;
  }

  /**
   * 按条件过滤日志
   */
  filterLogs(filter: { type?: string; sessionId?: string; userId?: string }) {
    return this.logs.value.filter((log) => {
      if (filter.type && log.type !== filter.type) return false;
      if (filter.sessionId && log.sessionId !== filter.sessionId) return false;
      if (filter.userId && log.userId !== filter.userId) return false;
      return true;
    });
  }

  /**
   * 获取面包屑轨迹
   */
  getBreadcrumbs() {
    return this.breadcrumbs;
  }

  /**
   * 清空所有日志
   */
  clearLogs() {
    this.logs.value = [];
    this.breadcrumbs = [];
    localStorage.removeItem("error_logs");
  }

  /**
   * 获取统计信息
   */
  getStatistics() {
    const typeCount: { [key: string]: number } = {};
    this.logs.value.forEach((log) => {
      typeCount[log.type] = (typeCount[log.type] || 0) + 1;
    });

    return {
      totalErrors: this.logs.value.length,
      sessionId: this.sessionId,
      typeCount,
      firstError: this.logs.value[0],
      lastError: this.logs.value[this.logs.value.length - 1],
    };
  }

  exportToTxt(): void {
    let content = `=== Error Log Report ===\n`;
    content += `Generated: ${new Date().toISOString()}\n`;
    content += `Session ID: ${this.sessionId}\n`;
    content += `Total Errors: ${this.logs.value.length}\n`;
    content += `\n=== Statistics ===\n`;

    const stats = this.getStatistics();
    Object.entries(stats.typeCount).forEach(([type, count]) => {
      content += `${type}: ${count}\n`;
    });

    content += `\n=== Errors ===\n`;
    this.logs.value.forEach((log) => {
      content += `\n[${new Date(log.timestamp).toISOString()}] ${log.type.toUpperCase()}\n`;
      content += `ID: ${log.id}\n`;
      content += `Message: ${log.message}\n`;
      content += `URL: ${log.url}\n`;
      content += `User: ${log.userId}\n`;
      if (log.stack) {
        content += `Stack: ${log.stack}\n`;
      }
      if (log.statusCode) {
        content += `Status Code: ${log.statusCode}\n`;
      }
      if (log.breadcrumbs && log.breadcrumbs.length > 0) {
        content += `\nBreadcrumbs:\n`;
        log.breadcrumbs.forEach((bc) => {
          content += `  - [${new Date(bc.timestamp).toISOString()}] ${bc.category}: ${bc.message}\n`;
        });
      }
      content += `\n${  "=".repeat(50)  }\n`;
    });

    if (content === "") content = "No error logs available.";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `error_logs_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export default ErrorLogger;
