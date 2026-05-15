/**
 * 将服务器响应Data.Message字段翻译为中文，是一个暂未实现的中间层
 * @param error 错误信息
 * @returns 中文
 */
export default function (error: string): string {
  switch (error) {
    case 'Login.Invalid':
      return '用户名或密码错误'
    case 'Login.Password.Invalid':
      return '用户名已被注册'
  }
  return error
}
