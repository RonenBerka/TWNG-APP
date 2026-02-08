import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import {
  isFollowing,
  toggleFollow,
  getFollowerCount,
  getFollowingCount,
} from "../lib/supabase/follows";

// MOCK USER DATA
const mockUser = {
  id: "usr_001",
  displayName: "Michael Torres",
  username: "vintage_mike",
  avatar:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop",
  bio: "Guitar collector, luthier, and TWNG pioneer. Vintage acoustics are my passion. Est. 2024",
  location: "Nashville, TN",
  website: "https://vintageguitars.com",
  memberSince: new Date("2024-01-15"),
  guitarCount: 12,
  followers: 847,
  following: 234,
  badges: ["Pioneer", "Founding Member"],
  isVerified: true,
};

const mockGuitars = [
  {
    id: "g1",
    name: "1952 Gibson Les Paul",
    year: 1952,
    brand: "Gibson",
    model: "Les Paul",
    image:
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&h=300&fit=crop",
    likes: 243,
    loved: false,
  },
  {
    id: "g2",
    name: "1965 Fender Stratocaster",
    year: 1965,
    brand: "Fender",
    model: "Stratocaster",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    likes: 189,
    loved: false,
  },
  {
    id: "g3",
    name: "1973 Martin D-35",
    year: 1973,
    brand: "Martin",
    model: "D-35",
    image:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
    likes: 156,
    loved: true,
  },
  {
    id: "g4",
    name: "1960 Epiphone Texan",
    year: 1960,
    brand: "Epiphone",
    model: "Texan",
    image:
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&h=300&fit=crop",
    likes: 124,
    loved: false,
  },
  {
    id: "g5",
    name: "1978 Yamaha LL2",
    year: 1978,
    brand: "Yamaha",
    model: "LL2",
    image:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
    likes: 98,
    loved: false,
  },
  {
    id: "g6",
    name: "1954 Gretsch 6120",
    year: 1954,
    brand: "Gretsch",
    model: "6120",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    likes: 167,
    loved: true,
  },
  {
    id: "g7",
    name: "1969 Guild F-512",
    year: 1969,
    brand: "Guild",
    model: "F-512",
    image:
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&h=300&fit=crop",
    likes: 142,
    loved: false,
  },
  {
    id: "g8",
    name: "1982 Ibanez Artist",
    year: 1982,
    brand: "Ibanez",
    model: "Artist",
    image:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
    likes: 87,
    loved: false,
  },
];

const mockCollections = [
  {
    id: "c1",
    name: "Vintage Gibsons",
    description: "Classic Gibson guitars from the golden era",
    guitarCount: 5,
    coverImage: mockGuitars[0].image,
  },
  {
    id: "c2",
    name: "Daily Players",
    description: "Guitars I actually play and enjoy",
    guitarCount: 3,
    coverImage: mockGuitars[2].image,
  },
];

const mockActivity = [
  {
    id: "a1",
    type: "added_guitar",
    description: "Added 1952 Gibson Les Paul to collection",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    icon: "guitar",
  },
  {
    id: "a2",
    type: "commented",
    description: "Commented on vintage stratocasters",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    icon: "comment",
  },
  {
    id: "a3",
    type: "loved",
    description: "Loved 1973 Martin D-35",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    icon: "heart",
  },
  {
    id: "a4",
    type: "followed",
    description: "Started following guitar_collector",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    icon: "users",
  },
  {
    id: "a5",
    type: "added_guitar",
    description: "Added 1965 Fender Stratocaster",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    icon: "guitar",
  },
  {
    id: "a6",
    type: "loved",
    description: "Loved 1954 Gretsch 6120",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    icon: "heart",
  },
];

const mockLovedGuitars = mockGuitars.filter((g) => g.loved);

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
  const [loved, setLoved] = useState(guitar.loved);
  const [isHovering, setIsHovering] = useState(false);

  const handleLove = () => {
    setLoved(!loved);
    if (onLove) onLove(guitar.id, !loved);
  };

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
          src={guitar.image}
          alt={guitar.name}
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
          {guitar.name}
        </h4>
        <p
          style={{
            color: T.txtM,
            fontSize: "12px",
            fontFamily: "DM Sans",
            margin: "0 0 8px 0",
          }}
        >
          {guitar.year} • {guitar.brand}
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
          <span>{guitar.likes} likes</span>
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
        <img
          src={collection.coverImage}
          alt={collection.name}
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
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))",
          }}
        />
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
          {collection.guitarCount} guitar{collection.guitarCount !== 1 ? "s" : ""}
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
  const [activeTab, setActiveTab] = useState("guitars");
  const [isOwnProfile] = useState(true);
  const [following, setFollowing] = useState(false);
  const [lovedGuitarIds, setLovedGuitarIds] = useState(
    new Set(mockLovedGuitars.map((g) => g.id))
  );

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
      count: mockUser.guitarCount,
    },
    {
      id: "collections",
      label: "Collections",
      count: mockCollections.length,
    },
    {
      id: "activity",
      label: "Activity",
      count: mockActivity.length,
    },
    {
      id: "loved",
      label: "Loved",
      count: lovedGuitarIds.size,
    },
  ];

  // Load follow data on mount and when user changes
  useEffect(() => {
    const loadFollowData = async () => {
      if (!user?.id || isOwnProfile) {
        setFollowState((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        // Load follow status and counts
        const [following, followerCount, followingCount] = await Promise.all([
          isFollowing(user.id, mockUser.id),
          getFollowerCount(mockUser.id),
          getFollowingCount(mockUser.id),
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
        // Graceful fallback — follows table doesn't exist yet
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

    loadFollowData();
  }, [user?.id, isOwnProfile]);

  // Handle follow button click
  const handleToggleFollow = async () => {
    if (!user?.id || !followState.isAvailable) return;

    try {
      setFollowState((prev) => ({ ...prev, loading: true }));
      const newFollowState = await toggleFollow(user.id, mockUser.id);

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

      setFollowing(newFollowState);
    } catch (err) {
      console.error("Failed to toggle follow:", err.message);
      setFollowState((prev) => ({
        ...prev,
        loading: false,
        error: err.message,
      }));
    }
  };

  const handleLoveGuitar = (guitarId, isLoved) => {
    const newLoved = new Set(lovedGuitarIds);
    if (isLoved) {
      newLoved.add(guitarId);
    } else {
      newLoved.delete(guitarId);
    }
    setLovedGuitarIds(newLoved);
  };

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
            }}
          >
            <img
              src={mockUser.avatar}
              alt={mockUser.displayName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
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
                {mockUser.displayName}
              </h1>
              {mockUser.isVerified && (
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
              @{mockUser.username}
            </p>

            {/* Bio */}
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
              {mockUser.bio}
            </p>

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
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={16} color={T.txtM} />
                <span style={{ color: T.txt2 }}>{mockUser.location}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Link2 size={16} color={T.txtM} />
                <a
                  href={mockUser.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: T.amber,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  vintageguitars.com
                  <ExternalLink size={12} />
                </a>
              </div>
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
                {mockUser.memberSince.toLocaleDateString("en-US", {
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
              {mockUser.guitarCount}
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
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {mockUser.badges.map((badge) => (
            <Badge key={badge} variant="default">
              {badge}
            </Badge>
          ))}
        </div>
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
            {mockGuitars.map((guitar) => (
              <GuitarCard
                key={guitar.id}
                guitar={{
                  ...guitar,
                  loved: lovedGuitarIds.has(guitar.id),
                }}
                onLove={handleLoveGuitar}
              />
            ))}
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
            {mockCollections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
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
            {mockActivity.map((item) => (
              <ActivityItem key={item.id} activity={item} />
            ))}
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
            {mockGuitars
              .filter((g) => lovedGuitarIds.has(g.id))
              .map((guitar) => (
                <GuitarCard
                  key={guitar.id}
                  guitar={{
                    ...guitar,
                    loved: true,
                  }}
                  onLove={handleLoveGuitar}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
