// src/services/parseService.js
import Parse from 'parse/dist/parse.min.js';
import { BACK4APP_CONFIG, ADMIN_EMAIL, FREE_ENTRIES } from '../config/back4app';

Parse.initialize(BACK4APP_CONFIG.APPLICATION_ID, BACK4APP_CONFIG.JAVASCRIPT_KEY);
Parse.serverURL = BACK4APP_CONFIG.SERVER_URL;

export { Parse };

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const signUp = async (name, email, password) => {
  const user = new Parse.User();
  user.set('username', email);
  user.set('email', email);
  user.set('password', password);
  user.set('name', name);
  user.set('entriesUsed', 0);
  user.set('isAdmin', email === ADMIN_EMAIL);
  user.set('subscriptionExpiry', null);
  user.set('plan', null);
  await user.signUp();
  return user;
};

export const logIn = async (email, password) => {
  return await Parse.User.logIn(email, password);
};

export const logOut = async () => {
  return await Parse.User.logOut();
};

export const getCurrentUser = () => Parse.User.current();

export const resetPassword = async (email) => {
  return await Parse.User.requestPasswordReset(email);
};

// ─── SUBSCRIPTION ─────────────────────────────────────────────────────────────

export const updateSubscription = async (userId, plan, days) => {
  const query = new Parse.Query(Parse.User);
  const user = await query.get(userId, { useMasterKey: false });
  
  const now = new Date();
  const current = user.get('subscriptionExpiry');
  const base = current && new Date(current) > now ? new Date(current) : now;
  const expiry = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
  
  user.set('subscriptionExpiry', expiry);
  user.set('plan', plan);
  await user.save(null, { useMasterKey: false });
  return user;
};

export const checkSubscription = (user) => {
  if (!user) return { active: false, isAdmin: false };
  if (user.get('email') === ADMIN_EMAIL || user.get('isAdmin')) {
    return { active: true, isAdmin: true };
  }
  const expiry = user.get('subscriptionExpiry');
  if (expiry && new Date(expiry) > new Date()) {
    return { active: true, isAdmin: false, expiry };
  }
  const used = user.get('entriesUsed') || 0;
  return { active: used < FREE_ENTRIES, isAdmin: false, freeRemaining: FREE_ENTRIES - used };
};

export const incrementEntry = async () => {
  const user = Parse.User.current();
  if (!user) return;
  if (user.get('email') === ADMIN_EMAIL) return;
  const expiry = user.get('subscriptionExpiry');
  if (expiry && new Date(expiry) > new Date()) return; // subscribed, no limit
  const used = user.get('entriesUsed') || 0;
  user.set('entriesUsed', used + 1);
  await user.save();
};

// ─── AI ENTRIES STORE ─────────────────────────────────────────────────────────

export const saveEntry = async (type, content, metadata = {}) => {
  const user = Parse.User.current();
  const Entry = Parse.Object.extend('Entry');
  const entry = new Entry();
  entry.set('type', type);
  entry.set('content', content);
  entry.set('metadata', metadata);
  entry.set('user', user);
  entry.set('userEmail', user.get('email'));
  const acl = new Parse.ACL(user);
  acl.setPublicReadAccess(false);
  entry.setACL(acl);
  return await entry.save();
};

export const getEntries = async (type = null) => {
  const user = Parse.User.current();
  const Entry = Parse.Object.extend('Entry');
  const query = new Parse.Query(Entry);
  query.equalTo('user', user);
  if (type) query.equalTo('type', type);
  query.descending('createdAt');
  query.limit(50);
  return await query.find();
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

export const getAllUsers = async () => {
  const query = new Parse.Query(Parse.User);
  query.descending('createdAt');
  query.limit(1000);
  return await query.find({ useMasterKey: false });
};

export const getPayments = async () => {
  const Payment = Parse.Object.extend('Payment');
  const query = new Parse.Query(Payment);
  query.descending('createdAt');
  query.limit(500);
  return await query.find();
};

export const savePayment = async (reference, plan, amount, userId) => {
  const Payment = Parse.Object.extend('Payment');
  const payment = new Payment();
  payment.set('reference', reference);
  payment.set('plan', plan);
  payment.set('amount', amount);
  payment.set('userId', userId);
  payment.set('status', 'success');
  return await payment.save();
};

export const saveAppSettings = async (settings) => {
  const AppSettings = Parse.Object.extend('AppSettings');
  const query = new Parse.Query(AppSettings);
  let obj;
  try {
    obj = await query.first();
  } catch {
    obj = null;
  }
  if (!obj) obj = new AppSettings();
  Object.keys(settings).forEach(k => obj.set(k, settings[k]));
  return await obj.save();
};

export const getAppSettings = async () => {
  const AppSettings = Parse.Object.extend('AppSettings');
  const query = new Parse.Query(AppSettings);
  try {
    return await query.first();
  } catch {
    return null;
  }
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export const sendNotification = async (userId, message, type = 'info') => {
  const Notification = Parse.Object.extend('Notification');
  const n = new Notification();
  n.set('userId', userId);
  n.set('message', message);
  n.set('type', type);
  n.set('read', false);
  return await n.save();
};

export const getMyNotifications = async () => {
  const user = Parse.User.current();
  if (!user) return [];
  const Notification = Parse.Object.extend('Notification');
  const query = new Parse.Query(Notification);
  query.equalTo('userId', user.id);
  query.descending('createdAt');
  query.limit(20);
  return await query.find();
};

export const markNotificationRead = async (id) => {
  const Notification = Parse.Object.extend('Notification');
  const query = new Parse.Query(Notification);
  const n = await query.get(id);
  n.set('read', true);
  return await n.save();
};
