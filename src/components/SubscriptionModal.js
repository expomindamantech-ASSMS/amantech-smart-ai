// src/components/SubscriptionModal.js
import React from 'react';
import { Modal } from './ui';
import { usePaystack } from '../hooks/usePaystack';
import { CheckCircle, Zap, Clock, Calendar, Crown } from 'lucide-react';

const PLAN_ICONS = {
  daily: <Clock size={20} />,
  weekly: <Zap size={20} />,
  monthly: <Calendar size={20} />,
  yearly: <Crown size={20} />,
};

const PLAN_FEATURES = {
  daily: ['Unlimited AI requests for 24h', 'All features unlocked', 'PDF downloads'],
  weekly: ['Unlimited requests for 7 days', 'All features unlocked', 'PDF downloads', 'Priority access'],
  monthly: ['Unlimited requests for 30 days', 'All features unlocked', 'PDF downloads', 'Priority access', 'Early new features'],
  yearly: ['Unlimited requests for 1 year', 'All features unlocked', 'PDF downloads', 'Priority access', 'Early new features', 'Best value – save 35%!'],
};

const PLAN_COLORS = {
  daily: 'from-blue-500 to-blue-700',
  weekly: 'from-purple-500 to-purple-700',
  monthly: 'from-yellow-400 to-orange-500',
  yearly: 'from-green-500 to-green-700',
};

export default function SubscriptionModal({ open, onClose, freeRemaining = 0 }) {
  const { pay, plans } = usePaystack();

  return (
    <Modal open={open} onClose={onClose} title="⚡ Upgrade Your Plan">
      <div className="space-y-4">
        {freeRemaining <= 0 ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            <strong>You've used all 5 free requests.</strong> Subscribe to continue using AmanTech Smart AI.
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
            You have <strong>{freeRemaining} free request{freeRemaining !== 1 ? 's' : ''}</strong> remaining. 
            Upgrade now for unlimited access!
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(plans).map(([key, plan]) => (
            <div
              key={key}
              className={`relative rounded-xl overflow-hidden border-2 ${key === 'yearly' ? 'border-green-400' : 'border-gray-100'}`}
            >
              {key === 'yearly' && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-bl-lg">
                  BEST VALUE
                </div>
              )}
              <div className={`bg-gradient-to-br ${PLAN_COLORS[key]} p-4 text-white`}>
                <div className="flex items-center gap-2 mb-1">
                  {PLAN_ICONS[key]}
                  <span className="font-bold capitalize">{plan.label}</span>
                </div>
                <div className="text-3xl font-black">GH₵{plan.ghsCost}</div>
              </div>
              <div className="p-3 bg-white">
                <ul className="space-y-1 mb-3">
                  {PLAN_FEATURES[key].map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => { pay(key, onClose); }}
                  className={`w-full bg-gradient-to-r ${PLAN_COLORS[key]} text-white font-semibold py-2 rounded-lg text-sm hover:opacity-90 transition-all active:scale-95`}
                >
                  Subscribe
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-center text-gray-400">
          Secured by Paystack · GHS payments · Cancel anytime
        </p>
      </div>
    </Modal>
  );
}
