import axios from 'axios';
import { createLogger } from '../utils/logger';

const logger = createLogger('PlatformService');

interface PlatformRating {
  rating: number | null;
  username: string;
  error?: string;
}

/**
 * Fetch LeetCode rating using GraphQL API
 * LeetCode's GraphQL API is the most reliable method
 */
export async function fetchLeetCodeRating(username: string): Promise<PlatformRating> {
  try {
    // Use the correct GraphQL query for LeetCode
    const query = `
      query userPublicProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            ranking
            reputation
          }
          submitStats {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
            totalSubmissionNum {
              difficulty
              count
              submissions
            }
          }
        }
      }
    `;

    // Try GraphQL API first (most reliable)
    try {
      const graphqlResponse = await axios.post(
        'https://leetcode.com/graphql/',
        {
          query,
          variables: { username },
          operationName: 'userPublicProfile'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': `https://leetcode.com/${username}/`,
            'Origin': 'https://leetcode.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'x-csrftoken': '',
            'Cookie': ''
          },
          timeout: 20000,
          validateStatus: (status) => status < 500
        }
      );

      // Check for GraphQL errors
      if (graphqlResponse.data?.errors) {
        const errorMsg = graphqlResponse.data.errors[0]?.message || 'User not found';
        logger.error('LeetCode GraphQL error', { username, error: errorMsg });
        return { rating: null, username, error: errorMsg };
      }

      const matchedUser = graphqlResponse.data?.data?.matchedUser;
      
      if (!matchedUser) {
        return { rating: null, username, error: 'User not found' };
      }

      // Extract solved problems
      const solvedProblems = matchedUser.submitStats?.acSubmissionNum?.find(
        (stat: any) => stat.difficulty === 'All'
      )?.count || 0;

      const ranking = matchedUser.profile?.ranking || 0;
      const reputation = matchedUser.profile?.reputation || 0;

      // Calculate rating: base on solved problems + ranking + reputation
      let rating = solvedProblems * 10;
      
      // Add ranking bonus (lower rank = better = higher score)
      if (ranking > 0 && ranking < 100000) {
        rating += Math.max(0, (100000 - ranking) / 10);
      }
      
      // Add reputation bonus
      if (reputation > 0) {
        rating += reputation / 100;
      }

      // Cap at reasonable maximum
      rating = Math.min(rating, 5000);

      if (solvedProblems > 0 || rating > 0) {
        return { rating: Math.round(rating), username };
      }

      return { rating: null, username, error: 'User profile found but no solved problems data available' };
    } catch (graphqlError: any) {
      logger.warn('GraphQL API failed, trying profile page scraping', { username, error: graphqlError.message });
      
      // Fallback to profile page scraping
      try {
        const profileUrl = `https://leetcode.com/${username}/`;
        
        const response = await axios.get(profileUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://leetcode.com/'
          },
          timeout: 15000,
          validateStatus: (status) => status < 500
        });

        if (response.status === 404) {
          return { rating: null, username, error: 'User not found' };
        }

        const html = response.data;
        
        // Try to extract from various patterns in HTML
        const patterns = [
          /"numSolved":\s*(\d+)/,
          /"solved":\s*(\d+)/,
          /(\d+)\s*problems?\s*(?:solved|completed)/i,
          /solved[:\s]+(\d+)/i
        ];

        for (const pattern of patterns) {
          const match = html.match(pattern);
          if (match && match[1]) {
            const solved = parseInt(match[1], 10);
            if (solved > 0) {
              const rating = Math.min(solved * 10, 5000);
              return { rating: Math.round(rating), username };
            }
          }
        }

        return { rating: null, username, error: 'Could not extract data from profile page' };
      } catch (scrapeError: any) {
        logger.error('Profile scraping also failed', { username, error: scrapeError.message });
        return { rating: null, username, error: 'Could not fetch LeetCode data. User may not exist or profile is private.' };
      }
    }

  } catch (error: any) {
    logger.error('Error fetching LeetCode rating', { username, error: error.message, code: error.code });
    
    // Handle timeout specifically
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return { rating: null, username, error: 'Request timed out. LeetCode API is slow. Please try again in a moment.' };
    }
    
    // Network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return { rating: null, username, error: 'Cannot reach LeetCode. Please check your internet connection.' };
    }
    
    // If it's a 404 or user not found
    if (error.response?.status === 404 || error.response?.data?.errors) {
      return { rating: null, username, error: 'User not found' };
    }
    
    return { rating: null, username, error: error.message || 'Failed to fetch rating' };
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
