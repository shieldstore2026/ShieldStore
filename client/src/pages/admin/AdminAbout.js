import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import ImageChooser from '../../components/admin/ImageChooser';

const emptyMember = { name: '', role: '', avatar: '', bio: '' };

export default function AdminAbout() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [about, setAbout] = useState({
    title: '',
    subtitle: '',
    story: '',
    mission: '',
    guildName: '',
    guildMembers: [],
  });
  const [memberForm, setMemberForm] = useState(emptyMember);

  const loadAbout = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/about');
      setAbout({
        title: data.title || '',
        subtitle: data.subtitle || '',
        story: data.story || '',
        mission: data.mission || '',
        guildName: data.guildName || '',
        guildMembers: data.guildMembers || [],
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load about content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAbout();
  }, []);

  const updateField = (key, value) => {
    setAbout((prev) => ({ ...prev, [key]: value }));
  };

  const saveContent = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/about', {
        title: about.title,
        subtitle: about.subtitle,
        story: about.story,
        mission: about.mission,
        guildName: about.guildName,
      });
      toast.success('About content updated');
      await loadAbout();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    if (!memberForm.name.trim() || !memberForm.role.trim()) {
      toast.error('Member name and role are required');
      return;
    }
    try {
      await api.post('/about/members', memberForm);
      toast.success('Guild member added');
      setMemberForm(emptyMember);
      await loadAbout();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const removeMember = async (memberId) => {
    if (!window.confirm('Remove this guild member?')) return;
    try {
      await api.delete('/about/members/' + memberId);
      toast.success('Guild member removed');
      await loadAbout();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  if (loading) return <p className="text-slate-500">Loading about content...</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-5 bg-gradient-to-r from-violet-900 to-slate-900 text-white">
        <h1 className="text-2xl font-bold mb-1">About Page Management</h1>
        <p className="text-violet-100">Manage story content and guild members shown on the public About page.</p>
      </div>

      <form onSubmit={saveContent} className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <input value={about.title} onChange={(e) => updateField('title', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Subtitle</label>
          <input value={about.subtitle} onChange={(e) => updateField('subtitle', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Story</label>
          <textarea value={about.story} onChange={(e) => updateField('story', e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Mission</label>
          <textarea value={about.mission} onChange={(e) => updateField('mission', e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Guild Name</label>
          <input value={about.guildName} onChange={(e) => updateField('guildName', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800" />
        </div>
        <div className="md:col-span-2">
          <button disabled={saving} className="px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-black transition-colors disabled:opacity-70">
            {saving ? 'Saving...' : 'Save About Content'}
          </button>
        </div>
      </form>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Add Guild Member</h2>
        <form onSubmit={addMember} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <input value={memberForm.name} onChange={(e) => setMemberForm((m) => ({ ...m, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
            <input value={memberForm.role} onChange={(e) => setMemberForm((m) => ({ ...m, role: e.target.value }))} placeholder="Guild leader, Strategist, Support..." className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800" />
          </div>
          <div>
            <ImageChooser
              label="Member avatar"
              value={memberForm.avatar}
              onChange={(val) => setMemberForm((m) => ({ ...m, avatar: val }))}
              helperText="You can paste an image URL or choose a local image."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
            <input value={memberForm.bio} onChange={(e) => setMemberForm((m) => ({ ...m, bio: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800" />
          </div>
          <div className="md:col-span-2">
            <button className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">Add Member</button>
          </div>
        </form>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Guild Members</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {about.guildMembers.length === 0 ? (
            <p className="p-4 text-slate-500">No members added yet.</p>
          ) : (
            about.guildMembers.map((member) => (
              <div key={member._id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800">{member.name}</p>
                  <p className="text-sm text-indigo-600">{member.role}</p>
                  {member.bio ? <p className="text-sm text-slate-500 mt-1">{member.bio}</p> : null}
                </div>
                <button type="button" onClick={() => removeMember(member._id)} className="text-red-600 hover:underline text-sm">
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
