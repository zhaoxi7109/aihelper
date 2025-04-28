"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import ProfileModal from '@/components/profile/ProfileModal';

interface ProfileContextType {
  isProfileOpen: boolean;
  openProfile: () => void;
  closeProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const openProfile = () => setIsProfileOpen(true);
  const closeProfile = () => setIsProfileOpen(false);

  return (
    <ProfileContext.Provider value={{ isProfileOpen, openProfile, closeProfile }}>
      {children}
      <ProfileModal isOpen={isProfileOpen} onClose={closeProfile} />
    </ProfileContext.Provider>
  );
}; 