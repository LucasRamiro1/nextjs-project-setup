import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Setting {
  key: string;
  value: string;
}

export default function Settings() {
  const [settings, setSettings] = useState({
    winPoints: "10",
    lossPoints: "5",
    analysisCost: "25",
    groupAnalysisCost: "100",
    affiliateReward: "100",
    minBetTime: "30",
    autoApproval: "disabled",
    botName: "BetMaster PRO",
    maintenanceMode: false,
  });

  const { toast } = useToast();

  const { data: systemSettings, isLoading } = useQuery({
    queryKey: ['/api/settings'],
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      return apiRequest('POST', '/api/settings', { key, value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Configurações salvas",
        description: "As configurações foram atualizadas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações.",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (systemSettings) {
      const settingsMap = systemSettings.reduce((acc: any, setting: Setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      setSettings(prev => ({
        ...prev,
        ...settingsMap,
        maintenanceMode: settingsMap.maintenanceMode === 'true',
      }));
    }
  }, [systemSettings]);

  const handleSave = async () => {
    const settingsToSave = [
      { key: 'winPoints', value: settings.winPoints },
      { key: 'lossPoints', value: settings.lossPoints },
      { key: 'analysisCost', value: settings.analysisCost },
      { key: 'groupAnalysisCost', value: settings.groupAnalysisCost },
      { key: 'affiliateReward', value: settings.affiliateReward },
      { key: 'minBetTime', value: settings.minBetTime },
      { key: 'autoApproval', value: settings.autoApproval },
      { key: 'botName', value: settings.botName },
      { key: 'maintenanceMode', value: settings.maintenanceMode.toString() },
    ];

    try {
      await Promise.all(
        settingsToSave.map(setting => 
          updateSettingMutation.mutateAsync(setting)
        )
      );
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleInputChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-96 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Configurações do Sistema
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Points System */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-4">
              Sistema de Pontos
            </h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="winPoints">Pontos por Ganho</Label>
                <Input
                  id="winPoints"
                  type="number"
                  value={settings.winPoints}
                  onChange={(e) => handleInputChange('winPoints', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lossPoints">Pontos por Perda</Label>
                <Input
                  id="lossPoints"
                  type="number"
                  value={settings.lossPoints}
                  onChange={(e) => handleInputChange('lossPoints', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="analysisCost">Custo de Análise</Label>
                <Input
                  id="analysisCost"
                  type="number"
                  value={settings.analysisCost}
                  onChange={(e) => handleInputChange('analysisCost', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="groupAnalysisCost">Custo de Análise de Grupo</Label>
                <Input
                  id="groupAnalysisCost"
                  type="number"
                  value={settings.groupAnalysisCost}
                  onChange={(e) => handleInputChange('groupAnalysisCost', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="affiliateReward">Recompensa por Indicação</Label>
                <Input
                  id="affiliateReward"
                  type="number"
                  value={settings.affiliateReward}
                  onChange={(e) => handleInputChange('affiliateReward', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* General Settings */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-4">
              Configurações Gerais
            </h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="minBetTime">Tempo Mínimo de Aposta (minutos)</Label>
                <Input
                  id="minBetTime"
                  type="number"
                  value={settings.minBetTime}
                  onChange={(e) => handleInputChange('minBetTime', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="autoApproval">Aprovação Automática</Label>
                <Select 
                  value={settings.autoApproval} 
                  onValueChange={(value) => handleInputChange('autoApproval', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disabled">Desabilitada</SelectItem>
                    <SelectItem value="vip">Apenas para usuários VIP</SelectItem>
                    <SelectItem value="low_value">Para valores até R$ 100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="botName">Nome do Bot</Label>
                <Input
                  id="botName"
                  type="text"
                  value={settings.botName}
                  onChange={(e) => handleInputChange('botName', e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="maintenance"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                />
                <Label htmlFor="maintenance">Modo de Manutenção</Label>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <Button variant="outline">
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateSettingMutation.isPending}
            className="bg-primary-500 hover:bg-primary-600"
          >
            Salvar Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}