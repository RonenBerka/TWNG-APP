import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Star,
  Shield,
  Phone,
  Mail,
  Globe,
  MessageSquare,
  Camera,
  ChevronRight,
  Heart,
  ThumbsUp,
  ExternalLink,
  Instagram,
  Facebook,
} from "lucide-react";
import { T } from "../theme/tokens";

// Mock luthier data
const luthierData = {
  id: "karl-anderson",
  name: "Karl Anderson",
  shopName: "Karl Anderson Guitars",
  location: "Brooklyn, NY",
  yearsExperience: 22,
  verified: true,
  avgRating: 4.9,
  reviewCount: 127,
  bio: "Master luthier with over two decades of experience in guitar restoration, vintage authentication, and custom builds. Specializing in acoustic and electric guitars, with a passion for preserving the legacy of classic instruments.",
  bioFull:
    "Karl Anderson has been crafting and restoring guitars since 2002. His meticulous approach to lutherie combines traditional hand-crafted techniques with modern precision tools. Each instrument that leaves his workshop receives the same level of care and attention, whether it's a complete restoration of a 1959 Les Paul or a new custom acoustic build.\n\nKnown throughout Brooklyn's music community for his integrity, craftsmanship, and deep knowledge of vintage instruments, Karl has become the go-to luthier for collectors, session musicians, and recording studios.",
  phone: "+1 (718) 555-0142",
  email: "karl@karlguitars.com",
  website: "www.karlguitars.com",
  instagram: "@karlguitars",
  facebook: "Karl Anderson Guitars",
  certifications: [
    "Master Luthier Certification",
    "Fender Authorized Technician",
    "Gibson Specialist",
  ],
  specialties: ["Vintage Restoration", "Custom Builds", "Setup & Maintenance", "Fret Work"],
};

const services = [
  {
    id: 1,
    name: "Full Setup & Inspection",
    description:
      "Complete guitar setup including action adjustment, intonation correction, nut/bridge work, and full inspection.",
    priceMin: 150,
    priceMax: 250,
  },
  {
    id: 2,
    name: "Fret Level & Crown",
    description: "Professional fret leveling, crowning, and polishing for improved playability.",
    priceMin: 300,
    priceMax: 450,
  },
  {
    id: 3,
    name: "Vintage Authentication",
    description:
      "Expert evaluation and authentication of vintage guitars with detailed documentation.",
    priceMin: 100,
    priceMax: 200,
  },
  {
    id: 4,
    name: "Neck Reset & Repair",
    description: "Advanced neck reset service for vintage instruments and damage repair.",
    priceMin: 500,
    priceMax: 800,
  },
  {
    id: 5,
    name: "Custom Build Consultation",
    description:
      "Design consultation for custom guitar builds tailored to your specifications.",
    priceMin: 250,
    priceMax: 500,
  },
];

const portfolio = [
  {
    id: 1,
    title: "1959 Les Paul Restoration",
    category: "Restorations",
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop",
    description: "Complete restoration of a 1959 Gibson Les Paul with original finish preservation.",
  },
  {
    id: 2,
    title: "Custom Acoustic Build",
    category: "Builds",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
    description: "Custom rosewood and spruce acoustic guitar built to client specifications.",
  },
  {
    id: 3,
    title: "Fender Stratocaster Neck Reset",
    category: "Repairs",
    image: "https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400&h=300&fit=crop",
    description: "Professional neck reset and fret work on a vintage 1970s Stratocaster.",
  },
  {
    id: 4,
    title: "Custom Semi-Hollow Build",
    category: "Builds",
    image: "https://images.unsplash.com/photo-1510915723066-9a54dfcd8acd?w=400&h=300&fit=crop",
    description: "Mahogany semi-hollow electric guitar with Bigsby tremolo system.",
  },
  {
    id: 5,
    title: "Vintage Martin D-28 Refret",
    category: "Restorations",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop",
    description: "Complete refret and restoration of a 1963 Martin D-28 dreadnought.",
  },
  {
    id: 6,
    title: "Modern Archtop Build",
    category: "Builds",
    image: "https://images.unsplash.com/photo-1532866822696-b5a495c46db7?w=400&h=300&fit=crop",
    description: "Hand-carved archtop guitar with modern electronics and classic aesthetics.",
  },
];

const verifiedGuitars = [
  {
    id: 1,
    title: "1959 Gibson Les Paul",
    year: 1959,
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=150&h=150&fit=crop",
  },
  {
    id: 2,
    title: "1965 Fender Jazzmaster",
    year: 1965,
    condition: "Very Good",
    image: "https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=150&h=150&fit=crop",
  },
  {
    id: 3,
    title: "1971 Martin D-45",
    year: 1971,
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&h=150&fit=crop",
  },
  {
    id: 4,
    title: "1980s Ibanez JEM7",
    year: 1987,
    condition: "Mint",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop",
  },
];

const reviews = [
  {
    id: 1,
    author: "Michael Chen",
    avatar: "MC",
    rating: 5,
    date: "2 weeks ago",
    text: "Karl completely transformed my 1975 Les Paul. The neck reset was flawless and he preserved the original finish beautifully. Highly recommend!",
    helpful: 24,
  },
  {
    id: 2,
    author: "Sarah Morrison",
    avatar: "SM",
    rating: 5,
    date: "1 month ago",
    text: "Had my Strat set up and refretted. The attention to detail is incredible. Plays better than it ever has. Worth every penny.",
    helpful: 18,
  },
  {
    id: 3,
    author: "James Rodriguez",
    avatar: "JR",
    rating: 4,
    date: "6 weeks ago",
    text: "Great work on the custom acoustic build. Karl was collaborative throughout the process and delivered exactly what we discussed.",
    helpful: 12,
  },
  {
    id: 4,
    author: "Lisa Anderson",
    avatar: "LA",
    rating: 5,
    date: "2 months ago",
    text: "Authenticated my vintage Martin D-28. Karl provided detailed documentation and expert analysis. Very professional.",
    helpful: 15,
  },
  {
    id: 5,
    author: "David Park",
    avatar: "DP",
    rating: 4,
    date: "3 months ago",
    text: "Good work overall. Service was quick and the results were great. Only minor note: scheduling was a bit tight.",
    helpful: 8,
  },
  {
    id: 6,
    author: "Emma Wilson",
    avatar: "EW",
    rating: 5,
    date: "4 months ago",
    text: "Karl's expertise with vintage instruments is unmatched. He restored my grandfather's 1950s Gretsch to pristine condition.",
    helpful: 31,
  },
];

// Rating breakdown
const ratingBreakdown = [
  { stars: 5, count: 110, percent: 87 },
  { stars: 4, count: 12, percent: 9 },
  { stars: 3, count: 3, percent: 2 },
  { stars: 2, count: 1, percent: 1 },
  { stars: 1, count: 1, percent: 1 },
];

export default function TWNGLuthierProfile() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [likedReviews, setLikedReviews] = useState(new Set());
  const [expandedReview, setExpandedReview] = useState(null);
  const [selectedGuitarForm, setSelectedGuitarForm] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");

  const toggleReviewLike = (reviewId) => {
    const newLiked = new Set(likedReviews);
    if (newLiked.has(reviewId)) {
      newLiked.delete(reviewId);
    } else {
      newLiked.add(reviewId);
    }
    setLikedReviews(newLiked);
  };

  const filteredPortfolio =
    selectedTab === "all" ? portfolio : portfolio.filter((p) => p.category === selectedTab);

  const ratingPercent = Math.round((luthierData.avgRating / 5) * 100);

  return (
    <div style={{ backgroundColor: T.bgDeep, color: T.txt }}>
      {/* Hero Section */}
      <div className="relative">
        {/* Banner Background */}
        <div
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1200&h=400&fit=crop')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "300px",
          }}
          className="relative"
        >
          <div
            style={{
              backgroundColor: "rgba(12, 10, 9, 0.4)",
            }}
            className="absolute inset-0"
          />
        </div>

        {/* Profile Header Content */}
        <div
          style={{ backgroundColor: T.bgCard, borderColor: T.border }}
          className="border-b"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row gap-6 -mt-24 pb-6 relative z-10">
              {/* Profile Photo */}
              <div className="flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
                  alt={luthierData.name}
                  className="w-32 h-32 rounded-full border-4 object-cover"
                  style={{ borderColor: T.amber }}
                />
              </div>

              {/* Profile Info */}
              <div className="flex-grow pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1
                      style={{ fontFamily: "'Playfair Display', serif" }}
                      className="text-3xl sm:text-4xl font-bold mb-1"
                    >
                      {luthierData.name}
                    </h1>
                    <p style={{ color: T.txt2 }} className="text-lg mb-3">
                      {luthierData.shopName}
                    </p>

                    {/* Rating & Location Row */}
                    <div className="flex flex-col sm:flex-row gap-4 text-sm">
                      {/* Rating */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              fill={i < Math.floor(luthierData.avgRating) ? T.amber : T.txtM}
                              color={i < Math.floor(luthierData.avgRating) ? T.amber : T.txtM}
                            />
                          ))}
                        </div>
                        <span className="font-semibold">{luthierData.avgRating}</span>
                        <span style={{ color: T.txt2 }}>
                          ({luthierData.reviewCount} reviews)
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2">
                        <MapPin size={16} style={{ color: T.warm }} />
                        <span>{luthierData.location}</span>
                      </div>

                      {/* Verified Badge */}
                      {luthierData.verified && (
                        <div className="flex items-center gap-2 px-2 py-1 rounded" style={{ backgroundColor: "#1e3a2a" }}>
                          <Shield size={14} style={{ color: "#4ade80" }} />
                          <span style={{ color: "#4ade80" }} className="text-xs font-semibold">
                            Verified
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Buttons */}
                  <div className="flex flex-wrap gap-2 pt-4 sm:pt-0">
                    <button
                      className="p-2 rounded transition-colors"
                      style={{
                        backgroundColor: T.bgElev,
                        borderColor: T.border,
                        border: "1px solid",
                        color: T.txt,
                      }}
                      title="Call"
                    >
                      <Phone size={18} />
                    </button>
                    <button
                      className="p-2 rounded transition-colors"
                      style={{
                        backgroundColor: T.bgElev,
                        borderColor: T.border,
                        border: "1px solid",
                        color: T.txt,
                      }}
                      title="Email"
                    >
                      <Mail size={18} />
                    </button>
                    <button
                      className="p-2 rounded transition-colors"
                      style={{
                        backgroundColor: T.bgElev,
                        borderColor: T.border,
                        border: "1px solid",
                        color: T.txt,
                      }}
                      title="Website"
                    >
                      <Globe size={18} />
                    </button>
                    <button
                      className="p-2 rounded transition-colors"
                      style={{
                        backgroundColor: T.bgElev,
                        borderColor: T.border,
                        border: "1px solid",
                        color: T.txt,
                      }}
                      title="Message"
                    >
                      <MessageSquare size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <section>
              <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold mb-4">
                About
              </h2>
              <div
                style={{
                  backgroundColor: T.bgCard,
                  borderColor: T.border,
                  border: "1px solid",
                }}
                className="rounded-lg p-6 space-y-4"
              >
                <p style={{ color: T.txt2 }} className="leading-relaxed">
                  {luthierData.bioFull}
                </p>

                <div className="pt-4 border-t" style={{ borderColor: T.border }}>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p style={{ color: T.txtM }} className="text-sm mb-1">
                        Experience
                      </p>
                      <p className="text-2xl font-bold" style={{ color: T.amber }}>
                        {luthierData.yearsExperience}+ years
                      </p>
                    </div>
                    <div>
                      <p style={{ color: T.txtM }} className="text-sm mb-1">
                        Verified Guitars
                      </p>
                      <p className="text-2xl font-bold" style={{ color: T.amber }}>
                        {verifiedGuitars.length}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p style={{ color: T.txtM }} className="text-sm mb-3">
                      Certifications & Training
                    </p>
                    <ul className="space-y-2">
                      {luthierData.certifications.map((cert, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Shield
                            size={16}
                            className="flex-shrink-0 mt-1"
                            style={{ color: T.warm }}
                          />
                          <span className="text-sm">{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t" style={{ borderColor: T.border }}>
                  <p style={{ color: T.txtM }} className="text-sm mb-3">
                    Specialties
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {luthierData.specialties.map((specialty, idx) => (
                      <span
                        key={idx}
                        style={{
                          backgroundColor: T.bgElev,
                          color: T.amber,
                          borderColor: T.borderAcc,
                          border: "1px solid",
                        }}
                        className="px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Services Section */}
            <section>
              <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold mb-4">
                Services
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    style={{
                      backgroundColor: T.bgCard,
                      borderColor: T.border,
                      border: "1px solid",
                    }}
                    className="rounded-lg p-5 hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <h3 className="font-semibold mb-2">{service.name}</h3>
                    <p style={{ color: T.txt2 }} className="text-sm mb-3 leading-relaxed">
                      {service.description}
                    </p>
                    <p style={{ color: T.amber }} className="font-semibold text-sm">
                      ${service.priceMin} - ${service.priceMax}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Portfolio Section */}
            <section>
              <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold mb-4">
                Portfolio
              </h2>

              {/* Tab Filter */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {["all", "Builds", "Repairs", "Restorations"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    style={{
                      backgroundColor: selectedTab === tab ? T.amber : T.bgElev,
                      color: selectedTab === tab ? T.bgDeep : T.txt,
                      borderColor: T.border,
                      border: selectedTab === tab ? "none" : "1px solid",
                    }}
                    className="px-4 py-2 rounded font-medium text-sm whitespace-nowrap transition-colors"
                  >
                    {tab === "all" ? "All Work" : tab}
                  </button>
                ))}
              </div>

              {/* Portfolio Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredPortfolio.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: T.bgCard,
                      borderColor: T.border,
                      border: "1px solid",
                    }}
                    className="rounded-lg overflow-hidden hover:opacity-90 transition-opacity cursor-pointer group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Camera size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="p-4">
                      <p style={{ color: T.amber }} className="text-xs font-semibold mb-1">
                        {item.category}
                      </p>
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p style={{ color: T.txt2 }} className="text-sm">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Verified Guitars Section */}
            <section>
              <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold mb-4">
                Verified Guitars on TWNG
              </h2>
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max">
                  {verifiedGuitars.map((guitar) => (
                    <div
                      key={guitar.id}
                      style={{
                        backgroundColor: T.bgCard,
                        borderColor: T.border,
                        border: "1px solid",
                      }}
                      className="rounded-lg overflow-hidden w-40 flex-shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <div className="relative">
                        <img
                          src={guitar.image}
                          alt={guitar.title}
                          className="w-full h-40 object-cover"
                        />
                        <div
                          style={{ backgroundColor: "rgba(16, 185, 129, 0.2)", borderColor: "#10b981", color: "#10b981" }}
                          className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold border"
                        >
                          Verified
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm mb-1 truncate">{guitar.title}</h3>
                        <p style={{ color: T.txt2 }} className="text-xs">
                          {guitar.year}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Reviews Section */}
            <section>
              <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold mb-4">
                Reviews
              </h2>

              {/* Rating Summary */}
              <div
                style={{
                  backgroundColor: T.bgCard,
                  borderColor: T.border,
                  border: "1px solid",
                }}
                className="rounded-lg p-6 mb-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 pb-6 border-b" style={{ borderColor: T.border }}>
                  <div className="text-center">
                    <p className="text-4xl font-bold mb-2" style={{ color: T.amber }}>
                      {luthierData.avgRating}
                    </p>
                    <div className="flex justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={i < Math.floor(luthierData.avgRating) ? T.amber : T.txtM}
                          color={i < Math.floor(luthierData.avgRating) ? T.amber : T.txtM}
                        />
                      ))}
                    </div>
                    <p style={{ color: T.txt2 }} className="text-sm">
                      Based on {luthierData.reviewCount} reviews
                    </p>
                  </div>

                  {/* Rating Breakdown */}
                  <div className="sm:col-span-2 space-y-2">
                    {ratingBreakdown.map((rating) => (
                      <div key={rating.stars} className="flex items-center gap-2">
                        <span style={{ color: T.txt2 }} className="text-sm w-12">
                          {rating.stars} star
                        </span>
                        <div
                          style={{
                            backgroundColor: T.bgElev,
                            borderColor: T.border,
                            border: "1px solid",
                          }}
                          className="flex-grow h-2 rounded overflow-hidden"
                        >
                          <div
                            style={{
                              backgroundColor: T.amber,
                              width: `${rating.percent}%`,
                            }}
                            className="h-full"
                          />
                        </div>
                        <span style={{ color: T.txt2 }} className="text-sm w-8 text-right">
                          {rating.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    style={{
                      backgroundColor: T.bgCard,
                      borderColor: T.border,
                      border: "1px solid",
                    }}
                    className="rounded-lg p-5"
                  >
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div
                        style={{
                          backgroundColor: T.amber,
                          color: T.bgDeep,
                        }}
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm"
                      >
                        {review.avatar}
                      </div>

                      {/* Review Content */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                          <div>
                            <p className="font-semibold">{review.author}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    fill={i < review.rating ? T.amber : T.txtM}
                                    color={i < review.rating ? T.amber : T.txtM}
                                  />
                                ))}
                              </div>
                              <span style={{ color: T.txt2 }} className="text-xs">
                                {review.date}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p style={{ color: T.txt2 }} className="text-sm leading-relaxed mb-3">
                          {review.text}
                        </p>

                        {/* Helpful Button */}
                        <button
                          onClick={() => toggleReviewLike(review.id)}
                          className="flex items-center gap-2 text-xs font-medium transition-colors"
                          style={{
                            color: likedReviews.has(review.id) ? T.warm : T.txt2,
                          }}
                        >
                          <ThumbsUp
                            size={14}
                            fill={likedReviews.has(review.id) ? T.warm : "none"}
                          />
                          <span>{review.helpful + (likedReviews.has(review.id) ? 1 : 0)}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Contact Card */}
            <div
              style={{
                backgroundColor: T.bgCard,
                borderColor: T.borderAcc,
                border: "1px solid",
              }}
              className="rounded-lg p-6 sticky top-4"
            >
              <h3 className="font-semibold mb-4">Quick Contact</h3>

              <div className="space-y-3 mb-6">
                <a
                  href={`tel:${luthierData.phone}`}
                  className="flex items-center gap-3 p-3 rounded transition-colors"
                  style={{
                    backgroundColor: T.bgElev,
                    color: T.txt,
                  }}
                >
                  <Phone size={18} style={{ color: T.warm }} />
                  <div className="text-sm">
                    <p style={{ color: T.txt2 }} className="text-xs">
                      Call
                    </p>
                    <p className="font-medium">{luthierData.phone}</p>
                  </div>
                </a>

                <a
                  href={`mailto:${luthierData.email}`}
                  className="flex items-center gap-3 p-3 rounded transition-colors"
                  style={{
                    backgroundColor: T.bgElev,
                    color: T.txt,
                  }}
                >
                  <Mail size={18} style={{ color: T.warm }} />
                  <div className="text-sm">
                    <p style={{ color: T.txt2 }} className="text-xs">
                      Email
                    </p>
                    <p className="font-medium text-xs truncate">{luthierData.email}</p>
                  </div>
                </a>

                <a
                  href={`https://${luthierData.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded transition-colors"
                  style={{
                    backgroundColor: T.bgElev,
                    color: T.txt,
                  }}
                >
                  <Globe size={18} style={{ color: T.warm }} />
                  <div className="text-sm">
                    <p style={{ color: T.txt2 }} className="text-xs">
                      Website
                    </p>
                    <p className="font-medium text-xs">{luthierData.website}</p>
                  </div>
                </a>
              </div>

              {/* Social Links */}
              <div
                className="pt-6 border-t space-y-3"
                style={{ borderColor: T.border }}
              >
                <a
                  href={`https://instagram.com/${luthierData.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded transition-colors"
                  style={{
                    backgroundColor: T.bgElev,
                  }}
                >
                  <Instagram size={18} style={{ color: T.warm }} />
                  <span className="text-sm font-medium">{luthierData.instagram}</span>
                </a>

                <a
                  href={`https://facebook.com/${luthierData.facebook.replace(/ /g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded transition-colors"
                  style={{
                    backgroundColor: T.bgElev,
                  }}
                >
                  <Facebook size={18} style={{ color: T.warm }} />
                  <span className="text-sm font-medium">{luthierData.facebook}</span>
                </a>
              </div>
            </div>

            {/* Request Verification Card */}
            <div
              style={{
                backgroundColor: T.bgCard,
                borderColor: T.borderAcc,
                border: "2px solid",
              }}
              className="rounded-lg p-6"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield size={18} style={{ color: T.amber }} />
                Request Verification
              </h3>

              <p style={{ color: T.txt2 }} className="text-sm mb-4">
                Submit a guitar for Karl to verify and authenticate.
              </p>

              <div className="space-y-3">
                <div>
                  <label style={{ color: T.txt2 }} className="text-xs font-medium block mb-2">
                    Guitar (if you have one on TWNG)
                  </label>
                  <select
                    value={selectedGuitarForm}
                    onChange={(e) => setSelectedGuitarForm(e.target.value)}
                    style={{
                      backgroundColor: T.bgElev,
                      borderColor: T.border,
                      color: T.txt,
                    }}
                    className="w-full p-2 border rounded text-sm"
                  >
                    <option value="">Select a guitar...</option>
                    <option value="guitar1">1959 Les Paul</option>
                    <option value="guitar2">1965 Jazzmaster</option>
                    <option value="guitar3">Custom Acoustic</option>
                  </select>
                </div>

                <div>
                  <label style={{ color: T.txt2 }} className="text-xs font-medium block mb-2">
                    Message
                  </label>
                  <textarea
                    value={verificationMessage}
                    onChange={(e) => setVerificationMessage(e.target.value)}
                    placeholder="Tell Karl about your guitar..."
                    style={{
                      backgroundColor: T.bgElev,
                      borderColor: T.border,
                      color: T.txt,
                    }}
                    className="w-full p-2 border rounded text-sm resize-none"
                    rows="4"
                  />
                </div>

                <button
                  style={{
                    backgroundColor: T.amber,
                    color: T.bgDeep,
                  }}
                  className="w-full py-2 rounded font-semibold text-sm transition-opacity hover:opacity-90"
                >
                  Request Verification
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
