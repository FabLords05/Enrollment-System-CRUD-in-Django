import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api';

interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  profile_picture: string | null;
  date_joined: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit profile state
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Change password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('profile/');
      setProfile(res.data);
      setFullName(res.data.full_name);
    } catch (err: any) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const formData = new FormData();
      formData.append('full_name', fullName);
      if (imageFile) formData.append('profile_picture', imageFile);
      const res = await axiosInstance.patch('profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(res.data);
      setEditMode(false);
      setImageFile(null);
      setPreviewImage(null);
      setSuccessMsg('Profile updated successfully.');
    } catch (err: any) {
      setError('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setSuccessMsg(null);
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    setSavingPassword(true);
    try {
      await axiosInstance.post('profile/change-password/', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setSuccessMsg('Password changed successfully.');
      setShowPasswordForm(false);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.current_password) setPasswordError(data.current_password[0]);
      else if (data?.new_password) setPasswordError(data.new_password[0]);
      else setPasswordError('Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  if (loading) return <div className="ustp-spinner"><div className="spinner-ring" /></div>;

  return (
    <>
      <div className="gold-strip" />
      <div className="ustp-page-header">
        <div>
          <h2 className="ustp-page-title">My Profile</h2>
          <p className="ustp-page-subtitle">Manage your account information</p>
        </div>
      </div>

      <div style={{ padding: '0 28px 32px', maxWidth: 680 }}>

        {error && (
          <div className="ustp-alert ustp-alert-error" style={{ marginBottom: 16 }}>
            <span>⚠</span><div>{error}</div>
          </div>
        )}
        {successMsg && (
          <div className="ustp-alert ustp-alert-success" style={{ marginBottom: 16 }}>
            <span>✓</span><div>{successMsg}</div>
          </div>
        )}

        {/* Profile Card */}
        <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-100)', borderRadius: 12, padding: 24, marginBottom: 20 }}>

          {/* Avatar + info row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {(previewImage || profile?.profile_picture) ? (
                <img
                  src={previewImage || profile?.profile_picture || ''}
                  alt="Profile"
                  style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--gold)' }}
                />
              ) : (
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'var(--navy-dark)', border: '3px solid var(--gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, fontWeight: 600, color: 'var(--gold)'
                }}>
                  {profile ? getInitials(profile.full_name) : 'U'}
                </div>
              )}
              {editMode && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'var(--gold)', border: 'none',
                    cursor: 'pointer', fontSize: 12, display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                  }}
                  title="Change photo"
                >📷</button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
            </div>

            <div style={{ flex: 1 }}>
              {editMode ? (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--navy-dark)', fontFamily: "'Source Serif 4', serif" }}>
                    {profile?.full_name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 4 }}>{profile?.email}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
                    Member since {profile?.date_joined ? formatDate(profile.date_joined) : '—'}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Info rows */}
          {!editMode && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Email', value: profile?.email },
                { label: 'Full Name', value: profile?.full_name },
                { label: 'Date Joined', value: profile?.date_joined ? formatDate(profile.date_joined) : '—' },
                { label: 'Account Status', value: 'Active' },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gray-400)', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 14, color: 'var(--gray-800)', fontWeight: 500 }}>{item.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            {editMode ? (
              <>
                <button className="btn-primary" onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : '✓ Save Changes'}
                </button>
                <button className="btn-ghost" onClick={() => { setEditMode(false); setPreviewImage(null); setImageFile(null); setFullName(profile?.full_name || ''); }}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button className="btn-gold" onClick={() => setEditMode(true)}>✏ Edit Profile</button>
                <button className="btn-ghost" onClick={() => { setShowPasswordForm(!showPasswordForm); setPasswordError(null); }}>
                  🔒 Change Password
                </button>
              </>
            )}
          </div>
        </div>

        {/* Change Password Form */}
        {showPasswordForm && (
          <div className="ustp-form-section">
            <div className="ustp-form-title">Change Password</div>
            <form onSubmit={handleChangePassword}>
              {passwordError && (
                <div className="ustp-alert ustp-alert-error" style={{ marginBottom: 14 }}>
                  <span>⚠</span><div>{passwordError}</div>
                </div>
              )}
              <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="form-group">
                  <label className="form-label">Current Password *</label>
                  <input className="form-input" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password *</label>
                  <input className="form-input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} placeholder="Min. 8 characters" />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password *</label>
                  <input className="form-input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: 4 }}>
                <button type="submit" className="btn-primary" disabled={savingPassword}>
                  {savingPassword ? 'Updating...' : '🔒 Update Password'}
                </button>
                <button type="button" className="btn-ghost" onClick={() => { setShowPasswordForm(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordError(null); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;