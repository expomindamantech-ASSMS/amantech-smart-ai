// src/config/back4app.js
export const BACK4APP_CONFIG = {
  APPLICATION_ID: process.env.REACT_APP_BACK4APP_APP_ID || 'YOUR_BACK4APP_APP_ID',
  JAVASCRIPT_KEY: process.env.REACT_APP_BACK4APP_JS_KEY || 'YOUR_BACK4APP_JS_KEY',
  SERVER_URL: 'https://parseapi.back4app.com'
};

export const PAYSTACK_CONFIG = {
  PUBLIC_KEY: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || 'YOUR_PAYSTACK_PUBLIC_KEY',
  PLANS: {
    daily: { amount: 700, label: '1 Day', days: 1, ghsCost: '7' },
    weekly: { amount: 1500, label: '1 Week', days: 7, ghsCost: '15' },
    monthly: { amount: 5500, label: '30 Days', days: 30, ghsCost: '55' },
    yearly: { amount: 45000, label: '1 Year', days: 365, ghsCost: '450' }
  }
};

export const GEMINI_CONFIG = {
  API_KEY: process.env.REACT_APP_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY',
  MODEL: 'gemini-2.0-flash',                          // free-tier model
  BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models'
};

export const FREE_ENTRIES = 5;
export const ADMIN_EMAIL = 'amarnahf@gmail.com';
export const APP_NAME = 'AmanTech Smart AI';
export const APP_SHORT = 'ASS AI';
