import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { T } from '../theme/tokens';
import Button from './ui/Button';

/**
 * AdvancedSearchSidebar Component
 *
 * Collapsible sidebar panel for the Explore page with advanced filtering options.
 * Responsive: full sidebar on desktop, slide-out drawer on mobile.
 *
 * @component
 * @param {Object} props
 * @param {Function} props.onSearch - Callback when filters are applied: onSearch(filters)
 * @param {Object} [props.initialFilters] - Initial filter values
 *
 * @example
 * const [filters, setFilters] = useState({});
 * <AdvancedSearchSidebar
 *   onSearch={(filters) => handleSearch(filters)}
 *   initialFilters={filters}
 * />
 */
export default function AdvancedSearchSidebar({ onSearch, initialFilters = {} }) {
  const [isExpanded, setIsExpanded] = useState(window.innerWidth > 768);
  const [filters, setFilters] = useState({
    make: initialFilters.make || '',
    model: initialFilters.model || '',
    yearMin: initialFilters.yearMin || '',
    yearMax: initialFilters.yearMax || '',
    instrumentType: initialFilters.instrumentType || '',
    condition: initialFilters.condition || '',
    forSale: initialFilters.forSale || false,
    featuredOnly: initialFilters.featuredOnly || false,
    tags: initialFilters.tags || [],
    sortBy: initialFilters.sortBy || 'newest',
  });

  const [tagInput, setTagInput] = useState('');

  // Instrument type options
  const instrumentTypes = [
    'Electric Guitar',
    'Acoustic Guitar',
    'Classical Guitar',
    'Bass Guitar',
    'Ukulele',
    'Mandolin',
    'Banjo',
    'Other',
  ];

  // Condition options
  const conditions = ['mint', 'excellent', 'good', 'fair', 'poor'];

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'make-asc', label: 'Make A-Z' },
    { value: 'make-desc', label: 'Make Z-A' },
  ];

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Handle tag addition
  const handleAddTag = (tag) => {
    if (tag.trim() && !filters.tags.includes(tag.trim())) {
      setFilters(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()],
      }));
      setTagInput('');
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove),
    }));
  };

  // Apply filters and call callback
  const handleApplyFilters = () => {
    onSearch(filters);
  };

  // Clear all filters
  const handleClearAll = () => {
    const clearedFilters = {
      make: '',
      model: '',
      yearMin: '',
      yearMax: '',
      instrumentType: '',
      condition: '',
      forSale: false,
      featuredOnly: false,
      tags: [],
      sortBy: 'newest',
    };
    setFilters(clearedFilters);
    setTagInput('');
    onSearch(clearedFilters);
  };

  // Responsive styles
  const isMobile = window.innerWidth < 768;
  const sidebarStyle = {
    position: isMobile && isExpanded ? 'fixed' : 'relative',
    left: 0,
    top: 0,
    width: isMobile ? '100%' : '320px',
    height: isMobile && isExpanded ? '100vh' : 'auto',
    backgroundColor: T.bgCard,
    borderRight: isMobile ? 'none' : `1px solid ${T.border}`,
    borderBottom: isMobile && isExpanded ? 'none' : `1px solid ${T.border}`,
    zIndex: isMobile && isExpanded ? 1000 : 'auto',
    overflowY: isMobile && isExpanded ? 'auto' : 'visible',
  };

  const overlayStyle = isMobile && isExpanded ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  } : null;

  return (
    <>
      {/* Mobile overlay */}
      {overlayStyle && (
        <div
          style={overlayStyle}
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Sidebar toggle button (mobile only) */}
      {isMobile && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: T.bgCard,
            border: `1px solid ${T.border}`,
            borderRadius: '8px',
            color: T.txt,
            cursor: 'pointer',
            marginBottom: '16px',
            fontWeight: '500',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <SlidersHorizontal size={18} />
          Filters
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      )}

      {/* Sidebar panel */}
      <div style={sidebarStyle}>
        {/* Mobile close button */}
        {isMobile && isExpanded && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            borderBottom: `1px solid ${T.border}`,
            marginBottom: '16px',
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: T.txt,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <Filter size={20} />
              Filters
            </h2>
            <button
              onClick={() => setIsExpanded(false)}
              style={{
                background: 'none',
                border: 'none',
                color: T.txt2,
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div style={{ padding: isMobile && isExpanded ? '0 16px 16px' : '16px' }}>
          {/* Make */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: T.txt2,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Make
            </label>
            <input
              type="text"
              placeholder="Gibson, Fender..."
              value={filters.make}
              onChange={(e) => handleFilterChange('make', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: T.bgDeep,
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
                color: T.txt,
                fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Model */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: T.txt2,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Model
            </label>
            <input
              type="text"
              placeholder="Les Paul, Stratocaster..."
              value={filters.model}
              onChange={(e) => handleFilterChange('model', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: T.bgDeep,
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
                color: T.txt,
                fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Year Range */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: T.txt2,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Year Range
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="number"
                placeholder="Min"
                value={filters.yearMin}
                onChange={(e) => handleFilterChange('yearMin', e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  backgroundColor: T.bgDeep,
                  border: `1px solid ${T.border}`,
                  borderRadius: '6px',
                  color: T.txt,
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.yearMax}
                onChange={(e) => handleFilterChange('yearMax', e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  backgroundColor: T.bgDeep,
                  border: `1px solid ${T.border}`,
                  borderRadius: '6px',
                  color: T.txt,
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </div>
          </div>

          {/* Instrument Type */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: T.txt2,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Instrument Type
            </label>
            <select
              value={filters.instrumentType}
              onChange={(e) => handleFilterChange('instrumentType', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: T.bgDeep,
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
                color: T.txt,
                fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer',
              }}
            >
              <option value="">All Types</option>
              {instrumentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: T.txt2,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Condition
            </label>
            <select
              value={filters.condition}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: T.bgDeep,
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
                color: T.txt,
                fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer',
              }}
            >
              <option value="">All Conditions</option>
              {conditions.map(cond => (
                <option key={cond} value={cond}>
                  {cond.charAt(0).toUpperCase() + cond.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* For Sale Toggle */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: T.txt,
            }}>
              <input
                type="checkbox"
                checked={filters.forSale}
                onChange={(e) => handleFilterChange('forSale', e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: T.warm,
                }}
              />
              For Sale Only
            </label>
          </div>

          {/* Featured Only Toggle */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: T.txt,
            }}>
              <input
                type="checkbox"
                checked={filters.featuredOnly}
                onChange={(e) => handleFilterChange('featuredOnly', e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: T.warm,
                }}
              />
              Featured Only
            </label>
          </div>

          {/* Tags Multi-Select */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: T.txt2,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Tags
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTag(tagInput);
                  }
                }}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  backgroundColor: T.bgDeep,
                  border: `1px solid ${T.border}`,
                  borderRadius: '6px',
                  color: T.txt,
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
              <button
                onClick={() => handleAddTag(tagInput)}
                style={{
                  padding: '10px 12px',
                  backgroundColor: T.warm,
                  border: 'none',
                  borderRadius: '6px',
                  color: T.bgDeep,
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                Add
              </button>
            </div>
            {filters.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {filters.tags.map(tag => (
                  <div
                    key={tag}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 10px',
                      backgroundColor: `${T.warm}20`,
                      border: `1px solid ${T.warm}60`,
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: T.warm,
                      fontWeight: '500',
                    }}
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: T.warm,
                        cursor: 'pointer',
                        padding: '0',
                        display: 'flex',
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sort By */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: T.txt2,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: T.bgDeep,
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
                color: T.txt,
                fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer',
              }}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="primary"
              size="md"
              onClick={handleApplyFilters}
              style={{ flex: 1 }}
            >
              Apply Filters
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={handleClearAll}
              style={{ flex: 1 }}
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
