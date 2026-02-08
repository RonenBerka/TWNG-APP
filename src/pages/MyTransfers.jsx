import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, X, Clock, AlertTriangle, Guitar,
  Loader2, Inbox, Send as SendIcon, User, ChevronDown
} from 'lucide-react';
import { T } from '../theme/tokens';
import { useAuth } from '../context/AuthContext';
import {
  getMyTransfers, acceptTransfer, declineTransfer,
  cancelTransfer, completeTransfer, expireOverdueTransfers
} from '../lib/supabase/transfers';

const STATUS_STYLES = {
  pending:   { bg: '#F59E0B15', color: '#F59E0B', border: '#F59E0B30', label: 'Pending' },
  accepted:  { bg: '#3B82F615', color: '#3B82F6', border: '#3B82F630', label: 'Accepted' },
  completed: { bg: '#34D39915', color: '#34D399', border: '#34D39930', label: 'Completed' },
  declined:  { bg: '#EF444415', color: '#EF4444', border: '#EF444430', label: 'Declined' },
  cancelled: { bg: '#6B728015', color: '#6B7280', border: '#6B728030', label: 'Cancelled' },
  expired:   { bg: '#6B728015', color: '#6B7280', border: '#6B728030', label: 'Expired' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span style={{
      padding: '4px 10px', borderRadius: '6px', fontSize: '11px',
      fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
      backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {s.label}
    </span>
  );
}

function TransferCard({ transfer, direction, onAction }) {
  const [declining, setDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [acting, setActing] = useState(false);

  const guitar = transfer.guitar;
  const otherUser = direction === 'incoming' ? transfer.from_user : transfer.to_user;
  const deadline = transfer.accept_deadline ? new Date(transfer.accept_deadline) : null;
  const daysLeft = deadline ? Math.max(0, Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24))) : null;

  // Client-side expiry check: if pending but past deadline, treat as expired
  const isExpired = transfer.status === 'pending' && deadline && deadline < new Date();
  const displayStatus = isExpired ? 'expired' : transfer.status;
  const isPending = transfer.status === 'pending' && !isExpired;
  const isAccepted = transfer.status === 'accepted';

  const handleAction = async (action) => {
    setActing(true);
    try {
      await onAction(transfer.id, action, declineReason || null);
      setDeclining(false);
    } catch (err) {
      alert('Action failed: ' + err.message);
    } finally {
      setActing(false);
    }
  };

  return (
    <div style={{
      padding: '20px', borderRadius: '12px', backgroundColor: T.bgCard,
      border: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: '14px',
    }}>
      {/* Header row — guitar info + status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flex: 1 }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '10px', backgroundColor: T.bgDeep,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Guitar size={24} color={T.txtM} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: T.txt2, fontFamily: "'JetBrains Mono', monospace", margin: '0 0 4px' }}>
              {guitar?.brand} · {guitar?.year}
            </p>
            <Link to={`/guitar/${guitar?.id}`} style={{
              fontSize: '15px', fontWeight: 600, color: T.txt, textDecoration: 'none',
            }}>
              {guitar?.model || 'Unknown Guitar'}
            </Link>
          </div>
        </div>
        <StatusBadge status={displayStatus} />
      </div>

      {/* Direction + other user */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
        borderRadius: '8px', backgroundColor: T.bgDeep,
      }}>
        {direction === 'incoming' ? (
          <>
            <Inbox size={14} color={T.txt2} />
            <span style={{ fontSize: '13px', color: T.txt2 }}>From</span>
          </>
        ) : (
          <>
            <SendIcon size={14} color={T.txt2} />
            <span style={{ fontSize: '13px', color: T.txt2 }}>To</span>
          </>
        )}
        <User size={14} color={T.warm} />
        <span style={{ fontSize: '13px', fontWeight: 500, color: T.txt }}>
          {otherUser?.display_name || otherUser?.username || (transfer.transfer_type === 'outside_twng' ? 'Outside TWNG' : 'Unknown')}
        </span>
        {otherUser?.username && (
          <span style={{ fontSize: '11px', color: T.txtM, fontFamily: "'JetBrains Mono', monospace" }}>
            @{otherUser.username}
          </span>
        )}
      </div>

      {/* Deadline warning */}
      {isPending && daysLeft !== null && direction === 'incoming' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
          borderRadius: '8px', backgroundColor: daysLeft <= 2 ? '#EF444410' : '#F59E0B10',
          border: `1px solid ${daysLeft <= 2 ? '#EF444425' : '#F59E0B25'}`,
        }}>
          <Clock size={14} color={daysLeft <= 2 ? '#EF4444' : '#F59E0B'} />
          <span style={{ fontSize: '12px', color: daysLeft <= 2 ? '#EF4444' : '#F59E0B', fontWeight: 500 }}>
            {daysLeft === 0 ? 'Expires today' : `${daysLeft} day${daysLeft > 1 ? 's' : ''} to respond`}
          </span>
        </div>
      )}

      {/* Transfer type + date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: T.txtM }}>
          {transfer.transfer_type === 'to_member' ? 'Member Transfer' : 'External Transfer'}
        </span>
        <span style={{ fontSize: '11px', color: T.txtM, fontFamily: "'JetBrains Mono', monospace" }}>
          {new Date(transfer.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Decline reason form */}
      {declining && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <textarea
            placeholder="Reason for declining (optional)..."
            value={declineReason}
            onChange={e => setDeclineReason(e.target.value)}
            style={{
              padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
              backgroundColor: T.bgDeep, border: `1px solid ${T.border}`, color: T.txt,
              outline: 'none', resize: 'vertical', minHeight: '60px',
            }}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button onClick={() => setDeclining(false)} style={{
              padding: '8px 16px', borderRadius: '8px', fontSize: '12px',
              background: 'transparent', border: `1px solid ${T.border}`, color: T.txt2, cursor: 'pointer',
            }}>Back</button>
            <button onClick={() => handleAction('decline')} disabled={acting} style={{
              padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
              background: '#EF4444', border: '1px solid #EF4444', color: '#fff', cursor: 'pointer',
              opacity: acting ? 0.6 : 1,
            }}>
              {acting ? 'Declining...' : 'Confirm Decline'}
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!declining && !isExpired && (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          {/* Incoming pending — Accept / Decline */}
          {direction === 'incoming' && isPending && (
            <>
              <button onClick={() => setDeclining(true)} style={{
                padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 500,
                background: 'transparent', border: `1px solid ${T.border}`, color: T.txt2,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <X size={14} /> Decline
              </button>
              <button onClick={() => handleAction('accept')} disabled={acting} style={{
                padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                background: T.warm, border: `1px solid ${T.warm}`, color: T.bgDeep,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                opacity: acting ? 0.6 : 1,
              }}>
                {acting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                Accept Transfer
              </button>
            </>
          )}

          {/* Incoming accepted — Complete (take ownership) */}
          {direction === 'incoming' && isAccepted && (
            <button onClick={() => handleAction('complete')} disabled={acting} style={{
              padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
              background: '#34D399', border: '1px solid #34D399', color: T.bgDeep,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              opacity: acting ? 0.6 : 1,
            }}>
              {acting ? 'Completing...' : 'Complete Transfer'}
            </button>
          )}

          {/* Outgoing pending — Cancel */}
          {direction === 'outgoing' && isPending && (
            <button onClick={() => handleAction('cancel')} disabled={acting} style={{
              padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 500,
              background: 'transparent', border: `1px solid #EF444440`, color: '#EF4444',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              opacity: acting ? 0.6 : 1,
            }}>
              <X size={14} /> Cancel Transfer
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyTransfers() {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('incoming');
  const [error, setError] = useState(null);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      // Check-on-read: expire any overdue transfers before fetching
      try {
        await expireOverdueTransfers();
      } catch (err) {
        console.warn('[Transfers] Expiry check failed (continuing anyway):', err.message);
      }
      const data = await getMyTransfers();
      setTransfers(data);
    } catch (err) {
      console.error('[Transfers] Fetch failed:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransfers(); }, []);

  const handleAction = async (transferId, action, reason) => {
    if (action === 'accept') await acceptTransfer(transferId);
    else if (action === 'decline') await declineTransfer(transferId, reason);
    else if (action === 'cancel') await cancelTransfer(transferId, reason);
    else if (action === 'complete') await completeTransfer(transferId);
    await fetchTransfers();
  };

  const activeList = tab === 'incoming' ? transfers.incoming : transfers.outgoing;
  const pendingIncoming = transfers.incoming.filter(t => t.status === 'pending').length;

  return (
    <div style={{ backgroundColor: T.bgDeep, color: T.txt, minHeight: '100vh' }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Back link */}
        <Link to="/settings" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', color: T.txt2,
          textDecoration: 'none', fontSize: '14px', fontWeight: 500, marginBottom: '32px',
        }}>
          <ArrowLeft size={18} /> Back to settings
        </Link>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: '32px',
          fontWeight: 700, color: T.txt, margin: '0 0 8px',
        }}>
          Transfers
        </h1>
        <p style={{ color: T.txt2, fontSize: '14px', lineHeight: 1.5, margin: '0 0 32px' }}>
          Manage incoming and outgoing guitar ownership transfers.
        </p>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '4px', padding: '4px', borderRadius: '10px',
          backgroundColor: T.bgCard, border: `1px solid ${T.border}`, marginBottom: '24px',
        }}>
          {['incoming', 'outgoing'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px',
              fontWeight: 600, border: 'none', cursor: 'pointer',
              backgroundColor: tab === t ? T.warm : 'transparent',
              color: tab === t ? T.bgDeep : T.txt2,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 150ms',
            }}>
              {t === 'incoming' ? <Inbox size={15} /> : <SendIcon size={15} />}
              {t === 'incoming' ? 'Incoming' : 'Outgoing'}
              {t === 'incoming' && pendingIncoming > 0 && (
                <span style={{
                  minWidth: '18px', height: '18px', borderRadius: '9px', fontSize: '10px',
                  fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: tab === t ? T.bgDeep : T.warm,
                  color: tab === t ? T.warm : T.bgDeep,
                }}>
                  {pendingIncoming}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
            <Loader2 size={28} color={T.warm} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{
            padding: '16px', borderRadius: '12px', backgroundColor: '#EF444410',
            border: '1px solid #EF444425', display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <AlertTriangle size={18} color="#EF4444" />
            <span style={{ fontSize: '13px', color: '#EF4444' }}>{error}</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && activeList.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
            padding: '64px 24px', textAlign: 'center',
          }}>
            {tab === 'incoming' ? <Inbox size={40} color={T.txtM} /> : <SendIcon size={40} color={T.txtM} />}
            <p style={{ fontSize: '16px', fontWeight: 600, color: T.txt, margin: 0 }}>
              No {tab} transfers
            </p>
            <p style={{ fontSize: '13px', color: T.txtM, margin: 0 }}>
              {tab === 'incoming'
                ? "When someone transfers a guitar to you, it'll appear here."
                : "Transfers you initiate will appear here."}
            </p>
          </div>
        )}

        {/* Transfer list */}
        {!loading && !error && activeList.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeList.map(t => (
              <TransferCard
                key={t.id}
                transfer={t}
                direction={tab}
                onAction={handleAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
