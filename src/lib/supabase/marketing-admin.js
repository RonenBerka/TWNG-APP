import { supabase } from './client';

// ── Outreach & Claims (Module 1) ──

export async function getOutreachQueue({ status, search, page = 1, perPage = 20 } = {}) {
  let query = supabase.from('outreach_queue').select('*', { count: 'exact' })
    .order('score', { ascending: false });
  if (status && status !== 'all') query = query.eq('status', status);
  if (search) query = query.or(`handle.ilike.%${search}%,guitar_brand.ilike.%${search}%`);
  query = query.range((page - 1) * perPage, page * perPage - 1);
  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data || [], count };
}

export async function updateOutreachStatus(id, status) {
  const { error } = await supabase.from('outreach_queue').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function getFoundingMembers() {
  const { data, error } = await supabase.from('founding_members').select('*').order('joined_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getVerificationQueue({ status } = {}) {
  let query = supabase.from('verification_queue').select('*').order('created_at', { ascending: false });
  if (status && status !== 'all') query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function updateVerificationStatus(id, status, reviewerId) {
  const { error } = await supabase.from('verification_queue')
    .update({ status, reviewed_by: reviewerId, reviewed_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function getInfluencerPipeline() {
  const { data, error } = await supabase.from('influencer_pipeline').select('*').order('last_contact', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateInfluencerStage(id, stage) {
  const { error } = await supabase.from('influencer_pipeline').update({ stage, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

// ── Automation Engine (Module 2) ──

export async function getAutomationSystems() {
  const { data, error } = await supabase.from('automation_config').select('*').order('system_key');
  if (error) throw error;
  return data || [];
}

export async function getAutomationRuns({ systemKey, limit = 20 } = {}) {
  let query = supabase.from('automation_runs').select('*').order('started_at', { ascending: false }).limit(limit);
  if (systemKey) query = query.eq('system_key', systemKey);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getPipelineLogs({ systemKey, status, limit = 50 } = {}) {
  let query = supabase.from('pipeline_logs').select('*').order('created_at', { ascending: false }).limit(limit);
  if (systemKey) query = query.eq('system_key', systemKey);
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function updateAutomationConfig(systemKey, config) {
  const { error } = await supabase.from('automation_config')
    .update({ config, updated_at: new Date().toISOString() }).eq('system_key', systemKey);
  if (error) throw error;
}

// ── Content Hub (Module 3) ──

export async function getSeededGuitars() {
  const { data, error } = await supabase.from('instrument_entities')
    .select('*').eq('source', 'seeded').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getContentCalendar({ weekStart } = {}) {
  let query = supabase.from('content_calendar').select('*').order('scheduled_date');
  if (weekStart) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    query = query.gte('scheduled_date', weekStart).lt('scheduled_date', weekEnd.toISOString());
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getUGCItems({ status } = {}) {
  const { data, error } = await supabase.from('social_engagement')
    .select('*').eq('type', 'ugc').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getForumPosts() {
  const { data, error } = await supabase.from('social_posts')
    .select('*').eq('channel', 'forum').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ── Email Center (Module 4) ──

export async function getEmailSequences() {
  const { data, error } = await supabase.from('email_sequences').select('*').order('created_at');
  if (error) throw error;
  return data || [];
}

export async function getEmailSubscribers({ segment } = {}) {
  let query = supabase.from('email_subscribers').select('*', { count: 'exact' });
  if (segment && segment !== 'all') query = query.contains('segments', [segment]);
  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data || [], count };
}

export async function getEmailEvents({ sequenceId, limit = 100 } = {}) {
  let query = supabase.from('email_events').select('*').order('timestamp', { ascending: false }).limit(limit);
  if (sequenceId) query = query.eq('sequence_id', sequenceId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getEmailTemplates() {
  const { data, error } = await supabase.from('email_templates').select('*').order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateSequenceStatus(id, status) {
  const { error } = await supabase.from('email_sequences')
    .update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

// ── Paid Campaigns (Module 5) ──

export async function getAdCampaigns({ platform, status } = {}) {
  let query = supabase.from('ad_campaigns').select('*').order('created_at', { ascending: false });
  if (platform) query = query.eq('platform', platform);
  if (status && status !== 'all') query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getAdPerformance({ campaignId, dateRange } = {}) {
  let query = supabase.from('ad_performance').select('*').order('date', { ascending: false });
  if (campaignId) query = query.eq('campaign_id', campaignId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getBudgetAllocations() {
  const { data, error } = await supabase.from('budget_allocations').select('*').order('channel');
  if (error) throw error;
  return data || [];
}

export async function updateCampaignStatus(id, status) {
  const { error } = await supabase.from('ad_campaigns')
    .update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

// ── Social Command (Module 6) ──

export async function getSocialChannels() {
  const { data, error } = await supabase.from('social_channels').select('*').order('name');
  if (error) throw error;
  return data || [];
}

export async function getSocialPosts({ channel, status, weekStart } = {}) {
  let query = supabase.from('social_posts').select('*').order('scheduled_date');
  if (channel) query = query.eq('channel', channel);
  if (status) query = query.eq('status', status);
  if (weekStart) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    query = query.gte('scheduled_date', weekStart).lt('scheduled_date', weekEnd.toISOString());
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getSocialEngagement({ replied } = {}) {
  let query = supabase.from('social_engagement').select('*').order('created_at', { ascending: false });
  if (replied !== undefined) query = query.eq('replied', replied);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// ── KPI Dashboard (Module 7) ──

export async function getKPISnapshots({ limit = 12 } = {}) {
  const { data, error } = await supabase.from('weekly_kpi_snapshots')
    .select('*').order('week_start', { ascending: false }).limit(limit);
  if (error) throw error;
  return data || [];
}

export async function saveKPISnapshot(snapshot) {
  const { error } = await supabase.from('weekly_kpi_snapshots').insert(snapshot);
  if (error) throw error;
}

// ── Setup & Config (Module 8) ──

export async function getSetupTasks() {
  const { data, error } = await supabase.from('setup_tasks').select('*').order('priority');
  if (error) throw error;
  return data || [];
}

export async function updateSetupTask(id, updates) {
  const { error } = await supabase.from('setup_tasks')
    .update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function getDecisions() {
  const { data, error } = await supabase.from('decisions_log').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
