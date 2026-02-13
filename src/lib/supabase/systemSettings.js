import { supabase } from './client.js';

/**
 * System settings service — for managing application configuration.
 *
 * Provides functions to get and set system-wide settings stored as key-value pairs.
 * Settings are stored in the system_settings table with JSONB values.
 */

/**
 * Get a single system setting by key.
 * @param {string} key - The setting key
 * @param {*} defaultValue - Default value if setting not found
 * @returns {Promise<*>} The setting value
 */
export async function getSetting(key, defaultValue = null) {
  try {
    // READ by key — setting may not exist
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .maybeSingle();

    if (error) throw error;
    return data ? data.setting_value : defaultValue;
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error.message);
    throw error;
  }
}

/**
 * Set or update a system setting.
 * @param {string} key - The setting key
 * @param {*} value - The setting value (can be any JSON-serializable type)
 * @param {string} updatedBy - User ID of who made the change
 * @returns {Promise<Object>} Updated setting record
 */
export async function setSetting(key, value, updatedBy = null) {
  try {
    // Check if setting exists
    // READ by key — setting may not exist yet
    const { data: existing, error: fetchError } = await supabase
      .from('system_settings')
      .select('id')
      .eq('setting_key', key)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('system_settings')
        .update({
          setting_value: value,
          updated_by_user_id: updatedBy,
          updated_at: new Date().toISOString(),
        })
        .eq('setting_key', key)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('system_settings')
        .insert({
          setting_key: key,
          setting_value: value,
          updated_by_user_id: updatedBy,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error(`Error setting ${key}:`, error.message);
    throw error;
  }
}

/**
 * Get all system settings.
 * @returns {Promise<Object>} Object with all settings as key-value pairs
 */
export async function getAllSettings() {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_key, setting_value')
      .order('setting_key', { ascending: true });

    if (error) throw error;

    // Convert array to object
    const settings = {};
    if (data) {
      data.forEach(item => {
        settings[item.setting_key] = item.setting_value;
      });
    }
    return settings;
  } catch (error) {
    console.error('Error fetching all settings:', error.message);
    throw error;
  }
}

/**
 * Get all settings that start with a specific prefix.
 * Useful for getting related settings (e.g., all 'email_' prefixed settings).
 * @param {string} prefix - The key prefix to filter by
 * @returns {Promise<Object>} Object with matching settings as key-value pairs
 */
export async function getSettingsByPrefix(prefix) {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_key, setting_value')
      .ilike('setting_key', `${prefix}%`)
      .order('setting_key', { ascending: true });

    if (error) throw error;

    // Convert array to object
    const settings = {};
    if (data) {
      data.forEach(item => {
        settings[item.setting_key] = item.setting_value;
      });
    }
    return settings;
  } catch (error) {
    console.error(`Error fetching settings with prefix ${prefix}:`, error.message);
    throw error;
  }
}

/**
 * Delete a system setting by key.
 * @param {string} key - The setting key to delete
 * @returns {Promise<void>}
 */
export async function deleteSetting(key) {
  try {
    const { error } = await supabase
      .from('system_settings')
      .delete()
      .eq('setting_key', key);

    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting setting ${key}:`, error.message);
    throw error;
  }
}
