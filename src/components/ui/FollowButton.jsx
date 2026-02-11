import { useState, useEffect } from 'react';
import { Heart, UserPlus } from 'lucide-react';
import { T } from '../../theme/tokens';
import { isFollowing, toggleFollow } from '../../lib/supabase/follows';

/**
 * FollowButton — Toggle follow/unfollow relationship with another user
 *
 * Props:
 *   - userId: Current user's ID (the follower)
 *   - targetUserId: Target user's ID (the one to follow/unfollow)
 *   - initialFollowing: Optional initial state (boolean)
 */
export default function FollowButton({ userId, targetUserId, initialFollowing = false }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  // Check initial follow status if not provided
  useEffect(() => {
    if (initialFollowing !== null && initialFollowing !== undefined) return;

    const checkFollowing = async () => {
      try {
        const isFollowingUser = await isFollowing(userId, targetUserId);
        setFollowing(isFollowingUser);
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    checkFollowing();
  }, [userId, targetUserId, initialFollowing]);

  const handleClick = async () => {
    setLoading(true);
    try {
      const newState = await toggleFollow(userId, targetUserId);
      // Optimistic update — newState is the new following state
      setFollowing(newState);
    } catch (error) {
      console.error('Error toggling follow:', error);
      // On error, revert optimistic update
      setFollowing(!following);
    } finally {
      setLoading(false);
    }
  };

  const isFollowingUser = following;
  const Icon = isFollowingUser ? Heart : UserPlus;
  const label = isFollowingUser ? 'Following' : 'Follow';

  return (
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
        backgroundColor: isFollowingUser ? T.warm : 'transparent',
        color: isFollowingUser ? T.bgDeep : T.txt2,
        borderColor: isFollowingUser ? 'transparent' : T.border,
        borderWidth: isFollowingUser ? '0' : '1px',
        opacity: loading ? 0.6 : 1,
      }}
      title={isFollowingUser ? 'Unfollow user' : 'Follow user'}
    >
      <Icon size={16} strokeWidth={2} />
      {label}
    </button>
  );
}

export { FollowButton };
