import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Zap, FileText, Users, MessageSquare, Folder } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { T } from '../theme/tokens';
import { globalSearch } from '../lib/supabase/globalSearch';

/**
 * GlobalSearchBar — Cross-platform search with Cmd+K shortcut
 *
 * Features:
 *   - Searches across instruments, articles, users, forum threads, collections
 *   - Cmd+K or Ctrl+K keyboard shortcut to focus
 *   - Debounced input (300ms)
 *   - Categorized results by type
 *   - Real-time dropdown with max 10 results per category
 *   - ESC to close
 *   - Click result to navigate
 */
export default function GlobalSearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Keyboard shortcut: Cmd+K or Ctrl+K to focus
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }

      // ESC to close
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search
  const handleInputChange = useCallback((value) => {
    setQuery(value);
    setIsOpen(true);

    // Clear previous timer
    if (debounceTimer) clearTimeout(debounceTimer);

    if (!value.trim()) {
      setResults(null);
      return;
    }

    // Set new timer for debounced search
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const searchResults = await globalSearch(value, { limit: 10 });
        setResults(searchResults);
      } catch (error) {
        console.error('Error performing global search:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    setDebounceTimer(timer);
  }, [debounceTimer]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleResultClick = (path) => {
    navigate(path);
    setQuery('');
    setResults(null);
    setIsOpen(false);
  };

  // Result category configs
  const categoryConfig = {
    instruments: {
      icon: Zap,
      label: 'Instruments',
      getPath: (item) => `/instrument/${item.id}`,
      renderTitle: (item) => `${item.make} ${item.model}`,
      renderSubtitle: (item) => item.year ? `${item.year}` : '',
    },
    articles: {
      icon: FileText,
      label: 'Articles',
      getPath: (item) => `/articles/${item.slug}`,
      renderTitle: (item) => item.title,
      renderSubtitle: (item) => item.excerpt ? item.excerpt.substring(0, 50) + '...' : '',
    },
    users: {
      icon: Users,
      label: 'Users',
      getPath: (item) => `/profile/${item.id}`,
      renderTitle: (item) => item.username,
      renderSubtitle: (item) => item.is_verified ? 'Verified User' : 'User',
    },
    threads: {
      icon: MessageSquare,
      label: 'Forum Threads',
      getPath: (item) => `/forum/threads/${item.slug}`,
      renderTitle: (item) => item.title,
      renderSubtitle: (item) => `${item.reply_count || 0} replies`,
    },
    collections: {
      icon: Folder,
      label: 'Collections',
      getPath: (item) => `/collections/${item.id}`,
      renderTitle: (item) => item.name,
      renderSubtitle: (item) => item.description ? item.description.substring(0, 50) + '...' : '',
    },
  };

  const hasResults =
    results &&
    (results.instruments?.length > 0 ||
      results.articles?.length > 0 ||
      results.users?.length > 0 ||
      results.threads?.length > 0 ||
      results.collections?.length > 0);

  return (
    <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }} ref={searchRef}>
      {/* Search Input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          borderRadius: '8px',
          border: `1px solid ${T.border}`,
          backgroundColor: T.bgCard,
          transition: 'all 0.2s',
        }}
        onClick={() => inputRef.current?.focus()}
      >
        <Search size={16} color={T.txtM} strokeWidth={2} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search instruments, articles, users... (⌘K)"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          style={{
            flex: 1,
            border: 'none',
            backgroundColor: 'transparent',
            color: T.txt,
            fontSize: '14px',
            fontFamily: "'DM Sans', sans-serif",
            outline: 'none',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults(null);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              padding: '0',
              border: 'none',
              backgroundColor: 'transparent',
              color: T.txtM,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            title="Clear search"
          >
            <X size={16} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Dropdown Results Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: '0',
            right: '0',
            backgroundColor: T.bgCard,
            borderRadius: '12px',
            border: `1px solid ${T.border}`,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            maxHeight: '500px',
            overflowY: 'auto',
            zIndex: 1000,
          }}
        >
          {loading && query.trim() ? (
            <div
              style={{
                padding: '20px',
                textAlign: 'center',
                color: T.txt2,
                fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Searching...
            </div>
          ) : !query.trim() ? (
            <div
              style={{
                padding: '20px',
                textAlign: 'center',
                color: T.txt2,
                fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Start typing to search
            </div>
          ) : !hasResults ? (
            <div
              style={{
                padding: '20px',
                textAlign: 'center',
                color: T.txt2,
                fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              No results found
            </div>
          ) : (
            /* Results by Category */
            Object.entries(categoryConfig).map(([category, config]) => {
              const items = results[category] || [];
              if (items.length === 0) return null;

              const Icon = config.icon;

              return (
                <div key={category}>
                  {/* Category Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 16px 8px 16px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: T.txtM,
                      fontFamily: "'DM Sans', sans-serif",
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      borderBottom: `1px solid ${T.border}`,
                      marginTop: items === Object.values(results)[0]?.length ? 0 : 4,
                    }}
                  >
                    <Icon size={12} />
                    {config.label}
                  </div>

                  {/* Category Items */}
                  {items.slice(0, 5).map((item, index) => (
                    <div
                      key={`${category}-${item.id}-${index}`}
                      onClick={() => handleResultClick(config.getPath(item))}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        backgroundColor: 'transparent',
                        borderBottom:
                          index < items.length - 1
                            ? `1px solid ${T.border}`
                            : 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${T.warm}10`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: '500',
                          color: T.txt,
                          fontFamily: "'DM Sans', sans-serif",
                          marginBottom: config.renderSubtitle(item) ? '2px' : 0,
                        }}
                      >
                        {config.renderTitle(item)}
                      </div>
                      {config.renderSubtitle(item) && (
                        <div
                          style={{
                            fontSize: '12px',
                            color: T.txt2,
                            fontFamily: "'DM Sans', sans-serif",
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {config.renderSubtitle(item)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export { GlobalSearchBar };
