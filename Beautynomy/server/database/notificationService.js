import supabase from '../config/supabase.js';

/**
 * Notification Service for Supabase
 * Handles price drop notifications
 */

class NotificationService {
  /**
   * Create a new notification
   */
  async create(notificationData) {
    if (!supabase) {
      // Fallback to in-memory for development
      return {
        id: `notif_${Date.now()}`,
        ...notificationData,
        created_at: new Date()
      };
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        type: notificationData.type || 'price_drop',
        product_id: notificationData.productId,
        product_name: notificationData.productName,
        drops: notificationData.drops,
        read: false
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      type: data.type,
      productId: data.product_id,
      productName: data.product_name,
      drops: data.drops,
      read: data.read,
      createdAt: data.created_at
    };
  }

  /**
   * Get all notifications
   */
  async getAll(unreadOnly = false) {
    if (!supabase) return [];

    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(n => ({
      id: n.id,
      type: n.type,
      productId: n.product_id,
      productName: n.product_name,
      drops: n.drops,
      read: n.read,
      createdAt: n.created_at
    }));
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    if (!supabase) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    if (!supabase) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false);

    if (error) throw error;
  }

  /**
   * Delete notification
   */
  async delete(notificationId) {
    if (!supabase) return;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  }

  /**
   * Clear all notifications
   */
  async clearAll() {
    if (!supabase) return;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) throw error;
  }

  /**
   * Get notification count
   */
  async getCount(unreadOnly = false) {
    if (!supabase) return 0;

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true });

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { count, error } = await query;

    if (error) throw error;

    return count || 0;
  }
}

export default new NotificationService();
