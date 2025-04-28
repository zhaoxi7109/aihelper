"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api, { AuthResponse, User, LoginRequest, ApiResponse, VerificationCodeRequest } from '@/utils/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  loginWithCode: (mobile: string, code: string) => Promise<AuthResponse>;
  register: (email: string | undefined, mobile: string | undefined, password: string, code: string, nickname?: string) => Promise<AuthResponse>;
  logout: () => void;
  updateUserInfo: () => Promise<void>;
  resetPassword: (account: string, verificationCode: string, newPassword: string) => Promise<void>;
  getVerificationCode: (type: 'login' | 'register' | 'reset', contact: string) => Promise<ApiResponse<string>>;
  deactivateAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => { throw new Error('需要在AuthProvider中使用此函数') },
  loginWithCode: async () => { throw new Error('需要在AuthProvider中使用此函数') },
  register: async () => { throw new Error('需要在AuthProvider中使用此函数') },
  logout: () => {},
  updateUserInfo: async () => {},
  resetPassword: async () => {},
  getVerificationCode: async () => { throw new Error('需要在AuthProvider中使用此函数') },
  deactivateAccount: async () => { throw new Error('需要在AuthProvider中使用此函数') },
});

// 设置登录状态保留时间为一天（24小时）
const LOGIN_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24小时，单位毫秒

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 验证令牌有效性并获取用户信息
  const updateUserInfo = async () => {
    try {
      console.log('开始验证令牌并获取用户信息...');
      
      // 验证令牌
      await api.auth.verifyToken();
      console.log('令牌验证成功，开始获取用户信息');
      
      // 获取用户信息
      const response = await api.users.getCurrentUser();
      console.log('用户信息API响应:', response);
      
      // 从response.data中获取用户数据
      if (response && response.data) {
        console.log('用户信息最终数据:', response.data);
        
        // 确保用户数据结构正确
        const userData = response.data;
        
        // 调试用户数据结构
        console.log('用户ID:', userData.id);
        console.log('用户名:', userData.username);
        console.log('昵称:', userData.nickname);
        console.log('邮箱:', userData.email);
        console.log('手机:', userData.mobile);
        console.log('头像:', userData.avatar);
        
        setUser(userData);
        setIsAuthenticated(true);
        return userData;
      } else {
        console.error('用户信息响应格式不正确:', response);
        throw new Error('用户信息响应格式不正确');
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      logout(); // 如果获取失败，注销用户
      throw error;
    }
  };

  // 检查登录状态
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      // 检查本地存储中的token和过期时间
      const token = localStorage.getItem('auth_token');
      const tokenExpiration = localStorage.getItem('auth_token_expiration');
      
      if (token && tokenExpiration) {
        // 检查token是否过期
        const expirationTime = parseInt(tokenExpiration, 10);
        const currentTime = new Date().getTime();
        
        if (currentTime < expirationTime) {
          // token未过期，验证并获取用户信息
          try {
            await updateUserInfo();
          } catch (error) {
            // token验证失败，清除登录信息
            logout();
          }
        } else {
          // token已过期，清除登录信息
          logout();
        }
      }
      
      setLoading(false);
    };
    
    initAuth();
  }, []);

  // 保存认证信息
  const saveAuthData = (authResponse: AuthResponse) => {
    // 计算过期时间（当前时间 + 24小时）
    const expirationTime = new Date().getTime() + LOGIN_EXPIRATION_TIME;
    
    // 存储token和过期时间
    localStorage.setItem('auth_token', authResponse.token);
    localStorage.setItem('auth_token_expiration', expirationTime.toString());
    
    // 存储用户信息
    setUser({
      id: authResponse.userId,
      username: authResponse.username,
      nickname: authResponse.nickname || '',
      email: authResponse.email || '',
      mobile: authResponse.mobile || '',
      avatar: authResponse.avatar || '',
      status: 1, // 假设默认状态为1（正常）
      role: 'user', // 假设默认角色为user
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    setIsAuthenticated(true);
  };

  // 登录方法
  const login = async (credentials: LoginRequest) => {
    try {
      console.log('开始密码登录流程...');
      const response = await api.auth.login(credentials);
      console.log('登录成功，保存认证数据...');
      saveAuthData(response.data);
      return response.data;
    } catch (error) {
      console.error('登录失败:', error);
      throw error; // 将错误传递给调用者处理
    }
  };

  // 验证码登录
  const loginWithCode = async (mobile: string, code: string) => {
    try {
      console.log('开始验证码登录流程...');
      
      if (!mobile || !code) {
        console.error('登录参数不完整:', { mobile, code });
        throw new Error('手机号和验证码不能为空');
      }
      
      // 直接调用API，修复参数传递
      console.log(`准备调用验证码登录API, mobile: ${mobile}, code: ${code}`);
      
      // 判断是邮箱还是手机号
      const isEmail = mobile.includes('@');
      
      // 构造参数对象 - 符合VerificationCodeRequest类型
      const requestBody: VerificationCodeRequest = {
        type: 'login',
        code: code,
        account: mobile // 使用account字段传递手机号或邮箱
      };
      
      console.log('请求参数:', requestBody);
      
      const response = await api.auth.loginWithCode(requestBody);
      console.log('验证码登录成功，保存认证数据...');
      saveAuthData(response.data);
      return response.data;
    } catch (error) {
      console.error('验证码登录失败:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('登录失败，请稍后再试');
      }
    }
  };

  // 注册
  const register = async (email: string | undefined, mobile: string | undefined, password: string, code: string, nickname?: string) => {
    try {
      console.log('开始用户注册流程...');
      
      if ((!email && !mobile) || !password || !code) {
        console.error('注册参数不完整:', { email, mobile, password, code });
        throw new Error('注册信息不完整，请检查');
      }
      
      console.log(`准备调用注册API, email: ${email || '无'}, mobile: ${mobile || '无'}, code: ${code}`);
      const response = await api.auth.register({
        email,
        mobile,
        password,
        nickname,
        code
      });
      
      console.log('注册成功，保存认证数据...');
      saveAuthData(response.data);
      return response.data;
    } catch (error) {
      console.error('注册失败:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('注册失败，请稍后再试');
      }
    }
  };

  // 重置密码
  const resetPassword = async (account: string, verificationCode: string, newPassword: string) => {
    try {
      console.log('开始重置密码流程...');
      await api.auth.resetPassword({
        account,
        verificationCode,
        newPassword
      });
      console.log('密码重置成功');
    } catch (error) {
      console.error('重置密码失败:', error);
      throw error;
    }
  };

  // 获取验证码
  const getVerificationCode = async (type: 'login' | 'register' | 'reset', contact: string) => {
    try {
      console.log(`开始获取${type}类型验证码...`);
      
      if (!contact) {
        console.error('联系方式为空，无法获取验证码');
        throw new Error('联系方式不能为空');
      }

      console.log(`准备调用验证码API，类型: ${type}, 账号: ${contact}`);
      const response = await api.auth.getVerificationCode({
        type,
        account: contact // 根据API文档使用account字段
      });
      
      console.log(`${type}类型验证码获取成功，已发送至${contact}`, response);
      
      // 检查响应格式并提取验证码
      if (response && response.data && typeof response.data === 'object' && 'code' in response.data) {
        // 正确结构：从response.data.code获取验证码
        // 使用类型断言确保可以访问code属性
        const code = String((response.data as { code: string | number }).code);
        console.log('从response.data.code解析到的验证码:', code);
        return {
          code: 200,
          message: "验证码获取成功",
          data: code
        };
      } else if (response && typeof response.data === 'string') {
        // 兼容直接返回字符串的情况
        console.log('从response.data字符串解析到的验证码:', response.data);
        return response;
      } else if (response && typeof response === 'object') {
        // 尝试在整个响应对象中寻找code字段
        const responseStr = JSON.stringify(response);
        console.log('响应完整内容:', responseStr);
        
        // 尝试找出response中的code字段 - 考虑多种路径
        const anyResponse = response as any; // 使用any类型避免类型错误
        if (anyResponse.code && typeof anyResponse.code === 'string' && /^\d{4,6}$/.test(anyResponse.code)) {
          console.log('从response.code解析到的验证码:', anyResponse.code);
          return {
            code: 200,
            message: "验证码获取成功",
            data: anyResponse.code
          };
        }
        
        // 尝试从响应中提取验证码数字
        const codeMatch = responseStr.match(/"code"\s*:\s*"?(\d{4,6})"?/);
        if (codeMatch && codeMatch[1]) {
          console.log('从响应JSON中提取的验证码:', codeMatch[1]);
          return {
            code: 200,
            message: "验证码获取成功",
            data: codeMatch[1]
          };
        }
        
        // 如果找不到验证码，返回响应本身
        console.log('未能从响应中提取到验证码，返回原始响应');
        return response;
      } else {
        console.error('无法解析验证码响应:', response);
        throw new Error('验证码响应格式不正确');
      }
    } catch (error) {
      console.error('获取验证码失败:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('验证码获取失败，请稍后再试');
      }
    }
  };

  // 注销
  const logout = () => {
    // 清除token和过期时间
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token_expiration');
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  // 注销用户账号
  const deactivateAccount = async (): Promise<void> => {
    try {
      // 调用注销账号API
      await api.users.deactivate();
      // 注销成功后清除登录状态
      logout();
    } catch (error) {
      console.error('账号注销失败:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      loading, 
      login, 
      loginWithCode, 
      register, 
      logout, 
      updateUserInfo: async () => {
        const userData = await updateUserInfo();
        return;
      },
      resetPassword,
      getVerificationCode,
      deactivateAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
};