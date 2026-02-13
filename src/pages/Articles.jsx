import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Eye,
  MessageSquare,
  Clock,
  Search,
  ChevronRight,
  Heart,
  Share2,
  ArrowLeft,
  Quote,
  Tag,
  X,
} from "lucide-react";
import { T } from "../theme/tokens";
import { GUITAR_IMAGES, ARTIST_IMAGES, HERO_IMAGES } from "../utils/placeholders";

// ===== MOCK DATA =====
const articles = [
  {
    id: 1,
    title: "The Golden Age: Pre-War Martin Guitars",
    excerpt: "Exploring the craftsmanship and legacy of Martin guitars from the 1920s-1940s era.",
    category: "Deep Dive",
    image: "/images/guitars/shopping-1.webp",
    author: "James Mitchell",
    authorAvatar: "/images/artists/download-1.jpg",
    authorBio: "Guitar historian and collector with 25+ years of experience.",
    date: "2024-02-02",
    readTime: "8 min",
    views: 2341,
    likes: 456,
    featured: true,
    content: [
      {
        type: "p",
        text: "The 1920s through 1940s represents the golden age of American guitar manufacturing, and no name stands taller than C.F. Martin. During this period, Martin guitars weren't just instruments—they were works of art, crafted with wood selections and techniques that have become increasingly rare and sought-after by musicians and collectors alike.",
      },
      {
        type: "h2",
        text: "The Craftsmanship Revolution",
      },
      {
        type: "p",
        text: "What set pre-war Martin guitars apart was the company's unwavering commitment to quality over quantity. Each instrument was hand-selected from premium stocks of spruce, mahogany, and rosewood. The tonewood selection process was meticulous—craftsmen would tap each piece of wood to assess its acoustic properties before a single board was cut.",
      },
      {
        type: "blockquote",
        text: "A pre-war Martin doesn't just sound different; it sounds alive. The wood has aged to perfection, and the craftsmanship was uncompromising—every joint, every detail mattered.",
      },
      {
        type: "h2",
        text: "The OM and D-28 Legacy",
      },
      {
        type: "p",
        text: "Two models define the era: the OM (Orchestra Model) and the D-28 (Dreadnought). The OM, introduced in 1929, was the original flat-top concert guitar, favored by folksingers and bluegrass pioneers. Its shorter body and smaller scale revolutionized what a fingerpicking guitarist could accomplish.",
      },
      {
        type: "p",
        text: "The D-28, meanwhile, became the standard for anyone seeking maximum volume and projection. Depression-era musicians needed guitars that could be heard in dance halls and concert venues without amplification. The D-28 answered that call with authority.",
      },
      {
        type: "h2",
        text: "Why Pre-War Matters Today",
      },
      {
        type: "p",
        text: "Today, pre-war Martin guitars command significant prices, not merely due to rarity but because of an intangible quality—the resonance that develops over decades. Collectors and professional musicians report that these instruments have warmth and clarity that modern guitars rarely match. The combination of vintage tonewood and hand-crafted precision creates something that cannot be easily replicated.",
      },
      {
        type: "p",
        text: "For aspiring collectors, finding an authentic pre-war Martin requires knowledge, patience, and trusted sources. Authentication details include specific serial numbers, wood grain patterns, and historical documentation. Whether you're a player seeking a lifetime instrument or a collector preserving music history, the pre-war Martin represents an investment in artistry.",
      },
    ],
    tags: ["Martin", "Vintage", "Acoustic", "History", "Craftsmanship"],
    comments: [
      {
        author: "Sarah Chen",
        avatar: "/images/guitars/shopping-2.webp",
        text: "Great breakdown of the pre-war era. I have a 1937 D-28 that I inherited, and this article perfectly captures why it sounds so distinctive.",
        date: "2024-02-03",
      },
      {
        author: "Marcus Rodriguez",
        avatar: "/images/guitars/download.webp",
        text: "The part about tonewood selection is fascinating. Modern manufacturers could learn from the Martin approach to materials.",
        date: "2024-02-03",
      },
      {
        author: "Elena Wu",
        avatar: "/images/guitars/images-1.jpg",
        text: "Excellent article! Would love to see a follow-up on how to authenticate pre-war instruments.",
        date: "2024-02-04",
      },
    ],
    relatedIds: [2, 3, 4],
  },
  {
    id: 2,
    title: "Essential Guitar Setup Guide",
    excerpt: "Learn how to properly adjust your guitar for optimal playability and tone.",
    category: "Guide",
    image: "/images/guitars/nash-s57-1.jpg",
    author: "David Park",
    authorAvatar: "/images/lifestyle/Gemini_Generated_Image_i97zdai97zdai97z.png",
    authorBio: "Professional luthier with 15+ years of setup expertise.",
    date: "2024-02-01",
    readTime: "6 min",
    views: 1823,
    likes: 312,
    featured: false,
    tags: ["Setup", "Maintenance", "How-To"],
  },
  {
    id: 3,
    title: "Interview: Inside Fender's Custom Shop",
    excerpt: "Exclusive conversation with Master Builder John Page about the art of custom guitar building.",
    category: "Interview",
    image: "/images/guitars/shopping.webp",
    author: "Rebecca Stone",
    authorAvatar: "/images/artists/download-1.jpg",
    authorBio: "Senior music journalist covering the guitar industry.",
    date: "2024-01-28",
    readTime: "10 min",
    views: 3156,
    likes: 689,
    featured: false,
    tags: ["Interview", "Fender", "Custom Building"],
  },
  {
    id: 4,
    title: "Gibson vs. Fender: The Never-Ending Debate",
    excerpt: "A balanced look at two of the world's most iconic guitar brands and their distinct characteristics.",
    category: "Review",
    image: "/images/guitars/shopping-2.webp",
    author: "Tom Anderson",
    authorAvatar: "/images/lifestyle/Gemini_Generated_Image_i97zdai97zdai97z.png",
    authorBio: "Equipment reviewer with extensive hands-on experience.",
    date: "2024-01-25",
    readTime: "7 min",
    views: 4102,
    likes: 743,
    featured: false,
    tags: ["Gibson", "Fender", "Comparison"],
  },
  {
    id: 5,
    title: "Tube Amps vs. Solid State: A Deep Analysis",
    excerpt: "Understanding the tonal differences and practical considerations of each amplifier type.",
    category: "Deep Dive",
    image: "/images/guitars/download.webp",
    author: "Alex Hughes",
    authorAvatar: "/images/artists/download-1.jpg",
    authorBio: "Sound engineer and amp enthusiast.",
    date: "2024-01-22",
    readTime: "9 min",
    views: 2987,
    likes: 521,
    featured: false,
    tags: ["Amps", "Tube", "Solid State", "Sound"],
  },
  {
    id: 6,
    title: "New PRS SE Series: Budget-Friendly Quality",
    excerpt: "PRS brings affordable quality to the market with the new SE lineup. Here's what we found.",
    category: "News",
    image: "/images/guitars/images-1.jpg",
    author: "Nick Waters",
    authorAvatar: "/images/lifestyle/Gemini_Generated_Image_i97zdai97zdai97z.png",
    authorBio: "New product correspondent.",
    date: "2024-01-20",
    readTime: "5 min",
    views: 1645,
    likes: 289,
    featured: false,
    tags: ["PRS", "News", "New Gear"],
  },
  {
    id: 7,
    title: "Pedal Board Essentials for Beginners",
    excerpt: "Build the perfect pedal board without breaking the bank or overwhelming yourself.",
    category: "Guide",
    image: "/images/guitars/shopping-1.webp",
    author: "Chris Mitchell",
    authorAvatar: "/images/artists/download-1.jpg",
    authorBio: "Effects specialist and gear enthusiast.",
    date: "2024-01-18",
    readTime: "6 min",
    views: 1456,
    likes: 234,
    featured: false,
    tags: ["Effects", "Pedals", "Setup"],
  },
  {
    id: 8,
    title: "Chord Progressions That Changed Music",
    excerpt: "Discover the progressions behind iconic songs and how to use them in your own music.",
    category: "Deep Dive",
    image: "/images/guitars/nash-s57-1.jpg",
    author: "Lisa Chen",
    authorAvatar: "/images/lifestyle/Gemini_Generated_Image_i97zdai97zdai97z.png",
    authorBio: "Music theory teacher and composer.",
    date: "2024-01-15",
    readTime: "8 min",
    views: 3234,
    likes: 612,
    featured: false,
    tags: ["Music Theory", "Chords", "Composition"],
  },
  {
    id: 9,
    title: "The Rise of Affordable Asian Guitars",
    excerpt: "How brands from Asia are competing with Western manufacturers on quality and price.",
    category: "News",
    image: "/images/guitars/shopping.webp",
    author: "Kevin Park",
    authorAvatar: "/images/artists/download-1.jpg",
    authorBio: "Market analyst covering guitar industry trends.",
    date: "2024-01-12",
    readTime: "7 min",
    views: 2156,
    likes: 389,
    featured: false,
    tags: ["Market", "Affordable", "Asian Brands"],
  },
];

// ===== COMPONENTS =====

function Badge({ children, type = "category" }) {
  const bgColor = {
    "Deep Dive": T.warm,
    Guide: T.amber,
    Interview: T.borderAcc,
    Review: T.amber,
    News: T.warm,
  }[children] || T.warm;

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: "6px",
        backgroundColor: bgColor,
        color: T.bgDeep,
        fontSize: "11px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}
    >
      {children}
    </span>
  );
}

function ArticleCard({ article, onClick, size = "default" }) {
  const [hov, setHov] = useState(false);

  if (size === "featured") {
    // Extract first 2 paragraph blocks for preview
    const previewParagraphs = article.content
      ?.filter((block) => block.type === "p")
      .slice(0, 2) || [];

    return (
      <Link
        to={`/articles/${article.id}`}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.8fr",
          borderRadius: "16px",
          overflow: "hidden",
          background: T.bgCard,
          border: `1px solid ${hov ? T.borderAcc : T.border}`,
          cursor: "pointer",
          transition: "all 0.3s",
          textDecoration: "none",
        }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        {/* Image — compact left column */}
        <div style={{ overflow: "hidden", minHeight: "280px" }}>
          <img
            src={article.image}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.5s",
              transform: hov ? "scale(1.05)" : "scale(1)",
            }}
          />
        </div>

        {/* Content — title, preview, author, Read More */}
        <div
          style={{
            padding: "28px 32px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Top: badge + meta */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <Badge>{article.category}</Badge>
            <span
              style={{
                fontSize: "12px",
                color: T.txtM,
                display: "flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              <Clock size={11} /> {article.readTime}
            </span>
          </div>

          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "24px",
              fontWeight: 700,
              color: T.txt,
              margin: "0 0 14px",
              lineHeight: 1.3,
            }}
          >
            {article.title}
          </h2>

          {/* Article preview — first 2 paragraphs */}
          <div style={{ flex: 1, marginBottom: "16px" }}>
            {previewParagraphs.map((block, idx) => (
              <p
                key={idx}
                style={{
                  fontSize: "14px",
                  color: T.txt2,
                  lineHeight: 1.6,
                  margin: idx === 0 ? "0 0 10px" : "0",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {block.text}
              </p>
            ))}
          </div>

          {/* Bottom: author + Read More */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "auto",
              paddingTop: "14px",
              borderTop: `1px solid ${T.border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  overflow: "hidden",
                }}
              >
                <img
                  src={article.authorAvatar}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <span style={{ fontSize: "13px", color: T.txt }}>
                {article.author}
              </span>
            </div>

            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: T.amber,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              Read More <ChevronRight size={14} />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/articles/${article.id}`}
      style={{
        background: T.bgCard,
        borderRadius: "12px",
        border: `1px solid ${hov ? T.borderAcc : T.border}`,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.3s",
        transform: hov ? "translateY(-3px)" : "none",
        textDecoration: "none",
        display: "block",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{ aspectRatio: "16/9", overflow: "hidden" }}>
        <img
          src={article.image}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s",
            transform: hov ? "scale(1.05)" : "scale(1)",
          }}
        />
      </div>
      <div style={{ padding: "16px" }}>
        <Badge>{article.category}</Badge>
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "16px",
            fontWeight: 600,
            color: T.txt,
            margin: "8px 0",
            lineHeight: 1.3,
          }}
        >
          {article.title}
        </h3>
        <p
          style={{
            fontSize: "13px",
            color: T.txt2,
            lineHeight: 1.4,
            marginBottom: "12px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.excerpt}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "10px",
            borderTop: `1px solid ${T.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                overflow: "hidden",
              }}
            >
              <img
                src={article.authorAvatar}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <span style={{ fontSize: "12px", color: T.txt }}>
              {article.author}
            </span>
          </div>
          <span
            style={{
              fontSize: "12px",
              color: T.txtM,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Clock size={12} /> {article.readTime}
          </span>
        </div>
      </div>
    </Link>
  );
}

function ArticleList({
  articles,
  onSelectArticle,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  activeTag,
  onClearTag,
}) {
  const categories = [
    "All",
    "Guides",
    "Deep Dives",
    "Interviews",
    "Reviews",
    "News",
  ];
  const categoryMap = {
    All: null,
    Guides: "Guide",
    "Deep Dives": "Deep Dive",
    Interviews: "Interview",
    Reviews: "Review",
    News: "News",
  };

  const featured = articles.find((a) => a.featured);
  let filtered = articles.filter((a) => !a.featured);

  if (selectedCategory !== "All") {
    filtered = filtered.filter(
      (a) => a.category === categoryMap[selectedCategory]
    );
  }

  if (searchQuery) {
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (activeTag) {
    filtered = filtered.filter(
      (a) => a.tags?.some((t) => t.toLowerCase() === activeTag.toLowerCase())
    );
  }

  if (sortBy === "popular") {
    filtered.sort((a, b) => b.views - a.views);
  } else if (sortBy === "oldest") {
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  return (
    <div style={{ padding: "40px 20px" }}>
      {/* Featured Article */}
      {featured && (
        <div style={{ marginBottom: "60px" }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "28px",
              color: T.txt,
              marginBottom: "20px",
            }}
          >
            Featured
          </h2>
          <ArticleCard
            article={featured}
            onClick={() => onSelectArticle(featured.id)}
            size="featured"
          />
        </div>
      )}

      {/* Category Filter */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "40px",
          borderBottom: `1px solid ${T.border}`,
          paddingBottom: "20px",
          overflowX: "auto",
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              background: selectedCategory === cat ? T.amber : "transparent",
              color: selectedCategory === cat ? T.bgDeep : T.txt2,
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search & Sort */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "12px",
              color: T.txtM,
            }}
          />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 40px",
              borderRadius: "8px",
              border: `1px solid ${T.border}`,
              background: T.bgCard,
              color: T.txt,
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: "8px",
            border: `1px solid ${T.border}`,
            background: T.bgCard,
            color: T.txt,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          <option value="latest">Latest</option>
          <option value="popular">Popular</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {/* Active tag filter */}
      {activeTag && (
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={onClearTag}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              background: T.amber,
              color: T.bgDeep,
              border: "none",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Tag size={12} /> {activeTag} <X size={14} />
          </button>
        </div>
      )}

      {/* Article Grid */}
      {filtered.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          {filtered.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onClick={() => onSelectArticle(article.id)}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: T.txt2,
          }}
        >
          <p style={{ fontSize: "16px" }}>No articles found.</p>
        </div>
      )}
    </div>
  );
}

function ArticleReader({ article, onBack, onSelectArticle, onTagClick }) {
  const [liked, setLiked] = useState(false);
  const relatedArticles = articles.filter((a) =>
    article.relatedIds?.includes(a.id)
  );

  return (
    <div style={{ background: T.bgDeep, minHeight: "100vh" }}>
      {/* Back Button & Progress Bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: T.bgDeep,
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          padding: "12px 20px",
          gap: "12px",
        }}
      >
        <button
          onClick={onBack}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "none",
            background: T.bgCard,
            color: T.txt,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.background = T.bgElev)}
          onMouseLeave={(e) => (e.target.style.background = T.bgCard)}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div
          style={{
            flex: 1,
            height: "3px",
            background: T.border,
            borderRadius: "2px",
            marginLeft: "auto",
          }}
        >
          <div
            style={{
              height: "100%",
              background: T.amber,
              borderRadius: "2px",
              width: "35%",
            }}
          />
        </div>
      </div>

      {/* Hero Image */}
      <div
        style={{
          width: "100%",
          maxHeight: "400px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <img
          src={article.image}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(135deg, rgba(12,10,9,0.6), rgba(12,10,9,0.3))`,
          }}
        />
      </div>

      {/* Article Content */}
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        {/* Meta & Title */}
        <div style={{ marginBottom: "30px" }}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
            <Badge>{article.category}</Badge>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "13px",
                color: T.txtM,
              }}
            >
              <Clock size={13} /> {article.readTime} read
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "48px",
              fontWeight: 700,
              color: T.txt,
              lineHeight: 1.2,
              marginBottom: "20px",
            }}
          >
            {article.title}
          </h1>

          {/* Author Info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              paddingBottom: "20px",
              borderBottom: `1px solid ${T.border}`,
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                overflow: "hidden",
              }}
            >
              <img
                src={article.authorAvatar}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: T.txt }}>
                {article.author}
              </div>
              <div style={{ fontSize: "13px", color: T.txtM }}>
                Published {new Date(article.date).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div
          style={{
            marginBottom: "50px",
            lineHeight: 1.7,
            fontSize: "16px",
            color: T.txt2,
          }}
        >
          {article.content?.map((block, idx) => {
            if (block.type === "p") {
              return (
                <p
                  key={idx}
                  style={{
                    marginBottom: "20px",
                    color: T.txt,
                  }}
                >
                  {block.text}
                </p>
              );
            }
            if (block.type === "h2") {
              return (
                <h2
                  key={idx}
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "24px",
                    fontWeight: 700,
                    color: T.txt,
                    marginTop: "32px",
                    marginBottom: "16px",
                    lineHeight: 1.3,
                  }}
                >
                  {block.text}
                </h2>
              );
            }
            if (block.type === "blockquote") {
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    gap: "16px",
                    padding: "20px",
                    background: T.bgCard,
                    borderLeft: `4px solid ${T.amber}`,
                    borderRadius: "4px",
                    margin: "30px 0",
                    fontStyle: "italic",
                  }}
                >
                  <Quote size={20} style={{ color: T.amber, flexShrink: 0 }} />
                  <p style={{ color: T.txt, margin: 0 }}>{block.text}</p>
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "50px",
              paddingBottom: "30px",
              borderBottom: `1px solid ${T.border}`,
            }}
          >
            {article.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick?.(tag)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  background: T.bgCard,
                  border: `1px solid ${T.border}`,
                  borderRadius: "20px",
                  fontSize: "12px",
                  color: T.txtM,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = T.amber;
                  e.currentTarget.style.color = T.amber;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = T.border;
                  e.currentTarget.style.color = T.txtM;
                }}
              >
                <Tag size={12} /> {tag}
              </button>
            ))}
          </div>
        )}

        {/* Author Bio Box */}
        <div
          style={{
            background: T.bgCard,
            border: `1px solid ${T.border}`,
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "50px",
            display: "flex",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <img
              src={article.authorAvatar}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div>
            <h4
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: T.txt,
                marginBottom: "6px",
              }}
            >
              {article.author}
            </h4>
            <p
              style={{
                fontSize: "13px",
                color: T.txtM,
                lineHeight: 1.5,
              }}
            >
              {article.authorBio}
            </p>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div style={{ marginBottom: "50px" }}>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "24px",
                fontWeight: 700,
                color: T.txt,
                marginBottom: "24px",
              }}
            >
              Related Articles
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
              }}
            >
              {relatedArticles.map((rel) => (
                <ArticleCard
                  key={rel.id}
                  article={rel}
                  onClick={() => onSelectArticle(rel.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        {article.comments && article.comments.length > 0 && (
          <div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "24px",
                fontWeight: 700,
                color: T.txt,
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <MessageSquare size={24} /> Comments ({article.comments.length})
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {article.comments.map((comment, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "16px",
                    background: T.bgCard,
                    border: `1px solid ${T.border}`,
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ display: "flex", gap: "12px", marginBottom: "10px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={comment.avatar}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                          marginBottom: "4px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: T.txt,
                          }}
                        >
                          {comment.author}
                        </span>
                        <span style={{ fontSize: "12px", color: T.txtM }}>
                          {new Date(comment.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: "13px",
                          color: T.txt2,
                          margin: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        {comment.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== MAIN COMPONENT =====

export default function TWNGArticles() {
  const [view, setView] = useState("list"); // 'list' or 'reader'
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [activeTag, setActiveTag] = useState(null);

  const { id: articleIdParam } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (articleIdParam) {
      const artId = Number(articleIdParam);
      if (articles.find(a => a.id === artId)) {
        setSelectedArticleId(artId);
        setView("reader");
      }
    }
  }, [articleIdParam]);

  const selectedArticle = articles.find((a) => a.id === selectedArticleId);

  return (
    <div style={{ background: T.bgDeep, minHeight: "100vh" }}>
      {view === "list" ? (
        <ArticleList
          articles={articles}
          onSelectArticle={(id) => {
            navigate(`/articles/${id}`);
          }}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          activeTag={activeTag}
          onClearTag={() => setActiveTag(null)}
        />
      ) : selectedArticle ? (
        <ArticleReader
          article={selectedArticle}
          onBack={() => {
            setView("list");
            setSelectedArticleId(null);
            navigate("/articles");
          }}
          onSelectArticle={(id) => navigate(`/articles/${id}`)}
          onTagClick={(tag) => {
            setActiveTag(tag);
            setView("list");
            setSelectedArticleId(null);
            navigate("/articles");
          }}
        />
      ) : null}
    </div>
  );
}
