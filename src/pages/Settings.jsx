import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Shield, Bell, Palette, Database, Camera, MapPin, Globe, Instagram, Twitter, Youtube, Mail,
  Lock, Eye, EyeOff, ChevronDown, Check, Trash2, Download, Sun, Moon, Monitor, LogOut, AlertCircle
} from "lucide-react";
import { T } from '../theme/tokens';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase/client';

const IMG = {
  logo: "/images/twng-logo.svg",
  artist4: "/images/artists/download-1.jpg",
};

const TABS = [
  { key: "profile", label: "Profile", icon: <User size={16} /> },
  { key: "account", label: "Account", icon: <Shield size={16} /> },
  { key: "privacy", label: "Privacy", icon: <Lock size={16} /> },
  { key: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  { key: "appearance", label: "Appearance", icon: <Palette size={16} /> },
  { key: "data", label: "Data", icon: <Database size={16} /> },
];

// ============================================================
// SHARED COMPONENTS
// ============================================================

function Toast({ message, type = "success", visible }) {
  if (!visible) return null;
  const bgColor = type === "success" ? "rgba(34, 197, 94, 0.1)" : type === "error" ? "rgba(248, 113, 113, 0.1)" : "rgba(59, 130, 246, 0.1)";
  const borderColor = type === "success" ? "#22C55E" : type === "error" ? "#F87171" : "#3B82F6";
  const textColor = type === "success" ? "#22C55E" : type === "error" ? "#F87171" : "#3B82F6";
  const icon = type === "error" ? <AlertCircle size={16} /> : <Check size={16} />;

  return (
    <div style={{ position: "fixed", top: "20px", right: "20px", padding: "12px 16px", borderRadius: "8px", background: bgColor, border: `1px solid ${borderColor}`, display: "flex", alignItems: "center", gap: "8px", zIndex: 1000, maxWidth: "300px" }}>
      <div style={{ color: textColor }}>{icon}</div>
      <span style={{ fontSize: "13px", color: textColor }}>{message}</span>
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder, hint, type = "text", error }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: T.txt, marginBottom: "6px" }}>{label}</label>
      {hint && <p style={{ fontSize: "12px", color: T.txtM, marginBottom: "6px" }}>{hint}</p>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", background: T.bgCard, border: `1px solid ${error ? "#F87171" : T.border}`, color: T.txt, fontSize: "14px", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
        onFocus={e => e.target.style.borderColor = error ? "#F87171" : T.borderAcc}
        onBlur={e => e.target.style.borderColor = error ? "#F87171" : T.border} />
      {error && <p style={{ fontSize: "12px", color: "#F87171", marginTop: "4px" }}>{error}</p>}
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, hint, maxLength, rows = 3 }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: T.txt, marginBottom: "6px" }}>{label}</label>
      {hint && <p style={{ fontSize: "12px", color: T.txtM, marginBottom: "6px" }}>{hint}</p>}
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", background: T.bgCard, border: `1px solid ${T.border}`, color: T.txt, fontSize: "14px", outline: "none", resize: "vertical", fontFamily: "'DM Sans', sans-serif" }}
        onFocus={e => e.target.style.borderColor = T.borderAcc}
        onBlur={e => e.target.style.borderColor = T.border} />
      {maxLength && <p style={{ fontSize: "11px", color: T.txtM, marginTop: "4px", fontFamily: "'JetBrains Mono', monospace" }}>{value.length}/{maxLength}</p>}
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange, disabled = false }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${T.border}20`, opacity: disabled ? 0.5 : 1 }}>
      <div style={{ flex: 1, marginRight: "16px" }}>
        <p style={{ fontSize: "14px", color: T.txt, fontWeight: 500 }}>{label}</p>
        {description && <p style={{ fontSize: "12px", color: T.txtM, marginTop: "2px" }}>{description}</p>}
      </div>
      <div onClick={() => !disabled && onChange()} role="switch" aria-checked={checked} aria-label={label} tabIndex={disabled ? -1 : 0} style={{ width: "40px", height: "22px", borderRadius: "11px", background: checked ? T.warm : T.border, position: "relative", cursor: disabled ? "not-allowed" : "pointer", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: "2px", left: checked ? "20px" : "2px", width: "18px", height: "18px", borderRadius: "50%", background: checked ? T.bgDeep : T.txtM, transition: "left 0.2s" }} />
      </div>
    </div>
  );
}

function SectionCard({ title, description, children }) {
  return (
    <div style={{ padding: "20px", borderRadius: "12px", border: `1px solid ${T.border}`, marginBottom: "20px" }}>
      <h3 style={{ fontWeight: 600, color: T.txt, marginBottom: "4px" }}>{title}</h3>
      {description && <p style={{ fontSize: "13px", color: T.txt2, marginBottom: "16px" }}>{description}</p>}
      {children}
    </div>
  );
}

function SelectDropdown({ label, value, onChange, options, hint }) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find(opt => opt.value === value)?.label || "Select...";

  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: T.txt, marginBottom: "6px" }}>{label}</label>
      {hint && <p style={{ fontSize: "12px", color: T.txtM, marginBottom: "6px" }}>{hint}</p>}
      <div style={{ position: "relative" }}>
        <div onClick={() => setOpen(!open)}
          style={{ padding: "10px 14px", borderRadius: "10px", background: T.bgCard, border: `1px solid ${T.border}`, color: T.txt, fontSize: "14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {selectedLabel}
          <ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
        </div>
        {open && (
          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "8px", background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: "10px", zIndex: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}>
            {options.map(opt => (
              <div key={opt.value} onClick={() => { if (!opt.disabled) { onChange(opt.value); setOpen(false); } }}
                style={{ padding: "10px 14px", cursor: opt.disabled ? "default" : "pointer", background: value === opt.value ? T.bgElev : "transparent", color: opt.disabled ? T.txtM : T.txt, fontSize: "14px", borderBottom: `1px solid ${T.border}20`, transition: "background 0.15s", opacity: opt.disabled ? 0.5 : 1 }}>
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SocialInput({ label, value, onChange, placeholder, prefix }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: T.txt, marginBottom: "6px" }}>{label}</label>
      <div style={{ display: "flex", gap: "8px" }}>
        {prefix && <div style={{ padding: "10px 14px", borderRadius: "10px", background: T.bgCard, border: `1px solid ${T.border}`, color: T.txtM, fontSize: "14px", fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center" }}>{prefix}</div>}
        <input type="text" value={value} onChange={onChange} placeholder={placeholder}
          style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", background: T.bgCard, border: `1px solid ${T.border}`, color: T.txt, fontSize: "14px", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
          onFocus={e => e.target.style.borderColor = T.borderAcc}
          onBlur={e => e.target.style.borderColor = T.border} />
      </div>
    </div>
  );
}

function DangerButton({ icon, label, description, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderRadius: "10px", background: hov ? "#7F1D1D15" : "transparent", border: `1px solid ${hov ? "#DC2626" : T.border}`, cursor: "pointer", transition: "all 0.2s", textAlign: "left" }}>
      <div style={{ color: "#F87171" }}>{icon}</div>
      <div>
        <p style={{ fontSize: "14px", color: "#F87171", fontWeight: 500 }}>{label}</p>
        {description && <p style={{ fontSize: "12px", color: T.txtM, marginTop: "2px" }}>{description}</p>}
      </div>
    </button>
  );
}

// ============================================================
// SETTINGS PANELS
// ============================================================

function ProfileSettings() {
  const { profile, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [youtube, setYoutube] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setLocation(profile.location || "");
      setAvatarUrl(profile.avatar_url || "");

      const socialLinks = profile.social_links || {};
      setInstagram(socialLinks.instagram || "");
      setTwitter(socialLinks.twitter || "");
      setYoutube(socialLinks.youtube || "");
      setWebsite(socialLinks.website || "");
    }
  }, [profile]);

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3000);
  };

  const handleAvatarUpload = async (file) => {
    if (!file || !profile) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("File must be less than 5MB", "error");
      return;
    }

    try {
      setSaveError(null);
      setAvatarLoading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const newUrl = data.publicUrl;
      setAvatarUrl(newUrl);

      await updateProfile({ avatar_url: newUrl });
      showToast("Avatar updated successfully", "success");
    } catch (err) {
      console.error("Avatar upload error:", err);
      setSaveError("Failed to upload avatar. Please try again.");
      setTimeout(() => setSaveError(null), 3000);
      showToast("Failed to upload avatar", "error");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      showToast("Display name is required", "error");
      return;
    }

    try {
      setSaveError(null);
      setLoading(true);
      const socialLinks = {
        instagram: instagram.trim(),
        twitter: twitter.trim(),
        youtube: youtube.trim(),
        website: website.trim()
      };

      await updateProfile({
        display_name: displayName.trim(),
        username: username.trim(),
        bio: bio.trim(),
        location: location.trim(),
        social_links: socialLinks
      });

      showToast("Profile saved successfully", "success");
    } catch (err) {
      console.error("Save error:", err);
      setSaveError("Failed to save profile. Please try again.");
      setTimeout(() => setSaveError(null), 3000);
      showToast("Failed to save profile", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, color: T.txt, marginBottom: "24px" }}>Profile Settings</h2>

      {/* Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
        <div style={{ position: "relative" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", overflow: "hidden", border: `2px solid ${T.borderAcc}` }}>
            <img src={avatarUrl || "/images/default-avatar.png"} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} accept="image/png,image/jpeg" style={{ display: "none" }} />
          <button onClick={() => fileInputRef.current?.click()} disabled={avatarLoading} aria-label="Upload profile photo" style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "28px", height: "28px", borderRadius: "50%", background: avatarLoading ? T.txtM : T.warm, border: `2px solid ${T.bgDeep}`, color: T.bgDeep, display: "flex", alignItems: "center", justifyContent: "center", cursor: avatarLoading ? "not-allowed" : "pointer", opacity: avatarLoading ? 0.6 : 1 }}><Camera size={13} /></button>
        </div>
        <div>
          <p style={{ fontWeight: 600, color: T.txt, marginBottom: "4px" }}>Profile Photo</p>
          <p style={{ fontSize: "12px", color: T.txtM }}>JPG, PNG. Max 5MB. Recommended 400x400.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="settings-grid">
        <TextInput label="Display Name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
        <TextInput label="Username" value={username} onChange={e => setUsername(e.target.value)} hint="twng.com/@username" />
      </div>

      <TextArea label="Bio" value={bio} onChange={e => setBio(e.target.value)} maxLength={300} rows={3} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="settings-grid">
        <TextInput label="Location" value={location} onChange={e => setLocation(e.target.value)} placeholder="City, State" />
        <TextInput label="Website" value={website} onChange={e => setWebsite(e.target.value)} placeholder="yoursite.com" />
      </div>

      <h3 style={{ fontSize: "14px", fontWeight: 600, color: T.txt, marginTop: "24px", marginBottom: "16px" }}>Social Links</h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="settings-grid">
        <SocialInput label="Instagram" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="username" prefix={<Instagram size={14} style={{ marginRight: "6px" }} />} />
        <SocialInput label="Twitter/X" value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="username" prefix={<Twitter size={14} style={{ marginRight: "6px" }} />} />
      </div>

      <SocialInput label="YouTube" value={youtube} onChange={e => setYoutube(e.target.value)} placeholder="@channelname" prefix={<Youtube size={14} style={{ marginRight: "6px" }} />} />

      {saveError && <p style={{ fontSize: "13px", color: "#F87171", marginBottom: "16px" }}>{saveError}</p>}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "28px" }}>
        <button disabled={loading} style={{ padding: "10px 20px", borderRadius: "10px", background: "transparent", border: `1px solid ${T.border}`, color: T.txt2, fontSize: "14px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>Cancel</button>
        <button onClick={handleSave} disabled={loading} style={{ padding: "10px 24px", borderRadius: "10px", background: loading ? T.txtM : T.warm, border: "none", color: T.bgDeep, fontSize: "14px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>{loading ? "Saving..." : "Save Changes"}</button>
      </div>

      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </div>
  );
}

function AccountSettings() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3000);
  };

  const handlePasswordChange = async () => {
    setPasswordError("");

    if (!newPassword.trim()) {
      setPasswordError("New password is required");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setNewPassword("");
      setConfirmPassword("");
      showToast("Password changed successfully", "success");
    } catch (err) {
      console.error("Password change error:", err);
      showToast("Failed to change password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, color: T.txt, marginBottom: "24px" }}>Account Settings</h2>

      <SectionCard title="Email Address" description="Your primary email for account recovery and notifications">
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <input type="email" value={email} disabled style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", background: T.bgCard, border: `1px solid ${T.border}`, color: T.txt, fontSize: "14px", outline: "none", fontFamily: "'DM Sans', sans-serif", opacity: 0.6 }} />
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", padding: "6px 12px", borderRadius: "6px", background: "rgba(34, 197, 94, 0.1)" }}>
            <Check size={14} style={{ color: "#22C55E" }} />
            <span style={{ fontSize: "12px", color: "#22C55E", fontWeight: 500 }}>Verified</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Change Password" description="Update your password to keep your account secure">
        <TextInput label="New Password" type={showPassword ? "text" : "password"} value={newPassword} onChange={e => { setNewPassword(e.target.value); setPasswordError(""); }} placeholder="Create new password" error={passwordError && newPassword && confirmPassword && newPassword !== confirmPassword ? "Passwords do not match" : ""} />
        <TextInput label="Confirm Password" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setPasswordError(""); }} placeholder="Confirm new password" error={passwordError} />
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginBottom: "16px" }}>
          <input type="checkbox" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} style={{ cursor: "pointer" }} />
          <span style={{ fontSize: "13px", color: T.txt2 }}>Show password</span>
        </label>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button onClick={() => { setNewPassword(""); setConfirmPassword(""); setPasswordError(""); }} disabled={loading} style={{ padding: "10px 20px", borderRadius: "10px", background: "transparent", border: `1px solid ${T.border}`, color: T.txt2, fontSize: "14px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>Reset</button>
          <button onClick={handlePasswordChange} disabled={loading || !newPassword || !confirmPassword} style={{ padding: "10px 24px", borderRadius: "10px", background: loading || !newPassword || !confirmPassword ? T.txtM : T.warm, border: "none", color: T.bgDeep, fontSize: "14px", fontWeight: 600, cursor: loading || !newPassword || !confirmPassword ? "not-allowed" : "pointer", opacity: loading || !newPassword || !confirmPassword ? 0.6 : 1 }}>{loading ? "Updating..." : "Update Password"}</button>
        </div>
      </SectionCard>

      <SectionCard title="Connected Accounts" description="Link external accounts for seamless sign-in">
        <p style={{ fontSize: "13px", color: T.txtM, padding: "14px 0" }}>Additional authentication methods will be available in a future update.</p>
        <p style={{ fontSize: "11px", color: T.txtM }}>(coming soon)</p>
      </SectionCard>

      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </div>
  );
}

function PrivacySettings() {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showActivity: true,
    searchIndexing: true
  });
  const [doNotShow, setDoNotShow] = useState(false);
  const [occDefaults, setOccDefaults] = useState({
    imageVisibility: "public",
    videoVisibility: "public",
    audioVisibility: "public",
    storyVisibility: "visible",
    nicknameVisibility: "visible",
  });
  const [transferDefaults, setTransferDefaults] = useState({
    userId: "anonymous",
    timelineEvents: "anonymized",
    images: "none",
    videos: "none",
    story: "none",
  });

  useEffect(() => {
    if (profile?.privacy_settings) {
      setPrivacySettings({
        profileVisibility: profile.privacy_settings.profileVisibility || "public",
        showActivity: profile.privacy_settings.showActivity !== false,
        searchIndexing: profile.privacy_settings.searchIndexing !== false
      });
    }
    // "Do Not Show" is a top-level user field, not in JSONB
    if (profile?.do_not_show_in_others_ie !== undefined) {
      setDoNotShow(profile.do_not_show_in_others_ie);
    }
    if (profile?.privacy_defaults) {
      const pd = profile.privacy_defaults;
      setOccDefaults({
        imageVisibility: pd.imageVisibility || pd.occ_public_defaults?.images || "public",
        videoVisibility: pd.videoVisibility || pd.occ_public_defaults?.videos || "public",
        audioVisibility: pd.audioVisibility || pd.occ_public_defaults?.audio || "public",
        storyVisibility: pd.storyVisibility || pd.occ_public_defaults?.story || "visible",
        nicknameVisibility: pd.nicknameVisibility || pd.occ_public_defaults?.nickname || "visible",
      });
      setTransferDefaults({
        userId: pd.transfer_retention?.userId || pd.transferUserId || "anonymous",
        timelineEvents: pd.transfer_retention?.timelineEvents || pd.transferTimeline || "anonymized",
        images: pd.transfer_retention?.images || pd.transferImages || "none",
        videos: pd.transfer_retention?.videos || pd.transferVideos || "none",
        story: pd.transfer_retention?.story || pd.transferStory || "none",
      });
    }
  }, [profile]);

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3000);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateProfile({
        privacy_settings: privacySettings,
        do_not_show_in_others_ie: doNotShow,
        privacy_defaults: {
          ...occDefaults,
          occ_public_defaults: {
            images: occDefaults.imageVisibility,
            videos: occDefaults.videoVisibility,
            audio: occDefaults.audioVisibility,
            story: occDefaults.storyVisibility,
            nickname: occDefaults.nicknameVisibility,
          },
          transfer_retention: transferDefaults,
        }
      });
      showToast("Privacy settings saved successfully", "success");
    } catch (err) {
      console.error("Save error:", err);
      showToast("Failed to save privacy settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const visibilityOpts = [
    { value: "public", label: "Public \u2014 Anyone can see" },
    { value: "future_owners", label: "Future Owners Only \u2014 Current + future owners" },
    { value: "private", label: "Private \u2014 Only you" },
  ];

  const visibilityToggleOpts = [
    { value: "visible", label: "Visible" },
    { value: "hidden", label: "Hidden" },
  ];

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, color: T.txt, marginBottom: "24px" }}>Privacy & Visibility</h2>

      {/* Profile Visibility */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, color: T.txt, marginBottom: "16px" }}>Profile</h3>
        <ToggleRow label="Public Profile" description="Allow anyone to view your profile and guitars" checked={privacySettings.profileVisibility === "public"} onChange={() => setPrivacySettings({ ...privacySettings, profileVisibility: privacySettings.profileVisibility === "public" ? "private" : "public" })} />
        <ToggleRow label="Show Activity" description="Let others see your recent activity and interactions" checked={privacySettings.showActivity} onChange={() => setPrivacySettings({ ...privacySettings, showActivity: !privacySettings.showActivity })} />
        <ToggleRow label="Search Engine Indexing" description="Allow search engines to find your profile" checked={privacySettings.searchIndexing} onChange={() => setPrivacySettings({ ...privacySettings, searchIndexing: !privacySettings.searchIndexing })} />
      </div>

      {/* Global "Do Not Show" Toggle — Spec Section 7 */}
      <div style={{ marginBottom: "24px", padding: "16px", borderRadius: "10px", background: "#7F1D1D10", border: `1px solid #7F1D1D30` }}>
        <ToggleRow label="Do Not Show My Content in Instruments I Don't Own" description="Hide ALL your content (images, stories, timeline events) from guitars you no longer own" checked={doNotShow} onChange={() => setDoNotShow(!doNotShow)} />
        <p style={{ fontSize: "12px", color: T.txtM, marginTop: "8px", lineHeight: 1.5 }}>
          This is a global setting. When enabled, all your content is hidden from instruments you've transferred.
          This setting can only be made <strong>more restrictive</strong> — once content is hidden via per-transfer settings, this cannot make it visible again.
        </p>
      </div>

      {/* Default OCC Visibility — Spec Section 4.1 */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, color: T.txt, marginBottom: "4px" }}>Default Content Visibility</h3>
        <p style={{ fontSize: "12px", color: T.txtM, marginBottom: "16px" }}>These defaults apply when you add new content to a guitar. You can override per item.</p>
        <SelectDropdown label="Images" value={occDefaults.imageVisibility} onChange={(val) => setOccDefaults({ ...occDefaults, imageVisibility: val })} options={visibilityOpts} />
        <SelectDropdown label="Videos" value={occDefaults.videoVisibility} onChange={(val) => setOccDefaults({ ...occDefaults, videoVisibility: val })} options={visibilityOpts} />
        <SelectDropdown label="Audio" value={occDefaults.audioVisibility} onChange={(val) => setOccDefaults({ ...occDefaults, audioVisibility: val })} options={visibilityOpts} />
        <SelectDropdown label="Story Text" value={occDefaults.storyVisibility} onChange={(val) => setOccDefaults({ ...occDefaults, storyVisibility: val })} options={visibilityToggleOpts} />
        <SelectDropdown label="Nickname" value={occDefaults.nicknameVisibility} onChange={(val) => setOccDefaults({ ...occDefaults, nicknameVisibility: val })} options={visibilityToggleOpts} />
        <p style={{ fontSize: "11px", color: T.txtM, marginTop: "8px", fontStyle: "italic" }}>Private notes are always private to you and never transfer.</p>
      </div>

      {/* Transfer Retention Defaults — Spec Section 4.2 */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, color: T.txt, marginBottom: "4px" }}>Transfer Retention Defaults</h3>
        <p style={{ fontSize: "12px", color: T.txtM, marginBottom: "16px" }}>When you transfer a guitar, what should the new owner see? You can override these per transfer.</p>
        <SelectDropdown label="My User ID" value={transferDefaults.userId} onChange={(val) => setTransferDefaults({ ...transferDefaults, userId: val })} options={[
          { value: "visible", label: "Visible \u2014 New owner sees your name" },
          { value: "anonymous", label: "Anonymous \u2014 Shown as 'Previous Owner'" },
        ]} />
        <SelectDropdown label="Timeline Events I Created" value={transferDefaults.timelineEvents} onChange={(val) => setTransferDefaults({ ...transferDefaults, timelineEvents: val })} options={[
          { value: "named", label: "Transfer with my name" },
          { value: "anonymized", label: "Transfer anonymized" },
          { value: "none", label: "Don't transfer" },
        ]} />
        <SelectDropdown label="Images" value={transferDefaults.images} onChange={(val) => setTransferDefaults({ ...transferDefaults, images: val })} options={[
          { value: "all", label: "Transfer all images" },
          { value: "none", label: "Don't transfer images" },
        ]} />
        <SelectDropdown label="Videos" value={transferDefaults.videos} onChange={(val) => setTransferDefaults({ ...transferDefaults, videos: val })} options={[
          { value: "all", label: "Transfer all videos" },
          { value: "none", label: "Don't transfer videos" },
        ]} />
        <SelectDropdown label="Story Text" value={transferDefaults.story} onChange={(val) => setTransferDefaults({ ...transferDefaults, story: val })} options={[
          { value: "transfer", label: "Transfer story" },
          { value: "none", label: "Don't transfer story" },
        ]} />
        <p style={{ fontSize: "11px", color: T.txtM, marginTop: "8px", fontStyle: "italic" }}>Private notes never transfer regardless of these settings.</p>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "28px" }}>
        <button disabled={loading} style={{ padding: "10px 20px", borderRadius: "10px", background: "transparent", border: `1px solid ${T.border}`, color: T.txt2, fontSize: "14px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>Cancel</button>
        <button onClick={handleSave} disabled={loading} style={{ padding: "10px 24px", borderRadius: "10px", background: loading ? T.txtM : T.warm, border: "none", color: T.bgDeep, fontSize: "14px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>{loading ? "Saving..." : "Save Changes"}</button>
      </div>

      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </div>
  );
}

function NotificationSettings() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  const [saveError, setSaveError] = useState(null);
  const [notificationPrefs, setNotificationPrefs] = useState({
    email_notifications: true,
    transfer_alerts: true,
    community_replies: true,
    system_announcements: true
  });

  useEffect(() => {
    if (user?.user_metadata?.notification_prefs) {
      setNotificationPrefs(user.user_metadata.notification_prefs);
    }
  }, [user]);

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3000);
  };

  const handleToggle = async (key) => {
    try {
      setSaveError(null);
      setLoading(true);
      const updated = { ...notificationPrefs, [key]: !notificationPrefs[key] };
      setNotificationPrefs(updated);

      const { error } = await supabase.auth.updateUser({
        data: { notification_prefs: updated }
      });

      if (error) throw error;
      showToast("Notification preference updated", "success");
    } catch (err) {
      console.error("Update error:", err);
      setSaveError("Failed to save notification preference. Please try again.");
      setTimeout(() => setSaveError(null), 3000);
      showToast("Failed to update notification preference", "error");
      setNotificationPrefs(notificationPrefs);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, color: T.txt, marginBottom: "24px" }}>Notifications</h2>

      {saveError && <p style={{ fontSize: "13px", color: "#F87171", marginBottom: "16px" }}>{saveError}</p>}

      <SectionCard title="Email Notifications" description="Control when you receive email updates from TWNG">
        <ToggleRow
          label="Email Notifications"
          description="Receive important updates and notifications via email"
          checked={notificationPrefs.email_notifications}
          onChange={() => handleToggle('email_notifications')}
          disabled={loading}
        />
        <ToggleRow
          label="Transfer Alerts"
          description="Get notified when one of your guitars is transferred"
          checked={notificationPrefs.transfer_alerts}
          onChange={() => handleToggle('transfer_alerts')}
          disabled={loading}
        />
        <ToggleRow
          label="Community Replies"
          description="Be notified when someone replies to your timeline events"
          checked={notificationPrefs.community_replies}
          onChange={() => handleToggle('community_replies')}
          disabled={loading}
        />
        <ToggleRow
          label="System Announcements"
          description="Receive important system updates and feature announcements"
          checked={notificationPrefs.system_announcements}
          onChange={() => handleToggle('system_announcements')}
          disabled={loading}
        />
      </SectionCard>

      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </div>
  );
}

function AppearanceSettings() {
  const { mode, toggleTheme } = useTheme();

  const handleThemeClick = (selectedMode) => {
    if (selectedMode !== mode) {
      toggleTheme();
    }
  };

  const themes = [
    { key: "dark", label: "Dark", icon: <Moon size={20} />, desc: "Dark theme" },
    { key: "light", label: "Light", icon: <Sun size={20} />, desc: "Light theme" },
    { key: "system", label: "System", icon: <Monitor size={20} />, desc: "Match device settings", comingSoon: true }
  ];

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, color: T.txt, marginBottom: "24px" }}>Appearance</h2>
      <p style={{ fontSize: "13px", color: T.txtM, marginBottom: "20px" }}>Choose your preferred theme for the TWNG interface.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
        {themes.map(t => (
          <div key={t.key} onClick={() => t.key !== "system" && handleThemeClick(t.key)}
            style={{ padding: "20px", borderRadius: "12px", border: `2px solid ${mode === t.key ? T.warm : T.border}`, background: mode === t.key ? T.warm + "10" : T.bgCard, cursor: t.key === "system" ? "default" : "pointer", opacity: t.comingSoon ? 0.5 : 1, textAlign: "center", transition: "all 0.2s" }}>
            <div style={{ color: mode === t.key ? T.warm : T.txtM, marginBottom: "8px", display: "flex", justifyContent: "center" }}>{t.icon}</div>
            <p style={{ fontWeight: 600, color: T.txt, marginBottom: "4px", fontSize: "14px" }}>{t.label}</p>
            <p style={{ fontSize: "11px", color: T.txtM }}>{t.desc}</p>
            {t.comingSoon && <p style={{ fontSize: "11px", color: T.txtM, marginTop: "4px" }}>(coming soon)</p>}
            {mode === t.key && <div style={{ marginTop: "8px" }}><Check size={16} style={{ color: T.warm }} /></div>}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "28px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, color: T.txt, marginBottom: "12px" }}>Language</h3>
        <p style={{ fontSize: "13px", color: T.txtM, marginBottom: "16px" }}>English only for now. Additional languages coming soon.</p>
        <SelectDropdown value="en" onChange={() => {}} options={[
          { value: "en", label: "English" },
          { value: "es", label: "Español", disabled: true },
          { value: "fr", label: "Français", disabled: true }
        ]} />
        <p style={{ fontSize: "11px", color: T.txtM, marginTop: "8px" }}>Other languages (coming soon)</p>
      </div>
    </div>
  );
}

function DataSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  const [saveError, setSaveError] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3000);
  };

  const handleExportJSON = async () => {
    try {
      setExportLoading(true);
      const { data, error } = await supabase
        .from('guitars')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `twng-collection-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("Collection exported as JSON", "success");
    } catch (err) {
      console.error("Export error:", err);
      showToast("Failed to export collection", "error");
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExportLoading(true);
      const { data, error } = await supabase
        .from('guitars')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data.length === 0) {
        showToast("No guitars to export", "info");
        setExportLoading(false);
        return;
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row =>
          headers.map(header => {
            const val = row[header];
            if (val === null || val === undefined) return '';
            if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
            return `"${String(val).replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `twng-collection-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("Collection exported as CSV", "success");
    } catch (err) {
      console.error("Export error:", err);
      showToast("Failed to export collection", "error");
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "WARNING: This action cannot be undone.\n\nAll your data will be permanently deleted, including:\n- Your profile and account\n- All guitars and their data\n- All photos, videos, and media\n- Transfer history and timeline events\n\nAre you absolutely sure you want to delete your account?"
    );

    if (!confirmed) return;

    try {
      setSaveError(null);
      setDeleteLoading(true);

      // Try to delete via RPC first
      const { error: rpcError } = await supabase.rpc('delete_user_account');

      if (rpcError) {
        // Fall back to sign out if RPC not available
        console.warn('RPC delete failed, signing out instead:', rpcError);
        await supabase.auth.signOut();
      }

      showToast("Account deleted successfully", "success");
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error("Delete error:", err);
      setSaveError("Failed to delete account. Please try again.");
      setTimeout(() => setSaveError(null), 3000);
      showToast("Failed to delete account", "error");
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, color: T.txt, marginBottom: "24px" }}>Data & Export</h2>

      {saveError && <p style={{ fontSize: "13px", color: "#F87171", marginBottom: "16px" }}>{saveError}</p>}

      <SectionCard title="Export Collection" description="Download your entire collection as a structured file including all specs, stories, and metadata.">
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={handleExportJSON} disabled={exportLoading} style={{ padding: "8px 16px", borderRadius: "8px", background: exportLoading ? T.txtM : T.bgCard, border: `1px solid ${T.border}`, color: T.txt2, fontSize: "13px", cursor: exportLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px", opacity: exportLoading ? 0.6 : 1, transition: "all 0.2s" }}><Download size={13} /> {exportLoading ? "Exporting..." : "Export as JSON"}</button>
          <button onClick={handleExportCSV} disabled={exportLoading} style={{ padding: "8px 16px", borderRadius: "8px", background: exportLoading ? T.txtM : T.bgCard, border: `1px solid ${T.border}`, color: T.txt2, fontSize: "13px", cursor: exportLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px", opacity: exportLoading ? 0.6 : 1, transition: "all 0.2s" }}><Download size={13} /> {exportLoading ? "Exporting..." : "Export as CSV"}</button>
        </div>
      </SectionCard>

      <SectionCard title="Export Media" description="Download all photos and videos from your collection as a ZIP archive.">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button disabled onClick={() => showToast("Media ZIP export coming soon", "info")} style={{ padding: "8px 16px", borderRadius: "8px", background: T.bgCard, border: `1px solid ${T.border}`, color: T.txt2, fontSize: "13px", cursor: "default", display: "flex", alignItems: "center", gap: "6px", opacity: 0.5 }}><Download size={13} /> Download Media (ZIP)</button>
          <p style={{ fontSize: "11px", color: T.txtM }}>(coming soon)</p>
        </div>
      </SectionCard>

      <div style={{ marginTop: "32px" }}>
        <h3 style={{ fontWeight: 600, color: "#F87171", marginBottom: "16px" }}>Danger Zone</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <DangerButton icon={<Trash2 size={16} />} label="Delete Account" description="Permanently delete your TWNG account and all associated data" onClick={() => setShowDeleteConfirm(!showDeleteConfirm)} />
        </div>

        {showDeleteConfirm && (
          <div style={{ marginTop: "16px", padding: "16px", borderRadius: "10px", background: "#7F1D1D15", border: `1px solid ${T.border}` }}>
            <p style={{ fontSize: "13px", color: T.txt, marginBottom: "12px" }}>This action cannot be undone. All your data will be permanently deleted.</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button disabled={deleteLoading} style={{ flex: 1, padding: "8px 16px", borderRadius: "8px", background: T.bgCard, border: `1px solid ${T.border}`, color: T.txt2, fontSize: "13px", cursor: deleteLoading ? "not-allowed" : "pointer", opacity: deleteLoading ? 0.6 : 1 }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button onClick={handleDeleteAccount} disabled={deleteLoading} style={{ flex: 1, padding: "8px 16px", borderRadius: "8px", background: "#DC2626", border: "none", color: "#FFF", fontSize: "13px", cursor: deleteLoading ? "not-allowed" : "pointer", fontWeight: 600, opacity: deleteLoading ? 0.6 : 1 }}>{deleteLoading ? "Deleting..." : "Delete Account"}</button>
            </div>
          </div>
        )}
      </div>

      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </div>
  );
}

// ============================================================
// MAIN SETTINGS PAGE
// ============================================================

export default function TWNGSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const panels = {
    profile: <ProfileSettings />,
    account: <AccountSettings />,
    privacy: <PrivacySettings />,
    notifications: <NotificationSettings />,
    appearance: <AppearanceSettings />,
    data: <DataSettings />,
  };

  return (
    <div style={{ background: T.bgDeep, color: T.txt, fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; }
        body { background: #0C0A09; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${T.txtM}; }
        input, textarea, select { font-family: 'DM Sans', sans-serif; }
        @media (max-width: 768px) {
          .settings-sidebar { display: none !important; }
          .settings-mobile-nav { display: flex !important; }
          .settings-grid { grid-template-columns: 1fr !important; }
          .settings-layout { padding-top: 0 !important; }
        }
        @media (min-width: 769px) {
          .settings-mobile-nav { display: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        {/* Mobile nav */}
        <div className="settings-mobile-nav" style={{ display: "none", overflowX: "auto", gap: "4px", padding: "16px 0 12px", background: T.bgDeep }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{ padding: "8px 14px", borderRadius: "8px", background: activeTab === tab.key ? T.bgCard : "transparent", border: `1px solid ${activeTab === tab.key ? T.border : "transparent"}`, color: activeTab === tab.key ? T.txt : T.txtM, fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px" }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Main layout */}
        <div className="settings-layout" style={{ display: "flex", gap: "40px", paddingTop: "32px", paddingBottom: "80px" }}>
          {/* Desktop Sidebar */}
          <div className="settings-sidebar" style={{ width: "220px", flexShrink: 0 }}>
            <nav style={{ position: "sticky", top: "96px" }}>
              {TABS.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "8px", background: activeTab === tab.key ? T.bgCard : "transparent", border: "none", color: activeTab === tab.key ? T.txt : T.txt2, fontSize: "14px", fontWeight: activeTab === tab.key ? 600 : 400, cursor: "pointer", marginBottom: "4px", transition: "all 0.15s", textAlign: "left" }}
                  onMouseEnter={e => { if (activeTab !== tab.key) e.currentTarget.style.background = T.bgElev; }}
                  onMouseLeave={e => { if (activeTab !== tab.key) e.currentTarget.style.background = "transparent"; }}>
                  <span style={{ color: activeTab === tab.key ? T.warm : T.txtM }}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0, maxWidth: "600px" }}>
            {panels[activeTab]}
          </div>
        </div>
      </div>
    </div>
  );
}
