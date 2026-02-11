import { Star } from 'lucide-react';
import { T } from '../../theme/tokens';
import Badge from './Badge';
import { Link } from 'react-router-dom';

export default function InstrumentCard({ instrument, compact = false }) {
  const {
    id,
    make,
    model,
    year,
    main_image_url,
    condition,
    instrument_type,
    current_owner,
    is_featured
  } = instrument;

  return (
    <Link to={`/instrument/${id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div style={{
        backgroundColor: T.bgCard,
        borderRadius: "12px",
        border: `1px solid ${T.border}`,
        overflow: "hidden",
        transition: "all 0.3s",
        cursor: "pointer",
      }}>
        <div style={{
          position: "relative",
          aspectRatio: compact ? "1" : "4/5",
          backgroundColor: T.bgElev,
          overflow: "hidden",
        }}>
          <img
            src={main_image_url}
            alt={`${make} ${model}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <div style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            display: "flex",
            gap: "6px",
            flexDirection: "column",
            alignItems: "flex-end",
          }}>
            {is_featured && (
              <div>
                <Badge variant="default">
                  <Star size={12} style={{ marginRight: "2px" }} />
                  Featured
                </Badge>
              </div>
            )}
            {condition && (
              <div>
                <Badge variant="outline">{condition}</Badge>
              </div>
            )}
          </div>
        </div>
        <div style={{ padding: compact ? "12px" : "16px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "4px",
          }}>
            <p style={{
              fontSize: "12px",
              fontWeight: "500",
              fontFamily: "'JetBrains Mono', monospace",
              color: T.warm,
              letterSpacing: "0.02em",
            }}>
              {make} · {year}
            </p>
          </div>
          <h3 style={{
            fontSize: compact ? "14px" : "16px",
            fontWeight: "600",
            color: T.txt,
            marginBottom: "4px",
          }}>
            {model}
          </h3>
          {instrument_type && !compact && (
            <p style={{
              fontSize: "13px",
              color: T.txt2,
              fontStyle: "italic",
              marginBottom: "8px",
            }}>
              {instrument_type}
            </p>
          )}
          {current_owner && (
            <p style={{
              fontSize: "12px",
              color: T.txtM,
              marginTop: "8px",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {current_owner}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export { default } from './InstrumentCard';
