import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Search, User, Globe, Users, EyeOff, Send, AlertTriangle, Check, Loader2, Guitar } from 'lucide-react';
import { T } from '../theme/tokens';
import { useAuth } from '../context/AuthContext';
import { getInstrument } from '../lib/supabase/instruments';
import { initiateTransfer, searchUsers } from '../lib/supabase/transfers';

/**
 * Transfer Instrument page — 3-step flow (renamed from TransferGuitar)
 *   1. Choose transfer type (to TWNG member / outside platform)
 *   2. Select recipient (member search) + privacy overrides
 *   3. Confirm and submit
 *
 * Updated schema: guitar → instrument, ie_id → instrument_id,
 * from_user_id → from_owner_id, to_user_id → to_owner_id
 */

const TRANSFER_TYPES = [
  {
    id: 'to_member',
    label: 'Transfer to TWNG Member',
    description: 'Transfer ownership to another TWNG user. They will receive a notification and must accept.',
    icon: Users,
  },
  {
    id: 'outside_twng',
    label: 'Transferred Outside TWNG',
    description: 'Mark this guitar as transferred to someone outside the platform. You will have 24 hours to cancel.',
    icon: Globe,
  },
];

const PRIVACY_OPTIONS = [
  { key: 'user_id', label: 'Your Identity', desc: 'Show your name in ownership history', options: ['visible', 'anonymized'] },
  { key: 'timeline_events', label: 'Timeline Events', desc: 'Your timeline entries on this guitar', options: ['transfer', 'anonymize', 'remove'] },
  { key: 'images', label: 'Images', desc: 'Photos you uploaded', options: ['transfer', 'remove'] },
  { key: 'videos', label: 'Videos', desc: 'Videos you uploaded', options: ['transfer', 'remove'] },
  { key: 'story', label: 'Story', desc: 'Your story text', options: ['transfer', 'remove'] },
];

function PrivacyLabel(value) {
  const labels = {
    visible: 'Visible', anonymized: 'Anonymized', transfer: 'Transfer with guitar',
    remove: 'Remove on transfer', anonymize: 'Transfer anonymized',
  };
  return labels[value] || value;
}

export default function TransferInstrument() {
  const { instrumentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Updated: fetch instrument instead of guitar
  const [instrument, setInstrument] = useState(null);
  const [instrumentLoading, setInstrumentLoading] = useState(true);

  useEffect(() => {
    const fetchInstrument = async () => {
      try {
        const data = await getInstrument(instrumentId);
        setInstrument(data);
      } catch (err) {
        console.error("Failed to fetch instrument:", err);
      } finally {
        setInstrumentLoading(false);
      }
    };
    if (instrumentId) fetchInstrument();
  }, [instrumentId]);

  const [step, setStep] = useState(1);
  const [transferType, setTransferType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [privacyOverrides, setPrivacyOverrides] = useState({
    user_id: 'visible',
    timeline_events: 'transfer',
    images: 'transfer',
    videos: 'transfer',
    story: 'transfer',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Check ownership — updated field: owner_id (from ownerId)
  const isOwner = !!(user && instrument && instrument.owner_id === user.id);

  // Search users with debounce
  useEffect(() => {
    if (transferType !== 'to_member' || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchUsers(searchQuery);
        // Exclude self
        setSearchResults(results.filter(u => u.id !== user.id));
      } catch (err) {
        console.error('[Transfer] User search failed:', err.message);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, transferType, user?.id]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      // Updated schema: guitarId → instrument_id, toUserId → to_owner_id
      await initiateTransfer({
        instrument_id: instrumentId,
        to_owner_id: transferType === 'to_member' ? selectedUser?.id : null,
        transfer_type: transferType,
        privacy_overrides: privacyOverrides,
      });
      setSuccess(true);
    } catch (err) {
      console.error('[Transfer] Initiation failed:', err.message);
      setError(err.message || 'Transfer failed');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Styles ---
  const cardStyle = {
    padding: '20px', borderRadius: '12px', border: `1px solid ${T.border}`,
    backgroundColor: T.bgCard, cursor: 'pointer', transition: 'all 150ms',
  };
  const selectedCardStyle = { ...cardStyle, borderColor: T.warm, backgroundColor: `${T.warm}10` };
  const btnPrimary = {
    padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
    background: T.warm, border: `1px solid ${T.warm}`, color: T.bgDeep, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '8px',
  };
  const btnSecondary = {
    padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 500,
    background: 'transparent', border: `1px solid ${T.border}`, color: T.txt2, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '8px',
  };

  // --- Loading / Auth gates ---
  if (instrumentLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: T.bgDeep }}>
        <Loader2 size={32} color={T.warm} style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!instrument || !isOwner) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: T.bgDeep, gap: '16px' }}>
        <Guitar size={48} color={T.txtM} />
        <p style={{ fontSize: '18px', fontWeight: 600, color: T.txt }}>
          {!instrument ? 'Instrument not found' : 'Only the owner can transfer this instrument'}
        </p>
        <Link to={instrument ? `/instrument/${instrumentId}` : '/my-instruments'} style={{ color: T.warm, fontSize: '14px' }}>
          Go back
        </Link>
      </div>
    );
  }

  // --- Success screen ---
  if (success) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '64px 24px', textAlign: 'center', backgroundColor: T.bgDeep, minHeight: '60vh' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#34D39920',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
        }}>
          <Check size={32} color="#34D399" />
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 700, color: T.txt, margin: '0 0 12px' }}>
          Transfer Initiated
        </h1>
        <p style={{ color: T.txt2, fontSize: '15px', lineHeight: 1.6, marginBottom: '32px' }}>
          {transferType === 'to_member'
            ? `A transfer request has been sent to @${selectedUser?.username}. They have 7 days to accept.`
            : 'The instrument has been marked as transferred. You have 24 hours to cancel if needed.'}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/my-instruments" style={{ ...btnSecondary, textDecoration: 'none' }}>My Instruments</Link>
          <Link to={`/instrument/${instrumentId}`} style={{ ...btnPrimary, textDecoration: 'none' }}>View Instrument</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: T.bgDeep, color: T.txt, minHeight: '100vh' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 24px 64px' }}>
        {/* Back link */}
        <Link to={`/instrument/${instrumentId}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', color: T.txt2,
          textDecoration: 'none', fontSize: '14px', fontWeight: 500, marginBottom: '32px',
        }}>
          <ArrowLeft size={18} /> Back to instrument
        </Link>

        {/* Instrument summary card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
          backgroundColor: T.bgCard, borderRadius: '12px', border: `1px solid ${T.border}`, marginBottom: '32px',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '10px', flexShrink: 0,
            backgroundImage: `url('${instrument.image}')`, backgroundSize: 'cover', backgroundPosition: 'center',
            backgroundColor: T.bgCard,
          }} />
          <div>
            <p style={{ fontSize: '12px', color: T.txt2, fontFamily: "'JetBrains Mono', monospace", margin: '0 0 4px' }}>
              {instrument.make} · {instrument.year}
            </p>
            <p style={{ fontSize: '16px', fontWeight: 600, color: T.txt, margin: 0 }}>
              {instrument.model}
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                backgroundColor: step >= s ? T.warm : T.bgCard,
                color: step >= s ? T.bgDeep : T.txtM,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 700, border: `1px solid ${step >= s ? T.warm : T.border}`,
              }}>
                {step > s ? <Check size={14} /> : s}
              </div>
              {s < 3 && <div style={{ width: '32px', height: '2px', backgroundColor: step > s ? T.warm : T.border }} />}
            </div>
          ))}
          <span style={{ fontSize: '13px', color: T.txt2, marginLeft: '12px' }}>
            {step === 1 ? 'Transfer Type' : step === 2 ? 'Details & Privacy' : 'Confirm'}
          </span>
        </div>

        {/* ====== STEP 1: Choose Transfer Type ====== */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 600, margin: 0 }}>
              How are you transferring this guitar?
            </h2>
            <p style={{ color: T.txt2, fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
              Choose how you'd like to transfer ownership of this instrument.
            </p>
            {TRANSFER_TYPES.map(tt => {
              const Icon = tt.icon;
              const isSelected = transferType === tt.id;
              return (
                <div key={tt.id} onClick={() => setTransferType(tt.id)}
                  style={isSelected ? selectedCardStyle : cardStyle}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = T.txt2; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = T.border; }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <Icon size={22} color={isSelected ? T.warm : T.txt2} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 600, color: T.txt, margin: '0 0 4px' }}>{tt.label}</p>
                      <p style={{ fontSize: '13px', color: T.txt2, margin: 0, lineHeight: 1.5 }}>{tt.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button disabled={!transferType} onClick={() => setStep(2)}
                style={{ ...btnPrimary, opacity: transferType ? 1 : 0.4 }}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ====== STEP 2: Details + Privacy ====== */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 600, margin: 0 }}>
              {transferType === 'to_member' ? 'Select Recipient' : 'Content Privacy'}
            </h2>

            {/* Member search (to_member only) */}
            {transferType === 'to_member' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} color={T.txtM} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    placeholder="Search by username or name..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 14px 12px 40px', borderRadius: '10px',
                      fontSize: '14px', backgroundColor: T.bgCard, border: `1px solid ${T.border}`,
                      color: T.txt, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Selected user */}
                {selectedUser && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: '10px', backgroundColor: `${T.warm}10`, border: `1px solid ${T.warm}40`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%', backgroundColor: T.warm,
                        color: T.bgDeep, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 700,
                      }}>
                        {(selectedUser.username || '?').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: T.txt, margin: 0 }}>{selectedUser.username}</p>
                        <p style={{ fontSize: '12px', color: T.txt2, fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>@{selectedUser.username}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedUser(null)} style={{
                      fontSize: '12px', color: T.txt2, background: 'none', border: 'none', cursor: 'pointer',
                    }}>Change</button>
                  </div>
                )}

                {/* Search results */}
                {!selectedUser && searchResults.length > 0 && (
                  <div style={{ borderRadius: '10px', border: `1px solid ${T.border}`, overflow: 'hidden' }}>
                    {searchResults.map(u => (
                      <button key={u.id} onClick={() => { setSelectedUser(u); setSearchResults([]); setSearchQuery(''); }}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '12px 16px', background: 'transparent', border: 'none',
                          borderBottom: `1px solid ${T.border}`, cursor: 'pointer', textAlign: 'left',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = T.bgCard}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <User size={16} color={T.txt2} />
                        <div>
                          <p style={{ fontSize: '14px', color: T.txt, margin: 0 }}>{u.username}</p>
                          <p style={{ fontSize: '11px', color: T.txtM, fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>@{u.username}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {searching && <p style={{ fontSize: '13px', color: T.txtM }}>Searching...</p>}
              </div>
            )}

            {/* Privacy overrides */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: T.txt, margin: 0 }}>
                Content Privacy After Transfer
              </h3>
              <p style={{ fontSize: '13px', color: T.txt2, lineHeight: 1.5, margin: 0 }}>
                Choose what happens to your content when the guitar changes hands.
              </p>
              {PRIVACY_OPTIONS.map(opt => (
                <div key={opt.key} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderRadius: '10px', backgroundColor: T.bgCard, border: `1px solid ${T.border}`,
                }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: T.txt, margin: 0 }}>{opt.label}</p>
                    <p style={{ fontSize: '12px', color: T.txtM, margin: 0 }}>{opt.desc}</p>
                  </div>
                  <select
                    value={privacyOverrides[opt.key]}
                    onChange={e => setPrivacyOverrides(prev => ({ ...prev, [opt.key]: e.target.value }))}
                    style={{
                      padding: '6px 10px', borderRadius: '8px', fontSize: '12px',
                      backgroundColor: T.bgDeep, border: `1px solid ${T.border}`, color: T.txt,
                      cursor: 'pointer', outline: 'none',
                    }}>
                    {opt.options.map(v => <option key={v} value={v}>{PrivacyLabel(v)}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
              <button onClick={() => setStep(1)} style={btnSecondary}>
                <ArrowLeft size={16} /> Back
              </button>
              <button onClick={() => setStep(3)}
                disabled={transferType === 'to_member' && !selectedUser}
                style={{ ...btnPrimary, opacity: (transferType === 'to_member' && !selectedUser) ? 0.4 : 1 }}>
                Review <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ====== STEP 3: Confirm ====== */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 600, margin: 0 }}>
              Confirm Transfer
            </h2>

            {/* Warning */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px',
              borderRadius: '12px', backgroundColor: '#92400E12', border: `1px solid ${T.borderAcc}`,
            }}>
              <AlertTriangle size={20} color={T.amber} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: T.txt, margin: '0 0 4px' }}>
                  Please review carefully
                </p>
                <p style={{ fontSize: '13px', color: T.txt2, lineHeight: 1.6, margin: 0 }}>
                  {transferType === 'to_member'
                    ? 'Once the recipient accepts, ownership will transfer permanently. Your content will be handled according to your privacy selections below.'
                    : 'The guitar will be marked as transferred. You have 24 hours to cancel. After that, ownership changes are permanent.'}
                </p>
              </div>
            </div>

            {/* Summary */}
            <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: T.bgCard, border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: T.txtM, fontSize: '13px' }}>Instrument</span>
                  <span style={{ color: T.txt, fontSize: '13px', fontWeight: 500 }}>{instrument.make} {instrument.model} ({instrument.year})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: T.txtM, fontSize: '13px' }}>Transfer Type</span>
                  <span style={{ color: T.txt, fontSize: '13px', fontWeight: 500 }}>
                    {transferType === 'to_member' ? 'To TWNG Member' : 'Outside TWNG'}
                  </span>
                </div>
                {selectedUser && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: T.txtM, fontSize: '13px' }}>Recipient</span>
                    <span style={{ color: T.txt, fontSize: '13px', fontWeight: 500 }}>@{selectedUser.username}</span>
                  </div>
                )}
                <div style={{ height: '1px', backgroundColor: T.border }} />
                <p style={{ fontSize: '13px', fontWeight: 600, color: T.txt, margin: 0 }}>Privacy Settings</p>
                {PRIVACY_OPTIONS.map(opt => (
                  <div key={opt.key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: T.txtM, fontSize: '12px' }}>{opt.label}</span>
                    <span style={{ color: T.txt, fontSize: '12px', fontWeight: 500 }}>
                      {PrivacyLabel(privacyOverrides[opt.key])}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <p style={{ color: '#EF4444', fontSize: '13px', margin: 0 }}>{error}</p>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <button onClick={() => setStep(2)} style={btnSecondary}>
                <ArrowLeft size={16} /> Back
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                style={{ ...btnPrimary, opacity: submitting ? 0.6 : 1 }}>
                {submitting ? (
                  <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</>
                ) : (
                  <><Send size={16} /> Confirm Transfer</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
