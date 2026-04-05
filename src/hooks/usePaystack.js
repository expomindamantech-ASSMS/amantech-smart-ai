// src/hooks/usePaystack.js
import { useCallback } from 'react';
import { PAYSTACK_CONFIG } from '../config/back4app';
import { updateSubscription, savePayment } from '../services/parseService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const usePaystack = () => {
  const { user, refreshUser } = useAuth();

  const pay = useCallback((planKey, onSuccess) => {
    if (!user) return;
    const plan = PAYSTACK_CONFIG.PLANS[planKey];
    if (!plan) return;

    const handler = window.PaystackPop?.setup({
      key: PAYSTACK_CONFIG.PUBLIC_KEY,
      email: user.get('email'),
      amount: plan.amount * 100, // pesewas
      currency: 'GHS',
      ref: `ASS_${Date.now()}_${user.id}`,
      metadata: {
        name: user.get('name'),
        plan: planKey,
        userId: user.id
      },
      callback: async (response) => {
        try {
          await savePayment(response.reference, planKey, plan.amount, user.id);
          await updateSubscription(user.id, planKey, plan.days);
          refreshUser();
          toast.success(`🎉 Subscribed! ${plan.label} plan activated.`);
          if (onSuccess) onSuccess();
        } catch (err) {
          toast.error('Payment recorded but activation failed. Contact support.');
          console.error(err);
        }
      },
      onClose: () => {
        toast('Payment cancelled.', { icon: 'ℹ️' });
      }
    });

    handler?.openIframe();
  }, [user, refreshUser]);

  return { pay, plans: PAYSTACK_CONFIG.PLANS };
};
