import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Crown, TrendingUp, DollarSign, Calendar, UserCheck, Percent } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface AdminStats {
  totalUsers: number;
  premiumUsers: number;
  freeUsers: number;
  recentUsers: number;
  todayUsers: number;
  revenue: number;
  conversionRate: number;
}

interface AdminUser {
  id: string;
  userId: string;
  name: string;
  nickname?: string;
  imageUrl?: string;
  isPremium: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats', refreshKey],
  }) as { data: AdminStats | undefined, isLoading: boolean };

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users', refreshKey],
  }) as { data: AdminUser[] | undefined, isLoading: boolean };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRevenue = (amount: number) => {
    return `${amount.toFixed(2)}π`;
  };

  if (statsLoading || usersLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
        <p className="mt-4 text-white">Loading admin data...</p>
      </div>
    );
  }

  // Debug informacije
  console.log('Admin data:', { stats, users, statsLoading, usersLoading });

  return (
    <div className="min-h-screen bg-black text-white p-4 space-y-6 pb-32">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 mt-1">PurpleBeats - Korisnicke statistike</p>
        </div>
        <Button 
          onClick={handleRefresh}
          className="bg-purple-600 hover:bg-purple-700"
          data-testid="button-refresh"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Osveži podatke
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Ukupno korisnika</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white" data-testid="text-total-users">
                {stats.totalUsers}
              </div>
              <p className="text-xs text-gray-400 mt-1">Registrovanih korisnika</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Premium korisnici</CardTitle>
              <Crown className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400" data-testid="text-premium-users">
                {stats.premiumUsers}
              </div>
              <p className="text-xs text-gray-400 mt-1">Platili 3.14π</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Prihod</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400" data-testid="text-revenue">
                {formatRevenue(stats.revenue)}
              </div>
              <p className="text-xs text-gray-400 mt-1">Ukupan prihod</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Konverzija</CardTitle>
              <Percent className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400" data-testid="text-conversion-rate">
                {stats.conversionRate.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-400 mt-1">Premium konverzija</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-purple-400" />
                Danas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400" data-testid="text-today-users">
                {stats.todayUsers}
              </div>
              <p className="text-gray-400 text-sm">Novih registracija</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-green-400" />
                Poslednih 7 dana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400" data-testid="text-recent-users">
                {stats.recentUsers}
              </div>
              <p className="text-gray-400 text-sm">Novih korisnika</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-400" />
                Besplatni
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400" data-testid="text-free-users">
                {stats.freeUsers}
              </div>
              <p className="text-gray-400 text-sm">Free korisnika</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users List */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-white">Svi korisnici</CardTitle>
          <CardDescription className="text-gray-400">
            Pregled svih registrovanih korisnika i njihov status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700"
                  data-testid={`user-row-${user.userId}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-yellow-500 rounded-full flex items-center justify-center">
                      {user.imageUrl ? (
                        <img src={user.imageUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-white" data-testid={`text-user-name-${user.userId}`}>
                          {user.name}
                        </h3>
                        {user.isPremium && (
                          <Crown className="h-4 w-4 text-yellow-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-400" data-testid={`text-user-id-${user.userId}`}>
                        ID: {user.userId}
                      </p>
                      {user.nickname && (
                        <p className="text-sm text-purple-400">@{user.nickname}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <Badge 
                      variant={user.isPremium ? "default" : "secondary"}
                      className={user.isPremium ? "bg-yellow-600 text-black" : "bg-gray-600 text-white"}
                      data-testid={`badge-status-${user.userId}`}
                    >
                      {user.isPremium ? 'Premium' : 'Free'}
                    </Badge>
                    <p className="text-xs text-gray-500">
                      Registrovan: {formatDate(user.createdAt)}
                    </p>
                    {user.isPremium && user.expiresAt && (
                      <p className="text-xs text-yellow-400">
                        Ističe: {formatDate(user.expiresAt)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nema registrovanih korisnika</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}