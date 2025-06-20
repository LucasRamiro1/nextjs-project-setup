import { BarChart3, Users, ClipboardList, Gift, TrendingUp, Settings, Megaphone, Dice1, Clock } from "lucide-react";

interface SidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'bets', label: 'Apostas Pendentes', icon: ClipboardList, badge: 5 },
  { id: 'rewards', label: 'Recompensas', icon: Gift },
  { id: 'analytics', label: 'Análises', icon: TrendingUp },
  { id: 'analysis-periods', label: 'Períodos de Análise', icon: Clock },
  { id: 'settings', label: 'Configurações', icon: Settings },
  { id: 'broadcast', label: 'Broadcast', icon: Megaphone },
];

export default function Sidebar({ currentSection, onSectionChange }: SidebarProps) {
  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* Logo Header */}
        <div className="flex items-center justify-center h-16 px-4 bg-primary-500">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Dice1 className="w-5 h-5 text-primary-500" />
            </div>
            <span className="text-white font-bold text-lg">BetMaster PRO</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                <IconComponent className="w-5 h-5 mr-3" />
                <span className="font-medium flex-1">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin Info */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Admin</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
