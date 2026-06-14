/**
 * API Mock 数据工厂
 * 
 * 覆盖 plweb2 所有已知 API 路径（来自 src/services/api/types.ts PathMap）
 * 确保每个 API 端点都有对应的 mock 响应
 */

// ==================== 类型定义 ====================
interface MockUser {
  ID: string
  Nickname: string
  Avatar: number
  AvatarRegion: number
  Verification: string
  Gold: number
  Diamond: number
  Level: number
  Experience: number
  Prestige: number
  Signature: string
  Decoration: number
  Fragment: number
  Subscription: number
  SubscriptionUntil: string
  IsBinded: boolean
  Regions: number[]
  Socials: Record<string, unknown>
}

interface MockSummary {
  ID: string
  Subject: string
  Category: string
  Tags: string[]
  Image: number
  UserID: string
  Nickname: string
  Avatar: number
  Date: string
  Stars: number
  Comments: number
  Derivatives: number
  IsStarred: boolean
}

interface MockComment {
  ID: string
  UserID: string
  Nickname: string
  Avatar: number
  Content: string
  Date: string
  Likes: number
  ReplyToID: string
  ReplyToNickname: string
}

// ==================== 测试数据 ====================

export const TEST_USER_ID = 'test-user-001'
export const TEST_EXPERIMENT_ID = '66a84559744ed757b46f8917'
export const TEST_CATEGORY = 'Discussion'

export const mockUser: MockUser = {
  ID: TEST_USER_ID,
  Nickname: 'TestUser',
  Avatar: 1,
  AvatarRegion: 1,
  Verification: 'user',
  Gold: 100,
  Diamond: 50,
  Level: 5,
  Experience: 1200,
  Prestige: 30,
  Signature: 'Hello from test',
  Decoration: 0,
  Fragment: 10,
  Subscription: 0,
  SubscriptionUntil: '',
  IsBinded: true,
  Regions: [1],
  Socials: {},
}

export const mockSummary: MockSummary = {
  ID: TEST_EXPERIMENT_ID,
  Subject: 'Test Discussion Topic',
  Category: TEST_CATEGORY,
  Tags: ['physics', 'test'],
  Image: 1,
  UserID: TEST_USER_ID,
  Nickname: 'TestUser',
  Avatar: 1,
  Date: new Date().toISOString(),
  Stars: 10,
  Comments: 5,
  Derivatives: 2,
  IsStarred: false,
}

export const mockComment: MockComment = {
  ID: 'comment-001',
  UserID: TEST_USER_ID,
  Nickname: 'TestUser',
  Avatar: 1,
  Content: 'This is a test comment',
  Date: new Date().toISOString(),
  Likes: 3,
  ReplyToID: '',
  ReplyToNickname: '',
}

// ==================== API 响应构造器 ====================

function successResponse(data: unknown, token?: string) {
  return {
    Status: 200,
    Message: 'OK',
    Data: data,
    Token: token || 'mock-token-12345',
    AuthCode: 'mock-auth-code-12345',
  }
}

function errorResponse(status: number, message: string) {
  return {
    Status: status,
    Message: message,
    Data: null,
  }
}

// ==================== 完整 API Mock 映射 ====================

/**
 * 所有已知 API 路径的 Mock 响应
 * 路径来自 src/services/api/types.ts 中的 PathMap 接口
 */
export const apiMocks: Record<string, (body?: unknown) => unknown> = {
  // ---- Users API ----
  '/Users/Authenticate': (body) => {
    const b = body as { arg1?: string; arg2?: string; token?: string }
    // 登录请求：arg1=邮箱/手机, arg2=密码; 或 token+authCode 自动登录
    if (b?.token || (b?.arg1 && b?.arg2)) {
      return successResponse({
        User: mockUser,
        Statistic: {
          FollowerCount: 10,
          FollowingCount: 5,
          CommentCount: 20,
          ExperimentCount: 3,
          Cover: null,
        },
        Library: {
          Blocks: [
            {
              $type: 'Quantum.Models.Contents.ListBlock, Quantum Models',
              Header: 'Featured',
              Summaries: [mockSummary],
              TargetLink: 'experiments://Featured',
              DefaultLink: '',
              DefaultText: '',
              FetchAmount: 10,
              FetchConfiguration: null,
              FetchSource: '',
              Locations: null,
              Permission: null,
              Type: 0,
            },
          ],
        },
        ContentTags: [{ Name: 'physics', Color: '#3397e9' }],
      })
    }
    // 匿名访问（null, null）
    return successResponse({
      User: { ...mockUser, Nickname: null },
      Statistic: { FollowerCount: 0, FollowingCount: 0, CommentCount: 0, ExperimentCount: 0, Cover: null },
      Library: {
        Blocks: [
          {
            $type: 'Quantum.Models.Contents.ListBlock, Quantum Models',
            Header: 'Featured',
            Summaries: [mockSummary],
            TargetLink: 'experiments://Featured',
            DefaultLink: '',
            DefaultText: '',
            FetchAmount: 10,
            FetchConfiguration: null,
            FetchSource: '',
            Locations: null,
            Permission: null,
            Type: 0,
          },
        ],
      },
      ContentTags: [{ Name: 'physics', Color: '#3397e9' }],
    })
  },

  '/Users/GetUser': () => {
    return successResponse({
      User: mockUser,
      Statistic: {
        FollowerCount: 10,
        FollowingCount: 5,
        CommentCount: 20,
        ExperimentCount: 3,
        Cover: {
          ID: TEST_EXPERIMENT_ID,
          Category: TEST_CATEGORY,
          Subject: 'Cover Experiment',
          Image: 1,
        },
      },
    })
  },

  '/Users/ModifyInformation': () => successResponse({}),
  '/Users/Rename': () => successResponse({}),
  '/Users/Follow': () => successResponse({}),
  '/Users/GetRelations': () => successResponse({ Users: [], TotalCount: 0 }),
  '/Users/Appoint': () => successResponse({}),
  '/Users/Ban': () => successResponse({}),
  '/Users/Block': () => successResponse({}),
  '/Users/Logout': () => successResponse({}),
  '/Users/ReceiveBonus': () => successResponse({ Gold: 10, Diamond: 0 }),
  '/Users/SetCover': () => successResponse({}),
  '/Users/Unban': () => successResponse({}),

  // ---- Contents API ----
  '/Contents/QueryExperiments': () => {
    return successResponse({
      Summaries: [mockSummary],
      TotalCount: 1,
    })
  },

  '/Contents/GetWorkspace': () => successResponse({ Workspace: {} }),

  '/Contents/GetLibrary': () => {
    return successResponse({
      Blocks: [
        {
          $type: 'Quantum.Models.Contents.ListBlock, Quantum Models',
          Header: 'Featured',
          Summaries: [mockSummary],
          TargetLink: 'experiments://Featured',
          DefaultLink: '',
          DefaultText: '',
          FetchAmount: 10,
          FetchConfiguration: null,
          FetchSource: '',
          Locations: null,
          Permission: null,
          Type: 0,
        },
      ],
    })
  },

  '/Contents/SubmitExperiment': () => successResponse({ ID: 'new-exp-001' }),

  '/Contents/GetDerivatives': () => successResponse({ Summaries: [], TotalCount: 0 }),

  '/Contents/GetProfile': () => {
    return successResponse({
      Experiments: {
        'Latest-Experiments': [mockSummary],
      },
    })
  },

  '/Contents/ConfirmExperiment': () => successResponse({}),

  '/Contents/GetSummary': () => {
    return successResponse({
      Summary: mockSummary,
      Description: 'This is a test experiment description with **markdown** content.',
      Content: '# Test Content\n\nSome content here.',
    })
  },

  '/Contents/MoveCategory': () => successResponse({}),
  '/Contents/StarContent': () => successResponse({}),

  // ---- Messages API ----
  '/Messages/RemoveComment': () => successResponse({}),

  '/Messages/GetComments': () => {
    return successResponse({
      Comments: [mockComment],
      TotalCount: 1,
    })
  },

  '/Messages/PostComment': () => {
    return successResponse({
      Comment: { ...mockComment, ID: 'new-comment-001', Content: 'Posted comment' },
    })
  },

  '/Messages/GetMessage': () => successResponse({ ...mockComment }),

  '/Messages/GetMessages': () => {
    return successResponse({
      Messages: [
        {
          ID: 'msg-001',
          Type: 'Comment',
          Content: 'Someone commented on your experiment',
          Date: new Date().toISOString(),
          IsRead: false,
          UserID: TEST_USER_ID,
          Nickname: 'TestUser',
          Avatar: 1,
          TargetID: TEST_EXPERIMENT_ID,
          TargetSubject: 'Test Discussion Topic',
        },
      ],
      TotalCount: 1,
    })
  },
}

/**
 * 获取所有已知 API 路径列表
 */
export function getAllApiPaths(): string[] {
  return Object.keys(apiMocks)
}

/**
 * 根据 API 路径获取 mock 响应
 */
export function getMockResponse(path: string, body?: unknown): unknown {
  const handler = apiMocks[path]
  if (handler) {
    return handler(body)
  }
  // 未知路径返回通用成功响应
  console.warn(`[Mock] No mock handler for API path: ${path}, returning generic success`)
  return successResponse({})
}

/**
 * 创建 API 错误响应
 */
export function getMockErrorResponse(path: string, status: number, message: string): unknown {
  return errorResponse(status, message)
}
