import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Plus } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Reward {
  id: number;
  points: string;
  code: string;
  isUsed: boolean;
  reason?: string;
  createdAt: string;
  expiresAt?: string;
}

export default function RewardsManager() {
  const [points, setPoints] = useState("");
  const [reason, setReason] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const { toast } = useToast();

  const { data: rewards, isLoading } = useQuery({
    queryKey: ['/api/rewards'],
    refetchInterval: 30000,
  });

  const createRewardMutation = useMutation({
    mutationFn: async (rewardData: any) => {
      return apiRequest('POST', '/api/rewards', rewardData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rewards'] });
      setPoints("");
      setReason("");
      setExpiryDate("");
      toast({
        title: "Código criado",
        description: "Código de recompensa gerado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao gerar código de recompensa.",
        variant: "destructive",
      });
    }
  });

  const handleGenerateReward = () => {
    if (!points || !reason) {
      toast({
        title: "Campos obrigatórios",
        description: "Pontos e motivo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const rewardData = {
      points: parseFloat(points),
      reason,
      code: generateRewardCode(),
      expiresAt: expiryDate ? new Date(expiryDate).toISOString() : null,
    };

    createRewardMutation.mutate(rewardData);
  };

  const generateRewardCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Código copiado",
      description: "O código foi copiado para a área de transferência.",
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Generate Reward */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Gerar Código de Recompensa
          </h3>
          <form onSubmit={(e) => { e.preventDefault(); handleGenerateReward(); }} className="space-y-4">
            <div>
              <Label htmlFor="points">Pontos</Label>
              <Input
                id="points"
                type="number"
                placeholder="Ex: 100"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="reason">Motivo</Label>
              <Input
                id="reason"
                type="text"
                placeholder="Ex: Recompensa por participação"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="expiry">Data de Expiração (opcional)</Label>
              <Input
                id="expiry"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary-500 hover:bg-primary-600"
              disabled={createRewardMutation.isPending}
            >
              <Plus className="w-4 h-4 mr-2" />
              Gerar Código
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Rewards */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Códigos Ativos</h3>
            <Button variant="ghost" className="text-sm text-primary-600 hover:text-primary-700">
              Ver todos
            </Button>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-thin">
            {!rewards || rewards.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-600">Nenhum código ativo</p>
                <p className="text-sm text-gray-500">Gere um novo código para começar</p>
              </div>
            ) : (
              rewards.map((reward: Reward) => (
                <div key={reward.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-lg font-bold text-primary-600">
                          {reward.code}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(reward.code)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {parseFloat(reward.points).toLocaleString()} pontos - {reward.reason}
                      </p>
                      {reward.expiresAt && (
                        <p className="text-xs text-gray-500">
                          Expira em: {new Date(reward.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        reward.isUsed 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {reward.isUsed ? 'Usado' : 'Ativo'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}