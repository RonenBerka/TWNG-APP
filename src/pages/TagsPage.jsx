import { useState, useEffect } from 'react';
import { Loader, AlertCircle, ArrowLeft, Search, Grid3x3, List, Tag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { T } from '../theme/tokens';
import { getTags } from '../lib/supabase/tags';
import { ROUTES } from '../lib/routes';

export default function TagsPage() {
  const navigate = useNavigate();

  const [tags, setTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('cloud'); // 'cloud' or 'list'

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    filterTags();
  }, [tags, searchQuery]);

  const fetchTags = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getTags({ limit: 500 });
      setTags(data || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError('Failed to load tags. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterTags = () => {
    let filtered = [...tags];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tag =>
        tag.name.toLowerCase().includes(query) ||
        (tag.description && tag.description.toLowerCase().includes(query))
      );
    }

    // Sort by usage count (descending)
    filtered.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));

    setFilteredTags(filtered);
  };

  const handleTagClick = (tagName) => {
    navigate(`/explore?tag=${encodeURIComponent(tagName)}`);
  };

  const getTagFontSize = (usage) => {
    if (!usage) return 12;
    const maxUsage = Math.max(...tags.map(t => t.usage_count || 0), 1);
    const minSize = 12;
    const maxSize = 32;
    return minSize + (usage / maxUsage) * (maxSize - minSize);
  };

  return (
    <div
      style={{
        background: T.bgDeep,
        minHeight: '100vh',
        color: T.txt,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          input::placeholder { color: ${T.txtM}; }
          input:focus { outline: none; }
        `}
      </style>

      {/* Header */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${T.border}`,
          background: T.bg,
        }}
      >
        <Link
          to={ROUTES.HOME}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: T.warm,
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.opacity = '0.7'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      {/* Hero */}
      <div
        style={{
          textAlign: 'center',
          padding: '80px 24px 60px',
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              background: `${T.warm}15`,
              padding: '16px',
              borderRadius: '12px',
              border: `1px solid ${T.borderAcc}`,
            }}
          >
            <Tag size={28} color={T.warm} />
          </div>
        </div>

        <h1
          style={{
            fontSize: '32px',
            fontWeight: 700,
            lineHeight: 1.3,
            marginBottom: '12px',
            color: T.txt,
          }}
        >
          Browse All Tags
        </h1>

        <p
          style={{
            fontSize: '15px',
            color: T.txtM,
            lineHeight: 1.6,
            marginBottom: '48px',
          }}
        >
          Explore guitars by tags and categories. Click any tag to see instruments tagged with it.
        </p>
      </div>

      {/* Controls */}
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0 24px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Search and View Toggle */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          {/* Search */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: T.bg,
                border: `1px solid ${T.border}`,
                borderRadius: '8px',
                padding: '10px 14px',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = T.warm}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = T.border}
            >
              <Search size={16} color={T.txtM} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tags..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: T.txt,
                  fontSize: '13px',
                }}
              />
            </div>
          </div>

          {/* View Toggle */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setViewMode('cloud')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px 14px',
                fontSize: '12px',
                fontWeight: 600,
                background: viewMode === 'cloud' ? T.warm : T.bg,
                color: viewMode === 'cloud' ? T.bgDeep : T.txt,
                border: `1px solid ${viewMode === 'cloud' ? T.warm : T.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'cloud') {
                  e.target.style.borderColor = T.warm;
                  e.target.style.color = T.warm;
                }
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'cloud') {
                  e.target.style.borderColor = T.border;
                  e.target.style.color = T.txt;
                }
              }}
            >
              <Grid3x3 size={14} />
              Cloud
            </button>

            <button
              onClick={() => setViewMode('list')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px 14px',
                fontSize: '12px',
                fontWeight: 600,
                background: viewMode === 'list' ? T.warm : T.bg,
                color: viewMode === 'list' ? T.bgDeep : T.txt,
                border: `1px solid ${viewMode === 'list' ? T.warm : T.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'list') {
                  e.target.style.borderColor = T.warm;
                  e.target.style.color = T.warm;
                }
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'list') {
                  e.target.style.borderColor = T.border;
                  e.target.style.color = T.txt;
                }
              }}
            >
              <List size={14} />
              List
            </button>
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <p style={{ fontSize: '12px', color: T.txtM }}>
            {filteredTags.length} {filteredTags.length === 1 ? 'tag' : 'tags'}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0 24px 80px',
        }}
      >
        {error && (
          <div
            style={{
              background: '#7F1D1D15',
              border: `1px solid #EF4444`,
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <AlertCircle size={20} color="#EF4444" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#EF4444' }}>
                Error
              </p>
              <p style={{ fontSize: '12px', color: T.txtM, marginTop: '2px' }}>
                {error}
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: `3px solid ${T.border}`,
                borderTopColor: T.warm,
                margin: '0 auto',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <p style={{ fontSize: '13px', color: T.txtM, marginTop: '16px' }}>
              Loading tags...
            </p>
            <style>
              {`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        )}

        {!loading && filteredTags.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <Tag size={32} color={T.txtM} style={{ margin: '0 auto', marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ fontSize: '14px', fontWeight: 600, color: T.txt }}>
              {searchQuery ? 'No tags found' : 'No tags available'}
            </p>
            {searchQuery && (
              <p style={{ fontSize: '12px', color: T.txtM, marginTop: '8px' }}>
                Try a different search term
              </p>
            )}
          </div>
        )}

        {!loading && filteredTags.length > 0 && viewMode === 'cloud' && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {filteredTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => handleTagClick(tag.name)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: `${Math.max(6, Math.floor(getTagFontSize(tag.usage_count || 0) / 3))}px ${Math.max(12, Math.floor(getTagFontSize(tag.usage_count || 0) / 2))}px`,
                  fontSize: `${getTagFontSize(tag.usage_count || 0)}px`,
                  fontWeight: 600,
                  background: `${T.warm}15`,
                  color: T.warm,
                  border: `1px solid ${T.borderAcc}`,
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = `${T.warm}25`;
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = `${T.warm}15`;
                  e.target.style.transform = 'scale(1)';
                }}
                title={`${tag.usage_count || 0} ${(tag.usage_count || 0) === 1 ? 'item' : 'items'}`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}

        {!loading && filteredTags.length > 0 && viewMode === 'list' && (
          <div>
            {filteredTags.map(tag => (
              <div
                key={tag.id}
                onClick={() => handleTagClick(tag.name)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  background: T.bg,
                  border: `1px solid ${T.border}`,
                  borderRadius: '8px',
                  marginBottom: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${T.warm}11`;
                  e.currentTarget.style.borderColor = T.warm;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = T.bg;
                  e.currentTarget.style.borderColor = T.border;
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: T.txt }}>
                    {tag.name}
                  </p>
                  {tag.description && (
                    <p style={{ fontSize: '12px', color: T.txtM, marginTop: '4px' }}>
                      {tag.description}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: T.warm }}>
                    {tag.usage_count || 0}
                  </p>
                  <p style={{ fontSize: '11px', color: T.txtM }}>
                    {(tag.usage_count || 0) === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
