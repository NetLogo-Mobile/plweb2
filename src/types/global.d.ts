// 全局类型定义，用于解决 KaTeX 类型检查问题

declare global {
  // 扩展 Error 构造函数，使其可以处理 unknown 类型
  var Error: ErrorConstructor;

  // 定义一个 Error 构造函数，可以接受 unknown 类型的参数
  interface ErrorConstructor {
    new (message?: string | unknown): Error;
    (message?: string | unknown): Error;
  }
}

// 重新导出 Error 以确保类型系统正确识别
export {};
