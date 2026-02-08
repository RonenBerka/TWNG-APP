import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Star, Shield, Grid3X3, List, ChevronDown, Phone, Mail, ExternalLink } from "lucide-react";
import { T } from "../theme/tokens";

const LUTHIER_DATA = [
  {
    id: 1,
    name: "Marcus Whitley",
    shop: "Whitley Fine Guitars",
    location: { city: "Nashville", country: "USA" },
    specialties: ["Acoustic", "Vintage", "Custom Builds"],
    rating: 4.9,
    verified: 127,
    featured: true,
    phone: "+1 (615) 555-0101",
    email: "marcus@whitleyguitars.com",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
  },
  {
    id: 2,
    name: "Elena Rodriguez",
    shop: "Resonancia Española",
    location: { city: "Granada", country: "Spain" },
    specialties: ["Classical", "Repairs", "Restoration"],
    rating: 4.8,
    verified: 89,
    featured: false,
    phone: "+34 958 555-0202",
    email: "elena@resonancia.es",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
  },
  {
    id: 3,
    name: "David Feldman",
    shop: "Tel Aviv Luthier Workshop",
    location: { city: "Tel Aviv", country: "Israel" },
    specialties: ["Electric", "Bass", "Custom Builds"],
    rating: 4.7,
    verified: 156,
    featured: true,
    phone: "+972 3 555-0303",
    email: "david@taluther.co.il",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
  },
  {
    id: 4,
    name: "Yuki Tanaka",
    shop: "Tokyo Guitar Makers",
    location: { city: "Tokyo", country: "Japan" },
    specialties: ["Acoustic", "Custom Builds", "Vintage"],
    rating: 4.9,
    verified: 203,
    featured: false,
    phone: "+81 3 555-0404",
    email: "yuki@tokyoguitarmakers.jp",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
  },
  {
    id: 5,
    name: "Liam O'Connor",
    shop: "Emerald Strings",
    location: { city: "Dublin", country: "Ireland" },
    specialties: ["Acoustic", "Repairs", "Folk Guitars"],
    rating: 4.6,
    verified: 72,
    featured: false,
    phone: "+353 1 555-0505",
    email: "liam@emeraldstrings.ie",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop",
  },
  {
    id: 6,
    name: "Sarah Mitchell",
    shop: "Vintage Vibe Guitars",
    location: { city: "Austin", country: "USA" },
    specialties: ["Vintage", "Electric", "Repairs"],
    rating: 4.8,
    verified: 134,
    featured: false,
    phone: "+1 (512) 555-0606",
    email: "sarah@vibevintage.com",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop",
  },
  {
    id: 7,
    name: "Hans Mueller",
    shop: "Schwarzwald Werkstatt",
    location: { city: "Offenburg", country: "Germany" },
    specialties: ["Acoustic", "Classical", "Custom Builds"],
    rating: 4.7,
    verified: 98,
    featured: false,
    phone: "+49 781 555-0707",
    email: "hans@schwarzwald-werkstatt.de",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
  },
  {
    id: 8,
    name: "Alessia Rossi",
    shop: "Liuteria Classica Italiana",
    location: { city: "Milan", country: "Italy" },
    specialties: ["Classical", "Vintage", "Restoration"],
    rating: 4.2,
    verified: 56,
    featured: false,
    phone: "+39 2 555-0808",
    email: "alessia@luteriaclassica.it",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
  },
];

const SPECIALTIES = ["All", "Acoustic", "Electric", "Bass", "Vintage", "Repairs", "Custom Builds"];

export default function TWNGLuthierDirectory() {
  const [view, setView] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const locations = ["All Locations", ...new Set(LUTHIER_DATA.map((l) => l.location.country))];

  const filteredLuthiers = LUTHIER_DATA.filter((luthier) => {
    const matchesSearch =
      luthier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      luthier.shop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      luthier.location.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty =
      selectedSpecialty === "All" || luthier.specialties.includes(selectedSpecialty);

    const matchesLocation =
      selectedLocation === "All Locations" || luthier.location.country === selectedLocation;

    return matchesSearch && matchesSpecialty && matchesLocation;
  });

  return (
    <div style={{ backgroundColor: T.bgDeep, color: T.txt, minHeight: "100vh", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Page Header */}
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <h1 style={{ fontFamily: "Playfair Display", fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 700, color: T.txt, marginBottom: "8px" }}>
            Luthier Directory
          </h1>
          <p style={{ color: T.txt2, fontFamily: "DM Sans", fontSize: "15px" }}>
            Find trusted guitar experts near you
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "240px", position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: T.txtM }} />
            <input
              type="text"
              placeholder="Search by name, specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 40px",
                borderRadius: "10px",
                backgroundColor: T.bgCard,
                border: "1px solid " + T.border,
                color: T.txt,
                fontSize: "14px",
                outline: "none"
              }}
              onFocus={e => e.target.style.borderColor = T.borderAcc}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Specialty Chips */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {SPECIALTIES.map((specialty) => (
              <button
                key={specialty}
                onClick={() => setSelectedSpecialty(specialty)}
                style={{
                  backgroundColor: selectedSpecialty === specialty ? T.warm : T.bgCard,
                  borderColor: selectedSpecialty === specialty ? T.warm : T.border,
                  color: selectedSpecialty === specialty ? T.bgDeep : T.txt,
                  padding: "8px 14px",
                  borderRadius: "20px",
                  border: "1px solid",
                  fontWeight: 500,
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {specialty}
              </button>
            ))}
          </div>

          {/* Location Filter & View Toggle */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  backgroundColor: T.bgCard,
                  border: "1px solid " + T.border,
                  color: T.txt,
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <MapPin size={15} />
                {selectedLocation}
                <ChevronDown size={14} style={{ color: T.txt2 }} />
              </button>

              {showLocationDropdown && (
                <div
                  style={{
                    backgroundColor: T.bgCard,
                    border: "1px solid " + T.border,
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: "8px",
                    borderRadius: "8px",
                    minWidth: "160px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    zIndex: 10
                  }}
                >
                  {locations.map((location) => (
                    <button
                      key={location}
                      onClick={() => {
                        setSelectedLocation(location);
                        setShowLocationDropdown(false);
                      }}
                      style={{
                        backgroundColor:
                          selectedLocation === location ? T.bgElev : "transparent",
                        color: T.txt,
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 14px",
                        border: "none",
                        borderBottom: "1px solid " + T.border,
                        fontSize: "13px",
                        cursor: "pointer"
                      }}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View Toggle */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                border: "1px solid " + T.border,
                borderRadius: "8px",
                overflow: "hidden"
              }}
            >
              <button
                onClick={() => setView("grid")}
                style={{
                  padding: "8px 10px",
                  backgroundColor: view === "grid" ? T.bgCard : "transparent",
                  border: "none",
                  color: view === "grid" ? T.txt : T.txtM,
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                <Grid3X3 size={15} />
              </button>
              <button
                onClick={() => setView("list")}
                style={{
                  padding: "8px 10px",
                  backgroundColor: view === "list" ? T.bgCard : "transparent",
                  border: "none",
                  color: view === "list" ? T.txt : T.txtM,
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Luthier Cards */}
        {filteredLuthiers.length > 0 ? (
          <div
            style={
              view === "grid"
                ? { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }
                : { display: "flex", flexDirection: "column", gap: "10px" }
            }
          >
            {filteredLuthiers.map((luthier) => (
              <div
                key={luthier.id}
                style={{
                  backgroundColor: T.bgCard,
                  border: (luthier.featured ? "2px solid " : "1px solid ") + (luthier.featured ? T.borderAcc : T.border),
                  borderRadius: "10px",
                  padding: "16px",
                  transition: "all 0.2s",
                  display: view === "list" ? "flex" : "block",
                  gap: view === "list" ? "12px" : undefined,
                  alignItems: view === "list" ? "center" : undefined
                }}
              >
                {/* Featured Badge */}
                {luthier.featured && (
                  <div
                    style={{
                      backgroundColor: T.warm,
                      color: T.bgDeep,
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <Shield size={12} /> Featured
                  </div>
                )}

                {/* Profile Image */}
                <div style={{ marginBottom: view === "grid" ? "12px" : 0, flexShrink: view === "list" ? 0 : undefined }}>
                  <div
                    style={{
                      borderRadius: "50%",
                      overflow: "hidden",
                      width: view === "grid" ? "80px" : "60px",
                      height: view === "grid" ? "80px" : "60px",
                      margin: view === "grid" ? "0 auto" : undefined,
                      border: "1px solid " + T.border
                    }}
                  >
                    <img
                      src={luthier.image}
                      alt={luthier.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div style={{ textAlign: view === "grid" ? "center" : "left", flex: view === "list" ? 1 : undefined }}>
                  <h3
                    style={{
                      fontFamily: "Playfair Display",
                      color: T.txt,
                      fontSize: "15px",
                      fontWeight: 600,
                      marginBottom: "4px"
                    }}
                  >
                    {luthier.name}
                  </h3>
                  <p style={{ color: T.txt2, fontFamily: "DM Sans", fontSize: "12px", marginBottom: "6px" }}>
                    {luthier.shop}
                  </p>

                  {/* Location */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: view === "grid" ? "center" : "flex-start", gap: "4px", marginBottom: "8px", color: T.txt2, fontSize: "12px" }}>
                    <MapPin size={13} />
                    <span>
                      {luthier.location.city}, {luthier.location.country}
                    </span>
                  </div>

                  {/* Specialty Tags */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px", justifyContent: view === "grid" ? "center" : "flex-start" }}>
                    {luthier.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        style={{
                          backgroundColor: T.bgElev,
                          border: "1px solid " + T.borderAcc,
                          color: T.warm,
                          padding: "3px 8px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: 500
                        }}
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px", fontSize: view === "list" ? "12px" : "13px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Star size={13} fill={T.warm} style={{ color: T.warm }} />
                      <span style={{ color: T.txt, fontWeight: 500 }}>
                        {luthier.rating.toFixed(1)}/5.0
                      </span>
                    </div>
                    <div style={{ color: T.txt2, fontSize: "12px" }}>
                      {luthier.verified} verified
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "6px", justifyContent: view === "grid" ? "center" : "flex-start" }}>
                    <Link
                      to={`/luthier/${luthier.id}`}
                      style={{
                        backgroundColor: T.warm,
                        color: T.bgDeep,
                        padding: "8px 12px",
                        borderRadius: "6px",
                        fontWeight: 500,
                        fontSize: "12px",
                        textDecoration: "none",
                        textAlign: "center",
                        flex: 1,
                        cursor: "pointer",
                        transition: "opacity 0.2s"
                      }}
                    >
                      View Profile
                    </Link>
                    <button
                      style={{
                        backgroundColor: T.bgElev,
                        border: "1px solid " + T.border,
                        color: T.txt,
                        padding: "8px 12px",
                        borderRadius: "6px",
                        fontWeight: 500,
                        fontSize: "12px",
                        cursor: "pointer",
                        flex: 1,
                        transition: "all 0.2s"
                      }}
                    >
                      Request
                    </button>
                  </div>

                  {/* Contact Icons */}
                  <div style={{ display: "flex", gap: "10px", marginTop: "8px", justifyContent: view === "grid" ? "center" : "flex-start" }}>
                    <a
                      href={`tel:${luthier.phone}`}
                      style={{ color: T.txt2, cursor: "pointer", transition: "color 0.2s" }}
                      title="Call"
                    >
                      <Phone size={13} />
                    </a>
                    <a
                      href={`mailto:${luthier.email}`}
                      style={{ color: T.txt2, cursor: "pointer", transition: "color 0.2s" }}
                      title="Email"
                    >
                      <Mail size={13} />
                    </a>
                    <Link
                      to={`/luthier/${luthier.id}`}
                      style={{ color: T.txt2, cursor: "pointer", transition: "color 0.2s" }}
                      title="View Profile"
                    >
                      <ExternalLink size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div
            style={{
              backgroundColor: T.bgCard,
              border: "1px solid " + T.border,
              borderRadius: "10px",
              padding: "48px 24px",
              textAlign: "center"
            }}
          >
            <p style={{ color: T.txt2, fontFamily: "DM Sans", fontSize: "15px", marginBottom: "8px" }}>
              No luthiers found matching your search.
            </p>
            <p style={{ color: T.txtM, fontSize: "13px" }}>
              Try adjusting your filters or search terms.
            </p>
          </div>
        )}

        {/* Results Count */}
        <div style={{ marginTop: "20px", textAlign: "center", color: T.txt2, fontSize: "13px" }}>
          <p>
            Showing {filteredLuthiers.length} of {LUTHIER_DATA.length} luthiers
          </p>
        </div>
      </div>
    </div>
  );
}
