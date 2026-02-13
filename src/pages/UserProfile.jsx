import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Guitar,
  Heart,
  Users,
  Shield,
  MapPin,
  Settings,
  Calendar,
  MessageSquare,
  Star,
  Check,
  Loader,
  Clock,
  PlusCircle,
  MoreVertical,
  Ban,
  VolumeX,
} from "lucide-react";
import { T } from "../theme/tokens";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase/client";
import {
  isFollowing,
  toggleFollow,
  getFollowerCount,
  getFollowingCount,
} from "../lib/supabase/follows";
import { getUserFavorites, getFavoriteCount, isFavorited, addFavorite, removeFavorite } from "../lib/supabase/userFavorites";
import { blockUser, unblockUser, isUserBlocked } from "../lib/supabase/userBlocks";

// UTILITY: Format relative time
function formatTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Badge Component
function Badge({ children, variant = "default" }) {
  const badgeVariants = {
    default: { bg: T.bgCard, border: T.border, txt: T.txt2 },
    verified: { bg: "rgba(217, 119, 6, 0.1)", border: T.borderAcc, txt: T.warm },
  };
  const badgeStyle = badgeVariants[variant] || badgeVariants.default;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 12px",
        backgroundColor: badgeStyle.bg,
        border: `1px solid ${badgeStyle.border}`,
        borderRadius: "20px",
        fontSize: "13px",
        color: badgeStyle.txt,
        fontFamily: "DM Sans",
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  );
}

// GuitarCard Component
function GuitarCard({ guitar }) {
  const { user } = useAuth();
  const [loved, setLoved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (guitar?.id) {
      getFavoriteCount(guitar.id, "instrument").then(setLikeCount).catch(() => {});
    }
    if (user && guitar?.id) {
      isFavorited(user.id, guitar.id, "instrument").then(setLoved).catch(() => {});
    }
  }, [user, guitar?.id]);

  const handleLove = async (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!user) return;
    const wasLoved = loved;
    setLoved(!wasLoved);
    setLikeCount((c) => (wasLoved ? Math.max(0, c - 1) : c + 1));
    try {
      if (wasLoved) {
        await removeFavorite(user.id, guitar.id, "instrument");
      } else {
        await addFavorite(user.id, guitar.id, "instrument");
      }
    } catch (err) {
      setLoved(wasLoved);
      setLikeCount((c) => (wasLoved ? c + 1 : Math.max(0, c - 1)));
      console.error("Failed to toggle favorite:", err);
    }
  };

  const guitarImage =
    guitar.main_image_url ||
    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&h=300&fit=crop";
  const guitarName = `${guitar.year || ""} ${guitar.make || ""} ${guitar.model || ""}`.trim();

  return (
    <Link to={`/instrument/${guitar.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div
        style={{
          backgroundColor: T.bgCard,
          borderRadius: "12px",
          overflow: "hidden",
          border: `1px solid ${T.border}`,
          transition: "all 0.3s ease",
          cursor: "pointer",
          transform: isHovering ? "translateY(-4px)" : "translateY(0)",
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            paddingBottom: "100%",
            overflow: "hidden",
            backgroundColor: T.bgElev,
          }}
        >
          <img
            src={guitarImage}
            alt={guitarName}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: isHovering ? 0.8 : 1,
              transition: "opacity 0.3s ease",
            }}
          />
          {isHovering && (
            <div
              style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: "rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "flex-end",
                padding: "12px",
              }}
            >
              <button
                onClick={handleLove}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Heart size={20} color={loved ? T.warm : T.txt} fill={loved ? T.warm : "none"} />
              </button>
            </div>
          )}
        </div>
        <div style={{ padding: "12px" }}>
          <h4
            style={{
              color: T.txt,
              fontSize: "14px",
              fontFamily: "DM Sans",
              fontWeight: 600,
              margin: "0 0 4px 0",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {guitarName}
          </h4>
          <p style={{ color: T.txtM, fontSize: "12px", fontFamily: "DM Sans", margin: "0 0 8px 0" }}>
            {guitar.year} • {guitar.make}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: T.txt2, fontSize: "12px" }}>
            <Heart size={14} fill={likeCount > 0 ? T.warm : "none"} color={likeCount > 0 ? T.warm : T.txt2} />
            <span>{likeCount} {likeCount === 1 ? "like" : "likes"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// CollectionCard Component
function CollectionCard({ collection }) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      style={{
        backgroundColor: T.bgCard,
        borderRadius: "12px",
        overflow: "hidden",
        border: `1px solid ${T.border}`,
        cursor: "pointer",
        transition: "all 0.3s ease",
        transform: isHovering ? "translateY(-4px)" : "translateY(0)",
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: "66.67%",
          overflow: "hidden",
          backgroundColor: T.bgElev,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: T.txt2,
            fontSize: "12px",
          }}
        >
          No image
        </div>
      </div>
      <div style={{ padding: "12px" }}>
        <h4 style={{ color: T.txt, fontSize: "14px", fontFamily: "DM Sans", fontWeight: 600, margin: "0 0 4px 0" }}>
          {collection.name}
        </h4>
        <p style={{ color: T.txt2, fontSize: "12px", fontFamily: "DM Sans", margin: 0 }}>
          {collection.description || "No description"}
        </p>
      </div>
    </div>
  );
}

// ActivityItem Component
function ActivityItem({ activity }) {
  const iconProps = { size: 16, color: T.amber, style: { flexShrink: 0 } };

  const getIcon = () => {
    switch (activity.type) {
      case "instrument_added": return <Guitar {...iconProps} />;
      case "favorite": return <Heart {...iconProps} color="#EF4444" />;
      case "follow": return <Users {...iconProps} />;
      case "collection": return <Star {...iconProps} />;
      case "comment": return <MessageSquare {...iconProps} />;
      default: return <Star {...iconProps} />;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        paddingBottom: "12px",
        marginBottom: "12px",
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          backgroundColor: "rgba(217, 119, 6, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {getIcon()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: T.txt, fontSize: "14px", fontFamily: "DM Sans", margin: "0 0 4px 0" }}>
          {activity.description}
        </p>
        <p style={{ color: T.txtM, fontSize: "12px", fontFamily: "DM Sans", margin: 0 }}>
          {formatTime(new Date(activity.timestamp))}
        </p>
      </div>
    </div>
  );
}

// MAIN PROFILE COMPONENT
export default function TWNGProfile() {
  const { user } = useAuth();
  const { username } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("guitars");

  // Profile data state
  const [profileUser, setProfileUser] = useState(null);
  const [instruments, setInstruments] = useState([]);
  const [collections, setCollections] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userNotFound, setUserNotFound] = useState(false);

  // Activity feed state
  const [activities, setActivities] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Loved guitars state
  const [lovedGuitars, setLovedGuitars] = useState([]);
  const [loadingLoved, setLoadingLoved] = useState(false);

  // Follow state
  const [followState, setFollowState] = useState({
    isFollowing: false,
    followerCount: "—",
    followingCount: "—",
    loading: true,
    error: null,
    isAvailable: true,
  });

  // Block state
  const [blockState, setBlockState] = useState({
    isBlocked: false,
    blockType: null,
    loading: true,
  });
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const tabs = [
    { id: "guitars", label: "Guitars", count: instruments.length },
    { id: "collections", label: "Collections", count: collections.length },
    { id: "activity", label: "Activity", count: activities.length },
    { id: "loved", label: "Loved", count: lovedGuitars.length },
  ];

  // Load profile data
  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      setUserNotFound(false);

      try {
        let { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("username", username)
          .single();

        if ((profileError || !profileData) && user?.id) {
          const { data: ownData } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();
          if (ownData) {
            profileData = ownData;
            profileError = null;
          }
        }

        if (profileError || !profileData) {
          setUserNotFound(true);
          setLoading(false);
          return;
        }

        setProfileUser(profileData);
        const isOwn = user?.id === profileData.id;
        setIsOwnProfile(isOwn);

        const { data: instrumentsData } = await supabase
          .from("instruments")
          .select("*")
          .eq("current_owner_id", profileData.id)
          .order("created_at", { ascending: false });
        setInstruments(instrumentsData || []);

        const { data: collectionsData } = await supabase
          .from("collections")
          .select("*")
          .eq("user_id", profileData.id);
        setCollections(collectionsData || []);

        setLoading(false);
      } catch (err) {
        console.error("Error loading profile:", err);
        setLoading(false);
      }
    };

    if (username) loadProfileData();
  }, [username, user?.id]);

  // Load follow data (counts for any profile, follow state for other users)
  useEffect(() => {
    const loadFollowData = async () => {
      if (!profileUser?.id) {
        setFollowState((prev) => ({ ...prev, loading: false }));
        return;
      }
      try {
        const [followerCount, followingCount] = await Promise.all([
          getFollowerCount(profileUser.id),
          getFollowingCount(profileUser.id),
        ]);
        // Only check follow state when viewing someone else's profile
        let following = false;
        if (user?.id && !isOwnProfile) {
          following = await isFollowing(user.id, profileUser.id);
        }
        setFollowState({ isFollowing: following, followerCount, followingCount, loading: false, error: null, isAvailable: true });
      } catch (err) {
        console.warn("Follows feature not available:", err.message);
        setFollowState({ isFollowing: false, followerCount: 0, followingCount: 0, loading: false, error: err.message, isAvailable: false });
      }
    };
    if (profileUser?.id) loadFollowData();
  }, [user?.id, profileUser?.id, isOwnProfile]);

  // Load block status for other users' profiles
  useEffect(() => {
    const checkBlockStatus = async () => {
      if (!user?.id || !profileUser?.id || isOwnProfile) {
        setBlockState({ isBlocked: false, blockType: null, loading: false });
        return;
      }
      try {
        const result = await isUserBlocked(user.id, profileUser.id);
        setBlockState({ isBlocked: result.blocked, blockType: result.blockType, loading: false });
      } catch (err) {
        console.warn("Block check failed:", err.message);
        setBlockState({ isBlocked: false, blockType: null, loading: false });
      }
    };
    if (user?.id && profileUser?.id) checkBlockStatus();
  }, [user?.id, profileUser?.id, isOwnProfile]);

  // Close more menu on outside click
  useEffect(() => {
    if (!showMoreMenu) return;
    const handleClickOutside = () => setShowMoreMenu(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMoreMenu]);

  // Load activity feed when tab is selected
  useEffect(() => {
    if (activeTab !== "activity" || !profileUser?.id) return;

    const loadActivity = async () => {
      setLoadingActivity(true);
      try {
        const activityList = [];

        // 1. Instruments added
        instruments.forEach((inst) => {
          activityList.push({
            id: `inst-${inst.id}`,
            type: "instrument_added",
            description: `Added ${inst.year || ""} ${inst.make || ""} ${inst.model || ""}`.trim(),
            timestamp: inst.created_at,
          });
        });

        // 2. Collections created
        collections.forEach((col) => {
          activityList.push({
            id: `col-${col.id}`,
            type: "collection",
            description: `Created collection "${col.name}"`,
            timestamp: col.created_at,
          });
        });

        // 3. Favorites — fetch with instrument details
        try {
          const favs = await getUserFavorites(profileUser.id, "instrument", { limit: 30 });
          if (favs.length > 0) {
            const favIds = favs.map((f) => f.favorite_id);
            const { data: favInstruments } = await supabase
              .from("instruments")
              .select("id, make, model, year")
              .in("id", favIds);
            const instMap = {};
            (favInstruments || []).forEach((i) => { instMap[i.id] = i; });
            favs.forEach((fav) => {
              const inst = instMap[fav.favorite_id];
              const name = inst ? `${inst.year || ""} ${inst.make || ""} ${inst.model || ""}`.trim() : "a guitar";
              activityList.push({
                id: `fav-${fav.id}`,
                type: "favorite",
                description: `Loved ${name}`,
                timestamp: fav.created_at,
              });
            });
          }
        } catch {
          // Silently skip if favorites table has issues
        }

        // 4. Follows — who this user followed
        try {
          const { data: followData } = await supabase
            .from("user_follows")
            .select("id, following_id, created_at, user:following_id(username, display_name)")
            .eq("follower_id", profileUser.id)
            .order("created_at", { ascending: false })
            .limit(20);
          (followData || []).forEach((f) => {
            const name = f.user?.display_name || f.user?.username || "a user";
            activityList.push({
              id: `follow-${f.id}`,
              type: "follow",
              description: `Followed ${name}`,
              timestamp: f.created_at,
            });
          });
        } catch {
          // Silently skip if follows table has issues
        }

        // Sort by most recent first
        activityList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setActivities(activityList);
      } catch (err) {
        console.error("Error loading activity:", err);
      } finally {
        setLoadingActivity(false);
      }
    };

    loadActivity();
  }, [activeTab, profileUser?.id, instruments, collections]);

  // Load loved guitars when tab is selected
  useEffect(() => {
    if (activeTab !== "loved" || !profileUser?.id) return;

    const loadLoved = async () => {
      setLoadingLoved(true);
      try {
        const favs = await getUserFavorites(profileUser.id, "instrument", { limit: 50 });
        if (favs.length === 0) {
          setLovedGuitars([]);
          return;
        }

        const favIds = favs.map((f) => f.favorite_id);
        const { data: guitarData, error } = await supabase
          .from("instruments")
          .select("*")
          .in("id", favIds);

        if (error) throw error;
        setLovedGuitars(guitarData || []);
      } catch (err) {
        console.error("Error loading loved guitars:", err);
        setLovedGuitars([]);
      } finally {
        setLoadingLoved(false);
      }
    };

    loadLoved();
  }, [activeTab, profileUser?.id]);

  // Handle follow button
  const handleToggleFollow = async () => {
    if (!user?.id || !profileUser?.id || !followState.isAvailable) return;
    try {
      setFollowState((prev) => ({ ...prev, loading: true }));
      const newFollowState = await toggleFollow(user.id, profileUser.id);
      const newFollowerCount = newFollowState
        ? followState.followerCount + 1
        : followState.followerCount - 1;
      setFollowState((prev) => ({ ...prev, isFollowing: newFollowState, followerCount: newFollowerCount, loading: false }));
    } catch (err) {
      console.error("Failed to toggle follow:", err.message);
      setFollowState((prev) => ({ ...prev, loading: false, error: err.message }));
    }
  };

  const handleBlock = async (type = 'block') => {
    if (!user?.id || !profileUser?.id) return;
    try {
      await blockUser(user.id, profileUser.id, type);
      setBlockState({ isBlocked: true, blockType: type, loading: false });
      setShowMoreMenu(false);
      // If blocking (not muting), also unfollow
      if (type === 'block' && followState.isFollowing) {
        try {
          const { unfollowUser } = await import("../lib/supabase/follows");
          await unfollowUser(user.id, profileUser.id);
          setFollowState(prev => ({ ...prev, isFollowing: false, followerCount: Math.max(0, prev.followerCount - 1) }));
        } catch { /* ignore unfollow error */ }
      }
    } catch (err) {
      console.error("Failed to block user:", err);
    }
  };

  const handleUnblock = async () => {
    if (!user?.id || !profileUser?.id) return;
    try {
      await unblockUser(user.id, profileUser.id);
      setBlockState({ isBlocked: false, blockType: null, loading: false });
      setShowMoreMenu(false);
    } catch (err) {
      console.error("Failed to unblock user:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: T.bgDeep, color: T.txt, minHeight: "100vh", fontFamily: "DM Sans, sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader size={32} style={{ color: T.txtM }} className="animate-spin" />
      </div>
    );
  }

  if (userNotFound) {
    return (
      <div style={{ backgroundColor: T.bgDeep, color: T.txt, minHeight: "100vh", fontFamily: "DM Sans, sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "12px" }}>User Not Found</h1>
          <p style={{ fontSize: "14px", color: T.txtM, marginBottom: "20px" }}>The user "{username}" does not exist.</p>
          <Link to="/" style={{ color: T.amber, textDecoration: "none", fontWeight: 600 }}>Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: T.bgDeep, color: T.txt, minHeight: "100vh", fontFamily: "DM Sans, sans-serif" }}>
      {/* PROFILE HEADER */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px 30px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
          {/* Avatar */}
          <div style={{ width: "96px", height: "96px", borderRadius: "50%", overflow: "hidden", border: `2px solid ${T.borderAcc}`, flexShrink: 0, backgroundColor: T.bgCard }}>
            {profileUser?.avatar_url ? (
              <img src={profileUser.avatar_url} alt={profileUser.display_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: T.txtM }}>
                No avatar
              </div>
            )}
          </div>

          {/* Info Section */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <h1 style={{ color: T.txt, fontSize: "32px", fontFamily: "Playfair Display, serif", fontWeight: 700, margin: 0 }}>
                {profileUser?.display_name || profileUser?.username}
              </h1>
              {profileUser?.is_verified && <Shield size={24} color={T.amber} fill={T.amber} style={{ flexShrink: 0 }} />}
            </div>

            <p style={{ color: T.txtM, fontSize: "14px", fontFamily: "JetBrains Mono, monospace", margin: "0 0 16px 0" }}>
              @{profileUser?.username}
            </p>

            {profileUser?.bio && (
              <p style={{ color: T.txt2, fontSize: "14px", fontFamily: "DM Sans", margin: "0 0 16px 0", lineHeight: "1.5", maxWidth: "500px" }}>
                {profileUser.bio}
              </p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px", fontSize: "14px" }}>
              {profileUser?.location && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <MapPin size={16} color={T.txtM} />
                  <span style={{ color: T.txt2 }}>{profileUser.location}</span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "13px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: T.txtM }}>
                <Calendar size={14} />
                <span>
                  Member since{" "}
                  {new Date(profileUser?.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                </span>
              </div>
              {followState.isAvailable && !followState.loading && (
                <>
                  <span style={{ color: T.border }}>|</span>
                  <span style={{ color: T.txt2 }}>
                    <strong style={{ color: T.txt, fontWeight: 600 }}>{followState.followerCount}</strong> {followState.followerCount === 1 ? 'follower' : 'followers'}
                  </span>
                  <span style={{ color: T.txt2 }}>
                    <strong style={{ color: T.txt, fontWeight: 600 }}>{followState.followingCount}</strong> following
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            {isOwnProfile ? (
              <button
                onClick={() => navigate("/settings")}
                style={{
                  backgroundColor: T.amber,
                  color: T.bgDeep,
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontFamily: "DM Sans",
                  fontWeight: 600,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.target.style.opacity = "1")}
              >
                <Settings size={16} />
                Edit Profile
              </button>
            ) : (
              <>
                {/* Show Follow + Message when NOT hard-blocked */}
                {!(blockState.isBlocked && blockState.blockType === 'block') && (
                  <>
                    <button
                      onClick={handleToggleFollow}
                      disabled={!followState.isAvailable || followState.loading}
                      title={!followState.isAvailable ? "Follow feature coming soon" : undefined}
                      style={{
                        backgroundColor: followState.isFollowing ? T.bgCard : T.amber,
                        color: followState.isFollowing ? T.amber : T.bgDeep,
                        border: `1px solid ${followState.isFollowing ? T.borderAcc : "transparent"}`,
                        padding: "10px 20px",
                        borderRadius: "8px",
                        cursor: followState.isAvailable && !followState.loading ? "pointer" : "not-allowed",
                        fontFamily: "DM Sans",
                        fontWeight: 600,
                        fontSize: "14px",
                        transition: "all 0.2s",
                        opacity: followState.loading ? 0.7 : 1,
                      }}
                    >
                      {followState.loading ? "..." : followState.isFollowing ? "Following" : "Follow"}
                    </button>
                    {user && (
                      <button
                        onClick={() => navigate("/messages")}
                        style={{
                          backgroundColor: T.bgCard,
                          color: T.txt,
                          border: `1px solid ${T.border}`,
                          padding: "10px 20px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontFamily: "DM Sans",
                          fontWeight: 600,
                          fontSize: "14px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = T.bgElev;
                          e.currentTarget.style.borderColor = T.warm;
                          e.currentTarget.style.color = T.warm;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = T.bgCard;
                          e.currentTarget.style.borderColor = T.border;
                          e.currentTarget.style.color = T.txt;
                        }}
                      >
                        <MessageSquare size={16} />
                        Message
                      </button>
                    )}
                  </>
                )}
                {/* Blocked badge */}
                {blockState.isBlocked && blockState.blockType === 'block' && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(239, 68, 68, 0.08)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    color: "#EF4444",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}>
                    <Ban size={14} />
                    User Blocked
                  </div>
                )}
                {/* More menu (Block/Mute/Unblock) */}
                {user && (
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowMoreMenu(!showMoreMenu); }}
                      style={{
                        backgroundColor: T.bgCard,
                        color: T.txt2,
                        border: `1px solid ${T.border}`,
                        padding: "10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                      }}
                      aria-label="More options"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {showMoreMenu && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: "absolute",
                          top: "100%",
                          right: 0,
                          marginTop: "8px",
                          backgroundColor: T.bgCard,
                          border: `1px solid ${T.border}`,
                          borderRadius: "10px",
                          padding: "4px",
                          minWidth: "180px",
                          zIndex: 50,
                          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                        }}
                      >
                        {blockState.isBlocked ? (
                          <button
                            onClick={handleUnblock}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              padding: "10px 12px",
                              background: "none",
                              border: "none",
                              color: T.txt,
                              cursor: "pointer",
                              fontSize: "14px",
                              borderRadius: "6px",
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = T.bgElev}
                            onMouseLeave={e => e.currentTarget.style.background = "none"}
                          >
                            <Ban size={14} />
                            {blockState.blockType === 'mute' ? 'Unmute User' : 'Unblock User'}
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleBlock('block')}
                              style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "10px 12px",
                                background: "none",
                                border: "none",
                                color: "#EF4444",
                                cursor: "pointer",
                                fontSize: "14px",
                                borderRadius: "6px",
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
                              onMouseLeave={e => e.currentTarget.style.background = "none"}
                            >
                              <Ban size={14} />
                              Block User
                            </button>
                            <button
                              onClick={() => handleBlock('mute')}
                              style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "10px 12px",
                                background: "none",
                                border: "none",
                                color: T.txt2,
                                cursor: "pointer",
                                fontSize: "14px",
                                borderRadius: "6px",
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = T.bgElev}
                              onMouseLeave={e => e.currentTarget.style.background = "none"}
                            >
                              <VolumeX size={14} />
                              Mute User
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Badges */}
        {profileUser?.is_luthier && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Badge variant="verified">Luthier</Badge>
          </div>
        )}
      </div>

      {/* TABS */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <div style={{ display: "flex", gap: "32px", borderBottom: `1px solid ${T.border}`, marginBottom: "40px" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: activeTab === tab.id ? T.txt : T.txtM,
                cursor: "pointer",
                padding: "16px 0",
                fontSize: "14px",
                fontFamily: "DM Sans",
                fontWeight: 600,
                transition: "color 0.2s",
                position: "relative",
                paddingBottom: "14px",
              }}
              onMouseEnter={(e) => { if (activeTab !== tab.id) e.target.style.color = T.txt2; }}
              onMouseLeave={(e) => { if (activeTab !== tab.id) e.target.style.color = T.txtM; }}
            >
              {tab.label}{" "}
              <span style={{ fontSize: "12px", opacity: 0.7 }}>({tab.count})</span>
              {activeTab === tab.id && (
                <div style={{ position: "absolute", bottom: "-1px", left: 0, right: 0, height: "2px", backgroundColor: T.amber }} />
              )}
            </button>
          ))}
        </div>

        {/* GUITARS TAB */}
        {activeTab === "guitars" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px", marginBottom: "60px" }}>
            {instruments.length > 0 ? (
              instruments.map((guitar) => <GuitarCard key={guitar.id} guitar={guitar} />)
            ) : (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px" }}>
                <Guitar size={48} style={{ color: T.txtM, marginBottom: 12 }} />
                <p style={{ color: T.txtM, fontSize: "14px" }}>No guitars yet</p>
                {isOwnProfile && (
                  <button
                    onClick={() => navigate("/add-instrument")}
                    style={{
                      marginTop: 16,
                      backgroundColor: T.warm,
                      color: "#fff",
                      border: "none",
                      padding: "10px 24px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontFamily: "DM Sans",
                      fontWeight: 600,
                      fontSize: "14px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <PlusCircle size={16} />
                    Add Your First Guitar
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* COLLECTIONS TAB */}
        {activeTab === "collections" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px", marginBottom: "60px" }}>
            {collections.length > 0 ? (
              collections.map((collection) => <CollectionCard key={collection.id} collection={collection} />)
            ) : (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px" }}>
                <Guitar size={48} style={{ color: T.txtM, marginBottom: 12 }} />
                <p style={{ color: T.txtM, fontSize: "14px" }}>No collections yet</p>
              </div>
            )}
          </div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === "activity" && (
          <div style={{ maxWidth: "600px", marginBottom: "60px" }}>
            {loadingActivity ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
                <Loader size={24} style={{ color: T.txtM }} className="animate-spin" />
              </div>
            ) : activities.length > 0 ? (
              activities.map((activity) => <ActivityItem key={activity.id} activity={activity} />)
            ) : (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <Clock size={48} style={{ color: T.txtM, marginBottom: 12 }} />
                <p style={{ color: T.txtM, fontSize: "14px" }}>No activity yet</p>
              </div>
            )}
          </div>
        )}

        {/* LOVED TAB */}
        {activeTab === "loved" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px", marginBottom: "60px" }}>
            {loadingLoved ? (
              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center", padding: "40px" }}>
                <Loader size={24} style={{ color: T.txtM }} className="animate-spin" />
              </div>
            ) : lovedGuitars.length > 0 ? (
              lovedGuitars.map((guitar) => <GuitarCard key={guitar.id} guitar={guitar} />)
            ) : (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px" }}>
                <Heart size={48} style={{ color: T.txtM, marginBottom: 12 }} />
                <p style={{ color: T.txtM, fontSize: "14px" }}>No loved guitars yet</p>
                <p style={{ color: T.txtM, fontSize: "12px", marginTop: 8 }}>
                  Tap the heart on any guitar to add it here
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
