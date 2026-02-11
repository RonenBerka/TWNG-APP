import { useState, useEffect } from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { T } from '../../theme/tokens';
import { blockUser, unblockUser, isUserBlocked } from '../../lib/supabase/userBlocks';

/**
 * BlockButton — Block/unblock a user with confirmation dialog
 *
 * Props:
 *   - userId: Current user's ID (the blocker)
 *   - targetUserId: Target user's ID (the one to block/unblock)
 */
export default function BlockButton({ userId, targetUserId }) {
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Check initial block status on mount
  useEffect(() => {
    const checkBlocked = async () => {
      try {
        const isBlocked = await isUserBlocked(userId, targetUserId);
        setBlocked(isBlocked);
      } catch (error) {
        console.error('Error checking block status:', error);
      }
    };

    checkBlocked();
  }, [userId, targetUserId]);

  const handleClick = () => {
    if (blocked) {
      // If already blocked, unblock directly
      handleUnblock();
    } else {
      // If not blocked, show confirmation first
      setShowConfirm(true);
    }
  };

  const handleConfirmBlock = async () => {
    setLoading(true);
    try {
      await blockUser(userId, targetUserId);
      setBlocked(true);
      setShowConfirm(false);
    } catch (error) {
      console.error('Error blocking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async () => {
    setLoading(true);
    try {
      await unblockUser(userId, targetUserId);
      setBlocked(false);
    } catch (error) {
      console.error('Error unblocking user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Confirm Dialog */}
      {showConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            style={{
              backgroundColor: T.bgCard,
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              border: `1px solid ${T.border}`,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={20} color={T.error} />
              <h3
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: '600',
                  color: T.txt,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Block User?
              </h3>
            </div>

            <p
              style={{
                margin: '0 0 20px 0',
                fontSize: '14px',
                color: T.txt2,
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: '1.5',
              }}
            >
              This user will not be able to see your content, follow you, or message you.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  fontFamily: "'DM Sans', sans-serif",
                  border: `1px solid ${T.border}`,
                  backgroundColor: 'transparent',
                  color: T.txt2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBlock}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  fontFamily: "'DM Sans', sans-serif",
                  border: 'none',
                  backgroundColor: T.error,
                  color: '#fff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.2s',
                }}
              >
                {loading ? 'Blocking...' : 'Block User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          fontFamily: "'DM Sans', sans-serif",
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          border: 'none',
          backgroundColor: blocked ? T.error : 'transparent',
          color: blocked ? '#fff' : T.txt2,
          borderColor: blocked ? 'transparent' : T.border,
          borderWidth: blocked ? '0' : '1px',
          opacity: loading ? 0.6 : 1,
        }}
        title={blocked ? 'Unblock user' : 'Block user'}
      >
        <Shield size={16} strokeWidth={2} />
        {blocked ? 'Blocked' : 'Block'}
      </button>
    </>
  );
}

export { BlockButton };
