import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/dashboard/sidebar";
import MetricsCards from "@/components/dashboard/metrics-cards";
import UserManagement from "@/components/dashboard/user-management";
import BetApproval from "@/components/dashboard/bet-approval";
import RewardsManager from "@/components/dashboard/rewards-manager";
import Analytics from "@/components/dashboard/analytics";
import Settings from "@/components/dashboard/settings";
import Broadcast from "@/components/dashboard/broadcast";
import AnalysisPeriods from "@/components/dashboard/analysis-periods";
import { useWebSocket } from "@/hooks/use-websocket";
import { Bell, Wifi } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Section = 'dashboard' | 'users' | 'bets' | 'rewards' | 'analytics' | 'analysis-periods' | 'settings' | 'broadcast';

const sectionTitles = {
  dashboard: { title: 'Dashboard', subtitle: 'Visão geral do sistema' },
  users: { title: 'Usuários', subtitle: 'Gerenciar usuários e pontos' },
  bets: { title: 'Apostas Pendentes', subtitle: 'Aprovar ou rejeitar apostas' },
  rewards: { title: 'Recompensas', subtitle: 'Gerenciar códigos de recompensa' },
  analytics: { title: 'Análises', subtitle: 'Estatísticas e relatórios' },
  'analysis-periods': { title: 'Períodos de Análise', subtitle: 'Configurar períodos e custos de análise' },
  settings: { title: 'Configurações', subtitle: 'Configurar sistema de pontos' },
  broadcast: { title: 'Broadcast', subtitle: 'Enviar mensagens para usuários' }
};

export default function Dashboard() {
  const [currentSection, setCurrentSection] = useState<Section>('dashboard');
  const { toast } = useToast();
  
  // WebSocket connection for real-time updates
  const { isConnected, lastMessage } = useWebSocket('/ws');

  // Handle real-time messages
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage);
        switch (data.type) {
          case 'bet_approved':
            toast({
              title: "Aposta Aprovada",
              description: "Uma nova aposta foi aprovada automaticamente.",
            });
            break;
          case 'user_points_updated':
            toast({
              title: "Pontos Atualizados",
              description: "Pontos de usuário foram modificados.",
            });
            break;
          case 'broadcast_sent':
            toast({
              title: "Mensagem Enviada",
              description: "Broadcast enviado para todos os usuários.",
            });
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    }
  }, [lastMessage, toast]);

  const { title, subtitle } = sectionTitles[currentSection];

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <MetricsCards />;
      case 'users':
        return <UserManagement />;
      case 'bets':
        return <BetApproval />;
      case 'rewards':
        return <RewardsManager />;
      case 'analytics':
        return <Analytics />;
      case 'analysis-periods':
        return <AnalysisPeriods />;
      case 'settings':
        return <Settings />;
      case 'broadcast':
        return <Broadcast />;
      default:
        return <MetricsCards />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar currentSection={currentSection} onSectionChange={(section) => setCurrentSection(section as Section)} />
      
      {/* Main Content */}
      <div className="flex-1 ml-64 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <button className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Real-time Status */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                isConnected ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500 animate-pulse-gentle' : 'bg-red-500'
                }`}></div>
                <Wifi className={`w-4 h-4 ${
                  isConnected ? 'text-green-700' : 'text-red-700'
                }`} />
                <span className={`text-sm font-medium ${
                  isConnected ? 'text-green-700' : 'text-red-700'
                }`}>
                  {isConnected ? 'Sistema Online' : 'Desconectado'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}