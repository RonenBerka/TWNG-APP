/**
 * Activity Feed Service
 * Placeholder implementation for fetching user activity
 * Replace with actual API calls as needed
 */

export async function getActivityFeed(userId, limit = 10) {
  try {
    // TODO: Replace with actual API call to your backend
    // const response = await fetch(`/api/users/${userId}/activity?limit=${limit}`);
    // const data = await response.json();
    // return data;

    // Placeholder mock data structure
    return [
      {
        id: '1',
        type: 'added_instrument',
        title: 'Added a new instrument',
        description: 'Added "1959 Les Paul" to collection',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        icon: 'guitar',
      },
      {
        id: '2',
        type: 'created_collection',
        title: 'Created a new collection',
        description: 'Created collection "Vintage Guitars"',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        icon: 'folder',
      },
      {
        id: '3',
        type: 'wrote_article',
        title: 'Published an article',
        description: 'Published "The History of the Electric Guitar"',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        icon: 'file-text',
      },
      {
        id: '4',
        type: 'joined_forum',
        title: 'Participated in forum',
        description: 'Replied to "Best Beginner Guitars" thread',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        icon: 'message-circle',
      },
      {
        id: '5',
        type: 'earned_badge',
        title: 'Earned a badge',
        description: 'Earned "First Collection" badge',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
        icon: 'award',
      },
    ];
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return [];
  }
}

/**
 * Utility function to get icon name for activity type
 */
export function getActivityIcon(activityType) {
  const iconMap = {
    added_instrument: 'guitar',
    created_collection: 'folder',
    wrote_article: 'file-text',
    joined_forum: 'message-circle',
    earned_badge: 'award',
  };
  return iconMap[activityType] || 'activity';
}

export default { getActivityFeed, getActivityIcon };
