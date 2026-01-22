import { Router, Request, Response } from 'express';
import { getSupabaseClient } from '../database/supabase';
import { createLogger } from '../utils/logger';

const router = Router();
const logger = createLogger('UserRoutes');

// Create new user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { username, email, rating } = req.body;

    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }

    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch (supabaseError: any) {
      logger.error('Failed to get Supabase client', supabaseError);
      return res.status(500).json({ 
        error: 'Database connection failed',
        details: supabaseError?.message || 'Supabase not configured'
      });
    }

    // Check if username or email already exists
    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('id')
      .or(`username.eq.${username},email.eq.${email}`)
      .limit(1);

    if (checkError) {
      logger.error('Error checking existing user', checkError);
      return res.status(500).json({ 
        error: 'Failed to check existing user',
        details: checkError.message
      });
    }

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        username,
        email,
        rating: rating || 1200
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating user', { error, message: error.message, details: error.details, hint: error.hint });
      return res.status(500).json({ 
        error: 'Failed to create user',
        details: error.message || 'Unknown error',
        hint: error.hint || ''
      });
    }

    if (!user) {
      logger.error('User created but no data returned');
      return res.status(500).json({ error: 'User created but no data returned' });
    }

    res.json({ user });
  } catch (error: any) {
    logger.error('Error creating user (catch block)', { 
      error, 
      message: error?.message, 
      stack: error?.stack 
    });
    res.status(500).json({ 
      error: 'Internal server error',
      details: error?.message || 'Unknown error'
    });
  }
});

// Search users by username (excluding current user and existing friends)
// For login: currentUserId can be empty, will search all users
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    const currentUserId = req.query.currentUserId as string;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const supabase = getSupabaseClient();
    
    let friendIds = new Set<string>();
    
    // Only get friends if currentUserId is provided (for friend search, not login)
    if (currentUserId && currentUserId.trim() !== '') {
      // Get current user's friends
      const { data: friendships } = await supabase
        .from('friendships')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`);

      // Extract friend IDs
      if (friendships) {
        friendships.forEach((f: any) => {
          if (f.user1_id === currentUserId) {
            friendIds.add(f.user2_id);
          } else {
            friendIds.add(f.user1_id);
          }
        });
      }
    }

    // Search users by username
    let queryBuilder = supabase
      .from('users')
      .select('id, username, email, rating, avatar_url, created_at')
      .ilike('username', `%${query}%`)
      .limit(20);

    // Only exclude current user if provided
    if (currentUserId && currentUserId.trim() !== '') {
      queryBuilder = queryBuilder.neq('id', currentUserId);
    }

    const { data: users, error } = await queryBuilder;

    if (error) {
      logger.error('Error searching users', error);
      return res.status(500).json({ error: 'Failed to search users' });
    }

    // Filter out friends from results (only if currentUserId was provided)
    const filteredUsers = (users || []).filter(u => !friendIds.has(u.id));

    res.json({ users: filteredUsers });
  } catch (error: any) {
    logger.error('Error in user search', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login - Find user by username or email (exact match)
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, email } = req.body;

    if (!username && !email) {
      return res.status(400).json({ error: 'Username or email is required' });
    }

    const supabase = getSupabaseClient();

    let queryBuilder = supabase
      .from('users')
      .select('id, username, email, rating, avatar_url, created_at, full_name')
      .limit(1);

    if (username) {
      queryBuilder = queryBuilder.eq('username', username);
    } else if (email) {
      queryBuilder = queryBuilder.eq('email', email);
    }

    const { data: users, error } = await queryBuilder;

    if (error) {
      logger.error('Error finding user for login', error);
      return res.status(500).json({ error: 'Failed to find user' });
    }

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    res.json({ user });
  } catch (error: any) {
    logger.error('Error in login', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const supabase = getSupabaseClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, rating, avatar_url, full_name, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error: any) {
    logger.error('Error fetching user', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send friend request
router.post('/friend-request', async (req: Request, res: Response) => {
  try {
    const { fromUserId, toUserId } = req.body;

    if (!fromUserId || !toUserId) {
      return res.status(400).json({ error: 'fromUserId and toUserId are required' });
    }

    if (fromUserId === toUserId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    const supabase = getSupabaseClient();

    // Check if users exist
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .in('id', [fromUserId, toUserId]);

    if (usersError || !users || users.length !== 2) {
      return res.status(404).json({ error: 'One or both users not found' });
    }

    // Check if already friends
    const { data: existingFriendship } = await supabase
      .from('friendships')
      .select('id')
      .or(`and(user1_id.eq.${fromUserId},user2_id.eq.${toUserId}),and(user1_id.eq.${toUserId},user2_id.eq.${fromUserId})`)
      .limit(1);

    if (existingFriendship && existingFriendship.length > 0) {
      return res.status(400).json({ error: 'Already friends' });
    }

    // Check if request already exists (either direction)
    const { data: existingRequests } = await supabase
      .from('friend_requests')
      .select('id, status')
      .or(`and(from_user_id.eq.${fromUserId},to_user_id.eq.${toUserId}),and(from_user_id.eq.${toUserId},to_user_id.eq.${fromUserId})`)
      .eq('status', 'pending');
    
    const existingRequest = existingRequests && existingRequests.length > 0 ? existingRequests[0] : null;

    if (existingRequest) {
      return res.status(400).json({ error: 'Friend request already exists' });
    }

    // Create friend request
    const { data: request, error: requestError } = await supabase
      .from('friend_requests')
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        status: 'pending'
      })
      .select()
      .single();

    if (requestError) {
      logger.error('Error creating friend request', { 
        error: requestError, 
        message: requestError.message, 
        details: requestError.details,
        hint: requestError.hint,
        code: requestError.code
      });
      return res.status(500).json({ 
        error: 'Failed to send friend request',
        details: requestError.message || 'Unknown error',
        hint: requestError.hint || 'Check RLS policies in Supabase'
      });
    }

    res.json({ success: true, request });
  } catch (error: any) {
    logger.error('Error sending friend request', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get friend requests for a user
router.get('/friend-requests/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const supabase = getSupabaseClient();

    // Get incoming requests
    const { data: incoming, error: incomingError } = await supabase
      .from('friend_requests')
      .select(`
        id,
        from_user_id,
        status,
        created_at,
        from_user:users!friend_requests_from_user_id_fkey(id, username, rating, avatar_url)
      `)
      .eq('to_user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (incomingError) {
      logger.error('Error fetching incoming requests', incomingError);
    }

    // Get outgoing requests  
    const { data: outgoing, error: outgoingError } = await supabase
      .from('friend_requests')
      .select(`
        id,
        to_user_id,
        status,
        created_at,
        to_user:users!friend_requests_to_user_id_fkey(id, username, rating, avatar_url)
      `)
      .eq('from_user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (outgoingError) {
      logger.error('Error fetching outgoing requests', outgoingError);
    }

    res.json({
      incoming: incoming || [],
      outgoing: outgoing || []
    });
  } catch (error: any) {
    logger.error('Error fetching friend requests', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Accept friend request
router.post('/friend-request/accept', async (req: Request, res: Response) => {
  try {
    const { requestId, userId } = req.body;

    if (!requestId || !userId) {
      return res.status(400).json({ error: 'requestId and userId are required' });
    }

    const supabase = getSupabaseClient();

    // Get the request
    const { data: request, error: requestError } = await supabase
      .from('friend_requests')
      .select('from_user_id, to_user_id')
      .eq('id', requestId)
      .eq('to_user_id', userId)
      .eq('status', 'pending')
      .single();

    if (requestError || !request) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    // Update request status
    const { error: updateError } = await supabase
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (updateError) {
      logger.error('Error updating request', updateError);
      return res.status(500).json({ error: 'Failed to accept request' });
    }

    // Create friendship (bidirectional - ensure user1_id < user2_id)
    const user1Id = request.from_user_id < request.to_user_id ? request.from_user_id : request.to_user_id;
    const user2Id = request.from_user_id < request.to_user_id ? request.to_user_id : request.from_user_id;

    const { error: friendshipError } = await supabase
      .from('friendships')
      .insert([
        {
          user1_id: user1Id,
          user2_id: user2Id
        }
      ]);

    if (friendshipError) {
      logger.error('Error creating friendship', friendshipError);
      return res.status(500).json({ error: 'Failed to create friendship' });
    }

    res.json({ success: true });
  } catch (error: any) {
    logger.error('Error accepting friend request', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject friend request
router.post('/friend-request/reject', async (req: Request, res: Response) => {
  try {
    const { requestId, userId } = req.body;

    if (!requestId || !userId) {
      return res.status(400).json({ error: 'requestId and userId are required' });
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId)
      .eq('to_user_id', userId)
      .eq('status', 'pending');

    if (error) {
      logger.error('Error rejecting request', error);
      return res.status(500).json({ error: 'Failed to reject request' });
    }

    res.json({ success: true });
  } catch (error: any) {
    logger.error('Error rejecting friend request', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get friends list
router.get('/friends/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const supabase = getSupabaseClient();

    // Get friendships where user is user1 or user2
    const { data: friendships, error } = await supabase
      .from('friendships')
      .select(`
        id,
        user1_id,
        user2_id,
        user1:users!friendships_user1_id_fkey(id, username, rating, avatar_url, email),
        user2:users!friendships_user2_id_fkey(id, username, rating, avatar_url, email)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (error) {
      logger.error('Error fetching friends', error);
      return res.status(500).json({ error: 'Failed to fetch friends' });
    }

    // Map to friend objects
    const friends = (friendships || []).map((friendship: any) => {
      const friend: any = friendship.user1_id === userId ? friendship.user2 : friendship.user1;
      return {
        id: friend.id,
        username: friend.username,
        rating: friend.rating,
        avatar_url: friend.avatar_url,
        email: friend.email
      };
    });

    res.json({ friends });
  } catch (error: any) {
    logger.error('Error fetching friends', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove friend
router.delete('/friends/:userId/:friendId', async (req: Request, res: Response) => {
  try {
    const { userId, friendId } = req.params;
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('friendships')
      .delete()
      .or(`and(user1_id.eq.${userId},user2_id.eq.${friendId}),and(user1_id.eq.${friendId},user2_id.eq.${userId})`);

    if (error) {
      logger.error('Error removing friend', error);
      return res.status(500).json({ error: 'Failed to remove friend' });
    }

    res.json({ success: true });
  } catch (error: any) {
    logger.error('Error removing friend', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as userRouter };
