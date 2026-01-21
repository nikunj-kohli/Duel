import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Trophy, Users, Link2, Plus, X, Check, ArrowLeft, Search } from "lucide-react";
import { useState } from "react";

interface ProfileProps {
  user: any;
  onLogout: () => void;
  onBack?: () => void;
}

export function Profile({ user, onLogout, onBack }: ProfileProps) {
  const [friends, setFriends] = useState([
    { id: "2", username: "alice_coder", rating: 1650, avatar: "" },
    { id: "3", username: "bob_dev", rating: 1420, avatar: "" },
  ]);
  const [friendRequests, setFriendRequests] = useState([
    { id: "4", username: "charlie_hacker", rating: 1580, avatar: "" },
  ]);
  const [platforms, setPlatforms] = useState(user.platforms || {
    leetcode: "",
    codeforces: "",
    codechef: ""
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  // Mock users database
  const allUsers = [
    { id: "2", username: "alice_coder", rating: 1650, avatar: "", isFriend: true },
    { id: "3", username: "bob_dev", rating: 1420, avatar: "", isFriend: true },
    { id: "5", username: "dave_pro", rating: 1900, avatar: "", isFriend: false },
    { id: "6", username: "eve_master", rating: 2100, avatar: "", isFriend: false },
    { id: "7", username: "frank_legend", rating: 2300, avatar: "", isFriend: false },
    { id: "8", username: "grace_coder", rating: 1750, avatar: "", isFriend: false },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const filtered = allUsers.filter(u => 
        u.username.toLowerCase().includes(query.toLowerCase()) && 
        u.id !== user.id &&
        !friends.find(f => f.id === u.id) &&
        !friendRequests.find(fr => fr.id === u.id)
      );
      setSearchResults(filtered);
      setShowSearch(true);
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  };

  const handleAddFriend = (userId: string) => {
    const userToAdd = allUsers.find(u => u.id === userId);
    if (userToAdd) {
      // In real app, this would send a friend request to backend
      setFriendRequests([...friendRequests, { 
        id: userToAdd.id, 
        username: userToAdd.username, 
        rating: userToAdd.rating, 
        avatar: "" 
      }]);
      setSearchQuery("");
      setSearchResults([]);
      setShowSearch(false);
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
    
    // Save to backend - mock for now
    console.log(`Connecting ${platform} with username: ${username}`);
    // In real app: await fetch('/api/user/platforms', { method: 'POST', body: JSON.stringify(platforms) });
    
    // Store platform rating
    const updatedPlatforms = {
      ...platforms,
      [`${platform}_rating`]: mockRatings[platform] || 0,
      [`${platform}_connected`]: true
    };
    setPlatforms(updatedPlatforms);
    
    alert(`${platform} connected successfully! Rating: ${mockRatings[platform] || 'N/A'}`);
  };

  const handleAcceptRequest = (requestId: string) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (request) {
      setFriends([...friends, request]);
      setFriendRequests(friendRequests.filter(r => r.id !== requestId));
    }
  };

  const handleRemoveFriend = (friendId: string) => {
    setFriends(friends.filter(f => f.id !== friendId));
  };

  const handleRejectRequest = (requestId: string) => {
    setFriendRequests(friendRequests.filter(r => r.id !== requestId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack || (() => window.history.back())}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Profile
            </h1>
          </div>
          <Button variant="outline" onClick={onLogout}>
            Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
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
                  Rating: {user.rating}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          <Card className="md:col-span-2">
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
                          />
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
                                    <p className="text-sm text-muted-foreground">Rating: {result.rating}</p>
                                  </div>
                                </div>
                                <Button size="sm" onClick={() => handleAddFriend(result.id)}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Friend
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        {searchQuery && searchResults.length === 0 && (
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
                                <p className="text-sm text-muted-foreground">Rating: {friend.rating}</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleRemoveFriend(friend.id)}>
                              <X className="h-4 w-4 mr-2" />
                              Remove
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
                      {friendRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{request.username}</p>
                              <p className="text-sm text-muted-foreground">Rating: {request.rating}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleAcceptRequest(request.id)}>
                              <Check className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleRejectRequest(request.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
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
