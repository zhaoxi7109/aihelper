"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { showErrorMessage } from '@/utils/api';

const ForgotPasswordPage = () => {
  const router = useRouter();
  const { resetPassword, getVerificationCode } = useAuth();
  const [contact, setContact] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: 输入联系方式和验证码, 2: 输入新密码

  // 获取验证码
  const handleSendCode = async () => {
    if (!contact.trim()) {
      showErrorMessage('请输入邮箱或手机号');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 调用API获取验证码
      console.log(`尝试获取重置密码验证码: ${contact}`);
      
      try {
        const response = await getVerificationCode('reset', contact);
        console.log(`重置密码验证码获取成功: ${contact}`, response);
        
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
        
        // 使用弹窗提示用户验证码已发送，并直接展示验证码
        const isEmail = contact.includes('@');
        
        // 根据控制台日志解析，处理图片中显示的"验证码已发送"情况
        if (code) {
          if (isEmail) {
            alert(`验证码已成功发送到邮箱: ${contact}，请注意查收。\n\n您的验证码是: ${code}`);
          } else {
            alert(`验证码已成功发送到手机号: ${contact}，请注意查收。\n\n您的验证码是: ${code}`);
          }
          
          // 自动填充验证码到输入框
          setVerificationCode(code);
        } else {
          // 如果未能从响应中提取验证码，可能是因为验证码已通过短信/邮件发送
          if (isEmail) {
            alert(`验证码已成功发送到邮箱: ${contact}，请注意查收邮箱。`);
          } else {
            alert(`验证码已成功发送到手机号: ${contact}，请注意查收短信。`);
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

  // 处理验证步骤
  const handleVerifyStep = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contact.trim() || !verificationCode.trim()) {
      showErrorMessage('请输入完整信息');
      return;
    }
    
    console.log('验证通过，进入密码重置步骤');
    // 进入设置新密码阶段
    setStep(2);
  };

  // 处理重置密码
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.trim().length < 6 || newPassword.trim().length > 18) {
      showErrorMessage('密码长度应为6-18位');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showErrorMessage('两次输入的密码不一致');
      return;
    }
    
    try {
      setIsLoading(true);
      
      console.log('开始重置密码...');
      // 调用API重置密码
      await resetPassword(contact, verificationCode, newPassword);
      
      console.log('密码重置成功，准备跳转到登录页');
      // 成功提示
      alert('密码重置成功，请使用新密码登录');
      router.push('/login');
    } catch (error) {
      console.error('重置密码失败:', error);
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
      
      {/* 忘记密码卡片 */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden p-6">
        <h2 className="text-center text-xl font-bold text-gray-800 mb-6">
          重置统一登录密码
        </h2>
        
        {step === 1 ? (
          // 步骤1：输入联系方式和验证码
          <>
            <p className="text-sm text-gray-600 mb-6 text-center">
              请输入你注册的邮箱或手机号用于接收验证码，我们将为你重置密码。
            </p>
            
            <form onSubmit={handleVerifyStep}>
              {/* 邮箱/手机号输入框 */}
              <div className="mb-5">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="请输入邮箱 / +86手机号"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              {/* 验证码输入框 */}
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
                    disabled={countdown > 0 || !contact.trim() || isLoading}
                    className={`whitespace-nowrap px-3 py-2 text-sm rounded-md ${countdown > 0 || !contact.trim() || isLoading ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600'}`}
                  >
                    {isLoading ? '获取中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
                  </button>
                </div>
              </div>
              
              {/* 下一步按钮 */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${isLoading ? 'bg-gray-400 text-gray-100' : 'bg-blue-600 text-white hover:bg-blue-700'} mb-4`}
              >
                {isLoading ? '验证中...' : '下一步'}
              </button>
            </form>
          </>
        ) : (
          // 步骤2：输入新密码
          <>
            <p className="text-sm text-gray-600 mb-6 text-center">
              请设置您的新密码，密码长度为6-18位，建议使用字母、数字和符号的组合
            </p>
            
            <form onSubmit={handleResetPassword}>
              {/* 新密码输入框 */}
              <div className="mb-5">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="请输入新密码"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              {/* 确认密码输入框 */}
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入新密码"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              {/* 确认按钮 */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${isLoading ? 'bg-gray-400 text-gray-100' : 'bg-blue-600 text-white hover:bg-blue-700'} mb-4`}
              >
                {isLoading ? '提交中...' : '确认重置'}
              </button>
              
              {/* 返回上一步 */}
              <div className="text-center">
                <button
                  type="button" 
                  onClick={() => setStep(1)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  返回上一步
                </button>
              </div>
            </form>
          </>
        )}
        
        {/* 返回登录链接 */}
        <div className="text-center mt-4">
          <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800">
            返回登录
          </Link>
        </div>
      </div>
      
      {/* 页脚 */}
      <div className="mt-16 text-xs text-gray-500">
        浙ICP备2023025841号 · 联系我们
      </div>
    </div>
  );
};

export default ForgotPasswordPage;