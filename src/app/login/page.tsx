"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { FaWeixin } from 'react-icons/fa';
import { showErrorMessage } from '@/utils/api';

const LoginPage = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const { login, loginWithCode, getVerificationCode } = useAuth();
  const [activeTab, setActiveTab] = useState('phone'); // 'phone' 或 'password'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 获取验证码
  const handleSendCode = async () => {
    if (phoneNumber.trim().length !== 11) {
      // 简单验证手机号
      showErrorMessage('请输入正确的手机号');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 调用API获取验证码
      console.log(`尝试获取登录验证码: ${phoneNumber}`);
      
      try {
        const response = await getVerificationCode('login', phoneNumber);
        console.log(`登录验证码获取成功: ${phoneNumber}`, response);
        
        // 从响应中获取验证码 - 增强兼容性
        let code = '';
        if (response && typeof response.data === 'string') {
          code = response.data;
        } else if (response && response.message && response.message.includes('验证码已发送')) {
          // 尝试从消息中提取验证码
          const codeMatch = response.message.match(/(\d{4,6})/);
          if (codeMatch && codeMatch[1]) {
            code = codeMatch[1];
          }
        } else if (response && typeof response === 'object') {
          // 尝试从整个响应对象中查找验证码
          const responseStr = JSON.stringify(response);
          const matches = responseStr.match(/(\d{4,6})/g);
          if (matches && matches.length > 0) {
            // 找出最可能是验证码的数字（通常是4-6位数字）
            for (const match of matches) {
              if (match.length >= 4 && match.length <= 6) {
                code = match;
                break;
              }
            }
          }
        }
        
        console.log('获取到的验证码:', code);
        
        // 开始倒计时
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        // 根据控制台日志解析，处理图片中显示的"验证码已发送"情况
        if (code) {
          // 使用弹窗提示用户验证码已发送并直接展示验证码
          alert(`验证码已成功发送到手机号: ${phoneNumber}，请注意查收。\n\n您的验证码是: ${code}`);
          
          // 自动填充验证码到输入框
          setVerificationCode(code);
        } else {
          // 如果未能从响应中提取验证码，可能是因为验证码已通过短信发送
          alert(`验证码已成功发送到手机号: ${phoneNumber}，请注意查收短信。`);
        }
      } catch (err) {
        console.error('验证码API调用失败:', err);
        showErrorMessage(`验证码获取失败: ${err instanceof Error ? err.message : '未知错误'}`);
      }
    } catch (error) {
      console.error('获取验证码失败:', error);
      showErrorMessage(`验证码获取失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      if (activeTab === 'phone') {
        // 验证码登录逻辑
        if (phoneNumber.trim() && verificationCode.trim()) {
          console.log(`尝试验证码登录: ${phoneNumber}`);
          try {
            // 显示更详细的信息
            console.log(`准备验证码登录, 手机号: ${phoneNumber}, 验证码: ${verificationCode}`);
            const result = await loginWithCode(phoneNumber, verificationCode);
            console.log('验证码登录成功，准备跳转', result);
            router.push('/chat'); // 登录成功后跳转到聊天页面
          } catch (err) {
            console.error('验证码登录处理失败:', err);
            showErrorMessage(`登录失败: ${err instanceof Error ? err.message : '未知错误'}`);
          }
        } else {
          showErrorMessage('请输入手机号和验证码');
        }
      } else {
        // 密码登录逻辑
        if (phoneNumber.trim() && password.trim()) {
          // 判断是邮箱还是手机号
          const isEmail = phoneNumber.includes('@');
          const loginType = isEmail ? 'email' : 'mobile';
          
          console.log(`尝试${loginType}密码登录: ${phoneNumber}`);
          await login({
            account: phoneNumber,
            password: password,
            loginType: loginType
          });
          
          console.log('密码登录成功，准备跳转');
          router.push('/chat'); // 登录成功后跳转到聊天页面
        } else {
          showErrorMessage('请输入账号和密码');
        }
      }
    } catch (error) {
      console.error('登录失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Logo - 横向展示且不可跳转 */}
      <div className="mb-6">
        <div className="flex items-center justify-center">
          <Image 
            src="/images/whale-logo.svg" 
            alt="DeepSeek Logo" 
            width={45} 
            height={45} 
            className="mr-2"
          />
          <span className="text-xl font-semibold text-gray-800">DeepSeek</span>
        </div>
      </div>
      
      {/* 登录卡片 - 左右布局 */}
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex flex-col md:flex-row h-[400px]">
          <div className="flex-[1.4]">
            {/* 标签切换 */}
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-3 text-center font-medium ${activeTab === 'phone' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('phone')}
              >
                验证码登录
              </button>
              <button
                className={`flex-1 py-3 text-center font-medium ${activeTab === 'password' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('password')}
              >
                密码登录
              </button>
            </div>
            
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">你所在地区仅支持 手机号 / 微信 / 邮箱 登录</p>
          
          <form onSubmit={handleLogin}>
            {/* 手机号输入框 */}
            <div className="mb-5">
              {activeTab === 'phone' ? (
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 px-3 flex items-center bg-gray-100 text-gray-600 border-r border-gray-300 rounded-l-lg">
                    +86
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="请输入手机号"
                    className="w-full pl-16 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    maxLength={11}
                    required
                  />
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="请输入手机号/邮箱地址"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              )}
            </div>
            
            {activeTab === 'phone' ? (
              /* 验证码输入框和发送按钮平级关系 */
              <div className="mb-6">
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="请输入验证码"
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={countdown > 0 || phoneNumber.trim().length !== 11 || isLoading}
                    className={`whitespace-nowrap px-3 py-2 text-sm rounded-md ${countdown > 0 || phoneNumber.trim().length !== 11 || isLoading ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600'}`}
                  >
                    {isLoading ? '获取中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
                  </button>
                </div>
              </div>
            ) : (
              /* 密码输入框 */
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
            )}
            
            {/* 协议提示和未注册手机号提示连在一起 - 左对齐 */}
            <div className="mb-8 text-xs text-gray-500 text-left">
              {t('agreementTip')} 
              <Link href="/terms" className="text-blue-600">{t('userAgreement')}</Link> 
              {t('and')} 
              <Link href="/privacy" className="text-blue-600">{t('privacyPolicy')}</Link>，
              {t('registerPhone')}
            </div>
            
            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 rounded-lg font-medium transition-colors ${isLoading ? 'bg-gray-400 text-gray-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              {isLoading ? '登录中...' : t('loginButton')}
            </button>

            {/* 添加忘记密码和立即注册链接 - 仅在密码登录模式下显示 */}
            {activeTab === 'password' && (
              <div className="flex justify-between mt-3">
                <Link href="/login/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                  忘记密码
                </Link>
                <Link href="/login/register" className="text-sm text-blue-600 hover:text-blue-800">
                  立即注册
                </Link>
              </div>
            )}
          </form>
        </div>
      </div>
            
      {/* 微信登录区域 - 右侧 */}
      <div className="flex-1 bg-gray-50 border-l border-gray-200 md:flex hidden flex-col items-center justify-center p-4"> {/* 增加二维码区域占比 */}
        <div className="flex flex-col items-center">
          <div className="mb-3">
            <div className="w-40 h-40 bg-white rounded-lg shadow-sm flex items-center justify-center">
              <Image 
                src="/images/deepseek-qrcode.svg" 
                alt="WeChat QR Code" 
                width={130} 
                height={130} 
                className="object-contain"
              />
            </div>
          </div>
          <div className="flex items-center text-green-600">
            <FaWeixin className="mr-2" size={20} />
            <span>{t('wechatLogin')}</span>
          </div>
        </div>
      </div>
      
      {/* 移动端微信登录区域 - 仅在移动端显示 */}
      <div className="md:hidden border-t border-gray-200 bg-gray-50 p-4">
        <div className="flex flex-col items-center">
          <div className="mb-3">
            <div className="w-40 h-40 bg-white rounded-lg shadow-sm flex items-center justify-center">
              <Image 
                src="/images/deepseek-qrcode.svg" 
                alt="WeChat QR Code" 
                width={130} 
                height={130} 
                className="object-contain"
              />
            </div>
          </div>
          <div className="flex items-center text-green-600">
            <FaWeixin className="mr-2" size={20} />
            <span>{t('wechatLogin')}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
      
      {/* 页脚 - 进一步向下移动 */}
      <div className="mt-16 text-xs text-gray-500">
        © 2025 Hangzhou DeepSeek AI Technology Research Co., Ltd. All Rights Reserved
      </div>
    </div>
  );
};

export default LoginPage;