import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import { T } from '../../theme/tokens';
import {
  ArrowLeft, Save, Eye, Send, Plus, Trash2, ChevronUp, ChevronDown,
  Image, Type, AlignLeft, Quote, Link, Minus, Hash, User, Tag,
  MessageSquare, Search, Globe, Clock, FileText, X, Check, Upload
} from 'lucide-react';

const ArticleComposer = () => {
  const { id: articleId } = useParams();
  const navigate = useNavigate();

  // Main content state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [blocks, setBlocks] = useState([
    { id: crypto.randomUUID(), type: 'paragraph', content: '' }
  ]);

  // Sidebar state
  const [contributorName, setContributorName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoSlug, setSeoSlug] = useState('');
  const [seoExpanded, setSeoExpanded] = useState(false);

  // UI state
  const [saveStatus, setSaveStatus] = useState(''); // '', 'saving', 'saved'
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(!!articleId);
  const [lastSaved, setLastSaved] = useState(null);
  const [status, setStatus] = useState('draft');

  const autoSaveTimeoutRef = useRef(null);
  const blockRefs = useRef({});

  // Categories
  const categories = [
    'Brand History',
    'Luthier Interview',
    'Model Deep Dive',
    'Collector Guide',
    'Gear Review',
    'Community Story',
    'News',
    'Tutorial'
  ];

  // Calculate slug from title
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Auto-update SEO fields from title/subtitle
  useEffect(() => {
    if (!seoTitle) {
      setSeoTitle(title.substring(0, 200));
    }
  }, [title]);

  useEffect(() => {
    if (!seoDescription) {
      setSeoDescription(subtitle.substring(0, 300));
    }
  }, [subtitle]);

  useEffect(() => {
    if (!seoSlug) {
      setSeoSlug(generateSlug(title));
    }
  }, [title]);

  // Load existing article
  useEffect(() => {
    if (articleId) {
      loadArticle();
    }
  }, [articleId]);

  const loadArticle = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (error) throw error;

      if (data) {
        setTitle(data.title || '');
        setSubtitle(data.excerpt || '');
        setCoverImageUrl(data.cover_image_url || '');
        setBlocks(data.content ? JSON.parse(data.content) : [{ id: crypto.randomUUID(), type: 'paragraph', content: '' }]);
        setSelectedCategory(data.category || '');
        setTags(data.tags || []);
        setSeoTitle(data.seo_title || '');
        setSeoDescription(data.seo_description || '');
        setSeoSlug(data.slug || '');
        setStatus(data.status || 'draft');

        const metadata = data.source_metadata ? JSON.parse(data.source_metadata) : {};
        setContributorName(metadata.contributor || '');
        setCommentsEnabled(metadata.comments_enabled !== false);
        setIsFeatured(metadata.featured || false);

        setLastSaved(data.updated_at);
      }
    } catch (err) {
      console.error('Error loading article:', err);
      alert('Failed to load article');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save draft
  const performAutoSave = useCallback(async () => {
    if (!title.trim()) return;

    setSaveStatus('saving');
    try {
      const articleData = {
        title,
        slug: seoSlug || generateSlug(title),
        excerpt: subtitle,
        content: JSON.stringify(blocks),
        cover_image_url: coverImageUrl,
        status: 'draft',
        category: selectedCategory,
        tags,
        seo_title: seoTitle || title,
        seo_description: seoDescription || subtitle,
        source: 'manual',
        source_metadata: JSON.stringify({
          contributor: contributorName,
          comments_enabled: commentsEnabled,
          featured: isFeatured,
        }),
        updated_at: new Date().toISOString(),
      };

      if (articleId) {
        await supabase
          .from('articles')
          .update(articleData)
          .eq('id', articleId);
      } else {
        const newArticleData = {
          ...articleData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
        };
        await supabase.from('articles').insert(newArticleData);
      }

      setLastSaved(new Date().toISOString());
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      console.error('Auto-save error:', err);
      setSaveStatus('');
    }
  }, [title, subtitle, blocks, coverImageUrl, selectedCategory, tags, seoTitle, seoDescription, seoSlug, contributorName, commentsEnabled, isFeatured, articleId]);

  // Set up auto-save debounce
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      performAutoSave();
    }, 30000);
  }, [performAutoSave]);

  // Watch for changes
  useEffect(() => {
    triggerAutoSave();
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [title, subtitle, blocks, coverImageUrl, selectedCategory, tags, contributorName, commentsEnabled, isFeatured, seoTitle, seoDescription, seoSlug, triggerAutoSave]);

  // Save draft manually
  const saveDraft = async () => {
    setSaveStatus('saving');
    try {
      const articleData = {
        title,
        slug: seoSlug || generateSlug(title),
        excerpt: subtitle,
        content: JSON.stringify(blocks),
        cover_image_url: coverImageUrl,
        status: 'draft',
        category: selectedCategory,
        tags,
        seo_title: seoTitle || title,
        seo_description: seoDescription || subtitle,
        source: 'manual',
        source_metadata: JSON.stringify({
          contributor: contributorName,
          comments_enabled: commentsEnabled,
          featured: isFeatured,
        }),
        updated_at: new Date().toISOString(),
      };

      if (articleId) {
        await supabase
          .from('articles')
          .update(articleData)
          .eq('id', articleId);
      } else {
        const newArticleData = {
          ...articleData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
        };
        await supabase.from('articles').insert(newArticleData);
      }

      setLastSaved(new Date().toISOString());
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save draft');
      setSaveStatus('');
    }
  };

  // Publish article
  const publishArticle = async () => {
    if (!title.trim()) {
      alert('Please add a title before publishing');
      return;
    }

    setSaveStatus('saving');
    setShowPublishConfirm(false);

    try {
      const articleData = {
        title,
        slug: seoSlug || generateSlug(title),
        excerpt: subtitle,
        content: JSON.stringify(blocks),
        cover_image_url: coverImageUrl,
        status: 'published',
        published_at: new Date().toISOString(),
        category: selectedCategory,
        tags,
        seo_title: seoTitle || title,
        seo_description: seoDescription || subtitle,
        source: 'manual',
        source_metadata: JSON.stringify({
          contributor: contributorName,
          comments_enabled: commentsEnabled,
          featured: isFeatured,
        }),
        updated_at: new Date().toISOString(),
      };

      if (articleId) {
        await supabase
          .from('articles')
          .update(articleData)
          .eq('id', articleId);
      } else {
        const newArticleData = {
          ...articleData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
        };
        await supabase.from('articles').insert(newArticleData);
      }

      setStatus('published');
      setLastSaved(new Date().toISOString());
      setSaveStatus('saved');
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err) {
      console.error('Publish error:', err);
      alert('Failed to publish article');
      setSaveStatus('');
    }
  };

  // Block management
  const updateBlock = (id, field, value) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, [field]: value } : b));
    triggerAutoSave();
  };

  const deleteBlock = (id) => {
    const block = blocks.find(b => b.id === id);
    if (block.content && !window.confirm('Delete this block? This cannot be undone.')) {
      return;
    }
    if (blocks.length > 1) {
      setBlocks(blocks.filter(b => b.id !== id));
      triggerAutoSave();
    }
  };

  const moveBlockUp = (id) => {
    const idx = blocks.findIndex(b => b.id === id);
    if (idx > 0) {
      const newBlocks = [...blocks];
      [newBlocks[idx], newBlocks[idx - 1]] = [newBlocks[idx - 1], newBlocks[idx]];
      setBlocks(newBlocks);
      triggerAutoSave();
    }
  };

  const moveBlockDown = (id) => {
    const idx = blocks.findIndex(b => b.id === id);
    if (idx < blocks.length - 1) {
      const newBlocks = [...blocks];
      [newBlocks[idx], newBlocks[idx + 1]] = [newBlocks[idx + 1], newBlocks[idx]];
      setBlocks(newBlocks);
      triggerAutoSave();
    }
  };

  const addBlock = (type, afterId = null) => {
    const newBlock = { id: crypto.randomUUID(), type, content: '' };
    if (type === 'image') {
      newBlock.url = '';
      newBlock.caption = '';
    } else if (type === 'link') {
      newBlock.url = '';
    }

    if (afterId) {
      const idx = blocks.findIndex(b => b.id === afterId);
      const newBlocks = [...blocks];
      newBlocks.splice(idx + 1, 0, newBlock);
      setBlocks(newBlocks);
    } else {
      setBlocks([...blocks, newBlock]);
    }
    triggerAutoSave();
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
      triggerAutoSave();
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
    triggerAutoSave();
  };

  // Calculate stats
  const wordCount = blocks.reduce((count, block) => {
    return count + (block.content || '').split(/\s+/).filter(w => w).length;
  }, 0);
  const readTime = Math.ceil(wordCount / 200) || 1;

  // Textarea auto-resize
  const handleTextareaInput = (id, value) => {
    updateBlock(id, 'content', value);
    const ref = blockRefs.current[id];
    if (ref) {
      setTimeout(() => {
        ref.style.height = 'auto';
        ref.style.height = ref.scrollHeight + 'px';
      }, 0);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: T.bg,
        color: T.txt,
      }}>
        <div>Loading article...</div>
      </div>
    );
  }

  if (isPreviewMode) {
    return <PreviewMode article={{
      title,
      subtitle,
      coverImageUrl,
      blocks,
      contributorName,
      selectedCategory,
      tags,
      wordCount,
      readTime,
      status,
    }} onClose={() => setIsPreviewMode(false)} />;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: T.bg,
      color: T.txt,
      overflow: 'hidden',
    }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: '60px',
        borderBottom: `1px solid ${T.border}`,
        backgroundColor: T.bgCard,
        gap: '16px',
      }}>
        <button
          onClick={() => navigate('/admin')}
          style={{
            background: 'none',
            border: 'none',
            color: T.txt,
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Back to admin"
        >
          <ArrowLeft size={20} />
        </button>

        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setSeoSlug(generateSlug(e.target.value));
          }}
          placeholder="Article Title"
          style={{
            fontSize: '18px',
            fontWeight: 600,
            border: 'none',
            background: 'transparent',
            color: T.txt,
            flex: 1,
            outline: 'none',
            padding: '8px 0',
          }}
        />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '13px',
          color: T.txt2,
        }}>
          {saveStatus === 'saving' && <span>Saving...</span>}
          {saveStatus === 'saved' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#22C55E' }}>
              <Check size={14} /> Saved
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsPreviewMode(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: `1px solid ${T.border}`,
              color: T.txt,
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Eye size={16} /> Preview
          </button>

          <button
            onClick={saveDraft}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: `1px solid ${T.border}`,
              color: T.txt,
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Save size={16} /> Save Draft
          </button>

          <button
            onClick={() => setShowPublishConfirm(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#22C55E',
              border: 'none',
              color: '#1C1917',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Send size={16} /> Publish
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
      }}>
        {/* Editor */}
        <div style={{
          flex: '0 0 65%',
          overflowY: 'auto',
          padding: '40px 48px',
          borderRight: `1px solid ${T.border}`,
        }}>
          {/* Cover Image */}
          <div
            onClick={() => {
              const url = prompt('Enter image URL:');
              if (url) setCoverImageUrl(url);
            }}
            style={{
              height: '200px',
              backgroundColor: coverImageUrl ? 'transparent' : T.bgElev,
              backgroundImage: coverImageUrl ? `url('${coverImageUrl}')` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px',
              position: 'relative',
              border: `2px dashed ${T.border}`,
              overflow: 'hidden',
            }}
          >
            {!coverImageUrl && (
              <div style={{
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                color: T.txt2,
              }}>
                <Upload size={32} />
                <span style={{ fontSize: '14px' }}>Click to add cover image</span>
              </div>
            )}
            {coverImageUrl && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                display: 'flex',
                gap: '8px',
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const url = prompt('Enter new image URL:', coverImageUrl);
                    if (url) setCoverImageUrl(url);
                  }}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: T.bgCard,
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: T.txt,
                  }}
                >
                  Change
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCoverImageUrl('');
                  }}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: T.bgCard,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: T.txt,
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSeoSlug(generateSlug(e.target.value));
            }}
            placeholder="Article Title"
            style={{
              fontSize: '32px',
              fontWeight: 700,
              border: 'none',
              background: 'transparent',
              color: T.txt,
              width: '100%',
              outline: 'none',
              marginBottom: '16px',
              padding: '0',
              fontFamily: 'inherit',
            }}
          />

          {/* Subtitle */}
          <input
            type="text"
            value={subtitle}
            onChange={(e) => {
              setSubtitle(e.target.value);
              if (!seoDescription) setSeoDescription(e.target.value.substring(0, 300));
            }}
            placeholder="Write a subtitle or brief description..."
            style={{
              fontSize: '18px',
              border: 'none',
              background: 'transparent',
              color: T.txt2,
              width: '100%',
              outline: 'none',
              marginBottom: '48px',
              padding: '0',
              fontFamily: 'inherit',
            }}
          />

          {/* Blocks */}
          <div>
            {blocks.map((block, index) => (
              <div key={block.id}>
                <BlockEditor
                  block={block}
                  onUpdate={updateBlock}
                  onDelete={deleteBlock}
                  onMoveUp={moveBlockUp}
                  onMoveDown={moveBlockDown}
                  canMoveUp={index > 0}
                  canMoveDown={index < blocks.length - 1}
                  blockRefs={blockRefs}
                  handleTextareaInput={handleTextareaInput}
                />

                {/* Add Block Button Between */}
                <AddBlockButton
                  onSelect={(type) => addBlock(type, block.id)}
                />
              </div>
            ))}

            {/* Add Block at End */}
            <AddBlockButton
              onSelect={(type) => addBlock(type)}
              isLast
            />
          </div>
        </div>

        {/* Sidebar */}
        <div style={{
          flex: '0 0 35%',
          overflowY: 'auto',
          padding: '40px 24px',
          backgroundColor: T.bgElev,
        }}>
          {/* Contributor */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: T.txt2,
              marginBottom: '8px',
              letterSpacing: '0.5px',
            }}>
              <User size={14} /> Contributor
            </label>
            <input
              type="text"
              value={contributorName}
              onChange={(e) => setContributorName(e.target.value)}
              placeholder="Author name"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
                backgroundColor: T.bgCard,
                color: T.txt,
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onBlur={() => triggerAutoSave()}
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: T.txt2,
              marginBottom: '8px',
              letterSpacing: '0.5px',
            }}>
              <Hash size={14} /> Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                triggerAutoSave();
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
                backgroundColor: T.bgCard,
                color: T.txt,
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: T.txt2,
              marginBottom: '8px',
              letterSpacing: '0.5px',
            }}>
              <Tag size={14} /> Tags
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tag"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: `1px solid ${T.border}`,
                  borderRadius: '6px',
                  backgroundColor: T.bgCard,
                  color: T.txt,
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={addTag}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#D97706',
                  color: '#1C1917',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {tags.map(tag => (
                <div
                  key={tag}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    backgroundColor: '#D97706',
                    color: '#1C1917',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1C1917',
                      cursor: 'pointer',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Comments Toggle */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: T.txt,
                cursor: 'pointer',
              }}>
                <MessageSquare size={16} /> Allow Comments
              </label>
              <div
                onClick={() => {
                  setCommentsEnabled(!commentsEnabled);
                  triggerAutoSave();
                }}
                style={{
                  width: '44px',
                  height: '24px',
                  backgroundColor: commentsEnabled ? '#D97706' : T.border,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                  transition: 'background-color 0.2s',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#fff',
                    borderRadius: '10px',
                    transition: 'transform 0.2s',
                    transform: commentsEnabled ? 'translateX(20px)' : 'translateX(0)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Featured Toggle */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: T.txt,
                cursor: 'pointer',
              }}>
                <Search size={16} /> Featured Article
              </label>
              <div
                onClick={() => {
                  setIsFeatured(!isFeatured);
                  triggerAutoSave();
                }}
                style={{
                  width: '44px',
                  height: '24px',
                  backgroundColor: isFeatured ? '#D97706' : T.border,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                  transition: 'background-color 0.2s',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#fff',
                    borderRadius: '10px',
                    transition: 'transform 0.2s',
                    transform: isFeatured ? 'translateX(20px)' : 'translateX(0)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* SEO Section */}
          <div style={{
            borderTop: `1px solid ${T.border}`,
            borderBottom: `1px solid ${T.border}`,
            paddingTop: '24px',
            paddingBottom: '24px',
            marginBottom: '32px',
          }}>
            <button
              onClick={() => setSeoExpanded(!seoExpanded)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'none',
                border: 'none',
                color: T.txt,
                fontSize: '13px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                marginBottom: seoExpanded ? '16px' : '0',
                padding: '0',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={14} /> SEO
              </span>
              <ChevronDown size={16} style={{
                transition: 'transform 0.2s',
                transform: seoExpanded ? 'rotate(180deg)' : 'rotate(0)',
              }} />
            </button>

            {seoExpanded && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: T.txt2,
                    marginBottom: '6px',
                    display: 'block',
                  }}>
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value.substring(0, 200))}
                    placeholder="Auto-generated from title"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${T.border}`,
                      borderRadius: '6px',
                      backgroundColor: T.bgCard,
                      color: T.txt,
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onBlur={() => triggerAutoSave()}
                  />
                  <div style={{
                    fontSize: '11px',
                    color: T.txt2,
                    marginTop: '4px',
                  }}>
                    {seoTitle.length}/200
                  </div>
                </div>

                <div>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: T.txt2,
                    marginBottom: '6px',
                    display: 'block',
                  }}>
                    SEO Description
                  </label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value.substring(0, 300))}
                    placeholder="Auto-generated from subtitle"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${T.border}`,
                      borderRadius: '6px',
                      backgroundColor: T.bgCard,
                      color: T.txt,
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                      minHeight: '80px',
                      fontFamily: 'inherit',
                    }}
                    onBlur={() => triggerAutoSave()}
                  />
                  <div style={{
                    fontSize: '11px',
                    color: T.txt2,
                    marginTop: '4px',
                  }}>
                    {seoDescription.length}/300
                  </div>
                </div>

                <div>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: T.txt2,
                    marginBottom: '6px',
                    display: 'block',
                  }}>
                    Slug
                  </label>
                  <input
                    type="text"
                    value={seoSlug}
                    onChange={(e) => setSeoSlug(generateSlug(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${T.border}`,
                      borderRadius: '6px',
                      backgroundColor: T.bgCard,
                      color: T.txt,
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'monospace',
                    }}
                    onBlur={() => triggerAutoSave()}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Article Info */}
          <div style={{
            fontSize: '13px',
            color: T.txt2,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={14} />
              <span>{wordCount} words</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={14} />
              <span>{readTime} min read</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                padding: '2px 8px',
                backgroundColor: status === 'published' ? '#22C55E' : T.border,
                color: status === 'published' ? '#1C1917' : T.txt2,
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}>
                {status}
              </span>
            </div>
            {lastSaved && (
              <div style={{ fontSize: '12px', marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${T.border}` }}>
                Last saved {new Date(lastSaved).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Publish Confirmation Modal */}
      {showPublishConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: T.bgCard,
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 700,
              margin: '0',
              color: T.txt,
            }}>
              Ready to publish?
            </h2>
            <p style={{
              margin: '0',
              color: T.txt2,
              fontSize: '14px',
              lineHeight: '1.6',
            }}>
              Once published, this article will be visible to all visitors. You can edit it later if needed.
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => setShowPublishConfirm(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: T.border,
                  color: T.txt,
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={publishArticle}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#22C55E',
                  color: '#1C1917',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Block Editor Component
const BlockEditor = ({
  block,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  blockRefs,
  handleTextareaInput,
}) => {
  const [showControls, setShowControls] = useState(false);

  return (
    <div
      key={block.id}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      style={{
        marginBottom: '16px',
        position: 'relative',
      }}
    >
      {/* Block Controls */}
      {showControls && (
        <div style={{
          position: 'absolute',
          left: '-60px',
          top: '0',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          alignItems: 'center',
        }}>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: T.txt2,
              cursor: 'grab',
              padding: '4px',
            }}
            title="Drag to move"
          >
            <Minus size={14} style={{ transform: 'rotate(90deg)' }} />
          </button>
          <button
            onClick={() => onMoveUp(block.id)}
            disabled={!canMoveUp}
            style={{
              background: 'none',
              border: 'none',
              color: canMoveUp ? T.txt2 : T.border,
              cursor: canMoveUp ? 'pointer' : 'not-allowed',
              padding: '4px',
              opacity: canMoveUp ? 1 : 0.5,
            }}
          >
            <ChevronUp size={16} />
          </button>
          <button
            onClick={() => onMoveDown(block.id)}
            disabled={!canMoveDown}
            style={{
              background: 'none',
              border: 'none',
              color: canMoveDown ? T.txt2 : T.border,
              cursor: canMoveDown ? 'pointer' : 'not-allowed',
              padding: '4px',
              opacity: canMoveDown ? 1 : 0.5,
            }}
          >
            <ChevronDown size={16} />
          </button>
          <button
            onClick={() => onDelete(block.id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#EF4444',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* Paragraph */}
      {block.type === 'paragraph' && (
        <textarea
          ref={(el) => {
            if (el) blockRefs.current[block.id] = el;
          }}
          value={block.content}
          onChange={(e) => handleTextareaInput(block.id, e.target.value)}
          placeholder="Start writing..."
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '12px 0',
            border: 'none',
            background: 'transparent',
            color: T.txt,
            fontSize: '16px',
            lineHeight: '1.6',
            outline: 'none',
            resize: 'none',
            fontFamily: 'inherit',
            overflow: 'hidden',
          }}
        />
      )}

      {/* Heading */}
      {block.type === 'heading' && (
        <input
          type="text"
          value={block.content}
          onChange={(e) => onUpdate(block.id, 'content', e.target.value)}
          placeholder="Heading"
          style={{
            width: '100%',
            fontSize: '22px',
            fontWeight: 700,
            border: 'none',
            background: 'transparent',
            color: T.txt,
            outline: 'none',
            padding: '12px 0',
            fontFamily: 'inherit',
          }}
        />
      )}

      {/* Subheading */}
      {block.type === 'subheading' && (
        <input
          type="text"
          value={block.content}
          onChange={(e) => onUpdate(block.id, 'content', e.target.value)}
          placeholder="Subheading"
          style={{
            width: '100%',
            fontSize: '18px',
            fontWeight: 600,
            border: 'none',
            background: 'transparent',
            color: T.txt,
            outline: 'none',
            padding: '12px 0',
            fontFamily: 'inherit',
          }}
        />
      )}

      {/* Image */}
      {block.type === 'image' && (
        <div>
          <input
            type="text"
            value={block.url || ''}
            onChange={(e) => onUpdate(block.id, 'url', e.target.value)}
            placeholder="Image URL"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${T.border}`,
              borderRadius: '6px',
              backgroundColor: T.bgCard,
              color: T.txt,
              fontSize: '13px',
              outline: 'none',
              marginBottom: '8px',
              boxSizing: 'border-box',
            }}
          />
          <input
            type="text"
            value={block.caption || ''}
            onChange={(e) => onUpdate(block.id, 'caption', e.target.value)}
            placeholder="Image caption (optional)"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${T.border}`,
              borderRadius: '6px',
              backgroundColor: T.bgCard,
              color: T.txt,
              fontSize: '13px',
              outline: 'none',
              marginBottom: '12px',
              boxSizing: 'border-box',
            }}
          />
          {block.url && (
            <img
              src={block.url}
              alt={block.caption || 'Article image'}
              style={{
                width: '100%',
                borderRadius: '8px',
                maxHeight: '400px',
                objectFit: 'cover',
                marginBottom: '8px',
              }}
              onError={() => (
                <div style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: T.bgCard,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: T.txt2,
                }}>
                  Image failed to load
                </div>
              )}
            />
          )}
          {block.caption && (
            <p style={{
              fontSize: '12px',
              color: T.txt2,
              marginTop: '0',
              marginBottom: '0',
              fontStyle: 'italic',
            }}>
              {block.caption}
            </p>
          )}
        </div>
      )}

      {/* Quote */}
      {block.type === 'quote' && (
        <textarea
          ref={(el) => {
            if (el) blockRefs.current[block.id] = el;
          }}
          value={block.content}
          onChange={(e) => handleTextareaInput(block.id, e.target.value)}
          placeholder="Type a quote..."
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '16px 16px 16px 16px',
            borderLeft: `4px solid #D97706`,
            border: 'none',
            borderLeft: `4px solid #D97706`,
            background: 'transparent',
            color: T.txt,
            fontSize: '16px',
            lineHeight: '1.6',
            outline: 'none',
            resize: 'none',
            fontFamily: 'inherit',
            fontStyle: 'italic',
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        />
      )}

      {/* Link */}
      {block.type === 'link' && (
        <div>
          <input
            type="text"
            value={block.url || ''}
            onChange={(e) => onUpdate(block.id, 'url', e.target.value)}
            placeholder="URL"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${T.border}`,
              borderRadius: '6px',
              backgroundColor: T.bgCard,
              color: T.txt,
              fontSize: '13px',
              outline: 'none',
              marginBottom: '8px',
              boxSizing: 'border-box',
            }}
          />
          <input
            type="text"
            value={block.content}
            onChange={(e) => onUpdate(block.id, 'content', e.target.value)}
            placeholder="Link text"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${T.border}`,
              borderRadius: '6px',
              backgroundColor: T.bgCard,
              color: T.txt,
              fontSize: '13px',
              outline: 'none',
              marginBottom: '12px',
              boxSizing: 'border-box',
            }}
          />
          {block.url && block.content && (
            <a
              href={block.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: '12px 16px',
                border: `1px solid ${T.border}`,
                borderRadius: '8px',
                backgroundColor: T.bgCard,
                color: '#D97706',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {block.content}
            </a>
          )}
        </div>
      )}

      {/* Divider */}
      {block.type === 'divider' && (
        <hr
          style={{
            border: 'none',
            borderTop: `2px solid ${T.border}`,
            margin: '24px 0',
          }}
        />
      )}
    </div>
  );
};

// Add Block Button Component
const AddBlockButton = ({ onSelect, isLast = false }) => {
  const [showMenu, setShowMenu] = useState(false);

  const blockTypes = [
    { type: 'paragraph', label: 'Paragraph', icon: '¶' },
    { type: 'heading', label: 'Heading', icon: 'H' },
    { type: 'subheading', label: 'Subheading', icon: 'h' },
    { type: 'image', label: 'Image', icon: '📷' },
    { type: 'quote', label: 'Quote', icon: '"' },
    { type: 'link', label: 'Link', icon: '🔗' },
    { type: 'divider', label: 'Divider', icon: '—' },
  ];

  return (
    <div style={{ position: 'relative', marginBottom: '16px' }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        onBlur={() => setTimeout(() => setShowMenu(false), 100)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          backgroundColor: 'transparent',
          border: `1px dashed ${T.border}`,
          borderRadius: '6px',
          color: T.txt2,
          cursor: 'pointer',
          padding: '0',
          fontSize: '16px',
          margin: '0 auto',
        }}
      >
        <Plus size={16} />
      </button>

      {showMenu && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '8px',
            backgroundColor: T.bgCard,
            border: `1px solid ${T.border}`,
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            zIndex: 100,
            minWidth: '160px',
          }}
        >
          {blockTypes.map(bt => (
            <button
              key={bt.type}
              onClick={() => {
                onSelect(bt.type);
                setShowMenu(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px 12px',
                border: 'none',
                background: 'none',
                color: T.txt,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                borderBottom: bt.type !== 'divider' ? `1px solid ${T.border}` : 'none',
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = T.bgElev}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <span style={{ fontSize: '14px' }}>{bt.icon}</span>
              {bt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Preview Mode Component
const PreviewMode = ({ article, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000',
      overflowY: 'auto',
      zIndex: 2000,
    }}>
      <div style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        padding: '16px 24px',
        backgroundColor: T.bgCard,
        borderBottom: `1px solid ${T.border}`,
        zIndex: 2001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h2 style={{ margin: '0', fontSize: '16px', fontWeight: 600, color: T.txt }}>
          Preview
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: T.txt,
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={20} />
        </button>
      </div>

      <div style={{
        maxWidth: '800px',
        margin: '80px auto 40px',
        padding: '0 24px',
        color: T.txt,
      }}>
        {/* Cover Image */}
        {article.coverImageUrl && (
          <img
            src={article.coverImageUrl}
            alt="Article cover"
            style={{
              width: '100%',
              height: '400px',
              objectFit: 'cover',
              borderRadius: '12px',
              marginBottom: '40px',
            }}
          />
        )}

        {/* Title */}
        <h1 style={{
          fontSize: '40px',
          fontWeight: 700,
          marginBottom: '16px',
          margin: '0 0 16px 0',
        }}>
          {article.title}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '18px',
          color: T.txt2,
          marginBottom: '24px',
          margin: '0 0 24px 0',
          lineHeight: '1.6',
        }}>
          {article.subtitle}
        </p>

        {/* Meta */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '40px',
          paddingBottom: '24px',
          borderBottom: `1px solid ${T.border}`,
          fontSize: '13px',
          color: T.txt2,
          flexWrap: 'wrap',
        }}>
          {article.contributorName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} />
              {article.contributorName}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} />
            {article.readTime} min read
          </div>
          {article.selectedCategory && (
            <span style={{
              padding: '2px 8px',
              backgroundColor: '#D97706',
              color: '#1C1917',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
            }}>
              {article.selectedCategory}
            </span>
          )}
        </div>

        {/* Content */}
        <div style={{ marginBottom: '40px', lineHeight: '1.8' }}>
          {article.blocks.map((block) => {
            switch (block.type) {
              case 'paragraph':
                return (
                  <p key={block.id} style={{
                    fontSize: '16px',
                    lineHeight: '1.8',
                    marginBottom: '16px',
                    margin: '0 0 16px 0',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {block.content}
                  </p>
                );
              case 'heading':
                return (
                  <h2 key={block.id} style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    marginBottom: '16px',
                    margin: '32px 0 16px 0',
                  }}>
                    {block.content}
                  </h2>
                );
              case 'subheading':
                return (
                  <h3 key={block.id} style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    marginBottom: '12px',
                    margin: '24px 0 12px 0',
                    color: T.txt,
                  }}>
                    {block.content}
                  </h3>
                );
              case 'image':
                return (
                  <figure key={block.id} style={{ margin: '32px 0' }}>
                    <img
                      src={block.url}
                      alt={block.caption || 'Article image'}
                      style={{
                        width: '100%',
                        borderRadius: '8px',
                        marginBottom: block.caption ? '12px' : '0',
                      }}
                    />
                    {block.caption && (
                      <figcaption style={{
                        fontSize: '14px',
                        color: T.txt2,
                        fontStyle: 'italic',
                        textAlign: 'center',
                        margin: '0',
                      }}>
                        {block.caption}
                      </figcaption>
                    )}
                  </figure>
                );
              case 'quote':
                return (
                  <blockquote key={block.id} style={{
                    fontSize: '18px',
                    fontStyle: 'italic',
                    borderLeft: '4px solid #D97706',
                    paddingLeft: '16px',
                    marginLeft: '0',
                    marginRight: '0',
                    marginBottom: '24px',
                    color: T.txt,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {block.content}
                  </blockquote>
                );
              case 'link':
                return (
                  <a
                    key={block.id}
                    href={block.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '12px 16px',
                      backgroundColor: '#D97706',
                      color: '#1C1917',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      marginBottom: '24px',
                      fontSize: '14px',
                    }}
                  >
                    {block.content}
                  </a>
                );
              case 'divider':
                return (
                  <hr key={block.id} style={{
                    border: 'none',
                    borderTop: `2px solid ${T.border}`,
                    margin: '32px 0',
                  }} />
                );
              default:
                return null;
            }
          })}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            paddingTop: '24px',
            borderTop: `1px solid ${T.border}`,
            marginTop: '40px',
          }}>
            {article.tags.map(tag => (
              <span key={tag} style={{
                padding: '4px 10px',
                backgroundColor: T.bgElev,
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                color: T.txt,
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleComposer;
