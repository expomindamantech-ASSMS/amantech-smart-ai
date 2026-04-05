// src/hooks/useFeatureAccess.js
import { useAuth } from '../context/AuthContext';
import { incrementEntry } from '../services/parseService';
import { ADMIN_EMAIL } from '../config/back4app';

export const useFeatureAccess = () => {
  const { user, subscription, isAdmin, refreshUser } = useAuth();

  const canUse = () => {
    if (!user) return false;
    if (isAdmin || user?.get('email') === ADMIN_EMAIL) return true;
    return subscription?.active;
  };

  const use = async (fn, openSub) => {
    if (!canUse()) {
      if (openSub) openSub();
      return null;
    }
    try {
      await incrementEntry();
      refreshUser();
      return await fn();
    } catch (err) {
      throw err;
    }
  };

  return { canUse, use, subscription, isAdmin };
};
