import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Trophy, Users, Link2, Plus, X, Check, ArrowLeft, Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface ProfileProps {
  user: any;
  onLogout: () => void;
  onBack?: () => void;
}

export function Profile({ user, onLogout, onBack }: ProfileProps) {
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState(user.platforms || {
    leetcode: "",
    codeforces: "",
    codechef: ""
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Load friends and friend requests on mount
  useEffect(() => {
    loadFriends();
    loadFriendRequests();
  }, [user.id]);

  const loadFriends = async () => {
    try {
      const response = await fetch(`http://localhost:3002/api/users/friends/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const response = await fetch(`http://localhost:3002/api/users/friend-requests/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        // Map incoming requests to the format we need
        const incoming = (data.incoming || []).map((req: any) => ({
          id: req.id,
          username: req.from_user?.username || 'Unknown',
          rating: req.from_user?.rating || 0,
          avatar: req.from_user?.avatar_url || '',
          requestId: req.id
        }));
        setFriendRequests(incoming);
      }
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      setSearchLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3002/api/users/search?query=${encodeURIComponent(query)}&currentUserId=${user.id}`
        );
        if (response.ok) {
          const data = await response.json();
          // Backend already filters out friends, but filter out pending requests
          const requestIds = new Set(friendRequests.map(fr => fr.requestId || fr.id));
          const filtered = (data.users || []).filter((u: any) => 
            !requestIds.has(u.id)
          );
          setSearchResults(filtered);
          setShowSearch(true);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  };

  const handleAddFriend = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3002/api/users/friend-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromUserId: user.id,
          toUserId: userId
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert('Friend request sent successfully!');
        setSearchQuery("");
        setSearchResults([]);
        setShowSearch(false);
        // Reload friend requests to show outgoing request
        loadFriendRequests();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Failed to send friend request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformInputChange = (platform: string, value: string) => {
    setPlatforms({ ...platforms, [platform]: value });
  };

  const handleConnect = async (platform: string) => {
    const username = platforms[platform as keyof typeof platforms];
    if (!username.trim()) {
      alert(`Please enter your ${platform} username first`);
      return;
    }
    // Mock platform ratings - in real app, fetch from platform APIs
    const mockRatings: Record<string, number> = {
      leetcode: 1850,
      codeforces: 1650,
      codechef: 1750
    };
    
    // TODO: Save to backend via API
    console.log(`Connecting ${platform} with username: ${username}`);
    
    // Store platform rating
    const updatedPlatforms = {
      ...platforms,
      [`${platform}_rating`]: mockRatings[platform] || 0,
      [`${platform}_connected`]: true
    };
    setPlatforms(updatedPlatforms);
    
    alert(`${platform} connected successfully! Rating: ${mockRatings[platform] || 'N/A'}`);
  };

  const handleAcceptRequest = async (requestId: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3002/api/users/friend-request/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          userId: user.id
        })
      });

      if (response.ok) {
        const request = friendRequests.find(r => r.requestId === requestId);
        if (request) {
          setFriends([...friends, {
            id: request.id,
            username: request.username,
            rating: request.rating,
            avatar: request.avatar
          }]);
        }
        setFriendRequests(friendRequests.filter(r => r.requestId !== requestId));
        alert('Friend request accepted!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to accept friend request');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert('Failed to accept friend request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3002/api/users/friends/${user.id}/${friendId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setFriends(friends.filter(f => f.id !== friendId));
        alert('Friend removed successfully');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to remove friend');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('Failed to remove friend. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3002/api/users/friend-request/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          userId: user.id
        })
      });

      if (response.ok) {
        setFriendRequests(friendRequests.filter(r => r.requestId !== requestId));
        alert('Friend request rejected');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to reject friend request');
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      alert('Failed to reject friend request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack || (() => window.history.back())}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
              Profile
            </h1>
          </div>
          <Button variant="outline" onClick={onLogout}>
            Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 border-2">
            <CardHeader>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold">{user.username}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant="default" className="text-lg px-4 py-1">
                  <Trophy className="h-4 w-4 mr-2" />
                  Rating: {user.rating || 1200}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          <Card className="md:col-span-2 border-2">
            <Tabs defaultValue="platforms" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="platforms">Platforms</TabsTrigger>
                <TabsTrigger value="friends">Friends</TabsTrigger>
                <TabsTrigger value="requests">Requests</TabsTrigger>
              </TabsList>

              <TabsContent value="platforms" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Connect Your Platforms</CardTitle>
                    <div className="text-sm text-muted-foreground mt-2">
                      Connect your accounts to display ratings and filter by platform
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>LeetCode Username</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="your_leetcode_username"
                          value={platforms.leetcode || ''}
                          onChange={(e) => handlePlatformInputChange('leetcode', e.target.value)}
                        />
                        <Button onClick={() => handleConnect('leetcode')}>
                          <Link2 className="h-4 w-4 mr-2" />
                          {platforms.leetcode_connected ? 'Update' : 'Connect'}
                        </Button>
                      </div>
                      {platforms.leetcode_connected && platforms.leetcode_rating && (
                        <div className="flex items-center gap-2 text-sm">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span>Rating: <strong>{platforms.leetcode_rating}</strong></span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Codeforces Handle</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="your_codeforces_handle"
                          value={platforms.codeforces || ''}
                          onChange={(e) => handlePlatformInputChange('codeforces', e.target.value)}
                        />
                        <Button onClick={() => handleConnect('codeforces')}>
                          <Link2 className="h-4 w-4 mr-2" />
                          {platforms.codeforces_connected ? 'Update' : 'Connect'}
                        </Button>
                      </div>
                      {platforms.codeforces_connected && platforms.codeforces_rating && (
                        <div className="flex items-center gap-2 text-sm">
                          <Trophy className="h-4 w-4 text-blue-500" />
                          <span>Rating: <strong>{platforms.codeforces_rating}</strong></span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>CodeChef Username</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="your_codechef_username"
                          value={platforms.codechef || ''}
                          onChange={(e) => handlePlatformInputChange('codechef', e.target.value)}
                        />
                        <Button onClick={() => handleConnect('codechef')}>
                          <Link2 className="h-4 w-4 mr-2" />
                          {platforms.codechef_connected ? 'Update' : 'Connect'}
                        </Button>
                      </div>
                      {platforms.codechef_connected && platforms.codechef_rating && (
                        <div className="flex items-center gap-2 text-sm">
                          <Trophy className="h-4 w-4 text-orange-500" />
                          <span>Rating: <strong>{platforms.codechef_rating}</strong></span>
                        </div>
                      )}
                    </div>
                    
                    {/* Platform Stats Filter */}
                    {(platforms.leetcode_connected || platforms.codeforces_connected || platforms.codechef_connected) && (
                      <div className="mt-4 pt-4 border-t">
                        <Label className="mb-2 block">Platform Ratings Overview</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {platforms.leetcode_connected && (
                            <Card className="p-3">
                              <div className="text-xs text-muted-foreground">LeetCode</div>
                              <div className="text-lg font-bold text-yellow-600">{platforms.leetcode_rating || 'N/A'}</div>
                            </Card>
                          )}
                          {platforms.codeforces_connected && (
                            <Card className="p-3">
                              <div className="text-xs text-muted-foreground">Codeforces</div>
                              <div className="text-lg font-bold text-blue-600">{platforms.codeforces_rating || 'N/A'}</div>
                            </Card>
                          )}
                          {platforms.codechef_connected && (
                            <Card className="p-3">
                              <div className="text-xs text-muted-foreground">CodeChef</div>
                              <div className="text-lg font-bold text-orange-600">{platforms.codechef_rating || 'N/A'}</div>
                            </Card>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="friends" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Friends ({friends.length})
                      </CardTitle>
                      <Button variant="outline" size="sm" onClick={() => setShowSearch(!showSearch)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Friend
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {showSearch && (
                      <div className="space-y-2">
                        <Label>Search Users</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search by username..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10"
                            disabled={searchLoading}
                          />
                          {searchLoading && (
                            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                        {searchResults.length > 0 && (
                          <div className="border rounded-lg divide-y">
                            {searchResults.map((result) => (
                              <div key={result.id} className="flex items-center justify-between p-3 hover:bg-muted/50">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-semibold">{result.username}</p>
                                    <p className="text-sm text-muted-foreground">Rating: {result.rating || 1200}</p>
                                  </div>
                                </div>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleAddFriend(result.id)}
                                  disabled={loading}
                                >
                                  {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Friend
                                    </>
                                  )}
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        {searchQuery && searchResults.length === 0 && !searchLoading && (
                          <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
                        )}
                      </div>
                    )}
                    <div className="space-y-3">
                      {friends.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No friends yet. Search and add some!</p>
                      ) : (
                        friends.map((friend) => (
                          <div key={friend.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold">{friend.username}</p>
                                <p className="text-sm text-muted-foreground">Rating: {friend.rating || 1200}</p>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleRemoveFriend(friend.id)}
                              disabled={loading}
                            >
                              {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <X className="h-4 w-4 mr-2" />
                                  Remove
                                </>
                              )}
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requests" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Friend Requests ({friendRequests.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {friendRequests.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No pending friend requests</p>
                      ) : (
                        friendRequests.map((request) => (
                          <div key={request.requestId} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold">{request.username}</p>
                                <p className="text-sm text-muted-foreground">Rating: {request.rating || 1200}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleAcceptRequest(request.requestId)}
                                disabled={loading}
                              >
                                {loading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Accept
                                  </>
                                )}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleRejectRequest(request.requestId)}
                                disabled={loading}
                              >
                                {loading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
