import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase/client';
import { T } from '../../theme/tokens';
import { useTheme } from '../../context/ThemeContext';
import { welcomeSequence, claimSequence, reengagementSequence } from '../../lib/email/templates';
import { authTemplates, transactionalTemplates } from '../../lib/email/auth-templates';
import {
  Users, Mail, TrendingUp, Settings, Share2, Zap, BarChart3, BookOpen,
  ChevronRight, ChevronDown, Download, Eye, Flag, Edit, Trash2,
  Plus, X, Search, Filter, CheckCircle, AlertCircle, Clock, Star,
  Send, MoreVertical, Copy, ExternalLink, Calendar, MessageSquare,
  DollarSign, Target, Music, Guitar, Smartphone, Code, ArrowUpRight,
  ArrowDownRight, Heart, MessageCircle, Share, TrendingDown, PieChart,
  BarChart2, LineChart, ArrowRight, Lock, Globe, Database, Terminal
} from 'lucide-react';

// Extended color palette — stays vibrant in BOTH themes
const colors = {
  green: '#22C55E',
  greenBg: 'rgba(34,197,94,0.12)',
  red: '#EF4444',
  redBg: 'rgba(239,68,68,0.12)',
  blue: '#3B82F6',
  blueBg: 'rgba(59,130,246,0.12)',
  purple: '#7C3AED',
  purpleBg: 'rgba(124,58,237,0.12)',
  cyan: '#06B6D4',
  cyanBg: 'rgba(6,182,212,0.12)',
  pink: '#DB2777',
  pinkBg: 'rgba(219,39,119,0.12)',
  orange: '#EA580C',
  orangeBg: 'rgba(234,88,12,0.12)',
  teal: '#0D9488',
  tealBg: 'rgba(13,148,136,0.12)',
  yellow: '#EAB308',
  yellowBg: 'rgba(234,179,8,0.12)',
  // Fixed warm amber — always vibrant regardless of theme
  warmAlways: '#D97706',
  warmBg: 'rgba(217,119,6,0.10)',
};

// ============================================================================
// SHARED SUB-COMPONENTS (Polished UI)
// ============================================================================

function MkBadge({ text, color = colors.warmAlways, bg }) {
  const bgFinal = bg || `${color}18`;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 600,
        color: color,
        backgroundColor: bgFinal,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );
}

function MkNotConnectedBanner({ service, description, icon: Icon }) {
  return (
    <div
      style={{
        padding: '16px 20px',
        backgroundColor: colors.orangeBg,
        border: `1px solid ${colors.orange}`,
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
      }}
    >
      {Icon && <Icon size={20} style={{ color: colors.orange, flexShrink: 0, marginTop: '2px' }} />}
      <div>
        <div style={{ fontWeight: 700, color: T.txt, fontSize: '13px', marginBottom: '4px' }}>
          {service} — Preview Mode
        </div>
        <div style={{ fontSize: '12px', color: T.txtM, lineHeight: '1.5' }}>
          {description} The data shown below is placeholder content for layout preview purposes.
        </div>
      </div>
    </div>
  );
}

function MkStatCard({ label, value, sub, icon: Icon, color = colors.warmAlways }) {
  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: T.bgCard,
        border: `1px solid ${T.border}`,
        borderRadius: '12px',
        borderTop: `3px solid ${color}`,
        flex: 1,
        minWidth: 140,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: T.txtM,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </div>
        {Icon && (
          <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: `${color}14` }}>
            <Icon size={16} color={color} strokeWidth={2} />
          </div>
        )}
      </div>
      <div style={{ fontSize: '28px', fontWeight: 700, color: T.txt, letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '11px', color: T.txtM, marginTop: '6px' }}>{sub}</div>}
    </div>
  );
}

function MkBtn({ label, onClick, variant = 'primary', size = 'sm', icon: Icon }) {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isSmall = size === 'sm';

  let bgColor, textColor, borderColor;
  if (isPrimary) {
    bgColor = colors.warmAlways;
    textColor = '#FFFFFF';
    borderColor = colors.warmAlways;
  } else if (isDanger) {
    bgColor = 'transparent';
    textColor = colors.red;
    borderColor = `${colors.red}44`;
  } else {
    bgColor = T.bgElev;
    textColor = T.txt;
    borderColor = T.border;
  }

  return (
    <button
      onClick={onClick}
      style={{
        padding: isSmall ? '6px 14px' : '10px 20px',
        fontSize: isSmall ? '12px' : '13px',
        fontWeight: 600,
        color: textColor,
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        whiteSpace: 'nowrap',
      }}
    >
      {Icon && <Icon size={isSmall ? 13 : 15} strokeWidth={2} />}
      {label}
    </button>
  );
}

function MkTH({ children }) {
  return (
    <th
      style={{
        padding: '10px 16px',
        textAlign: 'left',
        fontSize: '10px',
        fontWeight: 700,
        color: T.txtM,
        borderBottom: `2px solid ${T.border}`,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}
    >
      {children}
    </th>
  );
}

// ============================================================================
// MODULE 1: OUTREACH & CLAIMS
// ============================================================================

function MkToast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
      padding: '12px 20px', borderRadius: '10px',
      backgroundColor: toast.type === 'error' ? colors.red : toast.type === 'info' ? colors.blue : colors.green,
      color: '#FFFFFF', fontSize: '13px', fontWeight: 600,
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)', maxWidth: '380px',
    }}>
      {toast.msg}
    </div>
  );
}

function OutreachModule() {
  const [activeScreen, setActiveScreen] = useState('queue');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [claims, setClaims] = useState([]);
  const [users, setUsers] = useState([]);
  const [guitars, setGuitars] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  // Extract workflow state
  const [extractUrl, setExtractUrl] = useState('');
  const [extractLoading, setExtractLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [extractedGuitar, setExtractedGuitar] = useState({
    make: '', model: '', year: '', color: '', serial: '',
  });
  const [outreachRecipientEmail, setOutreachRecipientEmail] = useState('');
  const [manualTextMode, setManualTextMode] = useState(false);
  const [manualText, setManualText] = useState('');
  const [extractedStory, setExtractedStory] = useState('');
  const [outreachMessageEn, setOutreachMessageEn] = useState('');
  const [outreachMessageHe, setOutreachMessageHe] = useState('');
  const [messageLanguage, setMessageLanguage] = useState('en');
  const [savedExtractions, setSavedExtractions] = useState([]);
  const [extractionAction, setExtractionAction] = useState(null); // 'saving' or 'sending'

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Fetch real data from Supabase
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [claimsRes, usersRes, guitarsRes] = await Promise.all([
          supabase
            .from('ownership_claims')
            .select('*, claimer:claimant_id(username), guitar:instrument_id(make, model, year)')
            .order('created_at', { ascending: false })
            .limit(20),
          supabase
            .from('users')
            .select('id, username, created_at')
            .order('created_at', { ascending: true })
            .limit(50),
          supabase
            .from('instruments')
            .select('id, make, model, year, serial_number, moderation_status, created_at, current_owner:current_owner_id(username)')
            .eq('moderation_status', 'approved')
            .order('created_at', { ascending: false })
            .limit(20),
        ]);
        setClaims(claimsRes.data || []);
        setUsers(usersRes.data || []);
        setGuitars(guitarsRes.data || []);
      } catch (e) {
        console.error('Outreach fetch error:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Approve or reject a claim
  const handleClaimAction = useCallback(async (claimId, action) => {
    setProcessingId(claimId);
    try {
      const { error } = await supabase
        .from('ownership_claims')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          rejection_reason: action === 'reject' ? 'Rejected by admin' : null,
        })
        .eq('id', claimId);
      if (error) throw error;
      setClaims(prev =>
        prev.map(c => c.id === claimId ? { ...c, status: action === 'approve' ? 'approved' : 'rejected' } : c)
      );
      showToast(`Claim ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
    } catch (e) {
      showToast(`Failed: ${e.message}`, 'error');
    } finally {
      setProcessingId(null);
    }
  }, [showToast]);

  // Copy suggested DM text
  const handleCopyDm = useCallback((dm, name) => {
    navigator.clipboard.writeText(dm).then(() => {
      showToast(`DM copied for ${name} — paste in your messaging app`);
    }).catch(() => showToast('Failed to copy', 'error'));
  }, [showToast]);

  // Verify a guitar via Edge Function
  const handleVerifyGuitar = useCallback(async (guitar) => {
    setProcessingId(guitar.id);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const response = await fetch(`${supabaseUrl}/functions/v1/verify-guitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${supabaseKey}` },
        body: JSON.stringify({
          guitarId: guitar.id, brand: guitar.make, model: guitar.model,
          year: guitar.year, serialNumber: guitar.serial_number, photoUrls: [],
        }),
      });
      const data = await response.json();
      showToast(`Verified: ${data.score ? Math.round(data.score * 100) : 0}% confidence — ${data.verified ? 'PASSED' : 'Issues found'}`);
    } catch (e) {
      showToast(`Verification failed: ${e.message}`, 'error');
    } finally {
      setProcessingId(null);
    }
  }, [showToast]);

  // Extract post — accepts URL scrape or manual text
  const handleExtractPost = useCallback(async (useManualText = false) => {
    if (!useManualText && !extractUrl.trim()) {
      showToast('Please enter a URL', 'error');
      return;
    }
    if (useManualText && !manualText.trim()) {
      showToast('Please paste the post text', 'error');
      return;
    }
    setExtractLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const payload = useManualText
        ? {
            text: manualText,
            source_url: extractUrl || undefined,
            source_author: extractedData?.manualAuthor || undefined,
            source: extractedData?.manualSource || 'reddit',
          }
        : { url: extractUrl };

      const response = await fetch(`${supabaseUrl}/functions/v1/extract-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || 'Extraction failed');
      }
      const data = await response.json();
      console.log('[extract-post] Response:', JSON.stringify(data, null, 2));

      // Handle scrape failure — offer manual paste
      if (data.scrapeError) {
        showToast('Could not scrape this URL. Paste the post text below instead.', 'error');
        setManualTextMode(true);
        setExtractLoading(false);
        return;
      }

      setExtractedData(data);
      setManualTextMode(false);
      const gi = data.guitarInfo || data.guitar || data.data || {};
      console.log('[extract-post] Guitar info:', gi);
      setExtractedGuitar({
        make: gi.make || gi.brand || '',
        model: gi.model || '',
        year: gi.year || '',
        color: gi.color || '',
        serial: gi.serial || '',
      });
      setExtractedStory(gi.story || data.data?.story || '');
      setOutreachMessageEn(data.outreach?.en || data.data?.outreach_message_en || '');
      setOutreachMessageHe(data.outreach?.he || data.data?.outreach_message_he || '');

      // Warn if extraction succeeded but no guitar info was found
      const hasAnyField = gi.make || gi.brand || gi.model || gi.year || gi.color || gi.story;
      if (hasAnyField) {
        showToast('Guitar info extracted successfully');
      } else {
        showToast('Post scraped but no guitar details found. Try pasting the text manually.', 'error');
        setManualTextMode(true);
      }
    } catch (e) {
      showToast(`Extraction failed: ${e.message}`, 'error');
    } finally {
      setExtractLoading(false);
    }
  }, [extractUrl, manualText, showToast]);

  // Save extracted data to database
  const handleSaveExtraction = useCallback(async () => {
    if (!extractedData) {
      showToast('No extraction to save', 'error');
      return;
    }
    setExtractionAction('saving');
    try {
      const { error } = await supabase.from('instruments').insert([
        {
          make: extractedGuitar.make || null,
          model: extractedGuitar.model || null,
          year: extractedGuitar.year || null,
          description: extractedStory || null,
          custom_fields: {
            extraction_source: extractedData?.data?.source || 'unknown',
            extraction_source_url: extractUrl,
            extraction_source_author: extractedData?.data?.source_author || null,
          },
          moderation_status: 'pending',
          uploader_id: (await supabase.auth.getUser()).data.user?.id || null,
          current_owner_id: null,
        },
      ]);
      if (error) throw error;
      showToast('Extraction saved to database');
      setExtractUrl('');
      setExtractedData(null);
      // Refetch saved extractions
      await fetchSavedExtractions();
    } catch (e) {
      showToast(`Save failed: ${e.message}`, 'error');
    } finally {
      setExtractionAction(null);
    }
  }, [extractUrl, extractedData, extractedGuitar, extractedStory, outreachMessageEn, outreachMessageHe, showToast]);

  // Send outreach — either via email (if address provided) or log as manual DM
  const handleSendOutreach = useCallback(async (recipientEmail) => {
    if (!extractedData) {
      showToast('No extraction data', 'error');
      return;
    }
    setExtractionAction('sending');
    try {
      const message = messageLanguage === 'en' ? outreachMessageEn : outreachMessageHe;
      const method = recipientEmail ? 'email' : 'manual';

      if (recipientEmail) {
        // Send via email Edge Function
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            to: recipientEmail,
            subject: 'Your guitar deserves to be documented — TWNG',
            html: message.replace(/\n/g, '<br>'),
          }),
        });
        if (!response.ok) throw new Error('Email send failed');
      }

      // Log to outreach_log
      const guitarId = extractedData?.data?.id;
      if (guitarId) {
        await supabase.from('outreach_log').insert([{
          unclaimed_guitar_id: guitarId,
          method,
          recipient: recipientEmail || extractedData?.data?.source_author || 'unknown',
          subject: 'Your guitar deserves to be documented — TWNG',
          message_body: message,
          language: messageLanguage,
          status: recipientEmail ? 'sent' : 'pending',
          sent_at: recipientEmail ? new Date().toISOString() : null,
        }]);
      }

      showToast(recipientEmail ? 'Outreach email sent' : 'Outreach logged — copy the message to send manually');
    } catch (e) {
      showToast(`Outreach failed: ${e.message}`, 'error');
    } finally {
      setExtractionAction(null);
    }
  }, [extractedData, messageLanguage, outreachMessageEn, outreachMessageHe, showToast]);

  // Copy outreach message to clipboard
  const handleCopyOutreachMessage = useCallback(() => {
    const message = messageLanguage === 'en' ? outreachMessageEn : outreachMessageHe;
    navigator.clipboard.writeText(message).then(() => {
      showToast('Outreach message copied to clipboard');
    }).catch(() => showToast('Failed to copy', 'error'));
  }, [messageLanguage, outreachMessageEn, outreachMessageHe, showToast]);

  // Fetch saved extractions
  const fetchSavedExtractions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('instruments')
        .select('*')
        .is('current_owner_id', null)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setSavedExtractions(data || []);
    } catch (e) {
      console.error('Fetch saved extractions error:', e);
    }
  }, []);

  // Load saved extraction
  const handleLoadExtraction = useCallback((extraction) => {
    setExtractUrl(extraction.source_url);
    setExtractedData({
      platform: extraction.source_platform,
      author_email: extraction.author_email,
      story: extraction.story,
      guitar: {
        make: extraction.make,
        model: extraction.guitar_model,
        year: extraction.guitar_year,
        color: extraction.guitar_color,
      },
    });
    setExtractedGuitar({
      make: extraction.make,
      model: extraction.guitar_model,
      year: extraction.guitar_year || '',
      color: extraction.guitar_color,
    });
    setExtractedStory(extraction.story);
    setOutreachMessageEn(extraction.outreach_message_en);
    setOutreachMessageHe(extraction.outreach_message_he);
    showToast('Extraction loaded');
  }, [showToast]);

  // Fetch saved extractions on mount
  useEffect(() => {
    fetchSavedExtractions();
  }, [fetchSavedExtractions]);

  const loadingRow = (
    <div style={{ padding: '40px', textAlign: 'center', color: T.txtM, fontSize: '13px' }}>
      Loading data from Supabase...
    </div>
  );

  const outreachTabs = (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
      {[
        { key: 'queue', label: 'Outreach Queue' },
        { key: 'extract', label: 'Create Outreach' },
        { key: 'claims', label: 'Claim Reviews' },
        { key: 'founding', label: 'Founding Members' },
        { key: 'verification', label: 'Verification' },
        { key: 'influencers', label: 'Influencers' },
      ].map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveScreen(tab.key)}
          style={{
            padding: '8px 16px',
            backgroundColor: activeScreen === tab.key ? colors.warmAlways : 'transparent',
            color: activeScreen === tab.key ? '#FFFFFF' : T.txt,
            border: `1px solid ${activeScreen === tab.key ? colors.warmAlways : T.border}`,
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  if (activeScreen === 'queue') {
    const outreachItems = guitars.map(g => ({
      id: g.id,
      name: g.owner?.username || 'Unknown',
      guitar: `${g.make} ${g.model}`,
      year: g.year,
      suggestedDm: `Hey! Love your ${g.make} ${g.model}${g.year ? ` (${g.year})` : ''}. We're building TWNG — a platform where guitar owners document their instruments. Would you like to claim yours?`,
    }));
    return (
      <div>
        {outreachTabs}
        <MkToast toast={toast} />
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '4px' }}>
            Outreach Queue
          </h2>
          <div style={{ fontSize: '12px', color: T.txtM, marginBottom: '16px' }}>
            {loading ? 'Loading...' : `${outreachItems.length} guitar owners from Supabase — click "Copy DM" to copy message`}
          </div>
          {loading ? loadingRow : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                <MkTH>Owner</MkTH>
                <MkTH>Guitar</MkTH>
                <MkTH>Year</MkTH>
                <MkTH>Suggested DM</MkTH>
                <MkTH>Action</MkTH>
              </tr>
            </thead>
            <tbody>
              {outreachItems.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: T.txtM, fontSize: '13px' }}>No guitars in database yet</td></tr>
              ) : outreachItems.map((item) => (
                <tr key={item.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ padding: '12px 16px', color: T.txt, fontSize: '13px', fontWeight: 600 }}>
                    {item.name}
                  </td>
                  <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                    {item.guitar}
                  </td>
                  <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                    {item.year || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '12px', maxWidth: '280px' }}>
                    {item.suggestedDm.length > 80 ? item.suggestedDm.slice(0, 80) + '...' : item.suggestedDm}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                    <button
                      onClick={() => handleCopyDm(item.suggestedDm, item.name)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: colors.warmAlways,
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Copy DM
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>
    );
  }

  if (activeScreen === 'claims') {
    const statusColor = (s) => s === 'approved' ? colors.green : s === 'rejected' ? colors.red : colors.orange;
    const statusBg = (s) => s === 'approved' ? colors.greenBg : s === 'rejected' ? colors.redBg : colors.orangeBg;
    return (
      <div>
        {outreachTabs}
        <MkToast toast={toast} />
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '4px' }}>
            Claim Requests
          </h2>
          <div style={{ fontSize: '12px', color: T.txtM, marginBottom: '16px' }}>
            {loading ? 'Loading...' : `${claims.length} claims from Supabase`}
          </div>
          {loading ? loadingRow : claims.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: T.txtM, fontSize: '13px',
              backgroundColor: T.bgCard, borderRadius: '10px', border: `1px solid ${T.border}` }}>
              No claims submitted yet
            </div>
          ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {claims.map((claim) => (
              <div
                key={claim.id}
                style={{
                  padding: '16px',
                  backgroundColor: T.bgCard,
                  border: `1px solid ${T.border}`,
                  borderRadius: '6px',
                }}
              >
                <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 700, color: T.txt }}>
                    {claim.claimer?.username || 'Unknown'}
                  </div>
                  <MkBadge
                    text={claim.status}
                    color={statusColor(claim.status)}
                    bg={statusBg(claim.status)}
                  />
                </div>
                <div style={{ fontSize: '13px', color: T.txt2, marginBottom: '8px' }}>
                  {claim.guitar ? `${claim.guitar.make} ${claim.guitar.model}${claim.guitar.year ? ` (${claim.guitar.year})` : ''}` : 'Unknown guitar'}
                </div>
                <div style={{ fontSize: '12px', color: T.txtM, marginBottom: '12px' }}>
                  Type: {claim.verification_type || 'Not specified'} • {new Date(claim.created_at).toLocaleDateString()}
                </div>
                {claim.claim_reason && (
                  <div style={{ fontSize: '12px', color: T.txt2, marginBottom: '12px', fontStyle: 'italic' }}>
                    "{claim.claim_reason}"
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {claim.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleClaimAction(claim.id, 'approve')}
                        disabled={processingId === claim.id}
                        style={{
                          flex: 1, padding: '8px',
                          backgroundColor: processingId === claim.id ? T.txtM : colors.green,
                          color: '#FFFFFF', border: 'none', borderRadius: '8px',
                          fontSize: '11px', fontWeight: 600,
                          cursor: processingId === claim.id ? 'wait' : 'pointer',
                        }}
                      >
                        {processingId === claim.id ? '...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleClaimAction(claim.id, 'reject')}
                        disabled={processingId === claim.id}
                        style={{
                          flex: 1, padding: '8px',
                          backgroundColor: processingId === claim.id ? T.txtM : colors.red,
                          color: '#FFFFFF', border: 'none', borderRadius: '8px',
                          fontSize: '11px', fontWeight: 600,
                          cursor: processingId === claim.id ? 'wait' : 'pointer',
                        }}
                      >
                        {processingId === claim.id ? '...' : 'Deny'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
    );
  }

  if (activeScreen === 'founding') {
    return (
      <div>
        {outreachTabs}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', color: T.txtM, marginBottom: '8px' }}>
              Progress to 50 Founding Members
            </div>
            <div style={{ height: '8px', backgroundColor: T.border, borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ height: '100%', backgroundColor: colors.warmAlways, width: `${(users.length / 50) * 100}%` }} />
            </div>
            <div style={{ fontSize: '12px', color: T.txt, marginTop: '8px' }}>
              {loading ? '...' : users.length} / 50
            </div>
          </div>
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          Founding Members
        </h2>
        {loading ? loadingRow : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              <MkTH>User</MkTH>
              <MkTH>Display Name</MkTH>
              <MkTH>Badge</MkTH>
              <MkTH>Joined</MkTH>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: T.txtM, fontSize: '13px' }}>No users yet</td></tr>
            ) : users.map((member, i) => (
              <tr key={member.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: '12px 16px', color: T.txt, fontSize: '13px', fontWeight: 600 }}>
                  @{member.username}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <MkBadge text={i < 10 ? 'Diamond' : i < 25 ? 'Platinum' : 'Gold'} color={colors.warmAlways} />
                </td>
                <td style={{ padding: '12px 16px', color: T.txtM, fontSize: '13px' }}>
                  {new Date(member.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    );
  }

  if (activeScreen === 'verification') {
    return (
      <div>
        {outreachTabs}
        <MkToast toast={toast} />
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '4px' }}>
          Guitar Verification
        </h2>
        <div style={{ fontSize: '12px', color: T.txtM, marginBottom: '16px' }}>
          {loading ? 'Loading...' : `${guitars.length} guitars — AI verification via Claude Sonnet`}
        </div>
        {loading ? loadingRow : guitars.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: T.txtM, fontSize: '13px',
            backgroundColor: T.bgCard, borderRadius: '10px', border: `1px solid ${T.border}` }}>
            No guitars to verify
          </div>
        ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {guitars.map((g) => (
            <div
              key={g.id}
              style={{
                padding: '16px',
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
              }}
            >
              <div style={{ marginBottom: '8px', fontWeight: 700, color: T.txt }}>
                {g.make} {g.model}
              </div>
              <div style={{ fontSize: '12px', color: T.txt2, marginBottom: '4px' }}>
                Year: {g.year || '—'} • Serial: {g.serial_number || '—'}
              </div>
              <div style={{ fontSize: '12px', color: T.txtM, marginBottom: '12px' }}>
                Owner: {g.owner?.username || 'Unknown'}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleVerifyGuitar(g)}
                  disabled={processingId === g.id}
                  style={{
                    flex: 1, padding: '8px',
                    backgroundColor: processingId === g.id ? T.txtM : colors.green,
                    color: '#FFFFFF', border: 'none', borderRadius: '8px',
                    fontSize: '11px', fontWeight: 600,
                    cursor: processingId === g.id ? 'wait' : 'pointer',
                  }}
                >
                  {processingId === g.id ? 'Verifying...' : 'Verify'}
                </button>
                <button
                  onClick={() => showToast('Guitar flagged for manual review', 'info')}
                  style={{
                    flex: 1, padding: '8px',
                    backgroundColor: colors.red, color: '#FFFFFF',
                    border: 'none', borderRadius: '8px',
                    fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Flag
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    );
  }

  if (activeScreen === 'extract') {
    return (
      <div>
        {outreachTabs}
        <MkToast toast={toast} />
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '4px' }}>
            Create Outreach
          </h2>
          <div style={{ fontSize: '12px', color: T.txtM, marginBottom: '16px' }}>
            Paste a URL → AI extracts guitar info automatically → review & send outreach
          </div>

          {/* URL Input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: T.txt, marginBottom: '8px' }}>
              Post URL
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="https://reddit.com/r/guitars/comments/..."
                value={extractUrl}
                onChange={(e) => setExtractUrl(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  backgroundColor: T.bgCard,
                  border: `1px solid ${T.border}`,
                  borderRadius: '8px',
                  color: T.txt,
                  fontSize: '13px',
                }}
              />
              <button
                onClick={() => handleExtractPost(false)}
                disabled={extractLoading || !extractUrl.trim()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: extractLoading ? T.txtM : !extractUrl.trim() ? T.txtM : colors.warmAlways,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: extractLoading || !extractUrl.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {extractLoading ? 'Extracting...' : 'Extract'}
              </button>
            </div>

            {/* Manual text fallback — shows when scrape fails */}
            {manualTextMode && (
              <div style={{ marginTop: '12px', padding: '14px', backgroundColor: T.bgDeep, borderRadius: '8px', border: `1px solid ${colors.warmAlways}40` }}>
                <p style={{ color: colors.warmAlways, fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                  Scraping blocked — paste the post text below as fallback:
                </p>
                <textarea
                  placeholder="Copy the post text from the page and paste here..."
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  style={{ width: '100%', padding: '10px', backgroundColor: T.bgElev, border: `1px solid ${T.border}`, borderRadius: '6px', color: T.txt, fontSize: '12px', fontFamily: 'inherit', minHeight: '100px', resize: 'vertical' }}
                />
                <button
                  onClick={() => handleExtractPost(true)}
                  disabled={extractLoading || !manualText.trim()}
                  style={{ marginTop: '8px', padding: '8px 16px', backgroundColor: extractLoading ? T.txtM : colors.warmAlways, color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {extractLoading ? 'Extracting...' : 'Extract from Text'}
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Review Results */}
          {extractedData && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Left Column: Guitar Info */}
              <div>
                <div style={{
                  padding: '16px',
                  backgroundColor: T.bgCard,
                  border: `1px solid ${T.border}`,
                  borderRadius: '8px',
                  marginBottom: '16px',
                }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: T.txt, marginBottom: '12px' }}>
                    Guitar Information
                  </h3>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: T.txtM, marginBottom: '4px' }}>
                      Brand
                    </label>
                    <input
                      type="text"
                      value={extractedGuitar.make}
                      onChange={(e) => setExtractedGuitar({ ...extractedGuitar, make: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        backgroundColor: T.bgElev,
                        border: `1px solid ${T.border}`,
                        borderRadius: '6px',
                        color: T.txt,
                        fontSize: '12px',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: T.txtM, marginBottom: '4px' }}>
                      Model
                    </label>
                    <input
                      type="text"
                      value={extractedGuitar.model}
                      onChange={(e) => setExtractedGuitar({ ...extractedGuitar, model: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        backgroundColor: T.bgElev,
                        border: `1px solid ${T.border}`,
                        borderRadius: '6px',
                        color: T.txt,
                        fontSize: '12px',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: T.txtM, marginBottom: '4px' }}>
                      Year
                    </label>
                    <input
                      type="text"
                      value={extractedGuitar.year}
                      onChange={(e) => setExtractedGuitar({ ...extractedGuitar, year: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        backgroundColor: T.bgElev,
                        border: `1px solid ${T.border}`,
                        borderRadius: '6px',
                        color: T.txt,
                        fontSize: '12px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: T.txtM, marginBottom: '4px' }}>
                      Color
                    </label>
                    <input
                      type="text"
                      value={extractedGuitar.color}
                      onChange={(e) => setExtractedGuitar({ ...extractedGuitar, color: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        backgroundColor: T.bgElev,
                        border: `1px solid ${T.border}`,
                        borderRadius: '6px',
                        color: T.txt,
                        fontSize: '12px',
                      }}
                    />
                  </div>
                </div>

                {/* Story */}
                <div style={{
                  padding: '16px',
                  backgroundColor: T.bgCard,
                  border: `1px solid ${T.border}`,
                  borderRadius: '8px',
                }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: T.txt, marginBottom: '8px' }}>
                    Story / Description
                  </label>
                  <textarea
                    value={extractedStory}
                    onChange={(e) => setExtractedStory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: T.bgElev,
                      border: `1px solid ${T.border}`,
                      borderRadius: '6px',
                      color: T.txt,
                      fontSize: '12px',
                      fontFamily: 'inherit',
                      minHeight: '120px',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>

              {/* Right Column: Outreach Messages */}
              <div>
                <div style={{
                  padding: '16px',
                  backgroundColor: T.bgCard,
                  border: `1px solid ${T.border}`,
                  borderRadius: '8px',
                }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: T.txt, marginBottom: '12px' }}>
                    Outreach Message
                  </h3>

                  {/* Language tabs */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', borderBottom: `1px solid ${T.border}`, paddingBottom: '12px' }}>
                    <button
                      onClick={() => setMessageLanguage('en')}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: messageLanguage === 'en' ? colors.warmAlways : 'transparent',
                        color: messageLanguage === 'en' ? '#FFFFFF' : T.txt,
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setMessageLanguage('he')}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: messageLanguage === 'he' ? colors.warmAlways : 'transparent',
                        color: messageLanguage === 'he' ? '#FFFFFF' : T.txt,
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Hebrew
                    </button>
                  </div>

                  <textarea
                    value={messageLanguage === 'en' ? outreachMessageEn : outreachMessageHe}
                    onChange={(e) => messageLanguage === 'en' ? setOutreachMessageEn(e.target.value) : setOutreachMessageHe(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: T.bgElev,
                      border: `1px solid ${T.border}`,
                      borderRadius: '6px',
                      color: T.txt,
                      fontSize: '12px',
                      fontFamily: 'inherit',
                      minHeight: '200px',
                      resize: 'vertical',
                    }}
                  />

                  {/* Copy for DM */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      onClick={() => { handleCopyOutreachMessage(); handleSendOutreach(); }}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        backgroundColor: colors.blue,
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      }}
                    >
                      <Copy size={14} /> Copy & Log as DM
                    </button>
                  </div>

                  {/* Or send via email */}
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: T.bgDeep, borderRadius: '8px' }}>
                    <p style={{ color: T.txt2, fontSize: '11px', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Or send via email</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="email"
                        placeholder="recipient@email.com"
                        value={outreachRecipientEmail}
                        onChange={(e) => setOutreachRecipientEmail(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          backgroundColor: T.bgElev,
                          border: `1px solid ${T.border}`,
                          borderRadius: '6px',
                          color: T.txt,
                          fontSize: '12px',
                        }}
                      />
                      <button
                        onClick={() => handleSendOutreach(outreachRecipientEmail)}
                        disabled={extractionAction === 'sending' || !outreachRecipientEmail.trim()}
                        style={{
                          padding: '8px 14px',
                          backgroundColor: !outreachRecipientEmail.trim() ? T.txtM : extractionAction === 'sending' ? T.txtM : colors.green,
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: !outreachRecipientEmail.trim() ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {extractionAction === 'sending' ? 'Sending...' : 'Send Email'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveExtraction}
                  disabled={extractionAction === 'saving'}
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '12px',
                    backgroundColor: extractionAction === 'saving' ? T.txtM : colors.warmAlways,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: extractionAction === 'saving' ? 'wait' : 'pointer',
                  }}
                >
                  {extractionAction === 'saving' ? 'Saving...' : 'Save to Database'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Saved Extractions */}
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: T.txt, marginBottom: '12px' }}>
            Recent Extractions ({savedExtractions.length})
          </h3>
          {savedExtractions.length === 0 ? (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: T.txtM,
              fontSize: '13px',
              backgroundColor: T.bgCard,
              borderRadius: '8px',
              border: `1px solid ${T.border}`,
            }}>
              No extractions yet
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {savedExtractions.map((extraction) => (
                <div
                  key={extraction.id}
                  style={{
                    padding: '16px',
                    backgroundColor: T.bgCard,
                    border: `1px solid ${T.border}`,
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: T.txt, fontSize: '13px' }}>
                        {extraction.make} {extraction.guitar_model}
                      </div>
                      <div style={{ fontSize: '11px', color: T.txtM, marginTop: '4px' }}>
                        {extraction.source_platform}
                      </div>
                    </div>
                    <MkBadge
                      text={extraction.status}
                      color={extraction.status === 'claimed' ? colors.green : colors.orange}
                    />
                  </div>
                  <div style={{ fontSize: '11px', color: T.txt2, marginBottom: '12px' }}>
                    {new Date(extraction.created_at).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => handleLoadExtraction(extraction)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      backgroundColor: colors.blue,
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Load & Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeScreen === 'influencers') {
    const influencers = [
      { id: 1, handle: '@guitar_collector_pro', followers: '523K', guitars: 12, engagement: '6.2%', tier: 'Macro' },
      { id: 2, handle: '@vintage_tone_hunter', followers: '148K', guitars: 8, engagement: '8.5%', tier: 'Micro' },
      { id: 3, handle: '@luthier_stories', followers: '45K', guitars: 5, engagement: '12.1%', tier: 'Nano' },
    ];
    return (
      <div>
        {outreachTabs}
        <MkToast toast={toast} />
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          Influencer Pipeline
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {influencers.map((inf) => (
            <div
              key={inf.id}
              style={{
                padding: '16px',
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontWeight: 700, color: T.txt, fontSize: '14px' }}>
                    {inf.handle}
                  </div>
                  <div style={{ fontSize: '12px', color: T.txtM, marginTop: '4px' }}>
                    {inf.followers} followers
                  </div>
                </div>
                <MkBadge text={inf.tier} color={colors.warmAlways} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: T.txtM }}>Guitars</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: T.txt }}>
                    {inf.guitars}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: T.txtM }}>Engagement</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: colors.green }}>
                    {inf.engagement}
                  </div>
                </div>
              </div>
              <button
                onClick={() => showToast(`${inf.handle} added to campaign pipeline`, 'info')}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: colors.warmAlways,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Add to Campaign
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback — should not reach here, but just in case
  return (
    <div>
      {outreachTabs}
      <p style={{ color: T.txtM, fontSize: '13px' }}>Select a tab above.</p>
    </div>
  );
}

// ============================================================================
// MODULE 2: AUTOMATION ENGINE
// ============================================================================

function AutomationModule() {
  const [activeScreen, setActiveScreen] = useState('overview');
  const [expandedSystem, setExpandedSystem] = useState(null);

  const systems = [
    {
      id: 'A',
      name: 'Guitar Detection & Tagging',
      status: 'Active',
      runs: 1247,
      cost: '$342',
      pipeline: Array.from({ length: 12 }, (_, i) => ({
        step: i + 1,
        name: `Step ${i + 1}`,
        status: i < 10 ? 'complete' : 'pending',
      })),
    },
    {
      id: 'B',
      name: 'Engagement Scoring',
      status: 'Active',
      runs: 892,
      cost: '$156',
      pipeline: Array.from({ length: 8 }, (_, i) => ({ step: i + 1, name: `Step ${i + 1}`, status: 'complete' })),
    },
    {
      id: 'C',
      name: 'Content Classification',
      status: 'Paused',
      runs: 523,
      cost: '$89',
      pipeline: Array.from({ length: 6 }, (_, i) => ({ step: i + 1, name: `Step ${i + 1}`, status: i < 4 ? 'complete' : 'pending' })),
    },
    {
      id: 'D',
      name: 'Influencer Matching',
      status: 'Active',
      runs: 734,
      cost: '$201',
      pipeline: Array.from({ length: 9 }, (_, i) => ({ step: i + 1, name: `Step ${i + 1}`, status: 'complete' })),
    },
    {
      id: 'E',
      name: 'Claim Verification',
      status: 'Active',
      runs: 456,
      cost: '$112',
      pipeline: Array.from({ length: 7 }, (_, i) => ({ step: i + 1, name: `Step ${i + 1}`, status: 'complete' })),
    },
  ];

  const runHistory = [
    { id: 1, system: 'A', timestamp: '2024-01-15 14:32', duration: '2m 34s', status: 'Success', records: 1247 },
    { id: 2, system: 'B', timestamp: '2024-01-15 14:28', duration: '1m 12s', status: 'Success', records: 892 },
    { id: 3, system: 'A', timestamp: '2024-01-15 14:00', duration: '2m 18s', status: 'Success', records: 1156 },
    { id: 4, system: 'D', timestamp: '2024-01-15 13:45', duration: '3m 01s', status: 'Success', records: 734 },
    { id: 5, system: 'C', timestamp: '2024-01-15 13:22', duration: '1m 44s', status: 'Failed', records: 0 },
  ];

  if (activeScreen === 'overview') {
    return (
      <div>
        <MkNotConnectedBanner
          service="Automation Engine"
          description="Automation workflows require integration with a task runner or serverless backend (e.g., Supabase Edge Functions, n8n, or Zapier). This module will become functional once an automation provider is connected."
          icon={Zap}
        />
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          Automation Systems Overview
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {systems.map((sys) => (
            <div
              key={sys.id}
              style={{
                padding: '16px',
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
              }}
              onClick={() => {
                setExpandedSystem(sys.id);
                setActiveScreen('system');
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div style={{ fontWeight: 700, color: T.txt, fontSize: '14px' }}>
                  {sys.name}
                </div>
                <MkBadge
                  text={sys.status}
                  color={sys.status === 'Active' ? colors.green : colors.yellow}
                  bg={sys.status === 'Active' ? colors.greenBg : colors.yellowBg}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: T.txtM }}>Total Runs</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: T.txt }}>
                    {sys.runs}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: T.txtM }}>Cost</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: T.warm }}>
                    {sys.cost}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeScreen === 'system') {
    const system = systems.find((s) => s.id === expandedSystem);
    if (!system) return null;

    return (
      <div>
        <button
          onClick={() => setActiveScreen('overview')}
          style={{
            marginBottom: '16px',
            padding: '8px 12px',
            backgroundColor: 'transparent',
            color: colors.blue,
            border: `1px solid ${colors.blue}`,
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ← Back to Overview
        </button>

        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '24px' }}>
          {system.name} - Pipeline Visualization
        </h2>

        <div style={{ marginBottom: '32px', padding: '16px', backgroundColor: T.bgCard, borderRadius: '6px', border: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {system.pipeline.map((step) => (
              <div key={step.step} style={{ flex: '1 1 auto', minWidth: '60px' }}>
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: step.status === 'complete' ? colors.greenBg : colors.yellowBg,
                    borderLeft: `3px solid ${step.status === 'complete' ? colors.green : colors.yellow}`,
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: step.status === 'complete' ? colors.green : colors.yellow,
                  }}
                >
                  {step.step}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <MkStatCard label="Total Runs" value={system.runs.toString()} icon={Zap} color={colors.blue} />
          <MkStatCard label="Cost" value={system.cost} icon={DollarSign} color={colors.blue} />
          <MkStatCard label="Status" value={system.status} icon={CheckCircle} color={colors.blue} />
        </div>

        <h3 style={{ fontSize: '14px', fontWeight: 700, color: T.txt, marginBottom: '12px' }}>
          Recent Runs
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              <MkTH>Timestamp</MkTH>
              <MkTH>Duration</MkTH>
              <MkTH>Status</MkTH>
              <MkTH>Records</MkTH>
            </tr>
          </thead>
          <tbody>
            {runHistory
              .filter((r) => r.system === system.id)
              .map((run) => (
                <tr key={run.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                    {run.timestamp}
                  </td>
                  <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                    {run.duration}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <MkBadge
                      text={run.status}
                      color={run.status === 'Success' ? colors.green : colors.red}
                      bg={run.status === 'Success' ? colors.greenBg : colors.redBg}
                    />
                  </td>
                  <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                    {run.records}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}

// ============================================================================
// MODULE 3: CONTENT HUB
// ============================================================================

function ContentModule() {
  const [activeScreen, setActiveScreen] = useState('seeds');
  const [seededGuitars, setSeededGuitars] = useState([]);
  const [articles, setArticles] = useState([]);
  const [contentLoading, setContentLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [instrRes, artRes] = await Promise.all([
          supabase.from('instruments').select('id, make, model, year, serial_number, created_at').is('deleted_at', null).order('created_at', { ascending: false }).limit(50),
          supabase.from('articles').select('id, title, status, view_count, likes_count, is_published, published_at, created_at').order('created_at', { ascending: false }).limit(50),
        ]);
        if (instrRes.data) {
          setSeededGuitars(instrRes.data.map((g, i) => ({
            id: g.id,
            model: `${g.make || ''} ${g.model || ''}`.trim() || 'Unknown',
            year: g.year || '—',
            serial: g.serial_number || '—',
          })));
        }
        if (artRes.data) {
          setArticles(artRes.data.map((a) => ({
            id: a.id,
            title: a.title || 'Untitled',
            status: a.is_published ? 'Published' : (a.status === 'draft' ? 'Draft' : (a.status || 'Draft')),
            views: a.view_count || 0,
            likes: a.likes_count || 0,
          })));
        }
      } catch (e) {
        console.error('Content fetch error:', e);
      } finally {
        setContentLoading(false);
      }
    })();
  }, []);

  const cmsFeatures = [
    { id: 1, name: 'Drag & Drop Editor', status: 'Active', version: 'v2.1' },
    { id: 2, name: 'Auto-Tagging System', status: 'Active', version: 'v1.8' },
    { id: 3, name: 'SEO Optimizer', status: 'Active', version: 'v3.2' },
    { id: 4, name: 'Schedule Publishing', status: 'Active', version: 'v1.5' },
    { id: 5, name: 'Analytics Dashboard', status: 'Planned', version: 'v1.0' },
    { id: 6, name: 'Multi-language Support', status: 'In Dev', version: 'v0.9' },
    { id: 7, name: 'AI Writing Assistant', status: 'Active', version: 'v2.3' },
  ];

  const calendarWeek = [
    { day: 'Mon', date: '1/15', posts: 2, status: 'scheduled' },
    { day: 'Tue', date: '1/16', posts: 3, status: 'scheduled' },
    { day: 'Wed', date: '1/17', posts: 1, status: 'scheduled' },
    { day: 'Thu', date: '1/18', posts: 2, status: 'scheduled' },
    { day: 'Fri', date: '1/19', posts: 4, status: 'scheduled' },
    { day: 'Sat', date: '1/20', posts: 1, status: 'scheduled' },
    { day: 'Sun', date: '1/21', posts: 2, status: 'open' },
  ];

  const ugcItems = [
    { id: 1, creator: '@guitar_creator_1', title: 'Acoustic Jam', status: 'Approved', views: 5200 },
    { id: 2, creator: '@guitar_creator_2', title: 'Metal Riff', status: 'Pending', views: 0 },
    { id: 3, creator: '@guitar_creator_3', title: 'Jazz Standards', status: 'Approved', views: 3850 },
  ];

  const forumPosts = [
    { id: 1, author: '@forum_user_1', title: 'Best Budget Acoustics 2024', replies: 12, views: 456 },
    { id: 2, author: '@forum_user_2', title: 'String Maintenance Tips', replies: 8, views: 234 },
    { id: 3, author: '@forum_user_3', title: 'Amp Recommendations', replies: 15, views: 678 },
  ];

  if (activeScreen === 'seeds') {
    return (
      <div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', color: T.txtM, marginBottom: '8px' }}>
            {contentLoading ? 'Loading...' : `Progress to 30 Seeded Guitars`}
          </div>
          <div
            style={{
              height: '8px',
              backgroundColor: T.border,
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                backgroundColor: colors.green,
                width: `${(seededGuitars.length / 30) * 100}%`,
              }}
            />
          </div>
          <div style={{ fontSize: '12px', color: T.txt, marginTop: '8px' }}>
            {seededGuitars.length} / 30
          </div>
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px', marginTop: '24px' }}>
          Seeded Guitars
        </h2>
        {contentLoading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: T.txtM }}>Loading instruments...</div>
        ) : seededGuitars.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: T.txtM }}>No instruments found in database.</div>
        ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              <MkTH>Make / Model</MkTH>
              <MkTH>Year</MkTH>
              <MkTH>Serial</MkTH>
            </tr>
          </thead>
          <tbody>
            {seededGuitars.map((guitar) => (
              <tr key={guitar.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: '12px 16px', color: T.txt, fontSize: '13px', fontWeight: 600 }}>
                  {guitar.model}
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {guitar.year}
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px', fontFamily: 'monospace' }}>
                  {guitar.serial}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    );
  }

  if (activeScreen === 'articles') {
    return (
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          Articles & Content
        </h2>
        {contentLoading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: T.txtM }}>Loading articles...</div>
        ) : articles.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: T.txtM }}>No articles found in database.</div>
        ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              <MkTH>Title</MkTH>
              <MkTH>Status</MkTH>
              <MkTH>Views</MkTH>
              <MkTH>Likes</MkTH>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: '12px 16px', color: T.txt, fontSize: '13px' }}>
                  {article.title}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <MkBadge
                    text={article.status}
                    color={
                      article.status === 'Published'
                        ? colors.green
                        : article.status === 'Draft'
                        ? colors.yellow
                        : colors.orange
                    }
                    bg={
                      article.status === 'Published'
                        ? colors.greenBg
                        : article.status === 'Draft'
                        ? colors.yellowBg
                        : colors.orangeBg
                    }
                  />
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {article.views || '-'}
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {article.likes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    );
  }

  if (activeScreen === 'cms') {
    return (
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          CMS Engine Features
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {cmsFeatures.map((feature) => (
            <div
              key={feature.id}
              style={{
                padding: '16px',
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
              }}
            >
              <div style={{ fontWeight: 700, color: T.txt, marginBottom: '8px' }}>
                {feature.name}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <MkBadge
                  text={feature.status}
                  color={
                    feature.status === 'Active'
                      ? colors.green
                      : feature.status === 'In Dev'
                      ? colors.yellow
                      : colors.orange
                  }
                  bg={
                    feature.status === 'Active'
                      ? colors.greenBg
                      : feature.status === 'In Dev'
                      ? colors.yellowBg
                      : colors.orangeBg
                  }
                />
                <div style={{ fontSize: '11px', color: T.txtM }}>{feature.version}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeScreen === 'calendar') {
    return (
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          Content Calendar - Week of 1/15
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
          {calendarWeek.map((day, idx) => (
            <div
              key={idx}
              style={{
                padding: '16px',
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontWeight: 700, color: T.txt, marginBottom: '4px' }}>
                {day.day}
              </div>
              <div style={{ fontSize: '12px', color: T.txtM, marginBottom: '8px' }}>
                {day.date}
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: day.status === 'open' ? colors.orange : colors.green,
                }}
              >
                {day.posts}
              </div>
              <div style={{ fontSize: '10px', color: T.txtM, marginTop: '4px' }}>
                {day.status === 'open' ? 'Open Slots' : 'Scheduled'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeScreen === 'ugc') {
    return (
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          UGC Curator
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {ugcItems.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '16px',
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
              }}
            >
              <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 700, color: T.txt }}>{item.title}</div>
                <MkBadge
                  text={item.status}
                  color={item.status === 'Approved' ? colors.green : colors.orange}
                  bg={item.status === 'Approved' ? colors.greenBg : colors.orangeBg}
                />
              </div>
              <div style={{ fontSize: '12px', color: T.txtM, marginBottom: '8px' }}>
                By {item.creator}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: T.txt }}>
                {item.views} views
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeScreen === 'forum') {
    return (
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          Forum Tracker
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              <MkTH>Title</MkTH>
              <MkTH>Author</MkTH>
              <MkTH>Replies</MkTH>
              <MkTH>Views</MkTH>
            </tr>
          </thead>
          <tbody>
            {forumPosts.map((post) => (
              <tr key={post.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: '12px 16px', color: T.txt, fontSize: '13px' }}>
                  {post.title}
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {post.author}
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {post.replies}
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {post.views}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'seeds', label: 'Seed Manager' },
          { key: 'articles', label: 'Articles' },
          { key: 'cms', label: 'CMS Engine' },
          { key: 'calendar', label: 'Calendar' },
          { key: 'ugc', label: 'UGC Curator' },
          { key: 'forum', label: 'Forum Tracker' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveScreen(tab.key)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeScreen === tab.key ? colors.green : 'transparent',
              color: activeScreen === tab.key ? '#FFFFFF' : T.txt,
              border: `1px solid ${activeScreen === tab.key ? colors.green : T.border}`,
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MODULE 4: EMAIL CENTER
// ============================================================================

function EmailModule() {
  const [activeScreen, setActiveScreen] = useState('sequences');
  const [selectedCategory, setSelectedCategory] = useState('welcome');
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('welcome');
  const [editedHtml, setEditedHtml] = useState('');
  const [editedSubject, setEditedSubject] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saved' | 'error' | null
  const [hasChanges, setHasChanges] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  const sequences = [
    {
      id: 1,
      name: 'Welcome Series',
      emails: 3,
      subscribers: 4521,
      trigger: 'New signup',
      emails_detail: [
        { order: 1, subject: 'Welcome to TWNG!', delay: 'Immediate', opens: 2341, clicks: 834 },
        { order: 2, subject: 'Your First Guitar Post', delay: '1 day', opens: 1876, clicks: 612 },
        { order: 3, subject: 'Complete Your Profile', delay: '3 days', opens: 1654, clicks: 423 },
      ],
    },
    {
      id: 2,
      name: 'Claim Process',
      emails: 4,
      subscribers: 892,
      trigger: 'Claim initiated',
      emails_detail: [
        { order: 1, subject: 'Claim Received', delay: 'Immediate', opens: 812, clicks: 234 },
        { order: 2, subject: 'Upload Proof', delay: '1 day', opens: 687, clicks: 198 },
        { order: 3, subject: 'Verification Status', delay: '3 days', opens: 523, clicks: 145 },
        { order: 4, subject: 'Claim Approved!', delay: '7 days', opens: 412, clicks: 289 },
      ],
    },
    {
      id: 3,
      name: 'Re-engagement',
      emails: 3,
      subscribers: 1234,
      trigger: '30 days inactive',
      emails_detail: [
        { order: 1, subject: 'We Miss You', delay: 'Immediate', opens: 456, clicks: 123 },
        { order: 2, subject: 'New Features', delay: '2 days', opens: 345, clicks: 89 },
        { order: 3, subject: 'Final Chance', delay: '5 days', opens: 234, clicks: 67 },
      ],
    },
  ];

  const subscribers = [
    { id: 1, segment: 'Active Users', count: 3421, lastEmail: '2024-01-15', engagement: '6.8%' },
    { id: 2, segment: 'Inactive', count: 2156, lastEmail: '2024-01-10', engagement: '1.2%' },
    { id: 3, segment: 'Claim Pending', count: 456, lastEmail: '2024-01-14', engagement: '12.3%' },
    { id: 4, segment: 'Verified Guitarists', count: 1872, lastEmail: '2024-01-13', engagement: '8.9%' },
    { id: 5, segment: 'New Signups', count: 892, lastEmail: '2024-01-15', engagement: '14.2%' },
  ];

  const supabaseTables = [
    { id: 1, name: 'users', records: 8421, lastUpdated: '2024-01-15 14:32' },
    { id: 2, name: 'guitars', records: 12847, lastUpdated: '2024-01-15 14:15' },
    { id: 3, name: 'email_sequences', records: 3, lastUpdated: '2024-01-14 10:22' },
    { id: 4, name: 'email_opens', records: 54321, lastUpdated: '2024-01-15 14:45' },
    { id: 5, name: 'subscriber_segments', records: 5, lastUpdated: '2024-01-15 11:30' },
    { id: 6, name: 'email_metrics', records: 892, lastUpdated: '2024-01-15 14:50' },
  ];

  const edgeFunctions = [
    { id: 1, name: 'sendWelcomeEmail', language: 'JavaScript', status: 'Active', version: '1.2.0' },
    { id: 2, name: 'trackEmailOpen', language: 'JavaScript', status: 'Active', version: '1.0.5' },
    { id: 3, name: 'processSegments', language: 'JavaScript', status: 'Active', version: '1.3.1' },
    { id: 4, name: 'calculateEngagement', language: 'JavaScript', status: 'Active', version: '1.1.0' },
  ];

  if (activeScreen === 'sequences') {
    return (
      <div>
        <MkNotConnectedBanner
          service="Email Sequences"
          description="Email sequence automation requires connecting a transactional email provider (e.g., Resend, SendGrid, or Mailgun). Templates are ready in the Templates tab — connect a provider to start sending."
          icon={Mail}
        />
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          Email Sequences
        </h2>
        {sequences.map((seq) => (
          <div
            key={seq.id}
            style={{
              marginBottom: '16px',
              padding: '16px',
              backgroundColor: T.bgCard,
              border: `1px solid ${T.border}`,
              borderRadius: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <div>
                <div style={{ fontWeight: 700, color: T.txt, fontSize: '14px' }}>
                  {seq.name}
                </div>
                <div style={{ fontSize: '12px', color: T.txtM, marginTop: '4px' }}>
                  Trigger: {seq.trigger}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: T.txtM }}>Subscribers</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: T.txt }}>
                  {seq.subscribers}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '12px' }}>
              {seq.emails_detail.map((email) => (
                <div
                  key={email.order}
                  style={{
                    padding: '12px',
                    backgroundColor: T.bgElev,
                    borderLeft: `3px solid ${colors.purple}`,
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ fontWeight: 600, color: T.txt, marginBottom: '4px' }}>
                    Email {email.order}
                  </div>
                  <div style={{ color: T.txt2, fontSize: '11px', marginBottom: '4px' }}>
                    {email.subject}
                  </div>
                  <div style={{ color: T.txtM, fontSize: '10px', marginBottom: '6px' }}>
                    Delay: {email.delay}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                    <span style={{ color: colors.purple }}>Opens: {email.opens}</span>
                    <span style={{ color: colors.purple }}>Clicks: {email.clicks}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activeScreen === 'supabase') {
    return (
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          Supabase Architecture
        </h2>
        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '6px' }}>
          <div style={{ fontSize: '13px', color: T.txt, marginBottom: '12px', fontWeight: 600 }}>
            Data Flow
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ padding: '8px 12px', backgroundColor: colors.purpleBg, borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: colors.purple }}>
              Email Triggers
            </div>
            <div style={{ fontSize: '16px', color: T.txtM }}>→</div>
            <div style={{ padding: '8px 12px', backgroundColor: colors.purpleBg, borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: colors.purple }}>
              Supabase DB
            </div>
            <div style={{ fontSize: '16px', color: T.txtM }}>→</div>
            <div style={{ padding: '8px 12px', backgroundColor: colors.purpleBg, borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: colors.purple }}>
              Edge Functions
            </div>
            <div style={{ fontSize: '16px', color: T.txtM }}>→</div>
            <div style={{ padding: '8px 12px', backgroundColor: colors.purpleBg, borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: colors.purple }}>
              Email Provider
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: '14px', fontWeight: 700, color: T.txt, marginBottom: '12px' }}>
          Database Tables
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              <MkTH>Table Name</MkTH>
              <MkTH>Records</MkTH>
              <MkTH>Last Updated</MkTH>
            </tr>
          </thead>
          <tbody>
            {supabaseTables.map((table) => (
              <tr key={table.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: '12px 16px', color: T.txt, fontSize: '13px', fontFamily: 'monospace' }}>
                  {table.name}
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {table.records.toLocaleString()}
                </td>
                <td style={{ padding: '12px 16px', color: T.txtM, fontSize: '13px' }}>
                  {table.lastUpdated}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={{ fontSize: '14px', fontWeight: 700, color: T.txt, marginBottom: '12px', marginTop: '24px' }}>
          Edge Functions
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              <MkTH>Function Name</MkTH>
              <MkTH>Language</MkTH>
              <MkTH>Status</MkTH>
              <MkTH>Version</MkTH>
            </tr>
          </thead>
          <tbody>
            {edgeFunctions.map((fn) => (
              <tr key={fn.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: '12px 16px', color: T.txt, fontSize: '13px', fontFamily: 'monospace' }}>
                  {fn.name}
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {fn.language}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <MkBadge text={fn.status} color={colors.green} bg={colors.greenBg} />
                </td>
                <td style={{ padding: '12px 16px', color: T.txtM, fontSize: '13px' }}>
                  {fn.version}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (activeScreen === 'template') {
    // Template Registry with all 17 templates
    const TEMPLATE_REGISTRY = {
      welcome: {
        label: 'Welcome Sequence',
        templates: {
          welcome: { label: 'Welcome Email', variables: ['username', 'profileUrl'], sampleData: { username: 'GuitarDave', profileUrl: 'https://twng.com/profile' } },
          completeProfile: { label: 'Complete Profile', variables: ['username', 'profileUrl'], sampleData: { username: 'GuitarDave', profileUrl: 'https://twng.com/profile' } },
          addFirstGuitar: { label: 'Add First Guitar', variables: ['username', 'addGuitarUrl'], sampleData: { username: 'GuitarDave', addGuitarUrl: 'https://twng.com/add' } },
          exploreConnect: { label: 'Explore & Connect', variables: ['username', 'exploreUrl'], sampleData: { username: 'GuitarDave', exploreUrl: 'https://twng.com/explore' } },
        },
      },
      claim: {
        label: 'Claim Process',
        templates: {
          claimConfirmed: { label: 'Claim Confirmed', variables: ['username', 'brand', 'model', 'guitarUrl'], sampleData: { username: 'GuitarDave', brand: 'Gibson', model: 'Les Paul Standard', guitarUrl: 'https://twng.com/guitars/123' } },
          addPhotosStory: { label: 'Add Photos & Story', variables: ['username', 'brand', 'model', 'guitarUrl'], sampleData: { username: 'GuitarDave', brand: 'Gibson', model: 'Les Paul Standard', guitarUrl: 'https://twng.com/guitars/123' } },
          shareCollection: { label: 'Share Collection', variables: ['username', 'collectionUrl'], sampleData: { username: 'GuitarDave', collectionUrl: 'https://twng.com/collection/dave' } },
          inviteCollectors: { label: 'Invite Collectors', variables: ['username', 'inviteUrl'], sampleData: { username: 'GuitarDave', inviteUrl: 'https://twng.com/invite' } },
        },
      },
      reengagement: {
        label: 'Re-engagement',
        templates: {
          missYou: { label: 'We Miss You', variables: ['username', 'exploreUrl'], sampleData: { username: 'GuitarDave', exploreUrl: 'https://twng.com/explore' } },
          newInBrand: { label: 'New in Your Brand', variables: ['username', 'preferredBrand', 'exploreUrl'], sampleData: { username: 'GuitarDave', preferredBrand: 'Fender', exploreUrl: 'https://twng.com/explore?brand=fender' } },
          featuredSpotlight: { label: 'Featured Spotlight', variables: ['username', 'featuredUrl'], sampleData: { username: 'GuitarDave', featuredUrl: 'https://twng.com/featured' } },
        },
      },
      auth: {
        label: 'Authentication',
        templates: {
          passwordReset: { label: 'Password Reset', variables: ['username', 'resetUrl'], sampleData: { username: 'GuitarDave', resetUrl: 'https://twng.com/reset?token=abc123' } },
          magicLink: { label: 'Magic Link', variables: ['username', 'magicLinkUrl'], sampleData: { username: 'GuitarDave', magicLinkUrl: 'https://twng.com/auth?token=xyz789' } },
          confirmSignup: { label: 'Confirm Signup', variables: ['username', 'confirmUrl'], sampleData: { username: 'GuitarDave', confirmUrl: 'https://twng.com/confirm?token=def456' } },
          changeEmail: { label: 'Change Email', variables: ['username', 'confirmUrl', 'newEmail'], sampleData: { username: 'GuitarDave', confirmUrl: 'https://twng.com/confirm-email', newEmail: 'dave@newmail.com' } },
        },
      },
      transaction: {
        label: 'Transactional',
        templates: {
          claimDenied: { label: 'Claim Denied', variables: ['username', 'brand', 'model', 'reason', 'supportUrl'], sampleData: { username: 'GuitarDave', brand: 'Fender', model: 'Stratocaster', reason: 'Serial number could not be verified with manufacturer records.', supportUrl: 'https://twng.com/support' } },
          claimPendingReview: { label: 'Claim Pending', variables: ['username', 'brand', 'model', 'claimUrl'], sampleData: { username: 'GuitarDave', brand: 'Fender', model: 'Stratocaster', claimUrl: 'https://twng.com/claims/456' } },
        },
      },
    };

    // Helper function to get template output
    const getTemplateOutput = (category, key) => {
      const registry = TEMPLATE_REGISTRY[category]?.templates[key];
      if (!registry) return null;

      const templateMaps = {
        welcome: { welcome: welcomeSequence.welcome, completeProfile: welcomeSequence.completeProfile, addFirstGuitar: welcomeSequence.addFirstGuitar, exploreConnect: welcomeSequence.exploreConnect },
        claim: { claimConfirmed: claimSequence.claimConfirmed, addPhotosStory: claimSequence.addPhotosStory, shareCollection: claimSequence.shareCollection, inviteCollectors: claimSequence.inviteCollectors },
        reengagement: { missYou: reengagementSequence.missYou, newInBrand: reengagementSequence.newInBrand, featuredSpotlight: reengagementSequence.featuredSpotlight },
        auth: { passwordReset: authTemplates.passwordReset, magicLink: authTemplates.magicLink, confirmSignup: authTemplates.confirmSignup, changeEmail: authTemplates.changeEmail },
        transaction: { claimDenied: transactionalTemplates.claimDenied, claimPendingReview: transactionalTemplates.claimPendingReview },
      };

      const fn = templateMaps[category]?.[key];
      if (!fn) return null;
      return fn(registry.sampleData);
    };

    // Load template on mount or when selection changes
    useEffect(() => {
      const loadTemplate = async () => {
        // First check for custom version in system_config
        const { data } = await supabase
          .from('system_config')
          .select('value')
          .eq('key', `email_template:${selectedCategory}:${selectedTemplateKey}`)
          .single();

        if (data?.value) {
          const custom = JSON.parse(data.value);
          setEditedHtml(custom.html);
          setEditedSubject(custom.subject);
        } else {
          // Load default from template code
          const output = getTemplateOutput(selectedCategory, selectedTemplateKey);
          if (output) {
            setEditedHtml(output.html);
            setEditedSubject(output.subject);
          }
        }
        setHasChanges(false);
        setSaveStatus(null);
      };

      loadTemplate();
    }, [selectedCategory, selectedTemplateKey]);

    // Handle save
    const handleSave = async () => {
      setIsSaving(true);
      try {
        await supabase.from('system_config').upsert({
          key: `email_template:${selectedCategory}:${selectedTemplateKey}`,
          value: JSON.stringify({ subject: editedSubject, html: editedHtml }),
          updated_at: new Date().toISOString(),
        });
        setSaveStatus('saved');
        setHasChanges(false);
        setTimeout(() => setSaveStatus(null), 3000);
      } catch (error) {
        console.error('Save failed:', error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(null), 3000);
      } finally {
        setIsSaving(false);
      }
    };

    // Handle reset
    const handleReset = async () => {
      if (!confirm('Are you sure? This will discard all changes.')) return;
      try {
        await supabase
          .from('system_config')
          .delete()
          .eq('key', `email_template:${selectedCategory}:${selectedTemplateKey}`);
        const output = getTemplateOutput(selectedCategory, selectedTemplateKey);
        if (output) {
          setEditedHtml(output.html);
          setEditedSubject(output.subject);
        }
        setHasChanges(false);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 3000);
      } catch (error) {
        console.error('Reset failed:', error);
      }
    };

    // Handle send test email
    const handleSendTest = async () => {
      const testEmail = prompt('Enter email address for test:');
      if (!testEmail) return;

      setSendingTest(true);
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${supabaseKey}` },
          body: JSON.stringify({ to: testEmail, subject: editedSubject, html: editedHtml }),
        });
        if (response.ok) {
          alert('Test email sent successfully!');
        } else {
          alert('Failed to send test email');
        }
      } catch (error) {
        console.error('Send test failed:', error);
        alert('Error sending test email');
      } finally {
        setSendingTest(false);
      }
    };

    const currentRegistry = TEMPLATE_REGISTRY[selectedCategory];
    const currentTemplate = currentRegistry?.templates[selectedTemplateKey];
    const variables = currentTemplate?.variables || [];

    return (
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          Email Template Editor
        </h2>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {Object.entries(TEMPLATE_REGISTRY).map(([catKey, catData]) => (
            <button
              key={catKey}
              onClick={() => {
                setSelectedCategory(catKey);
                setSelectedTemplateKey(Object.keys(catData.templates)[0]);
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedCategory === catKey ? colors.purple : T.bgCard,
                color: selectedCategory === catKey ? '#fff' : T.txt2,
                border: `1px solid ${selectedCategory === catKey ? colors.purple : T.border}`,
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >
              {catData.label}
            </button>
          ))}
        </div>

        {/* Template Selector & Subject Line */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: T.txt2, marginBottom: '6px' }}>
              Template
            </label>
            <select
              value={selectedTemplateKey}
              onChange={(e) => setSelectedTemplateKey(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: T.bgElev,
                color: T.txt,
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
                fontSize: '12px',
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              {Object.entries(currentRegistry?.templates || {}).map(([key, tmpl]) => (
                <option key={key} value={key}>
                  {tmpl.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: T.txt2, marginBottom: '6px' }}>
              Subject Line
            </label>
            <input
              type="text"
              value={editedSubject}
              onChange={(e) => {
                setEditedSubject(e.target.value);
                setHasChanges(true);
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: T.bgElev,
                color: T.txt,
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
                fontSize: '12px',
                fontFamily: 'inherit',
              }}
              placeholder="Email subject line"
            />
          </div>
        </div>

        {/* Variables Reference */}
        {variables.length > 0 && (
          <div style={{ marginBottom: '16px', padding: '8px 12px', backgroundColor: colors.purpleBg, borderRadius: '6px', borderLeft: `3px solid ${colors.purple}` }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: T.txt2, marginRight: '8px' }}>Available variables:</span>
            {variables.map((variable) => (
              <span
                key={variable}
                style={{
                  display: 'inline-block',
                  marginRight: '8px',
                  padding: '4px 8px',
                  backgroundColor: T.bgElev,
                  color: colors.purple,
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                }}
              >
                {`{{${variable}}}`}
              </span>
            ))}
          </div>
        )}

        {/* Split pane: Code Editor (left) | Live Preview (right) */}
        <div style={{ display: 'grid', gridTemplateColumns: '55% 45%', gap: '16px', marginBottom: '16px' }}>
          {/* Code Editor */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: T.txt, marginBottom: '8px' }}>
              HTML Code
            </h3>
            <textarea
              value={editedHtml}
              onChange={(e) => {
                setEditedHtml(e.target.value);
                setHasChanges(true);
              }}
              style={{
                width: '100%',
                height: '500px',
                padding: '16px',
                backgroundColor: T.bgElev,
                color: T.txt,
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '12px',
                fontWeight: 500,
                lineHeight: '1.5',
                resize: 'vertical',
              }}
              placeholder="Enter HTML email template..."
            />
            <div style={{ fontSize: '11px', color: T.txt2, marginTop: '4px' }}>
              {editedHtml.length} characters
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: T.txt, marginBottom: '8px' }}>
              Live Preview
            </h3>
            <iframe
              srcDoc={editedHtml}
              style={{
                width: '100%',
                height: '500px',
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
                backgroundColor: '#fff',
                boxShadow: `0 2px 8px rgba(0,0,0,0.1)`,
              }}
              title="Email preview"
              sandbox={{ allow: ['same-origin'] }}
            />
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: T.txt2 }}>
            <span>{variables.length} variables</span>
            <span>•</span>
            <span>{editedHtml.length} characters</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {hasChanges && (
              <button
                onClick={handleReset}
                style={{
                  padding: '8px 14px',
                  backgroundColor: 'transparent',
                  color: T.txt2,
                  border: `1px solid ${T.border}`,
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = T.bgCard;
                  e.target.style.color = T.txt;
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = T.txt2;
                }}
              >
                Reset to Default
              </button>
            )}

            <button
              onClick={handleSendTest}
              disabled={sendingTest}
              style={{
                padding: '8px 14px',
                backgroundColor: colors.cyan,
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: sendingTest ? 'not-allowed' : 'pointer',
                opacity: sendingTest ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
            >
              {sendingTest ? 'Sending...' : 'Send Test Email'}
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              style={{
                padding: '8px 14px',
                backgroundColor: colors.purple,
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: isSaving || !hasChanges ? 'not-allowed' : 'pointer',
                opacity: isSaving || !hasChanges ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>

            {saveStatus && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: saveStatus === 'saved' ? colors.greenBg : colors.redBg,
                color: saveStatus === 'saved' ? colors.green : colors.red,
              }}>
                {saveStatus === 'saved' ? '✓ Saved' : '✗ Error'}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeScreen === 'subscribers') {
    return (
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          Subscriber Segments
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              <MkTH>Segment</MkTH>
              <MkTH>Count</MkTH>
              <MkTH>Last Email</MkTH>
              <MkTH>Engagement</MkTH>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((sub) => (
              <tr key={sub.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: '12px 16px', color: T.txt, fontSize: '13px', fontWeight: 600 }}>
                  {sub.segment}
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {sub.count.toLocaleString()}
                </td>
                <td style={{ padding: '12px 16px', color: T.txtM, fontSize: '13px' }}>
                  {sub.lastEmail}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <MkBadge
                    text={sub.engagement}
                    color={colors.purple}
                    bg={colors.purpleBg}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (activeScreen === 'analytics') {
    const analyticsData = [
      { id: 1, sequence: 'Welcome Series', sent: 4521, opens: 3234, clicks: 1456, unsubscribe: 34 },
      { id: 2, sequence: 'Claim Process', sent: 892, opens: 734, clicks: 267, unsubscribe: 12 },
      { id: 3, sequence: 'Re-engagement', sent: 1234, opens: 456, clicks: 145, unsubscribe: 89 },
    ];

    return (
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          Email Analytics
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              <MkTH>Sequence</MkTH>
              <MkTH>Sent</MkTH>
              <MkTH>Opens</MkTH>
              <MkTH>Clicks</MkTH>
              <MkTH>Unsubscribe</MkTH>
            </tr>
          </thead>
          <tbody>
            {analyticsData.map((row) => (
              <tr key={row.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: '12px 16px', color: T.txt, fontSize: '13px' }}>
                  {row.sequence}
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {row.sent}
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {row.opens} ({((row.opens / row.sent) * 100).toFixed(1)}%)
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {row.clicks} ({((row.clicks / row.sent) * 100).toFixed(1)}%)
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {row.unsubscribe}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'sequences', label: 'Sequences' },
          { key: 'supabase', label: 'Supabase' },
          { key: 'template', label: 'Template' },
          { key: 'subscribers', label: 'Subscribers' },
          { key: 'analytics', label: 'Analytics' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveScreen(tab.key)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeScreen === tab.key ? colors.purple : 'transparent',
              color: activeScreen === tab.key ? '#FFFFFF' : T.txt,
              border: `1px solid ${activeScreen === tab.key ? colors.purple : T.border}`,
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MODULE 5: PAID CAMPAIGNS
// ============================================================================

function PaidModule() {
  const [activeScreen, setActiveScreen] = useState('overview');

  const metaCampaigns = [
    { id: 1, name: 'Guitar Summer Sale', status: 'Active', spend: '$2,340', reach: '45.2K', conversions: 234, cac: '$10.00' },
    { id: 2, name: 'New Member Acquisition', status: 'Active', spend: '$1,890', reach: '32.1K', conversions: 178, cac: '$10.62' },
    { id: 3, name: 'Retargeting Campaign', status: 'Paused', spend: '$854', reach: '18.5K', conversions: 89, cac: '$9.60' },
  ];

  const googleCampaigns = [
    { id: 1, name: 'Guitar Search Terms', status: 'Active', spend: '$3,120', reach: '52.3K', conversions: 312, cac: '$10.00' },
    { id: 2, name: 'Brand Awareness', status: 'Active', spend: '$2,450', reach: '41.2K', conversions: 198, cac: '$12.37' },
    { id: 3, name: 'Shopping Ads', status: 'Active', spend: '$1,670', reach: '28.4K', conversions: 145, cac: '$11.52' },
  ];

  if (activeScreen === 'overview') {
    return (
      <div>
        <MkNotConnectedBanner
          service="Paid Campaigns"
          description="Campaign tracking requires connecting ad platform APIs (Meta Ads, Google Ads). Connect your ad accounts to see real spend, reach, and conversion data."
          icon={Target}
        />
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          Campaign Overview
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: T.txt, marginBottom: '12px' }}>
              Meta Campaigns
            </h3>
            {metaCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                style={{
                  padding: '12px',
                  backgroundColor: T.bgCard,
                  border: `1px solid ${T.border}`,
                  borderRadius: '8px',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: T.txt }}>
                    {campaign.name}
                  </div>
                  <div style={{ fontSize: '11px', color: T.txtM, marginTop: '4px' }}>
                    Spend: {campaign.spend}
                  </div>
                </div>
                <MkBadge
                  text={campaign.status}
                  color={campaign.status === 'Active' ? colors.green : colors.yellow}
                  bg={campaign.status === 'Active' ? colors.greenBg : colors.yellowBg}
                />
              </div>
            ))}
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: T.txt, marginBottom: '12px' }}>
              Google Campaigns
            </h3>
            {googleCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                style={{
                  padding: '12px',
                  backgroundColor: T.bgCard,
                  border: `1px solid ${T.border}`,
                  borderRadius: '8px',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: T.txt }}>
                    {campaign.name}
                  </div>
                  <div style={{ fontSize: '11px', color: T.txtM, marginTop: '4px' }}>
                    Spend: {campaign.spend}
                  </div>
                </div>
                <MkBadge
                  text={campaign.status}
                  color={campaign.status === 'Active' ? colors.green : colors.yellow}
                  bg={campaign.status === 'Active' ? colors.greenBg : colors.yellowBg}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeScreen === 'meta') {
    return (
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          Meta Ad Campaigns
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              <MkTH>Campaign</MkTH>
              <MkTH>Status</MkTH>
              <MkTH>Spend</MkTH>
              <MkTH>Reach</MkTH>
              <MkTH>Conversions</MkTH>
              <MkTH>CAC</MkTH>
            </tr>
          </thead>
          <tbody>
            {metaCampaigns.map((campaign) => (
              <tr key={campaign.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: '12px 16px', color: T.txt, fontSize: '13px', fontWeight: 600 }}>
                  {campaign.name}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <MkBadge
                    text={campaign.status}
                    color={campaign.status === 'Active' ? colors.green : colors.yellow}
                    bg={campaign.status === 'Active' ? colors.greenBg : colors.yellowBg}
                  />
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {campaign.spend}
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {campaign.reach}
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {campaign.conversions}
                </td>
                <td style={{ padding: '12px 16px', color: colors.orange, fontSize: '13px', fontWeight: 600 }}>
                  {campaign.cac}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (activeScreen === 'google') {
    return (
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          Google Ads Campaigns
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              <MkTH>Campaign</MkTH>
              <MkTH>Status</MkTH>
              <MkTH>Spend</MkTH>
              <MkTH>Reach</MkTH>
              <MkTH>Conversions</MkTH>
              <MkTH>CAC</MkTH>
            </tr>
          </thead>
          <tbody>
            {googleCampaigns.map((campaign) => (
              <tr key={campaign.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: '12px 16px', color: T.txt, fontSize: '13px', fontWeight: 600 }}>
                  {campaign.name}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <MkBadge
                    text={campaign.status}
                    color={campaign.status === 'Active' ? colors.green : colors.yellow}
                    bg={campaign.status === 'Active' ? colors.greenBg : colors.yellowBg}
                  />
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {campaign.spend}
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {campaign.reach}
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {campaign.conversions}
                </td>
                <td style={{ padding: '12px 16px', color: colors.orange, fontSize: '13px', fontWeight: 600 }}>
                  {campaign.cac}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (activeScreen === 'cac') {
    const cacData = [
      ...metaCampaigns.map((c) => ({ ...c, platform: 'Meta' })),
      ...googleCampaigns.map((c) => ({ ...c, platform: 'Google' })),
    ].sort((a, b) => parseFloat(a.cac) - parseFloat(b.cac));

    return (
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          CAC Calculator (Sorted by Cost)
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              <MkTH>Campaign</MkTH>
              <MkTH>Platform</MkTH>
              <MkTH>Spend</MkTH>
              <MkTH>Conversions</MkTH>
              <MkTH>CAC</MkTH>
            </tr>
          </thead>
          <tbody>
            {cacData.map((campaign) => (
              <tr key={`${campaign.platform}-${campaign.id}`} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: '12px 16px', color: T.txt, fontSize: '13px', fontWeight: 600 }}>
                  {campaign.name}
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {campaign.platform}
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {campaign.spend}
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {campaign.conversions}
                </td>
                <td style={{ padding: '12px 16px', color: colors.green, fontSize: '13px', fontWeight: 600 }}>
                  {campaign.cac}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (activeScreen === 'budget') {
    const budgetData = [
      { platform: 'Meta Ads', allocation: 45, spend: '$5,084' },
      { platform: 'Google Ads', allocation: 55, spend: '$6,240' },
    ];

    return (
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          Budget Allocation Tracker
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {budgetData.map((item) => (
            <div
              key={item.platform}
              style={{
                padding: '16px',
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontWeight: 700, color: T.txt }}>{item.platform}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: colors.orange }}>
                  {item.allocation}%
                </div>
              </div>
              <div
                style={{
                  height: '12px',
                  backgroundColor: T.border,
                  borderRadius: '6px',
                  overflow: 'hidden',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    backgroundColor: colors.orange,
                    width: `${item.allocation}%`,
                  }}
                />
              </div>
              <div style={{ fontSize: '13px', color: T.txtM }}>Spend: {item.spend}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'meta', label: 'Meta Ads' },
          { key: 'google', label: 'Google Ads' },
          { key: 'cac', label: 'CAC Calculator' },
          { key: 'budget', label: 'Budget Tracker' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveScreen(tab.key)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeScreen === tab.key ? colors.orange : 'transparent',
              color: activeScreen === tab.key ? '#FFFFFF' : T.txt,
              border: `1px solid ${activeScreen === tab.key ? colors.orange : T.border}`,
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MODULE 6: SOCIAL COMMAND
// ============================================================================

function SocialModule() {
  const [activeScreen, setActiveScreen] = useState('overview');

  const channels = [
    { id: 1, name: 'Instagram', handle: '@thewitnessng', followers: '234.5K', posts: 487, engagement: '7.2%' },
    { id: 2, name: 'YouTube', handle: 'TheWitnessNG', subscribers: '128.3K', posts: 89, engagement: '4.8%' },
    { id: 3, name: 'TikTok', handle: '@thewitnessguitars', followers: '456.2K', posts: 823, engagement: '9.3%' },
    { id: 4, name: 'Forums', handle: 'TWNGForums', members: '3.2K', topics: 345, engagement: '12.1%' },
  ];

  const scheduledPosts = [
    { id: 1, day: 'Monday', channel: 'Instagram', title: 'New guitar review', time: '10:00 AM', status: 'scheduled' },
    { id: 2, day: 'Tuesday', channel: 'YouTube', title: 'Unboxing: Fender Strat', time: '2:00 PM', status: 'scheduled' },
    { id: 3, day: 'Wednesday', channel: 'TikTok', title: 'Shred challenge', time: '6:00 PM', status: 'scheduled' },
    { id: 4, day: 'Thursday', channel: 'Instagram', title: 'Member spotlight', time: '9:00 AM', status: 'scheduled' },
    { id: 5, day: 'Friday', channel: 'Forums', title: 'Weekly discussion', time: '12:00 PM', status: 'scheduled' },
    { id: 6, day: 'Saturday', channel: 'TikTok', title: 'Acoustic jam', time: '7:00 PM', status: 'scheduled' },
    { id: 7, day: 'Sunday', channel: 'YouTube', title: 'Week in review', time: '1:00 PM', status: 'scheduled' },
  ];

  const engagementFeed = [
    { id: 1, author: '@user_1', platform: 'Instagram', content: 'Love your latest post!', timestamp: '2 hours ago', likes: 34 },
    { id: 2, author: '@user_2', platform: 'YouTube', content: 'Great tutorial, thanks!', timestamp: '4 hours ago', likes: 89 },
    { id: 3, author: '@user_3', platform: 'TikTok', content: 'Can you do a collab?', timestamp: '1 hour ago', likes: 156 },
    { id: 4, author: '@user_4', platform: 'Forums', content: 'Discussion about vintage guitars', timestamp: '30 mins ago', likes: 12 },
    { id: 5, author: '@user_5', platform: 'Instagram', content: 'This inspired me to learn!', timestamp: '3 hours ago', likes: 67 },
  ];

  const topPosts = [
    { id: 1, platform: 'TikTok', title: 'Shred challenge compilation', views: '234K', likes: '12.5K' },
    { id: 2, platform: 'YouTube', title: 'Gibson Les Paul review', views: '45.2K', likes: '3.2K' },
    { id: 3, platform: 'Instagram', title: 'Member guitar showcase', views: '23.4K', likes: '2.1K' },
  ];

  if (activeScreen === 'overview') {
    return (
      <div>
        <MkNotConnectedBanner
          service="Social Media"
          description="Social channel management requires connecting platform APIs (Instagram Graph API, YouTube Data API, etc.). Connect your social accounts to enable real-time analytics and post scheduling."
          icon={Share2}
        />
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          Channel Overview
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {channels.map((channel) => (
            <div
              key={channel.id}
              style={{
                padding: '16px',
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
              }}
            >
              <div style={{ fontWeight: 700, color: T.txt, marginBottom: '4px' }}>
                {channel.name}
              </div>
              <div style={{ fontSize: '12px', color: T.txtM, marginBottom: '12px' }}>
                {channel.handle}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: T.txtM }}>
                    {channel.name === 'Forums' ? 'Members' : channel.name === 'YouTube' ? 'Subscribers' : 'Followers'}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: T.txt }}>
                    {channel.followers || channel.subscribers || channel.members}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: T.txtM }}>Engagement</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: colors.teal }}>
                    {channel.engagement}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: T.txtM }}>
                Posts: {channel.posts || channel.topics}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeScreen === 'schedule') {
    return (
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          7-Day Post Schedule
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
          {scheduledPosts.map((post) => (
            <div
              key={post.id}
              style={{
                padding: '12px',
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: '8px',
              }}
            >
              <div style={{ fontWeight: 700, color: T.txt, marginBottom: '4px', fontSize: '13px' }}>
                {post.day}
              </div>
              <div style={{ fontSize: '12px', color: T.txt2, marginBottom: '6px' }}>
                {post.title}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <MkBadge text={post.channel} color={colors.teal} bg={colors.tealBg} />
                <div style={{ fontSize: '11px', color: T.txtM }}>{post.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeScreen === 'engagement') {
    return (
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          Engagement Feed
        </h2>
        {engagementFeed.map((item) => (
          <div
            key={item.id}
            style={{
              padding: '16px',
              backgroundColor: T.bgCard,
              border: `1px solid ${T.border}`,
              borderRadius: '6px',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div>
                <div style={{ fontWeight: 700, color: T.txt, fontSize: '13px' }}>
                  {item.author}
                </div>
                <div style={{ fontSize: '11px', color: T.txtM, marginTop: '2px' }}>
                  {item.platform} • {item.timestamp}
                </div>
              </div>
              <MkBadge text={`${item.likes} likes`} color={colors.teal} bg={colors.tealBg} />
            </div>
            <div style={{ fontSize: '13px', color: T.txt2 }}>{item.content}</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                onClick={() => alert('Reply copied to clipboard')}
                style={{
                  padding: '6px 12px',
                  backgroundColor: colors.tealBg,
                  color: colors.teal,
                  border: `1px solid ${colors.teal}`,
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reply
              </button>
              <button
                onClick={() => alert('Post flagged for review')}
                style={{
                  padding: '6px 12px',
                  backgroundColor: colors.redBg,
                  color: colors.red,
                  border: `1px solid ${colors.red}`,
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Flag
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activeScreen === 'analytics') {
    return (
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          Top Performing Posts
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              <MkTH>Platform</MkTH>
              <MkTH>Title</MkTH>
              <MkTH>Views</MkTH>
              <MkTH>Likes</MkTH>
            </tr>
          </thead>
          <tbody>
            {topPosts.map((post) => (
              <tr key={post.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {post.platform}
                </td>
                <td style={{ padding: '12px 16px', color: T.txt, fontSize: '13px', fontWeight: 600 }}>
                  {post.title}
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {post.views}
                </td>
                <td style={{ padding: '12px 16px', color: colors.teal, fontSize: '13px', fontWeight: 600 }}>
                  {post.likes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'overview', label: 'Channel Overview' },
          { key: 'schedule', label: 'Post Scheduler' },
          { key: 'engagement', label: 'Engagement Feed' },
          { key: 'analytics', label: 'Analytics' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveScreen(tab.key)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeScreen === tab.key ? colors.teal : 'transparent',
              color: activeScreen === tab.key ? '#FFFFFF' : T.txt,
              border: `1px solid ${activeScreen === tab.key ? colors.teal : T.border}`,
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MODULE 7: KPI DASHBOARD
// ============================================================================

function KPIModule() {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [kpiData, setKpiData] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [usersRes, instrumentsRes, articlesRes, collectionsRes, claimsRes, threadsRes] = await Promise.all([
          supabase.from('users').select('id', { count: 'exact', head: true }),
          supabase.from('instruments').select('id', { count: 'exact', head: true }).is('deleted_at', null),
          supabase.from('articles').select('id', { count: 'exact', head: true }),
          supabase.from('collections').select('id', { count: 'exact', head: true }),
          supabase.from('ownership_claims').select('id', { count: 'exact', head: true }),
          supabase.from('forum_threads').select('id', { count: 'exact', head: true }),
        ]);
        setKpiData({
          users: usersRes.count ?? 0,
          instruments: instrumentsRes.count ?? 0,
          articles: articlesRes.count ?? 0,
          collections: collectionsRes.count ?? 0,
          claims: claimsRes.count ?? 0,
          threads: threadsRes.count ?? 0,
        });
      } catch (e) {
        console.error('KPI fetch error:', e);
      } finally {
        setKpiLoading(false);
      }
    })();
  }, []);

  const totalUsers = kpiData?.users ?? 0;
  const northStarMetric = {
    name: 'Registered Members',
    value: kpiLoading ? '...' : totalUsers.toLocaleString(),
    change: 'Live data',
    target: '1,000',
    progress: Math.min((totalUsers / 1000) * 100, 100),
  };

  const primaryKPIs = [
    { id: 1, name: 'Total Instruments', value: kpiLoading ? '...' : (kpiData?.instruments ?? 0).toLocaleString(), change: 'Live', color: colors.green },
    { id: 2, name: 'Member Signups', value: kpiLoading ? '...' : (kpiData?.users ?? 0).toLocaleString(), change: 'Live', color: colors.blue },
    { id: 3, name: 'Published Articles', value: kpiLoading ? '...' : (kpiData?.articles ?? 0).toLocaleString(), change: 'Live', color: colors.orange },
    { id: 4, name: 'Ownership Claims', value: kpiLoading ? '...' : (kpiData?.claims ?? 0).toLocaleString(), change: 'Live', color: colors.purple },
  ];

  const funnelKPIs = [
    { stage: 'Users Registered', count: kpiData?.users ?? 0, rate: '100%' },
    { stage: 'Collections Created', count: kpiData?.collections ?? 0, rate: totalUsers ? `${Math.round(((kpiData?.collections ?? 0) / totalUsers) * 100)}%` : '0%' },
    { stage: 'Forum Threads', count: kpiData?.threads ?? 0, rate: totalUsers ? `${Math.round(((kpiData?.threads ?? 0) / totalUsers) * 100)}%` : '0%' },
  ];

  const budgetBreakdown = [
    { channel: 'Meta Ads', spend: 'Not set', percent: 25 },
    { channel: 'Google Ads', spend: 'Not set', percent: 25 },
    { channel: 'Email Marketing', spend: 'Not set', percent: 25 },
    { channel: 'Content Creation', spend: 'Not set', percent: 25 },
  ];

  if (activeScreen === 'dashboard') {
    return (
      <div>
        <div
          style={{
            padding: '20px',
            backgroundColor: T.bgCard,
            border: `2px solid ${colors.pink}`,
            borderRadius: '6px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', color: T.txtM, marginBottom: '4px' }}>
                North Star Metric
              </div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: T.txt }}>
                {northStarMetric.value}
              </div>
              <div style={{ fontSize: '12px', color: colors.pink, fontWeight: 600, marginTop: '4px' }}>
                {northStarMetric.change} to target
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: T.txtM, marginBottom: '8px' }}>
                Progress to {northStarMetric.target}
              </div>
              <div
                style={{
                  width: '200px',
                  height: '12px',
                  backgroundColor: T.border,
                  borderRadius: '6px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    backgroundColor: colors.pink,
                    width: `${northStarMetric.progress}%`,
                  }}
                />
              </div>
              <div style={{ fontSize: '12px', color: T.txt, marginTop: '8px', fontWeight: 600 }}>
                {northStarMetric.progress.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: '14px', fontWeight: 700, color: T.txt, marginBottom: '12px' }}>
          Primary KPIs
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {primaryKPIs.map((kpi) => (
            <div
              key={kpi.id}
              style={{
                padding: '16px',
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
              }}
            >
              <div style={{ fontSize: '12px', color: T.txtM, marginBottom: '8px' }}>
                {kpi.name}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: T.txt }}>
                  {kpi.value}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: kpi.color }}>
                  {kpi.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: '14px', fontWeight: 700, color: T.txt, marginBottom: '12px' }}>
          Conversion Funnel
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {funnelKPIs.map((funnel) => (
            <div
              key={funnel.stage}
              style={{
                padding: '16px',
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
              }}
            >
              <div style={{ fontSize: '12px', color: T.txtM, marginBottom: '8px' }}>
                {funnel.stage}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: T.txt, marginBottom: '8px' }}>
                {funnel.count.toLocaleString()}
              </div>
              <div
                style={{
                  height: '6px',
                  backgroundColor: T.border,
                  borderRadius: '3px',
                  overflow: 'hidden',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    backgroundColor: colors.pink,
                    width: funnel.rate,
                  }}
                />
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: colors.pink }}>
                {funnel.rate}
              </div>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: '14px', fontWeight: 700, color: T.txt, marginBottom: '12px' }}>
          Budget Breakdown
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {budgetBreakdown.map((budget) => (
            <div
              key={budget.channel}
              style={{
                padding: '16px',
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: T.txt }}>
                  {budget.channel}
                </div>
                <div style={{ fontSize: '12px', color: T.txtM }}>
                  {budget.percent}%
                </div>
              </div>
              <div
                style={{
                  height: '8px',
                  backgroundColor: T.border,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    backgroundColor: colors.pink,
                    width: `${budget.percent}%`,
                  }}
                />
              </div>
              <div style={{ fontSize: '12px', color: T.txt2 }}>{budget.spend}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeScreen === 'report') {
    return (
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          Weekly Report
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <button
            onClick={() => alert('PDF export coming soon')}
            style={{
              padding: '12px 16px',
              backgroundColor: colors.pink,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Download PDF
          </button>
          <button
            onClick={() => alert('CSV export coming soon')}
            style={{
              padding: '12px 16px',
              backgroundColor: 'transparent',
              color: colors.pink,
              border: `1px solid ${colors.pink}`,
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Export CSV
          </button>
          <button
            onClick={() => alert('Email report coming soon')}
            style={{
              padding: '12px 16px',
              backgroundColor: 'transparent',
              color: T.txt,
              border: `1px solid ${T.border}`,
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Email Report
          </button>
        </div>
        <div style={{ padding: '16px', backgroundColor: T.bgCard, borderRadius: '6px', border: `1px solid ${T.border}` }}>
          <p style={{ color: T.txt2, fontSize: '13px', lineHeight: '1.6' }}>
            Weekly report generated for the period 1/8/2024 - 1/14/2024. This report contains comprehensive metrics across all marketing channels including paid campaigns, email engagement, social media performance, and KPI progress.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { key: 'dashboard', label: 'Dashboard' },
          { key: 'report', label: 'Weekly Report' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveScreen(tab.key)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeScreen === tab.key ? colors.pink : 'transparent',
              color: activeScreen === tab.key ? '#FFFFFF' : T.txt,
              border: `1px solid ${activeScreen === tab.key ? colors.pink : T.border}`,
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MODULE 8: SETUP & CONFIG
// ============================================================================

function SetupModule() {
  const [activeScreen, setActiveScreen] = useState('checklist');
  const [setupTasks, setSetupTasks] = useState([
    { id: 1, name: 'Create admin account', completed: true },
    { id: 2, name: 'Set up Supabase', completed: true },
    { id: 3, name: 'Configure email system', completed: false },
    { id: 4, name: 'Set up analytics', completed: false },
    { id: 5, name: 'Configure payment processing', completed: false },
    { id: 6, name: 'Set up CDN', completed: false },
    { id: 7, name: 'Create brand guidelines', completed: false },
    { id: 8, name: 'Train support team', completed: false },
    { id: 9, name: 'Seed initial instruments', completed: false },
    { id: 10, name: 'Seed articles content', completed: false },
    { id: 11, name: 'Connect social media', completed: false },
    { id: 12, name: 'Launch marketing campaign', completed: false },
  ]);
  const [setupLoading, setSetupLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('system_config')
          .select('value')
          .eq('key', 'setup_checklist')
          .single();
        if (data?.value) {
          const saved = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          if (Array.isArray(saved)) {
            setSetupTasks(saved);
          }
        }
      } catch (e) {
        // No saved config yet, use defaults
      } finally {
        setSetupLoading(false);
      }
    })();
  }, []);

  const toggleTask = async (taskId) => {
    const updated = setupTasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setSetupTasks(updated);
    try {
      await supabase.from('system_config').upsert(
        { key: 'setup_checklist', value: JSON.stringify(updated), updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    } catch (e) {
      console.error('Failed to save checklist:', e);
    }
  };

  const decisions = [
    {
      id: 1,
      title: 'Primary Ad Platform',
      description: 'Meta Ads vs Google Ads prioritization',
      decision: 'Focus on Meta for engagement, Google for conversion',
      decided: true,
      date: '2024-01-10',
    },
    {
      id: 2,
      title: 'Email Service Provider',
      description: 'Choose between Sendgrid, Mailgun, Resend',
      decision: 'Using Supabase with custom email functions',
      decided: true,
      date: '2024-01-08',
    },
    {
      id: 3,
      title: 'Content Moderation Strategy',
      description: 'Manual vs AI-powered moderation approach',
      decision: 'Pending team discussion',
      decided: false,
      date: null,
    },
  ];

  const brandAssets = [
    { id: 1, name: 'Logo', type: 'PNG', size: '2.3 MB', uploaded: '2024-01-05' },
    { id: 2, name: 'Brand Colors', type: 'PDF', size: '1.1 MB', uploaded: '2024-01-06' },
    { id: 3, name: 'Typography Guide', type: 'PDF', size: '856 KB', uploaded: '2024-01-07' },
    { id: 4, name: 'Social Media Templates', type: 'ZIP', size: '45.2 MB', uploaded: '2024-01-08' },
    { id: 5, name: 'Email Headers', type: 'PNG', size: '3.4 MB', uploaded: '2024-01-09' },
    { id: 6, name: 'Ad Creatives', type: 'ZIP', size: '67.8 MB', uploaded: '2024-01-10' },
    { id: 7, name: 'Icon Library', type: 'ZIP', size: '12.5 MB', uploaded: '2024-01-11' },
  ];

  if (activeScreen === 'checklist') {
    const completed = setupTasks.filter((t) => t.completed).length;
    const progress = (completed / setupTasks.length) * 100;

    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt }}>Setup Checklist</h2>
            <div style={{ fontSize: '13px', fontWeight: 600, color: T.txt }}>
              {completed} / {setupTasks.length} complete
            </div>
          </div>
          <div
            style={{
              height: '12px',
              backgroundColor: T.border,
              borderRadius: '6px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                backgroundColor: colors.green,
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {setupTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              style={{
                padding: '16px',
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  backgroundColor: task.completed ? colors.green : T.border,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: task.completed ? '#FFFFFF' : T.txtM,
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                {task.completed ? '✓' : '○'}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: T.txt,
                    textDecoration: task.completed ? 'line-through' : 'none',
                  }}
                >
                  {task.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeScreen === 'decisions') {
    return (
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          Decision Log
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {decisions.map((decision) => (
            <div
              key={decision.id}
              style={{
                padding: '16px',
                backgroundColor: T.bgCard,
                border: `2px solid ${decision.decided ? colors.greenBg : colors.orangeBg}`,
                borderRadius: '6px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                <div style={{ fontWeight: 700, color: T.txt }}>{decision.title}</div>
                <MkBadge
                  text={decision.decided ? 'Decided' : 'Pending'}
                  color={decision.decided ? colors.green : colors.orange}
                  bg={decision.decided ? colors.greenBg : colors.orangeBg}
                />
              </div>
              <div style={{ fontSize: '12px', color: T.txtM, marginBottom: '8px' }}>
                {decision.description}
              </div>
              <div style={{ padding: '8px', backgroundColor: T.bgElev, borderRadius: '8px', marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', color: T.txtM, marginBottom: '2px' }}>Decision:</div>
                <div style={{ fontSize: '13px', color: T.txt }}>{decision.decision}</div>
              </div>
              {decision.date && (
                <div style={{ fontSize: '11px', color: T.txtM }}>
                  Decided: {decision.date}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeScreen === 'assets') {
    return (
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          Brand Assets Inventory
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              <MkTH>Asset Name</MkTH>
              <MkTH>Type</MkTH>
              <MkTH>Size</MkTH>
              <MkTH>Uploaded</MkTH>
              <MkTH>Action</MkTH>
            </tr>
          </thead>
          <tbody>
            {brandAssets.map((asset) => (
              <tr key={asset.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: '12px 16px', color: T.txt, fontSize: '13px', fontWeight: 600 }}>
                  {asset.name}
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {asset.type}
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {asset.size}
                </td>
                <td style={{ padding: '12px 16px', color: T.txtM, fontSize: '13px' }}>
                  {asset.uploaded}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                  <button
                    onClick={() => alert('Asset download coming soon')}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: 'transparent',
                      color: colors.warmAlways,
                      border: `1px solid ${colors.warmAlways}`,
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'checklist', label: 'Setup Checklist' },
          { key: 'decisions', label: 'Decision Log' },
          { key: 'assets', label: 'Brand Assets' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveScreen(tab.key)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeScreen === tab.key ? T.txtM : 'transparent',
              color: activeScreen === tab.key ? '#FFFFFF' : T.txt,
              border: `1px solid ${activeScreen === tab.key ? T.txtM : T.border}`,
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MarketingConsole() {
  const [activeModule, setActiveModule] = useState('outreach');
  const { isDark } = useTheme();

  const modules = [
    { id: 'outreach', name: 'Outreach & Claims', icon: Users, color: colors.warmAlways, missions: 7 },
    { id: 'automation', name: 'Automation Engine', icon: Zap, color: colors.blue, missions: 5 },
    { id: 'content', name: 'Content Hub', icon: BookOpen, color: colors.green, missions: 8 },
    { id: 'email', name: 'Email Center', icon: Mail, color: colors.purple, missions: 3 },
    { id: 'paid', name: 'Paid Campaigns', icon: TrendingUp, color: colors.orange, missions: 5 },
    { id: 'social', name: 'Social Command', icon: Share2, color: colors.teal, missions: 4 },
    { id: 'kpi', name: 'KPI Dashboard', icon: BarChart3, color: colors.pink, missions: 2 },
    { id: 'setup', name: 'Setup & Config', icon: Settings, color: '#78716C', missions: 8 },
  ];

  const activeMod = modules.find((m) => m.id === activeModule);
  const sidebarBg = isDark ? '#151311' : '#FAFAF8';
  const contentBg = isDark ? T.bgDeep : '#F5F3F0';
  const headerBg = isDark ? 'rgba(28,25,23,0.85)' : 'rgba(255,255,255,0.9)';
  const moduleHoverBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const moduleActiveBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return (
    <div style={{ display: 'flex', minHeight: '100%', backgroundColor: contentBg }}>
      {/* Module Sidebar */}
      <div
        style={{
          width: '230px',
          backgroundColor: sidebarBg,
          borderRight: `1px solid ${T.border}`,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Sidebar header */}
        <div style={{ padding: '20px 16px 12px', borderBottom: `1px solid ${T.border}` }}>
          <div style={{
            fontSize: '10px',
            fontWeight: 700,
            color: colors.warmAlways,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '4px',
          }}>
            Marketing Console
          </div>
          <div style={{ fontSize: '11px', color: T.txtM }}>
            8 modules · 38 missions
          </div>
        </div>

        {/* Module list */}
        <div style={{ padding: '8px', flex: 1, overflowY: 'auto' }}>
          {modules.map((mod) => {
            const Icon = mod.icon;
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: isActive ? moduleActiveBg : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: isActive ? T.txt : T.txt2,
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.15s ease',
                  marginBottom: '2px',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = moduleHoverBg;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '20%',
                    bottom: '20%',
                    width: '3px',
                    backgroundColor: mod.color,
                    borderRadius: '0 3px 3px 0',
                  }} />
                )}
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '7px',
                  backgroundColor: isActive ? `${mod.color}18` : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}>
                  <Icon size={15} color={isActive ? mod.color : T.txtM} strokeWidth={isActive ? 2 : 1.5} />
                </div>
                <span style={{ flex: 1, textAlign: 'left', lineHeight: 1.3 }}>{mod.name}</span>
                <span
                  style={{
                    padding: '1px 6px',
                    backgroundColor: isActive ? `${mod.color}20` : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
                    color: isActive ? mod.color : T.txtM,
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: 700,
                    minWidth: '20px',
                    textAlign: 'center',
                  }}
                >
                  {mod.missions}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {/* Header with breadcrumb */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: `1px solid ${T.border}`,
            backgroundColor: headerBg,
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: T.txtM }}>Marketing</span>
            <ChevronRight size={14} color={T.txtM} strokeWidth={1.5} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activeMod && (
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '6px',
                  backgroundColor: `${activeMod.color}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {(() => { const I = activeMod.icon; return <I size={12} color={activeMod.color} strokeWidth={2} />; })()}
                </div>
              )}
              <span style={{ fontSize: '14px', color: T.txt, fontWeight: 600 }}>
                {activeMod?.name}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontSize: '10px',
              fontWeight: 600,
              color: colors.warmAlways,
              padding: '3px 10px',
              borderRadius: '10px',
              backgroundColor: colors.warmBg,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {activeMod?.missions} missions
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
          }}
        >
          {activeModule === 'outreach' && <OutreachModule />}
          {activeModule === 'automation' && <AutomationModule />}
          {activeModule === 'content' && <ContentModule />}
          {activeModule === 'email' && <EmailModule />}
          {activeModule === 'paid' && <PaidModule />}
          {activeModule === 'social' && <SocialModule />}
          {activeModule === 'kpi' && <KPIModule />}
          {activeModule === 'setup' && <SetupModule />}
        </div>
      </div>
    </div>
  );
}
