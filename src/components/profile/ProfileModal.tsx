"use client";

import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Modal, 
  Button, 
  Avatar, 
  Input, 
  Tabs, 
  Form, 
  Popconfirm,
  message,
  Radio,
  Space,
  Spin,
  Image,
  Typography
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  SaveOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  UploadOutlined,
  LockOutlined,
  ExclamationCircleOutlined,
  RobotOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import api from '@/utils/api';
import UserAvatar from '@/components/common/UserAvatar';
import { useProfile } from '@/contexts/ProfileContext';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';

const { Title, Text } = Typography;

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 默认头像路径
const DEFAULT_AVATAR = '/images/avatar-placeholder.svg';

// 邮箱部分隐藏函数，保留前几位和后缀
const maskEmail = (email: string): string => {
  if (!email) return '';
  
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  
  const name = parts[0];
  const domain = parts[1];
  
  // 名称部分保留头2位，剩余用星号代替
  const maskedName = name.length <= 2 
    ? name 
    : `${name.substring(0, 2)}${'*'.repeat(Math.min(name.length - 2, 3))}`;
  
  return `${maskedName}@${domain}`;
};

// 手机号部分隐藏函数，保留前3位和后2位
const maskMobile = (mobile: string): string => {
  if (!mobile) return '';
  if (mobile.length <= 5) return mobile;
  
  const prefix = mobile.substring(0, 3);
  const suffix = mobile.substring(mobile.length - 2);
  const masked = '*'.repeat(Math.min(mobile.length - 5, 4));
  
  return `${prefix}${masked}${suffix}`;
};

// 避免不必要的重新渲染
const MemoizedAvatar = memo(({ src, size = "default" }: { src: string, size?: "large" | "small" | "default" }) => {
  // 避免头像加载失败问题
  const [error, setError] = useState(false);
  
  const handleError = () => {
    console.log('头像加载失败，使用默认头像');
    setError(true);
    return true; // 返回true表示错误已处理
  };
  
  return (
    <Avatar 
      src={error ? DEFAULT_AVATAR : src}
      size={size}
      icon={<UserOutlined />}
      onError={handleError}
    />
  );
});

MemoizedAvatar.displayName = 'MemoizedAvatar';

// 格式化电话号码，显示前三位和后四位
const formatPhoneNumber = (phone: string | undefined) => {
  if (!phone) return '未设置';
  if (phone.length < 7) return phone;
  return `${phone.substring(0, 3)}****${phone.substring(phone.length - 4)}`;
};

// 格式化邮箱，只显示@前面的前三个字符和@后面的域名
const formatEmail = (email: string | undefined) => {
  if (!email) return '未设置';
  if (!email.includes('@')) return email;
  
  const [prefix, domain] = email.split('@');
  if (prefix.length <= 3) return email;
  
  return `${prefix.substring(0, 3)}****@${domain}`;
};

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUserInfo, resetPassword, deactivateAccount } = useAuth();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [maskedMobile, setMaskedMobile] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // 头像预览状态
  const [previewVisible, setPreviewVisible] = useState(false);
  
  // 头像上传方式
  const [avatarUploadType, setAvatarUploadType] = useState<'upload' | 'ai'>('upload');
  // AI生成头像的提示词
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [generatingAvatar, setGeneratingAvatar] = useState(false);
  
  // 密码相关状态
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // 验证码相关状态
  const [verificationCode, setVerificationCode] = useState('');
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 用于追踪模态框是否曾经加载过用户数据
  const [hasLoadedUserData, setHasLoadedUserData] = useState(false);
  
  // 调试用，查看用户数据，但避免频繁输出
  useEffect(() => {
    if (user && !hasLoadedUserData) {
      console.log('个人资料模态框 - 用户数据对象:', user);
      setHasLoadedUserData(true);
    }
  }, [user, hasLoadedUserData]);

  // 只在模态框首次打开且没有用户数据时获取用户信息
  useEffect(() => {
    if (isOpen && !user && !hasLoadedUserData) {
      console.log('模态框首次打开，尝试获取用户信息');
      updateUserInfo().catch(err => {
        console.error('获取用户信息失败:', err);
      });
    }
  }, [isOpen, user, updateUserInfo, hasLoadedUserData]);

  // 当用户ID变化时重置头像错误状态
  useEffect(() => {
    if (user?.id) {
      setAvatarError(false);
    }
  }, [user?.id]);

  // 当用户数据更新且模态框打开时，更新表单字段，避免频繁更新
  useEffect(() => {
    if (user && isOpen) {
      // 避免频繁日志输出
      if (!hasLoadedUserData) {
        console.log('设置用户数据到表单字段');
      }
      
      // 设置基本信息 - 只设置昵称，邮箱和手机设置为空字符串以便编辑
      setNickname(user.nickname || '');
      
      // 编辑模式下不显示真实的手机号和邮箱，只显示掩码后的值
      setEmail('');  // 编辑时从空开始
      setMobile(''); // 编辑时从空开始
      
      // 优先使用本地预览URL，如果没有则使用用户头像或默认头像
      // 如果头像曾经加载失败，则直接使用默认头像
      if (!previewUrl) {
        const safeAvatar = avatarError ? DEFAULT_AVATAR : (user.avatar || DEFAULT_AVATAR);
        setAvatar(safeAvatar);
        setPreviewUrl(safeAvatar);
      }
      
      // 设置掩码处理后的信息，用于非编辑模式显示
      setMaskedEmail(maskEmail(user.email || ''));
      setMaskedMobile(maskMobile(user.mobile || ''));
      
      // 清空密码字段
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setVerificationCode('');
    }
  }, [user, isOpen, hasLoadedUserData, previewUrl, avatarError]);

  // 处理保存用户信息
  const handleSave = async () => {
    if (!user) {
      message.error('用户未登录，无法保存信息');
      return;
    }
    
    try {
      setLoading(true);
      
      const updateData = {
        nickname,
        email,
        mobile
      };
      
      console.log('准备更新用户资料:', updateData);
      
      // 使用API直接更新用户资料
      const response = await api.users.updateProfile(updateData);
      
      console.log('更新用户资料响应:', response);
      
      // 刷新用户数据
      await updateUserInfo();
      
      setIsEditing(false);
      
      // 更新掩码显示
      setMaskedEmail(maskEmail(email));
      setMaskedMobile(maskMobile(mobile));
      
      toast.success('个人资料更新成功');
    } catch (error) {
      console.error('更新个人资料失败:', error);
      toast.error('个人资料更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      // 重置昵称为用户当前昵称
      setNickname(user.nickname || '');
      // 清空邮箱和手机号输入框
      setEmail('');
      setMobile('');
      // 重置头像预览
      setPreviewUrl(user.avatar || DEFAULT_AVATAR);
      setFileList([]);
      // 重置AI头像生成相关状态
      setAvatarUploadType('upload');
      setAiPrompt('');
    }
    setIsEditing(false);
  };
  
  const handleModalClose = () => {
    handleCancel();
    setActiveTab('profile');
    // 不要清除hasLoadedUserData，保留用户数据状态
    onClose();
  };
  
  // 处理头像上传
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('选择了文件:', file.name);
      
      // 创建一个新的FormData对象
      const formData = new FormData();
      formData.append('file', file);  // 修改参数名为'file'匹配API规范
      
      // 直接在这里处理头像上传
      setLoading(true);
      
      // 先显示本地预览
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreviewUrl(dataUrl);
        console.log('设置了本地预览');
      };
      reader.readAsDataURL(file);
      
      // 上传到服务器
      api.users.uploadAvatar(formData)
        .then(response => {
          console.log('头像上传成功:', response);
          // 服务器返回的头像URL - 检查返回格式适配API接口文档
          if (response.data && response.data.avatarUrl) {
            setAvatar(response.data.avatarUrl);
            setPreviewUrl(response.data.avatarUrl);
          } else if (response.data) {
            // 可能直接返回URL作为data.data的值
            const url = response.data.url || response.data.avatar || Object.values(response.data)[0];
            if (url && typeof url === 'string') {
              setAvatar(url);
              setPreviewUrl(url);
            }
          }
          toast.success('头像上传成功');
          // 刷新用户信息
          updateUserInfo();
        })
        .catch(error => {
          console.error('头像上传失败:', error);
          toast.error('头像上传失败');
          // 上传失败时，重置预览
          setPreviewUrl(user?.avatar || DEFAULT_AVATAR);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };
  
  // 处理AI头像生成
  const generateAiAvatar = async () => {
    try {
      setGeneratingAvatar(true);
      let response;
      
      if (aiPrompt.trim()) {
        // 有提示词，调用自定义生成接口
        response = await api.users.generateAiAvatarWithPrompt(aiPrompt);
      } else {
        // 无提示词，调用默认生成接口
        response = await api.users.generateAiAvatar();
      }
      
      console.log('AI头像生成响应:', response);
      
      if (response.data && typeof response.data === 'object' && 'avatarUrl' in response.data) {
        const responseData = response.data as { avatarUrl: string };
        setAvatar(responseData.avatarUrl);
        setPreviewUrl(responseData.avatarUrl);
        toast.success('AI头像生成成功');
        // 刷新用户信息
        updateUserInfo();
      } else if (response.data) {
        // 可能直接返回URL作为data的值，或者其他格式
        let avatarUrl: string | null = null;
        
        if (typeof response.data === 'string') {
          // 直接是URL字符串
          avatarUrl = response.data;
        } else if (typeof response.data === 'object') {
          // 尝试从对象中获取URL
          const dataObj = response.data as Record<string, any>;
          avatarUrl = dataObj.url || dataObj.avatar || dataObj.avatarUrl;
          
          // 如果以上属性都不存在，尝试获取第一个字符串值
          if (!avatarUrl) {
            const firstValue = Object.values(dataObj)[0];
            if (typeof firstValue === 'string') {
              avatarUrl = firstValue;
            }
          }
        }
        
        if (avatarUrl) {
          setAvatar(avatarUrl);
          setPreviewUrl(avatarUrl);
          toast.success('AI头像生成成功');
          // 刷新用户信息
          updateUserInfo();
        } else {
          toast.error('生成头像的响应格式不正确');
        }
      } else {
        toast.error('生成头像失败');
      }
    } catch (error) {
      console.error('生成AI头像失败:', error);
      toast.error('生成AI头像失败');
    } finally {
      setGeneratingAvatar(false);
    }
  };
  
  // 触发本地上传
  const triggerLocalUpload = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // 显示头像预览
  const showAvatarPreview = () => {
    if (previewUrl && previewUrl !== DEFAULT_AVATAR) {
      setPreviewVisible(true);
    }
  };
  
  // 处理密码修改
  const handlePasswordChange = async () => {
    if (!newPassword || !oldPassword) {
      message.error('请填写完整的密码信息');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      message.error('两次输入的新密码不一致');
      return;
    }
    
    try {
      setPasswordLoading(true);
      // 使用API直接调用修改密码
      await api.users.changePassword({
        currentPassword: oldPassword,
        newPassword: newPassword
      });
      message.success('密码修改成功');
      // 清空字段
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('密码修改失败:', error);
      message.error('密码修改失败，请确认当前密码是否正确');
    } finally {
      setPasswordLoading(false);
    }
  };
  
  // 处理账号注销
  const handleDeactivate = async () => {
    try {
      setDeactivateLoading(true);
      // 这里假设AuthContext中的deactivateAccount方法已经实现
      await deactivateAccount();
      message.success('账号已注销');
      handleModalClose();
    } catch (error) {
      console.error('账号注销失败:', error);
      message.error('账号注销失败');
    } finally {
      setDeactivateLoading(false);
    }
  };

  // 非编辑状态下的表单项渲染
  const renderInfoItem = (icon: React.ReactNode, label: string, value: string, placeholder: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center p-2 bg-gray-50 rounded border border-gray-200">
        <span className="text-gray-400 mr-2">{icon}</span>
        <span className="text-gray-700">{value || placeholder}</span>
      </div>
    </div>
  );

  // 渲染头像 - 优先使用本地预览，避免外部请求
  const renderAvatar = () => {
    // 如果有本地预览，优先使用
    if (previewUrl && !avatarError) {
      return (
        <div 
          className="relative cursor-pointer"
          onClick={showAvatarPreview}
        >
          <Avatar 
            src={previewUrl} 
            size={100}
            icon={<UserOutlined />}
            onError={() => {
              console.log('预览头像加载失败');
              setAvatarError(true);
              return true;
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-full opacity-0 hover:opacity-100 transition-opacity">
            <EyeOutlined className="text-white text-xl" />
          </div>
        </div>
      );
    }
    
    // 否则使用带自动刷新功能的UserAvatar组件
    return (
      <div 
        className="relative cursor-pointer"
        onClick={showAvatarPreview}
      >
        <UserAvatar
          userId={user?.id}
          avatarUrl={user?.avatar || DEFAULT_AVATAR}
          name={user?.nickname || user?.username || '用户'}
          size={100}
          onAvatarChange={(newUrl) => {
            // 当头像URL被刷新时更新用户信息
            if (user) {
              user.avatar = newUrl;
            }
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-full opacity-0 hover:opacity-100 transition-opacity">
          <EyeOutlined className="text-white text-xl" />
        </div>
      </div>
    );
  };

  // 渲染头像上传选项
  const renderAvatarUploadOptions = () => {
    if (!isEditing) return null;
    
    return (
      <div className="mt-4 flex flex-col items-center">
        <Radio.Group 
          onChange={(e) => setAvatarUploadType(e.target.value)} 
          value={avatarUploadType}
          buttonStyle="solid"
          size="small"
          className="mb-4"
        >
          <Radio.Button value="upload">本地上传</Radio.Button>
          <Radio.Button value="ai">AI生成</Radio.Button>
        </Radio.Group>
        
        {avatarUploadType === 'upload' ? (
          <div className="flex flex-col items-center">
            <Button 
              size="small" 
              icon={<UploadOutlined />} 
              onClick={triggerLocalUpload}
              className="mb-2"
            >
              本地上传
            </Button>
            <div className="text-gray-500 text-xs text-center">
              支持jpg、png、gif格式，文件大小不超过2MB
            </div>
          </div>
        ) : (
          <div className="w-full space-y-3">
            <Input.TextArea 
              placeholder="输入提示词描述你想要的头像风格(可选)" 
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={3}
              size="middle"
              className="rounded-md w-full"
              style={{ resize: 'none', minHeight: '80px' }}
            />
            <div className="flex flex-col items-center">
              <Button 
                type="primary" 
                icon={<RobotOutlined />} 
                onClick={generateAiAvatar}
                loading={generatingAvatar}
                size="small"
                className="mb-2"
              >
                生成AI头像
              </Button>
              <Text type="secondary" className="text-xs text-center">
                不填写提示词时将自动生成个性化头像
              </Text>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProfileTab = () => (
    <div className="space-y-6 py-4">
      {/* 头像区域 */}
      <Spin spinning={generatingAvatar} tip="AI正在创作你的头像...">
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            {renderAvatar()}
            {isEditing && avatarUploadType === 'upload' && (
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleAvatarChange}
              />
            )}
          </div>
          {renderAvatarUploadOptions()}
        </div>
      </Spin>
      
      {/* 头像预览模态框 */}
      <Modal
        open={previewVisible}
        title="头像预览"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        centered
      >
        <div className="flex justify-center">
          <Image
            src={previewUrl || DEFAULT_AVATAR}
            alt="头像预览"
            preview={false}
            style={{ maxWidth: '100%' }}
            fallback={DEFAULT_AVATAR}
          />
        </div>
      </Modal>
      
      {/* 个人信息输入/显示区域 */}
      <div className="space-y-4">
        {isEditing ? (
          // 编辑模式 - 使用输入框
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="请输入您的昵称"
                size="large"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">电子邮箱</label>
              <Input
                prefix={<MailOutlined className="site-form-item-icon" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入您的电子邮箱"
                size="large"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">手机号码</label>
              <Input
                prefix={<PhoneOutlined className="site-form-item-icon" />}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="请输入您的手机号码"
                size="large"
              />
            </div>
          </>
        ) : (
          // 显示模式 - 使用自定义显示组件
          <>
            {renderInfoItem(<UserOutlined />, "昵称", nickname || (user?.nickname ?? ''), "未设置昵称")}
            {renderInfoItem(<MailOutlined />, "电子邮箱", maskedEmail || (user?.email ? maskEmail(user.email) : ''), "未设置邮箱")}
            {renderInfoItem(<PhoneOutlined />, "手机号码", maskedMobile || (user?.mobile ? maskMobile(user.mobile) : ''), "未设置手机号")}
          </>
        )}
      </div>
      
      {/* 按钮区域 */}
      <div className="flex justify-end space-x-4 pt-4">
        {isEditing ? (
          <>
            <Button onClick={handleCancel}>
              取消
            </Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={handleSave}
              loading={loading}
            >
              保存
            </Button>
          </>
        ) : (
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => setIsEditing(true)}
          >
            编辑
          </Button>
        )}
      </div>
    </div>
  );
  
  const renderPasswordTab = () => (
    <div className="space-y-6 py-4">
      <Form layout="vertical">
        <Form.Item label="当前密码" required>
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请输入当前密码"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            size="large"
          />
        </Form.Item>
        
        <Form.Item label="新密码" required>
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请输入新密码"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            size="large"
          />
        </Form.Item>
        
        <Form.Item label="确认新密码" required>
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请再次输入新密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            size="large"
          />
        </Form.Item>
        
        <Form.Item>
          <Button 
            type="primary" 
            onClick={handlePasswordChange}
            loading={passwordLoading}
            block
            size="large"
          >
            修改密码
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
  
  const renderAccountTab = () => (
    <div className="space-y-6 py-6">
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <div className="flex items-start">
          <ExclamationCircleOutlined className="text-red-500 text-lg mr-3 mt-0.5" />
          <div>
            <h3 className="text-red-800 font-medium">注销账号警告</h3>
            <p className="text-red-700 text-sm mt-1">
              注销账号后，您将无法登录此账号，且该操作不可逆。如果确定要注销账号，请点击下方按钮确认。
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center pt-4">
        <Popconfirm
          title="确认注销账号"
          description="此操作不可逆，您确定要注销账号吗？"
          onConfirm={handleDeactivate}
          okText="确认注销"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <Button 
            danger 
            type="primary" 
            size="large"
            loading={deactivateLoading}
          >
            注销账号
          </Button>
        </Popconfirm>
      </div>
    </div>
  );

  const items = [
    {
      key: 'profile',
      label: '个人资料',
      children: renderProfileTab(),
    },
    {
      key: 'password',
      label: '修改密码',
      children: renderPasswordTab(),
    },
    {
      key: 'account',
      label: '账号管理',
      children: renderAccountTab(),
    },
  ];

  return (
    <Modal
      title="个人中心"
      open={isOpen}
      onCancel={handleModalClose}
      footer={null}
      width={600}
      className="profile-modal"
      centered
      destroyOnClose={true}
    >
      {user ? (
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={items}
          className="profile-tabs"
        />
      ) : (
        <div className="flex justify-center items-center p-8">
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-200 flex items-center justify-center">
                <UserOutlined style={{ fontSize: 24 }} />
              </div>
            </div>
            <p className="text-gray-500">正在加载用户信息...</p>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ProfileModal; 