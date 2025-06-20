import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Analytics() {
  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  // Mock data for charts - in a real app, this would come from the API
  const betStatsData = [
    { month: 'Janeiro', ganhos: 120, perdas: 80 },
    { month: 'Fevereiro', ganhos: 190, perdas: 100 },
    { month: 'Março', ganhos: 150, perdas: 90 },
    { month: 'Abril', ganhos: 220, perdas: 110 },
    { month: 'Maio', ganhos: 180, perdas: 95 },
  ];

  const revenueData = [
    { month: 'Jan', receita: 5000 },
    { month: 'Fev', receita: 7500 },
    { month: 'Mar', receita: 6200 },
    { month: 'Abr', receita: 8900 },
    { month: 'Mai', receita: 15480 },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bet Statistics */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">
              Estatísticas de Apostas
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={betStatsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ganhos" fill="#4caf50" name="Ganhos" />
                <Bar dataKey="perdas" fill="#f44336" name="Perdas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Analysis */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">
              Análise de Receita
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString()}`} />
                <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Receita']} />
                <Line 
                  type="monotone" 
                  dataKey="receita" 
                  stroke="#ff9800" 
                  strokeWidth={2}
                  fill="rgba(255, 152, 0, 0.1)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Estatísticas Detalhadas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">78%</div>
              <div className="text-sm text-gray-600">Taxa de Aprovação</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                R$ {stats?.monthlyRevenue?.toLocaleString() || '45,280'}
              </div>
              <div className="text-sm text-gray-600">Volume Total</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {stats?.totalUsers || '156'}
              </div>
              <div className="text-sm text-gray-600">Usuários Ativos</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}