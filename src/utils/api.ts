// API客户端工具
// 基础URL常量
const API_BASE_URL = 'http://localhost:8080';

// 定义通用响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 定义用户类型
export interface User {
  id: number;
  username: string;
  nickname?: string;
  email?: string;
  mobile?: string;
  avatar?: string;
  status: number;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// 定义认证响应类型
export interface AuthResponse {
  userId: number;
  username: string;
  nickname?: string;
  email?: string;
  mobile?: string;
  avatar?: string;
  token: string;
}

// 定义登录请求参数
export interface LoginRequest {
  account: string;
  password: string;
  loginType: 'email' | 'mobile';
}

// 定义注册请求参数
export interface RegisterRequest {
  email?: string;
  mobile?: string;
  password: string;
  nickname?: string;
  code: string;
}

// 定义密码重置请求参数
export interface PasswordResetRequest {
  account: string;
  verificationCode: string;
  newPassword: string;
}

// 定义验证码请求参数
export interface VerificationCodeRequest {
  type: 'login' | 'register' | 'reset';
  email?: string;
  mobile?: string;
  code?: string;
  account?: string; // 账号字段，可选
}

// 错误显示函数
export function showErrorMessage(message: string) {
  // 创建并显示错误弹窗
  alert(message);
}

// 通用API错误处理函数
export function handleApiError(error: any): never {
  console.error('API调用错误:', error);
  
  // 提取错误信息
  let errorMessage = '请求失败，请稍后再试';
  
  if (error.response) {
    // 服务器返回了错误状态码
    const status = error.response.status;
    const data = error.response.data;
    
    if (data && data.message) {
      errorMessage = data.message;
    } else {
      switch (status) {
        case 400:
          errorMessage = '请求参数错误';
          break;
        case 401:
          errorMessage = '未授权，请重新登录';
          // 可以在这里清除本地存储的token并重定向到登录页
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_token_expiration');
          window.location.href = '/login';
          break;
        case 403:
          errorMessage = '无权限访问该资源';
          break;
        case 404:
          errorMessage = '请求的资源不存在';
          break;
        case 409:
          errorMessage = '资源冲突，可能已存在';
          break;
        case 500:
          errorMessage = '服务器内部错误';
          break;
        default:
          errorMessage = `请求失败 (${status})`;
      }
    }
  } else if (error.request) {
    // 请求发出但没有收到响应
    errorMessage = '服务器无响应，请检查网络连接';
  }
  
  // 显示错误消息
  showErrorMessage(errorMessage);
  throw error;
}

// 通用请求方法
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  // 获取token
  const token = localStorage.getItem('auth_token');
  
  // 默认头部
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // 合并传入的headers
  if (options.headers) {
    const inputHeaders = options.headers as Record<string, string>;
    Object.keys(inputHeaders).forEach(key => {
      headers[key] = inputHeaders[key];
    });
  }
  
  // 如果有token，添加到请求头
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });
    
    // 如果响应不成功，抛出错误
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { 
        response: { 
          status: response.status, 
          data: errorData 
        } 
      };
    }
    
    // 解析JSON响应
    const data = await response.json();
    
    // 如果API返回错误码，也需要处理
    if (data && data.code !== undefined && data.code !== 200) {
      throw { 
        response: { 
          status: response.status, 
          data 
        } 
      };
    }
    
    return data as T;
  } catch (error) {
    return handleApiError(error);
  }
}

// API方法
export const api = {
  // 认证相关
  auth: {
    // 密码登录
    login: (data: LoginRequest) => {
      console.log('正在调用密码登录接口...', data.account);
      return request<ApiResponse<AuthResponse>>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }).then(response => {
        console.log('密码登录成功:', data.account);
        return response;
      }).catch(error => {
        console.error('密码登录失败:', error);
        throw error;
      });
    },
    
    // 用户注册
    register: (data: RegisterRequest) => {
      console.log('正在调用用户注册接口...', data.email || data.mobile);
      return request<ApiResponse<AuthResponse>>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          code: data.code // 确保验证码字段传递正确
        }),
      }).then(response => {
        console.log('用户注册成功:', data.email || data.mobile);
        return response;
      }).catch(error => {
        console.error('用户注册失败:', error);
        throw error;
      });
    },
    
    // 重置密码
    resetPassword: (data: PasswordResetRequest) => {
      console.log('正在调用重置密码接口...', data.account);
      return request<ApiResponse>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }).then(response => {
        console.log('重置密码成功:', data.account);
        return response;
      }).catch(error => {
        console.error('重置密码失败:', error);
        throw error;
      });
    },
    
    // 验证令牌有效性
    verifyToken: () => {
      console.log('正在验证令牌有效性...');
      return request<ApiResponse>('/api/auth/verify-token')
        .then(response => {
          console.log('令牌验证成功');
          return response;
        }).catch(error => {
          console.error('令牌验证失败:', error);
          throw error;
        });
    },
    
    // 验证码登录
    loginWithCode: (data: any) => {
      console.log('正在调用验证码登录接口...', data.email || data.mobile || data.account);
      return request<ApiResponse<AuthResponse>>('/api/auth/login/code', {
        method: 'POST',
        body: JSON.stringify(data),
      }).then(response => {
        console.log('验证码登录成功:', data.email || data.mobile || data.account);
        return response;
      }).catch(error => {
        console.error('验证码登录失败:', error);
        throw error;
      });
    },
    
    // 获取验证码
    getVerificationCode: (data: VerificationCodeRequest) => {
      const account = data.account || data.email || data.mobile;
      console.log('正在获取验证码...', account, '类型:', data.type);
      
      // 构造请求参数
      const requestData: any = {
        type: data.type
      };
      
      // 根据参数格式构造请求
      if (data.account) {
        requestData.account = data.account;
      } else if (data.email) {
        requestData.email = data.email;
      } else if (data.mobile) {
        requestData.mobile = data.mobile;
      }
      
      if (data.code) {
        requestData.code = data.code;
      }
      
      console.log('验证码请求参数:', requestData);
      
      return request<ApiResponse<string>>('/api/verification/code', {
        method: 'POST',
        body: JSON.stringify(requestData),
      }).then(response => {
        console.log('验证码获取成功:', account, response);
        return response;
      }).catch(error => {
        console.error('验证码获取失败:', error);
        throw error;
      });
    },
  },
  
  // 用户相关
  users: {
    // 获取当前用户信息
    getCurrentUser: () => 
      request<ApiResponse<User>>('/api/users/me'),
    
    // 更新用户个人资料
    updateProfile: (data: { nickname?: string, email?: string, mobile?: string }) => 
      request<ApiResponse<User>>('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    // 修改密码
    changePassword: (data: { currentPassword: string, newPassword: string }) => 
      request<ApiResponse<object>>('/api/users/password', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
      
    // 上传用户头像
    uploadAvatar: (formData: FormData) => {
      console.log('正在上传头像...');
      // 这个请求不需要手动设置Content-Type，浏览器会自动设置为multipart/form-data
      return fetch(`${API_BASE_URL}/api/users/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          // 不要设置 'Content-Type'，让浏览器自动设置
        },
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw { response: { status: response.status, data } };
          });
        }
        return response.json();
      })
      .then(data => {
        console.log('头像上传成功:', data);
        return data;
      })
      .catch(error => {
        console.error('头像上传失败:', error);
        return handleApiError(error);
      });
    },
    
    // 刷新当前用户头像签名URL
    refreshAvatarUrl: () => 
      request<ApiResponse<{avatarUrl: string, expireTime: number}>>('/api/users/refresh-avatar-url'),
    
    // 刷新指定用户的头像签名URL
    refreshUserAvatarUrl: (userId: number) => 
      request<ApiResponse<{avatarUrl: string, expireTime: number}>>(`/api/users/${userId}/refresh-avatar-url`),
    
    // 注销账号
    deactivate: () => 
      request<ApiResponse<object>>('/api/users/deactivate', {
        method: 'POST',
      }),
    
    // 生成AI用户头像（无提示词）
    generateAiAvatar: () => {
      return request<ApiResponse<string>>('/api/users/generate-avatar', {
        method: 'POST'
      });
    },
    
    // 根据提示词生成AI头像
    generateAiAvatarWithPrompt: (prompt: string, forceReplace: boolean = false) => {
      return request<ApiResponse<string>>(`/api/users/generate-avatar-with-prompt?prompt=${encodeURIComponent(prompt)}${forceReplace ? '&forceReplace=true' : ''}`, {
        method: 'POST'
      });
    },
  },
  
  // 聊天相关
  chat: {
    // 发送聊天消息
    sendMessage: (data: { 
      prompt: string, 
      conversationId?: number, 
      userId?: number,
      deepThinking?: boolean, 
      model?: string,
      imageBase64List?: string[] // 添加图片Base64数据数组
    }) => 
      request<ApiResponse<{ 
        conversationId: number, 
        response: string, 
        reason?: string,
        messageId?: number,
        images?: Array<{ 
          id: number, 
          signedUrl: string, 
          ocrText: string, 
          originalFileName: string 
        }> // 添加图片信息返回
      }>>('/api/chat', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
      
    // 停止生成
    stopGeneration: (conversationId: number) => 
      request<ApiResponse<boolean>>('/api/chat/stop', {
        method: 'POST',
        body: JSON.stringify({ conversationId }),
      }),
  },
  
  // 对话管理
  conversations: {
    // 获取用户的所有对话
    getAll: (userId: number) => 
      request<ApiResponse<Array<{ 
        id: number, 
        userId: number, 
        title: string, 
        model: string, 
        createdAt: string, 
        updatedAt: string 
      }>>>(`/api/conversations/${userId}`),
    
    // 创建新会话
    create: (data: { title: string, model: string, userId?: number }) =>
      request<ApiResponse<{
        id: number,
        userId: number,
        title: string,
        model: string,
        createdAt: string,
        updatedAt: string
      }>>(`/api/conversations${data.userId ? `?userId=${data.userId}` : ''}`, {
        method: 'POST',
        body: JSON.stringify({ title: data.title, model: data.model }),
      }),
    
    // 获取对话详情
    getDetail: (id: number) => 
      request<ApiResponse<{ 
        id: number, 
        userId: number, 
        title: string, 
        model: string, 
        createdAt: string, 
        updatedAt: string 
      }>>(`/api/conversations/detail/${id}`),
    
    // 获取对话中的消息
    getMessages: (id: number) => 
      request<ApiResponse<Array<{ 
        id: number, 
        conversationId: number, 
        role: string, 
        content: string, 
        reasoningContent?: string, 
        order: number, 
        createdAt: string, 
        updatedAt: string 
      }>>>(`/api/conversations/${id}/messages`),
    
    // 更新对话标题
    updateTitle: (id: number, title: string) => 
      request<ApiResponse>(`/api/conversations/${id}?title=${encodeURIComponent(title)}`, {
        method: 'PUT',
      }),
    
    // 删除对话
    delete: (id: number) => 
      request<ApiResponse>(`/api/conversations/${id}`, {
        method: 'DELETE',
      }),
  },
  
  // 消息管理（原dialogs改为messages）
  messages: {
    // 删除特定消息
    delete: (messageId: number) => 
      request<ApiResponse>(`/api/messages/${messageId}`, {
        method: 'DELETE',
      }),
  },
};

export default api; 