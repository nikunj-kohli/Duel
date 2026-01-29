import axios from 'axios';
import { createLogger } from '../utils/logger';

const logger = createLogger('PlatformService');

interface PlatformRating {
  rating: number | null;
  username: string;
  error?: string;
  stats?: {
    totalSolved?: number;
    ranking?: number;
    contestRating?: number | null;
  };
}

/**
 * Fetch LeetCode rating using a stable public stats API.
 *
 * We use the unofficial `leetcode-stats-api` service:
 *   https://leetcode-stats-api.herokuapp.com/{username}
 *
 * This returns JSON like:
 * {
 *   "status": "success",
 *   "totalSolved": 620,
 *   "ranking": 109479,
 *   ...
 * }
 */
export async function fetchLeetCodeRating(username: string): Promise<PlatformRating> {
  try {
    const apiUrl = `https://leetcode-stats-api.herokuapp.com/${encodeURIComponent(username)}`;

    const response = await axios.get(apiUrl, {
      timeout: 15000,
      validateStatus: (status) => status < 500,
    });

    if (!response.data || response.data.status !== 'success') {
      const message = response.data?.message || 'Unknown error from LeetCode stats API';
      logger.error('LeetCode stats API error', { username, data: response.data });
      return { rating: null, username, error: message };
    }

    const stats = response.data;
    const totalSolved = stats.totalSolved || 0;
    const ranking = stats.ranking || 0;
    // This API does not expose contest rating; keep it null for now
    const contestRating = stats.contestRating ?? null;

    if (totalSolved === 0) {
      return {
        rating: null,
        username,
        error: 'User has no solved problems or stats are unavailable',
        stats: { totalSolved, ranking, contestRating },
      };
    }

    // We no longer invent our own \"rating\" for LeetCode.
    // Instead, we return the raw stats and leave rating null.
    return {
      rating: null,
      username,
      stats: {
        totalSolved,
        ranking,
        contestRating,
      },
    };
  } catch (error: any) {
    logger.error('Error fetching LeetCode rating via stats API', {
      username,
      error: error.message,
      code: error.code,
    });

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return { rating: null, username, error: 'LeetCode stats service timed out. Please try again.' };
    }

    return { rating: null, username, error: error.message || 'Failed to fetch rating from LeetCode stats API' };
  }
}

/**
 * Fetch Codeforces rating using their public API
 */
export async function fetchCodeforcesRating(handle: string): Promise<PlatformRating> {
  try {
    const response = await axios.get(
      `https://codeforces.com/api/user.info?handles=${handle}`,
      { 
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    if (response.data?.status !== 'OK' || !response.data?.result?.length) {
      return { rating: null, username: handle, error: 'User not found' };
    }

    const user = response.data.result[0];
    const rating = user.rating || user.maxRating || 0;

    return { rating, username: handle };
  } catch (error: any) {
    logger.error('Error fetching Codeforces rating', { handle, error: error.message });
    
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return { rating: null, username: handle, error: 'Request timed out. Please try again.' };
    }
    
    return { rating: null, username: handle, error: error.message || 'Failed to fetch rating' };
  }
}

/**
 * Fetch CodeChef rating - they don't have a public API, so we'll use web scraping
 * Note: This is a simplified version. In production, you might want to use a more robust solution
 */
export async function fetchCodeChefRating(username: string): Promise<PlatformRating> {
  try {
    // CodeChef doesn't have a public API, so we'll try to scrape their website
    // This is a basic implementation - you may need to adjust based on their HTML structure
    const response = await axios.get(
      `https://www.codechef.com/users/${username}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 15000
      }
    );

    const html = response.data;
    
    // Try to extract rating from the HTML
    // CodeChef stores rating in various places, this is a simplified extraction
    // Look for rating in data attributes or script tags
    const ratingMatch = html.match(/"rating":"(\d+)"/) || 
                       html.match(/rating["\s]*:["\s]*(\d+)/i) ||
                       html.match(/Rating[\s:]*(\d+)/i) ||
                       html.match(/data-rating=["']?(\d+)/i);
    
    if (ratingMatch && ratingMatch[1]) {
      const rating = parseInt(ratingMatch[1], 10);
      return { rating, username };
    }

    // Alternative: try to find in JSON-LD or script tags
    const jsonMatch = html.match(/<script[^>]*>[\s\S]*?"rating":\s*(\d+)[\s\S]*?<\/script>/i);
    if (jsonMatch && jsonMatch[1]) {
      const rating = parseInt(jsonMatch[1], 10);
      return { rating, username };
    }

    return { rating: null, username, error: 'Could not extract rating from profile' };
  } catch (error: any) {
    logger.error('Error fetching CodeChef rating', { username, error: error.message });
    
    // If it's a 404, user doesn't exist
    if (error.response?.status === 404) {
      return { rating: null, username, error: 'User not found' };
    }
    
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return { rating: null, username, error: 'Request timed out. Please try again.' };
    }
    
    return { rating: null, username, error: error.message || 'Failed to fetch rating' };
  }
}

/**
 * Fetch rating for a specific platform
 */
export async function fetchPlatformRating(
  platform: 'leetcode' | 'codeforces' | 'codechef',
  username: string
): Promise<PlatformRating> {
  switch (platform) {
    case 'leetcode':
      return fetchLeetCodeRating(username);
    case 'codeforces':
      return fetchCodeforcesRating(username);
    case 'codechef':
      return fetchCodeChefRating(username);
    default:
      return { rating: null, username, error: 'Unknown platform' };
  }
}
