import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Guitar,
  Heart,
  Users,
  Shield,
  MapPin,
  Link2,
  Share2,
  Settings,
  ExternalLink,
  Calendar,
  MessageSquare,
  Star,
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
  const variants = {
    default: {
      bg: T.bgCard,
      border: T.border,
      txt: T.txt2,
    },
    verified: {
      bg: "rgba(217, 119, 6, 0.1)",
      border: T.borderAcc,
      txt: T.warm,
    },
  };

  const v = variants[variant] || variants.default;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 12px",
        backgroundColor: v.bg,
        border: `1px solid ${v.border}`,
        borderRadius: "20px",
        fontSize: "13px",
        color: v.txt,
        fontFamily: "DM Sans",
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  );
}

// GuitarCard Component
function GuitarCard({ guitar, onLove }) {
  const [loved, setLoved] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleLove = () => {
    setLoved(!loved);
    if (onLove) onLove(guitar.id, !loved);
  };

  const guitarImage = guitar.main_image_url ||
    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&h=300&fit=crop";
  const guitarName = `${guitar.year} ${guitar.make} ${guitar.model}`.trim();

  return (
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
      {/* Image Container */}
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
        {/* Overlay */}
        {isHovering && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
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
              <Heart
                size={20}
                color={loved ? T.warm : T.txt}
                fill={loved ? T.warm : "none"}
              />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
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
        <p
          style={{
            color: T.txtM,
            fontSize: "12px",
            fontFamily: "DM Sans",
            margin: "0 0 8px 0",
          }}
        >
          {guitar.year} • {guitar.make}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            color: T.txt2,
            fontSize: "12px",
          }}
        >
          <Heart size={14} />
          <span>0 likes</span>
        </div>
      </div>
    </div>
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
      {/* Cover Image */}
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
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))",
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

      {/* Content */}
      <div style={{ padding: "12px" }}>
        <h4
          style={{
            color: T.txt,
            fontSize: "14px",
            fontFamily: "DM Sans",
            fontWeight: 600,
            margin: "0 0 4px 0",
          }}
        >
          {collection.name}
        </h4>
        <p
          style={{
            color: T.txt2,
            fontSize: "12px",
            fontFamily: "DM Sans",
            margin: 0,
          }}
        >
          {collection.description || "No description"}
        </p>
      </div>
    </div>
  );
}

// ActivityItem Component
function ActivityItem({ activity }) {
  const getActivityIcon = () => {
    const iconProps = {
      size: 16,
      color: T.amber,
      style: { flexShrink: 0 },
    };
    switch (activity.icon) {
      case "guitar":
        return <Guitar {...iconProps} />;
      case "heart":
        return <Heart {...iconProps} />;
      case "comment":
        return <MessageSquare {...iconProps} />;
      case "users":
        return <Users {...iconProps} />;
      default:
        return <Star {...iconProps} />;
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
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          backgroundColor: T.bgCard,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {getActivityIcon()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            color: T.txt,
            fontSize: "14px",
            fontFamily: "DM Sans",
            margin: "0 0 4px 0",
          }}
        >
          {activity.description}
        </p>
        <p
          style={{
            color: T.txtM,
            fontSize: "12px",
            fontFamily: "DM Sans",
            margin: 0,
          }}
        >
          {formatTime(activity.timestamp)}
        </p>
      </div>
    </div>
  );
}

// MAIN PROFILE COMPONENT
export default function TWNGProfile() {
  const { user } = useAuth();
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState("guitars");

  // Profile data state
  const [profileUser, setProfileUser] = useState(null);
  const [instruments, setInstruments] = useState([]);
  const [collections, setCollections] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userNotFound, setUserNotFound] = useState(false);

  // Follow/count state with graceful fallbacks
  const [followState, setFollowState] = useState({
    isFollowing: false,
    followerCount: "—",
    followingCount: "—",
    loading: true,
    error: null,
    isAvailable: true,
  });

  const tabs = [
    {
      id: "guitars",
      label: "Guitars",
      count: instruments.length,
    },
    {
      id: "collections",
      label: "Collections",
      count: collections.length,
    },
    {
      id: "activity",
      label: "Activity",
      count: 0,
    },
    {
      id: "loved",
      label: "Loved",
      count: 0,
    },
  ];

  // Load profile data on mount and when username changes
  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      setUserNotFound(false);

      try {
        // Fetch user profile by username
        let { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("username", username)
          .single();

        // If still not found, check if this is the current user's own profile
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

        // Determine if this is the user's own profile
        const isOwn = user?.id === profileData.id;
        setIsOwnProfile(isOwn);

        // Fetch user's instruments
        const { data: instrumentsData } = await supabase
          .from("instruments")
          .select("*")
          .eq("current_owner_id", profileData.id)
          .order("created_at", { ascending: false });

        setInstruments(instrumentsData || []);

        // Fetch user's collections
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

    if (username) {
      loadProfileData();
    }
  }, [username, user?.id]);

  // Load follow data on mount and when profileUser changes
  useEffect(() => {
    const loadFollowData = async () => {
      if (!user?.id || !profileUser?.id || isOwnProfile) {
        setFollowState((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        // Load follow status and counts
        const [following, followerCount, followingCount] = await Promise.all([
          isFollowing(user.id, profileUser.id),
          getFollowerCount(profileUser.id),
          getFollowingCount(profileUser.id),
        ]);

        setFollowState({
          isFollowing: following,
          followerCount,
          followingCount,
          loading: false,
          error: null,
          isAvailable: true,
        });
      } catch (err) {
        console.warn("Follows feature not available:", err.message);
        setFollowState({
          isFollowing: false,
          followerCount: "—",
          followingCount: "—",
          loading: false,
          error: err.message,
          isAvailable: false,
        });
      }
    };

    if (profileUser?.id && user?.id) {
      loadFollowData();
    }
  }, [user?.id, profileUser?.id, isOwnProfile]);

  // Handle follow button click
  const handleToggleFollow = async () => {
    if (!user?.id || !profileUser?.id || !followState.isAvailable) return;

    try {
      setFollowState((prev) => ({ ...prev, loading: true }));
      const newFollowState = await toggleFollow(user.id, profileUser.id);

      // Update local state and counts
      const newFollowerCount = newFollowState
        ? followState.followerCount + 1
        : followState.followerCount - 1;

      setFollowState((prev) => ({
        ...prev,
        isFollowing: newFollowState,
        followerCount: newFollowerCount,
        loading: false,
      }));
    } catch (err) {
      console.error("Failed to toggle follow:", err.message);
      setFollowState((prev) => ({
        ...prev,
        loading: false,
        error: err.message,
      }));
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div
        style={{
          backgroundColor: T.bgDeep,
          color: T.txt,
          minHeight: "100vh",
          fontFamily: "DM Sans, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ fontSize: "16px", color: T.txtM }}>Loading profile...</p>
      </div>
    );
  }

  // Show user not found
  if (userNotFound) {
    return (
      <div
        style={{
          backgroundColor: T.bgDeep,
          color: T.txt,
          minHeight: "100vh",
          fontFamily: "DM Sans, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "12px" }}>
            User Not Found
          </h1>
          <p style={{ fontSize: "14px", color: T.txtM, marginBottom: "20px" }}>
            The user "{username}" does not exist.
          </p>
          <Link
            to="/"
            style={{
              color: T.amber,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: T.bgDeep,
        color: T.txt,
        minHeight: "100vh",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      {/* PROFILE HEADER */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 20px 30px",
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        {/* Avatar + Name Section */}
        <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
          {/* Avatar */}
          <div
            style={{
              width: "96px",
              height: "96px",
              borderRadius: "50%",
              overflow: "hidden",
              border: `2px solid ${T.borderAcc}`,
              flexShrink: 0,
              backgroundColor: T.bgCard,
            }}
          >
            {profileUser?.avatar_url ? (
              <img
                src={profileUser.avatar_url}
                alt={profileUser.display_name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: T.txtM,
                }}
              >
                No avatar
              </div>
            )}
          </div>

          {/* Info Section */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              <h1
                style={{
                  color: T.txt,
                  fontSize: "32px",
                  fontFamily: "Playfair Display, serif",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                {profileUser?.display_name || profileUser?.username}
              </h1>
              {profileUser?.is_verified && (
                <Shield
                  size={24}
                  color={T.amber}
                  fill={T.amber}
                  style={{ flexShrink: 0 }}
                />
              )}
            </div>

            {/* Username */}
            <p
              style={{
                color: T.txtM,
                fontSize: "14px",
                fontFamily: "JetBrains Mono, monospace",
                margin: "0 0 16px 0",
              }}
            >
              @{profileUser?.username}
            </p>

            {/* Bio */}
            {profileUser?.bio && (
              <p
                style={{
                  color: T.txt2,
                  fontSize: "14px",
                  fontFamily: "DM Sans",
                  margin: "0 0 16px 0",
                  lineHeight: "1.5",
                  maxWidth: "500px",
                }}
              >
                {profileUser.bio}
              </p>
            )}

            {/* Location & Website */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginBottom: "16px",
                fontSize: "14px",
              }}
            >
              {profileUser?.location && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <MapPin size={16} color={T.txtM} />
                  <span style={{ color: T.txt2 }}>{profileUser.location}</span>
                </div>
              )}
            </div>

            {/* Member Since */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: T.txtM,
                fontSize: "13px",
              }}
            >
              <Calendar size={14} />
              <span>
                Member since{" "}
                {new Date(profileUser?.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            {isOwnProfile ? (
              <button
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
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.target.style.opacity = "1")}
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleToggleFollow}
                disabled={!followState.isAvailable || followState.loading}
                title={
                  !followState.isAvailable
                    ? "Follow feature coming soon"
                    : undefined
                }
                style={{
                  backgroundColor:
                    followState.isFollowing ? T.bgCard : T.amber,
                  color: followState.isFollowing ? T.amber : T.bgDeep,
                  border: `1px solid ${
                    followState.isFollowing ? T.borderAcc : "transparent"
                  }`,
                  padding: "10px 20px",
                  borderRadius: "8px",
                  cursor:
                    followState.isAvailable && !followState.loading
                      ? "pointer"
                      : "not-allowed",
                  fontFamily: "DM Sans",
                  fontWeight: 600,
                  fontSize: "14px",
                  transition: "all 0.2s",
                  opacity: followState.loading ? 0.7 : 1,
                }}
              >
                {followState.loading
                  ? "..."
                  : followState.isFollowing
                    ? "Following"
                    : "Follow"}
              </button>
            )}
            <button
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
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = T.bgCard;
              }}
            >
              <Share2 size={16} />
              Share
            </button>
            <button
              style={{
                backgroundColor: T.bgCard,
                color: T.txt,
                border: `1px solid ${T.border}`,
                padding: "10px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = T.bgElev;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = T.bgCard;
              }}
            >
              <Settings size={18} color={T.txt} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "flex", gap: "32px", marginBottom: "24px" }}>
          <div>
            <p
              style={{
                color: T.txt,
                fontSize: "20px",
                fontFamily: "DM Sans",
                fontWeight: 700,
                margin: 0,
              }}
            >
              {instruments.length}
            </p>
            <p
              style={{
                color: T.txtM,
                fontSize: "12px",
                fontFamily: "DM Sans",
                margin: 0,
              }}
            >
              Guitars
            </p>
          </div>
          <div>
            <p
              style={{
                color: T.txt,
                fontSize: "20px",
                fontFamily: "DM Sans",
                fontWeight: 700,
                margin: 0,
              }}
            >
              {typeof followState.followerCount === "number"
                ? followState.followerCount.toLocaleString()
                : followState.followerCount}
            </p>
            <p
              style={{
                color: T.txtM,
                fontSize: "12px",
                fontFamily: "DM Sans",
                margin: 0,
              }}
            >
              Followers
            </p>
          </div>
          <div>
            <p
              style={{
                color: T.txt,
                fontSize: "20px",
                fontFamily: "DM Sans",
                fontWeight: 700,
                margin: 0,
              }}
            >
              {typeof followState.followingCount === "number"
                ? followState.followingCount.toLocaleString()
                : followState.followingCount}
            </p>
            <p
              style={{
                color: T.txtM,
                fontSize: "12px",
                fontFamily: "DM Sans",
                margin: 0,
              }}
            >
              Following
            </p>
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
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "32px",
            borderBottom: `1px solid ${T.border}`,
            marginBottom: "40px",
            marginTop: "0",
          }}
        >
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
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.color = T.txt2;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.color = T.txtM;
                }
              }}
            >
              {tab.label}{" "}
              <span style={{ fontSize: "12px", opacity: 0.7 }}>
                ({tab.count})
              </span>
              {activeTab === tab.id && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "-1px",
                    left: 0,
                    right: 0,
                    height: "2px",
                    backgroundColor: T.amber,
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* GUITARS TAB */}
        {activeTab === "guitars" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "20px",
              marginBottom: "60px",
            }}
          >
            {instruments.length > 0 ? (
              instruments.map((guitar) => (
                <GuitarCard
                  key={guitar.id}
                  guitar={guitar}
                />
              ))
            ) : (
              <p style={{ color: T.txtM, fontSize: "14px" }}>
                No guitars yet
              </p>
            )}
          </div>
        )}

        {/* COLLECTIONS TAB */}
        {activeTab === "collections" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "20px",
              marginBottom: "60px",
            }}
          >
            {collections.length > 0 ? (
              collections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))
            ) : (
              <p style={{ color: T.txtM, fontSize: "14px" }}>
                No collections yet
              </p>
            )}
          </div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === "activity" && (
          <div
            style={{
              maxWidth: "600px",
              marginBottom: "60px",
            }}
          >
            <p style={{ color: T.txtM, fontSize: "14px" }}>
              Coming soon - activity feed is being developed
            </p>
          </div>
        )}

        {/* LOVED TAB */}
        {activeTab === "loved" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "20px",
              marginBottom: "60px",
            }}
          >
            <p style={{ color: T.txtM, fontSize: "14px" }}>
              Coming soon - loved guitars feature is being developed
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
