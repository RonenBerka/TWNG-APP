import { useState } from 'react';
import { T } from '../../theme/tokens';
import { useTheme } from '../../context/ThemeContext';
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

function OutreachModule() {
  const [activeScreen, setActiveScreen] = useState('queue');

  const outreachQueue = [
    { id: 1, handle: '@guitar_hero_88', guitar: 'Fender Strat', score: 8.7, status: 'Ready', suggestedDm: 'Your Strat collection is fire 🔥' },
    { id: 2, handle: '@acoustic_vibes', guitar: 'Taylor 814', score: 7.2, status: 'Pending', suggestedDm: 'Love your acoustic journey' },
    { id: 3, handle: '@metal_riffs', guitar: 'ESP LTD', score: 8.1, status: 'Ready', suggestedDm: 'Metal players unite!' },
    { id: 4, handle: '@jazz_master', guitar: 'Ibanez AS', score: 6.8, status: 'Contacted', suggestedDm: 'Jazz tone goals' },
    { id: 5, handle: '@blues_walk', guitar: 'Gibson Les Paul', score: 8.9, status: 'Ready', suggestedDm: 'Les Paul legend right here' },
    { id: 6, handle: '@folk_singer', guitar: 'Martin D-45', score: 7.5, status: 'Pending', suggestedDm: 'Martin quality 🎶' },
    { id: 7, handle: '@shred_lord', guitar: 'Ibanez RG', score: 9.2, status: 'Ready', suggestedDm: 'Shred skills impressive!' },
  ];

  const claimRequests = [
    { id: 1, handle: '@acoustic_vibes', guitar: 'Taylor 814', proofType: 'Photo', status: 'Pending', timestamp: '2024-01-15' },
    { id: 2, handle: '@metal_riffs', guitar: 'ESP LTD', proofType: 'Video', status: 'Approved', timestamp: '2024-01-14' },
    { id: 3, handle: '@jazz_master', guitar: 'Ibanez AS', proofType: 'Serial', status: 'Rejected', timestamp: '2024-01-13' },
  ];

  const foundingMembers = [
    { id: 1, handle: '@founder_01', guitars: 3, badge: 'Platinum', activity: '98%', joined: '2024-01-01' },
    { id: 2, handle: '@founder_02', guitars: 5, badge: 'Diamond', activity: '99%', joined: '2024-01-02' },
    { id: 3, handle: '@founder_03', guitars: 2, badge: 'Gold', activity: '94%', joined: '2024-01-03' },
    { id: 4, handle: '@founder_04', guitars: 4, badge: 'Platinum', activity: '97%', joined: '2024-01-04' },
    { id: 5, handle: '@founder_05', guitars: 3, badge: 'Gold', activity: '92%', joined: '2024-01-05' },
    { id: 6, handle: '@founder_06', guitars: 6, badge: 'Diamond', activity: '99.5%', joined: '2024-01-06' },
  ];

  const verificationQueue = [
    { id: 1, handle: '@user_verify_1', submitted: '2024-01-15', photoUrl: 'photo1.jpg' },
    { id: 2, handle: '@user_verify_2', submitted: '2024-01-14', photoUrl: 'photo2.jpg' },
  ];

  const influencers = [
    { id: 1, handle: '@influencer_01', followers: '523K', guitars: 12, engagement: '6.2%', tier: 'Macro' },
    { id: 2, handle: '@influencer_02', followers: '148K', guitars: 8, engagement: '8.5%', tier: 'Micro' },
    { id: 3, handle: '@influencer_03', followers: '45K', guitars: 5, engagement: '12.1%', tier: 'Nano' },
  ];

  if (activeScreen === 'queue') {
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
            Outreach Queue
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                <MkTH>Handle</MkTH>
                <MkTH>Guitar</MkTH>
                <MkTH>Score</MkTH>
                <MkTH>Status</MkTH>
                <MkTH>Suggested DM</MkTH>
                <MkTH>Action</MkTH>
              </tr>
            </thead>
            <tbody>
              {outreachQueue.map((item) => (
                <tr key={item.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ padding: '12px 16px', color: T.txt, fontSize: '13px' }}>
                    {item.handle}
                  </td>
                  <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                    {item.guitar}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                    <MkBadge
                      text={item.score.toString()}
                      color={colors.green}
                      bg={colors.greenBg}
                    />
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                    <MkBadge text={item.status} color={colors.warmAlways} />
                  </td>
                  <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                    {item.suggestedDm}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                    <button
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
                      Send
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeScreen === 'claims') {
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
            Claim Requests
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {claimRequests.map((claim) => (
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
                  <div style={{ fontWeight: 700, color: T.txt }}>{claim.handle}</div>
                  <MkBadge
                    text={claim.status}
                    color={claim.status === 'Approved' ? colors.green : colors.orange}
                    bg={claim.status === 'Approved' ? colors.greenBg : colors.orangeBg}
                  />
                </div>
                <div style={{ fontSize: '13px', color: T.txt2, marginBottom: '8px' }}>
                  {claim.guitar}
                </div>
                <div style={{ fontSize: '12px', color: T.txtM, marginBottom: '12px' }}>
                  Proof: {claim.proofType} • {claim.timestamp}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {claim.status === 'Pending' && (
                    <>
                      <button
                        style={{
                          flex: 1,
                          padding: '8px',
                          backgroundColor: colors.green,
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Approve
                      </button>
                      <button
                        style={{
                          flex: 1,
                          padding: '8px',
                          backgroundColor: colors.red,
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Deny
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeScreen === 'founding') {
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', color: T.txtM, marginBottom: '8px' }}>
              Progress to 50 Founding Members
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
                  backgroundColor: colors.warmAlways,
                  width: `${(foundingMembers.length / 50) * 100}%`,
                }}
              />
            </div>
            <div style={{ fontSize: '12px', color: T.txt, marginTop: '8px' }}>
              {foundingMembers.length} / 50
            </div>
          </div>
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          Founding Members
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              <MkTH>Handle</MkTH>
              <MkTH>Guitars</MkTH>
              <MkTH>Badge</MkTH>
              <MkTH>Activity</MkTH>
              <MkTH>Joined</MkTH>
            </tr>
          </thead>
          <tbody>
            {foundingMembers.map((member) => (
              <tr key={member.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: '12px 16px', color: T.txt, fontSize: '13px' }}>
                  {member.handle}
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {member.guitars}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <MkBadge text={member.badge} color={colors.warmAlways} />
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {member.activity}
                </td>
                <td style={{ padding: '12px 16px', color: T.txtM, fontSize: '13px' }}>
                  {member.joined}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (activeScreen === 'verification') {
    return (
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          Photo Verification Queue
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {verificationQueue.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '16px',
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
              }}
            >
              <div style={{ marginBottom: '12px', fontWeight: 700, color: T.txt }}>
                {item.handle}
              </div>
              <div
                style={{
                  width: '100%',
                  height: '180px',
                  backgroundColor: T.bgElev,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  color: T.txtM,
                  fontSize: '12px',
                }}
              >
                {item.photoUrl}
              </div>
              <div style={{ fontSize: '12px', color: T.txtM, marginBottom: '12px' }}>
                Submitted: {item.submitted}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: colors.green,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Verify
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: colors.red,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeScreen === 'influencers') {
    return (
      <div>
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

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { key: 'queue', label: 'Outreach Queue' },
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

  const seededGuitars = [
    { id: 1, model: 'Fender Strat', count: 2847, reach: '1.2M', engagement: '6.8%' },
    { id: 2, model: 'Gibson Les Paul', count: 2156, reach: '980K', engagement: '7.1%' },
    { id: 3, model: 'Taylor Acoustic', count: 1923, reach: '850K', engagement: '6.3%' },
    { id: 4, model: 'Ibanez RG', count: 1654, reach: '720K', engagement: '7.8%' },
    { id: 5, model: 'PRS Custom', count: 1342, reach: '580K', engagement: '8.2%' },
    { id: 6, model: 'Epiphone', count: 892, reach: '420K', engagement: '5.9%' },
    { id: 7, model: 'Squire Strat', count: 756, reach: '340K', engagement: '5.2%' },
    { id: 8, model: 'Yamaha', count: 623, reach: '280K', engagement: '6.1%' },
  ];

  const articles = [
    { id: 1, title: 'Ultimate Strat Buying Guide', type: 'Buyer Guide', status: 'Published', views: 4821, ai: true },
    { id: 2, title: '10 Greatest Gibson Solos', type: 'Tutorial', status: 'Draft', views: 0, ai: false },
    { id: 3, title: 'Acoustic vs Electric: Full Comparison', type: 'Comparison', status: 'Published', views: 6543, ai: true },
    { id: 4, title: 'Shredding Techniques 101', type: 'Tutorial', status: 'Published', views: 3421, ai: false },
    { id: 5, title: 'Vintage Guitar Price Trends', type: 'Analysis', status: 'Scheduled', views: 0, ai: true },
    { id: 6, title: 'Setup & Maintenance Guide', type: 'How-To', status: 'Published', views: 5234, ai: false },
  ];

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
            Progress to 30 Seeded Guitars
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
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              <MkTH>Model</MkTH>
              <MkTH>Posts</MkTH>
              <MkTH>Reach</MkTH>
              <MkTH>Engagement</MkTH>
            </tr>
          </thead>
          <tbody>
            {seededGuitars.map((guitar) => (
              <tr key={guitar.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: '12px 16px', color: T.txt, fontSize: '13px', fontWeight: 600 }}>
                  {guitar.model}
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {guitar.count}
                </td>
                <td style={{ padding: '12px 16px', color: T.txt2, fontSize: '13px' }}>
                  {guitar.reach}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <MkBadge
                    text={guitar.engagement}
                    color={colors.green}
                    bg={colors.greenBg}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (activeScreen === 'articles') {
    return (
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          Articles & Content
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              <MkTH>Title</MkTH>
              <MkTH>Type</MkTH>
              <MkTH>Status</MkTH>
              <MkTH>Views</MkTH>
              <MkTH>AI</MkTH>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: '12px 16px', color: T.txt, fontSize: '13px' }}>
                  {article.title}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <MkBadge text={article.type} color={colors.blue} bg={colors.blueBg} />
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
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  {article.ai && <span style={{ color: colors.green, fontWeight: 700 }}>✓</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    return (
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: T.txt, marginBottom: '16px' }}>
          Email Template Editor
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: T.txt, marginBottom: '12px' }}>
              Editor
            </h3>
            <div
              style={{
                padding: '16px',
                backgroundColor: T.bgElev,
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: T.txt2,
                minHeight: '300px',
              }}
            >
              {'<div>'}<br />
              {'  <h1>Welcome {name}</h1>'}<br />
              {'  <p>Thanks for joining TWNG!</p>'}<br />
              {'  <button>Get Started</button>'}<br />
              {'</div>'}
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: T.txt, marginBottom: '12px' }}>
              Preview
            </h3>
            <div
              style={{
                padding: '16px',
                backgroundColor: '#fff',
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
                minHeight: '300px',
                color: '#000',
              }}
            >
              <h1 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                Welcome John
              </h1>
              <p style={{ marginBottom: '12px' }}>Thanks for joining TWNG!</p>
              <button
                style={{
                  padding: '8px 16px',
                  backgroundColor: colors.warmAlways,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                }}
              >
                Get Started
              </button>
            </div>
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

  const northStarMetric = {
    name: 'Monthly Active Members',
    value: '47,234',
    change: '+12.4%',
    target: '50,000',
    progress: 94.5,
  };

  const primaryKPIs = [
    { id: 1, name: 'Total Guitars Claimed', value: '12,847', change: '+5.2%', color: colors.green },
    { id: 2, name: 'Member Signups', value: '2,143', change: '+8.7%', color: colors.blue },
    { id: 3, name: 'Content Posts', value: '8,234', change: '+3.1%', color: colors.orange },
    { id: 4, name: 'Email Engagement', value: '34.2%', change: '+2.3%', color: colors.purple },
  ];

  const funnelKPIs = [
    { stage: 'Signup', count: 8423, rate: '100%' },
    { stage: 'Profile Complete', count: 6234, rate: '74%' },
    { stage: 'Guitar Claimed', count: 5123, rate: '61%' },
  ];

  const budgetBreakdown = [
    { channel: 'Meta Ads', spend: '$5,084', percent: 32 },
    { channel: 'Google Ads', spend: '$6,240', percent: 39 },
    { channel: 'Email Marketing', spend: '$2,340', percent: 15 },
    { channel: 'Content Creation', spend: '$2,156', percent: 14 },
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

  const setupTasks = [
    { id: 1, name: 'Create admin account', completed: true },
    { id: 2, name: 'Set up Supabase', completed: true },
    { id: 3, name: 'Configure email system', completed: true },
    { id: 4, name: 'Set up analytics', completed: false },
    { id: 5, name: 'Configure payment processing', completed: false },
    { id: 6, name: 'Set up CDN', completed: true },
    { id: 7, name: 'Create brand guidelines', completed: false },
    { id: 8, name: 'Train support team', completed: false },
  ];

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
              style={{
                padding: '16px',
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
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
