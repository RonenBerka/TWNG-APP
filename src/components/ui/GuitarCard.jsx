import { Heart } from 'lucide-react';
import { T } from '../../theme/tokens';
import Badge from './Badge';
import { Link } from 'react-router-dom';

export default function GuitarCard({ guitar, compact = false }) {
  const { id, make, model, year, nickname, owner, image, verified, tags } = guitar;

  return (
    <Link to={`/guitar/${id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div style={{
        backgroundColor: T.bgCard, borderRadius: "12px",
        border: `1px solid ${T.border}`, overflow: "hidden",
        transition: "all 0.3s", cursor: "pointer",
      }}>
        <div style={{
          position: "relative", aspectRatio: compact ? "1" : "4/3",
          backgroundColor: T.bgElev, overflow: "hidden",
        }}>
          <img src={image} alt={`${make} ${model}`} style={{
            width: "100%", height: "100%", objectFit: "cover",
          }} />
          {verified && (
            <div style={{
              position: "absolute", top: "8px", right: "8px",
            }}>
              <Badge variant="verified">Verified</Badge>
            </div>
          )}
        </div>
        <div style={{ padding: compact ? "12px" : "16px" }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-start", marginBottom: "4px",
          }}>
            <p style={{
              fontSize: "12px", fontWeight: "500",
              fontFamily: "'JetBrains Mono', monospace",
              color: T.warm, letterSpacing: "0.02em",
            }}>{make} · {year}</p>
            <Heart size={14} style={{ color: T.txtM }} />
          </div>
          <h3 style={{
            fontSize: compact ? "14px" : "16px", fontWeight: "600",
            color: T.txt, marginBottom: "4px",
          }}>{model}</h3>
          {nickname && !compact && (
            <p style={{ fontSize: "13px", color: T.txt2, fontStyle: "italic" }}>{nickname}</p>
          )}
          {tags && !compact && (
            <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
              {tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}
          {owner && (
            <p style={{
              fontSize: "12px", color: T.txtM, marginTop: "8px",
              fontFamily: "'JetBrains Mono', monospace",
            }}>{owner}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
