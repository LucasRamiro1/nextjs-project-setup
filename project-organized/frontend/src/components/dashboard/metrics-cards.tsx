import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Users, ClipboardList, Coins, DollarSign, TrendingUp, Clock, UserPlus, CheckCircle, AlertTriangle } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";

export default function MetricsCards() {
  const { lastMessage } = useWebSocket('/ws');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Invalidate stats when real-time updates come in
  useEffect(() => {
    if (lastMessage) {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    }
  }, [lastMessage]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const COLORS = ['#1976d2', '#42a5f5', '#90caf9', '#bbdefb', '#e3f2fd'];

  const recentActivities = [
    {
      id: 1,
      type: 'user_registered',
      description: 'Novo usuário cadastrado',
      details: '@joaosilva se registrou via código de afiliado ABC123',
      time: '2 min atrás',
      icon: UserPlus,
      color: 'blue'
    },
    {
      id: 2,
      type: 'bet_approved',
      description: 'Aposta aprovada',
      details: 'Ganho de R$ 250 aprovado para @mariasilva',
      time: '5 min atrás',
      icon: CheckCircle,
      color: 'green'
    },
    {
      id: 3,
      type: 'bet_pending',
      description: 'Aposta pendente',
      details: 'Nova aposta aguardando aprovação de @pedrocosta',
      time: '8 min atrás',
      icon: AlertTriangle,
      color: 'yellow'
    }
  ];

  return (
    <div>
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats?.totalUsers?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% este mês
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Apostas Pendentes</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats?.pendingBets || '0'}
                </p>
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Requer atenção
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pontos Distribuídos</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats?.totalPoints?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8% esta semana
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Coins className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita do Mês</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  R$ {stats?.monthlyRevenue?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +23% vs. último mês
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth Chart */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Crescimento de Usuários</h3>
              <select className="text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
                <option>Últimos 7 dias</option>
                <option>Últimos 30 dias</option>
                <option>Últimos 90 dias</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats?.userGrowth?.map((value, index) => ({
                day: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][index],
                users: value
              })) || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#1976d2" 
                  strokeWidth={2}
                  fill="rgba(25, 118, 210, 0.1)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Distribuição por Plataforma</h3>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Ver detalhes
              </button>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats?.platformDistribution || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ platform, count }) => `${platform}: ${count}`}
                >
                  {(stats?.platformDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Atividade Recente</h3>
        </div>
        <CardContent className="p-6">
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.color === 'blue' ? 'bg-blue-100' :
                    activity.color === 'green' ? 'bg-green-100' :
                    'bg-yellow-100'
                  }`}>
                    <IconComponent className={`w-5 h-5 ${
                      activity.color === 'blue' ? 'text-blue-600' :
                      activity.color === 'green' ? 'text-green-600' :
                      'text-yellow-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.details}</p>
                  </div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}