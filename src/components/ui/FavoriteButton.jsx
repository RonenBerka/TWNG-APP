import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { T } from '../../theme/tokens';
import { addFavorite, removeFavorite, isFavorited } from '../../lib/supabase/userFavorites';

/**
 * FavoriteButton — Toggle favorite status with heart icon and animation
 *
 * Props:
 *   - userId: Current user's ID
 *   - targetType: Type of target ('instrument', 'collection', 'article')
 *   - targetId: Target item's ID
 *   - initialFavorited: Optional initial state (boolean)
 */
export default function FavoriteButton({ userId, targetType, targetId, initialFavorited = false }) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Check initial favorite status if not provided
  useEffect(() => {
    if (initialFavorited !== null && initialFavorited !== undefined) return;

    const checkFavorited = async () => {
      try {
        const isFav = await isFavorited(userId, targetId, targetType);
        setFavorited(isFav);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavorited();
  }, [userId, targetId, targetType, initialFavorited]);

  const handleClick = async () => {
    setLoading(true);
    setAnimating(true);

    try {
      if (favorited) {
        // Remove from favorites
        await removeFavorite(userId, targetId, targetType);
        setFavorited(false);
      } else {
        // Add to favorites
        await addFavorite(userId, targetId, targetType);
        setFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // On error, revert optimistic update
      setFavorited(!favorited);
    } finally {
      setLoading(false);
      // Clear animation state after 400ms
      setTimeout(() => setAnimating(false), 400);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        padding: '0',
        borderRadius: '8px',
        fontSize: '14px',
        fontFamily: "'DM Sans', sans-serif",
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        border: `1px solid ${T.border}`,
        backgroundColor: favorited ? `${T.warm}20` : 'transparent',
        color: favorited ? T.warm : T.txt2,
        opacity: loading ? 0.6 : 1,
      }}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        size={18}
        strokeWidth={2}
        fill={favorited ? T.warm : 'none'}
        style={{
          transition: animating ? 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
          transform: animating ? 'scale(1.3)' : 'scale(1)',
        }}
      />
    </button>
  );
}

export { FavoriteButton };
