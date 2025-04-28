"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { showErrorMessage } from '@/utils/api';

const RegisterPage = () => {
  const router = useRouter();
  const { register, getVerificationCode } = useAuth();
  const [contactInfo, setContactInfo] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 验证输入是手机号还是邮箱
  const isValidInput = (input: string) => {
    // 简单的邮箱验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // 简单的手机号验证
    const phoneRegex = /^1\d{10}$/;
    
    return emailRegex.test(input) || phoneRegex.test(input);
  };
  
  // 获取验证码
  const handleSendCode = async () => {
    if (!isValidInput(contactInfo)) {
      // 验证输入
      showErrorMessage('请输入正确的手机号或邮箱');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 调用API获取验证码
      console.log(`尝试获取注册验证码: ${contactInfo}`);
      
      try {
        const response = await getVerificationCode('register', contactInfo);
        console.log(`注册验证码获取成功: ${contactInfo}`, response);
        
        // 从响应中获取验证码 - 增强兼容性，主要寻找response.data.code
        let code = '';
        
        // 首选直接从返回数据中获取 - 如果已经处理好
        if (response && typeof response.data === 'string') {
          code = response.data;
          console.log('直接从response.data中获取验证码:', code);
        } 
        // 从完整的响应数据中查找 - 检查多层结构
        else if (response && typeof response === 'object') {
          const responseStr = JSON.stringify(response);
          console.log('完整响应数据:', responseStr);
          
          // 方式1: 尝试从response.data.code中获取
          if (response.data && typeof response.data === 'object') {
            // 使用类型断言避免类型错误
            const dataObj = response.data as any;
            if (dataObj.code) {
              code = String(dataObj.code);
              console.log('从response.data.code中获取验证码:', code);
            }
          }
          // 方式2: 尝试匹配包含"code"的数字
          else {
            const codeMatches = responseStr.match(/"code"\s*:\s*"?(\d{4,6})"?/g);
            if (codeMatches && codeMatches.length > 0) {
              for (const match of codeMatches) {
                const extractedCode = match.replace(/[^0-9]/g, '');
                if (extractedCode.length >= 4 && extractedCode.length <= 6) {
                  code = extractedCode;
                  console.log('从JSON响应中提取到的验证码:', code);
                  break;
                }
              }
            }
          }
        }
        
        console.log('最终获取到的验证码:', code);
        
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
        
        // 使用弹窗提示用户验证码已发送，并直接展示验证码
        const isEmail = contactInfo.includes('@');
        
        // 根据控制台日志解析，处理图片中显示的"验证码已发送"情况
        if (code) {
          if (isEmail) {
            alert(`验证码已成功发送到邮箱: ${contactInfo}，请注意查收。\n\n您的验证码是: ${code}`);
          } else {
            alert(`验证码已成功发送到手机号: ${contactInfo}，请注意查收。\n\n您的验证码是: ${code}`);
          }
          
          // 自动填充验证码到输入框
          setVerificationCode(code);
        } else {
          // 如果未能从响应中提取验证码，可能是因为验证码已通过短信/邮件发送
          if (isEmail) {
            alert(`验证码已成功发送到邮箱: ${contactInfo}，请注意查收邮箱。`);
          } else {
            alert(`验证码已成功发送到手机号: ${contactInfo}，请注意查收短信。`);
          }
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

  // 处理注册
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!isValidInput(contactInfo)) {
      showErrorMessage('请输入正确的手机号或邮箱');
      return;
    }
    
    if (verificationCode.trim().length === 0) {
      showErrorMessage('请输入验证码');
      return;
    }
    
    if (password.trim().length < 6 || password.trim().length > 18) {
      showErrorMessage('密码长度应为6-18位');
      return;
    }
    
    if (password !== confirmPassword) {
      showErrorMessage('两次输入的密码不一致');
      return;
    }
    
    if (!agreeTerms) {
      showErrorMessage('请阅读并同意用户协议和隐私政策');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 区分邮箱和手机号
      const isEmail = contactInfo.includes('@');
      
      console.log('开始注册用户...', isEmail ? '邮箱注册' : '手机号注册');
      
      // 调用API注册
      await register(
        isEmail ? contactInfo : undefined, // 邮箱
        !isEmail ? contactInfo : undefined, // 手机号
        password,
        verificationCode, // 传递验证码
        nickname || undefined // 昵称，如果为空则发送undefined
      );
      
      console.log('注册成功，准备跳转...');
      
      // 成功提示
      alert('注册成功，欢迎使用DeepSeek！');
      router.push('/chat'); // 注册成功后直接进入聊天界面
    } catch (error) {
      console.error('注册失败:', error);
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
      
      {/* 注册卡片 */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden p-6">
        <p className="text-sm text-gray-400 mb-4">
          仅支持邮箱和手机号注册。
        </p>
        
        <form onSubmit={handleRegister}>
          {/* 手机号/邮箱输入框 */}
          <div className="mb-5">
            <div className="relative">
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="请输入手机号或邮箱"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>
          
          {/* 昵称输入框 */}
          <div className="mb-5">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="请输入昵称（选填）"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* 验证码输入框 */}
          <div className="mb-5">
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
                disabled={countdown > 0 || !isValidInput(contactInfo) || isLoading}
                className={`whitespace-nowrap px-3 py-2 text-sm rounded-md ${countdown > 0 || !isValidInput(contactInfo) || isLoading ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600'}`}
              >
                {isLoading ? '获取中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
              </button>
            </div>
          </div>
          
          {/* 密码输入框 */}
          <div className="mb-5">
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
          
          {/* 确认密码输入框 */}
          <div className="mb-5">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>
          
          {/* 协议勾选 */}
          <div className="mb-6">
            <label className="inline-flex items-center">
              <input 
                type="checkbox" 
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-600" 
              />
              <span className="ml-2 text-xs text-gray-700">
                注册即代表已同意并同意我们的 
                <Link href="/terms" className="text-blue-600 mx-1">用户协议</Link> 
                和 
                <Link href="/privacy" className="text-blue-600 mx-1">隐私政策</Link>
              </span>
            </label>
          </div>
          
          {/* 注册按钮 */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 rounded-lg font-medium transition-colors ${isLoading ? 'bg-gray-400 text-gray-100' : 'bg-blue-600 text-white hover:bg-blue-700'} mb-4`}
          >
            {isLoading ? '注册中...' : '注册'}
          </button>
          
          {/* 返回登录链接 */}
          <div className="text-center">
            <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800">
              返回登录
            </Link>
          </div>
        </form>
      </div>
      
      {/* 页脚 */}
      <div className="mt-16 text-xs text-gray-500">
        浙ICP备2023025841号 · 联系我们
      </div>
    </div>
  );
};

export default RegisterPage;