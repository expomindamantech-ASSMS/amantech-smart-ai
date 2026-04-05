// src/pages/AdminPage.js
import React, { useState, useEffect } from 'react';
import { getAllUsers, getPayments, sendNotification } from '../services/parseService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, StatCard, Badge, Modal, Textarea } from '../components/ui';
import { Users, CreditCard, Bell, TrendingUp, Crown, Search, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const nav = useNavigate();
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [notifModal, setNotifModal] = useState(false);
  const [notifTarget, setNotifTarget] = useState(null);
  const [notifMsg, setNotifMsg] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [tab, setTab] = useState('users');

  useEffect(() => {
    if (!isAdmin) { nav('/dashboard'); return; }
    load();
  }, [isAdmin, nav]);

  const load = async () => {
    setLoading(true);
    try {
      const [u, p] = await Promise.all([getAllUsers(), getPayments()]);
      setUsers(u);
      setPayments(p);
    } catch (err) { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const notify = async (targetUser) => {
    if (!notifMsg) return toast.error('Enter message');
    try {
      await sendNotification(targetUser.id, notifMsg);
      toast.success('Notification sent!');
      setNotifModal(false); setNotifMsg('');
    } catch { toast.error('Failed to send'); }
  };

  const broadcastAll = async () => {
    if (!broadcastMsg) return toast.error('Enter message');
    try {
      await Promise.all(users.map(u => sendNotification(u.id, broadcastMsg)));
      toast.success(`Broadcast sent to ${users.length} users!`);
      setBroadcastMsg('');
    } catch { toast.error('Broadcast failed'); }
  };

  const getSubStatus = (user) => {
    const exp = user.get('subscriptionExpiry');
    if (!exp) return { label: 'Free', color: 'gray' };
    const d = new Date(exp);
    if (d > new Date()) return { label: `Active until ${format(d, 'dd MMM yy')}`, color: 'green' };
    return { label: 'Expired', color: 'red' };
  };

  const filtered = users.filter(u =>
    u.get('email')?.toLowerCase().includes(search.toLowerCase()) ||
    u.get('name')?.toLowerCase().includes(search.toLowerCase())
  );

  const activeSubUsers = users.filter(u => {
    const exp = u.get('subscriptionExpiry');
    return exp && new Date(exp) > new Date();
  }).length;

  const totalRevenue = payments.reduce((sum, p) => sum + (p.get('amount') || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
            <Crown size={20} className="text-white" />
          </div>
          <div><h1 className="text-xl font-bold">Admin Dashboard</h1><p className="text-sm text-gray-500">Manage users, subscriptions & notifications</p></div>
        </div>
        <button onClick={load} className="text-sm text-blue-600 hover:underline">Refresh</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Users size={20} />} label="Total Users" value={users.length} color="blue" />
        <StatCard icon={<TrendingUp size={20} />} label="Active Subs" value={activeSubUsers} color="green" />
        <StatCard icon={<CreditCard size={20} />} label="Total Revenue" value={`GH₵${(totalRevenue / 100).toFixed(0)}`} color="gold" />
        <StatCard icon={<Bell size={20} />} label="Payments" value={payments.length} color="red" />
      </div>

      {/* Broadcast */}
      <Card className="p-5">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Bell size={16} /> Broadcast Notification to All Users</h3>
        <div className="flex gap-3">
          <input value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)}
            placeholder="Message to send to all users..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yellow-400" />
          <button onClick={broadcastAll} className="flex items-center gap-2 bg-yellow-400 text-blue-900 font-semibold px-4 py-2.5 rounded-xl hover:bg-yellow-300 transition-all">
            <Send size={16} /> Broadcast
          </button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        {[['users','👥 Users'],['payments','💳 Payments']].map(([t,l]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'}`}>{l}</button>
        ))}
      </div>

      {tab === 'users' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name','Email','Entries Used','Subscription','Joined','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>
                ) : filtered.map(u => {
                  const status = getSubStatus(u);
                  return (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-xs font-bold">
                            {u.get('name')?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <span className="font-medium text-gray-800">{u.get('name') || '—'}</span>
                          {u.get('isAdmin') && <Crown size={12} className="text-yellow-500" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.get('email')}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{u.get('entriesUsed') || 0}</td>
                      <td className="px-4 py-3"><Badge color={status.color}>{status.label}</Badge></td>
                      <td className="px-4 py-3 text-gray-500">{u.createdAt ? format(new Date(u.createdAt), 'dd MMM yyyy') : '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => { setNotifTarget(u); setNotifModal(true); }}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-2.5 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all"
                        >
                          <Bell size={12} /> Notify
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!loading && filtered.length === 0 && (
              <p className="text-center text-gray-400 py-8">No users found</p>
            )}
          </div>
        </Card>
      )}

      {tab === 'payments' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Reference','Plan','Amount (GHS)','User ID','Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr>
                ) : payments.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{p.get('reference')?.slice(-12)}</td>
                    <td className="px-4 py-3"><Badge color="blue" className="capitalize">{p.get('plan')}</Badge></td>
                    <td className="px-4 py-3 font-semibold text-green-700">GH₵{(p.get('amount') || 0) / 100}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.get('userId')?.slice(-8)}</td>
                    <td className="px-4 py-3 text-gray-500">{p.createdAt ? format(new Date(p.createdAt), 'dd MMM yyyy HH:mm') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && payments.length === 0 && (
              <p className="text-center text-gray-400 py-8">No payments yet</p>
            )}
          </div>
        </Card>
      )}

      {/* Notify modal */}
      <Modal open={notifModal} onClose={() => setNotifModal(false)} title={`Notify ${notifTarget?.get('name') || 'User'}`}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Send a notification to <strong>{notifTarget?.get('email')}</strong></p>
          <Textarea label="Message" value={notifMsg} onChange={e => setNotifMsg(e.target.value)}
            placeholder="Your subscription is expiring soon! Renew now to continue..." rows={4} />
          <div className="flex gap-3">
            <button onClick={() => setNotifModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={() => notify(notifTarget)} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
              Send Notification
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
