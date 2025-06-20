import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Check, X, Image, CheckCheck } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Bet {
  id: number;
  userId: number;
  platform: string;
  game: string;
  betAmount: string;
  winAmount?: string;
  lossAmount?: string;
  startTime: string;
  endTime: string;
  duration: string;
  proofImage?: string;
  betType: 'win' | 'loss';
  user?: {
    firstName: string;
    lastName?: string;
    username?: string;
  };
}

export default function BetApproval() {
  const [filter, setFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: pendingBets, isLoading } = useQuery({
    queryKey: ['/api/bets/pending'],
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const approveBetMutation = useMutation({
    mutationFn: async (betId: number) => {
      return apiRequest('POST', `/api/bets/${betId}/approve`, { adminId: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bets/pending'] });
      toast({
        title: "Aposta aprovada",
        description: "A aposta foi aprovada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao aprovar a aposta.",
        variant: "destructive",
      });
    }
  });

  const rejectBetMutation = useMutation({
    mutationFn: async (betId: number) => {
      return apiRequest('POST', `/api/bets/${betId}/reject`, { adminId: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bets/pending'] });
      toast({
        title: "Aposta rejeitada",
        description: "A aposta foi rejeitada.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao rejeitar a aposta.",
        variant: "destructive",
      });
    }
  });

  const approveAllMutation = useMutation({
    mutationFn: async () => {
      const approvals = (pendingBets || []).map((bet: Bet) =>
        apiRequest('POST', `/api/bets/${bet.id}/approve`, { adminId: 1 })
      );
      return Promise.all(approvals);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bets/pending'] });
      toast({
        title: "Todas as apostas aprovadas",
        description: "Todas as apostas pendentes foram aprovadas com sucesso.",
      });
    }
  });

  const filteredBets = (pendingBets || []).filter((bet: Bet) => {
    if (filter === "all") return true;
    if (filter === "wins") return bet.betType === "win";
    if (filter === "losses") return bet.betType === "loss";
    return true;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Apostas Pendentes de Aprovação
          </h3>
          <div className="flex items-center space-x-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as apostas</SelectItem>
                <SelectItem value="wins">Apenas ganhos</SelectItem>
                <SelectItem value="losses">Apenas perdas</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              className="bg-green-500 hover:bg-green-600"
              onClick={() => approveAllMutation.mutate()}
              disabled={approveAllMutation.isPending || filteredBets.length === 0}
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Aprovar Todas
            </Button>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        {filteredBets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCheck className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Nenhuma aposta pendente
            </h3>
            <p className="text-gray-600">
              Todas as apostas foram processadas ou não há novas apostas para aprovar.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBets.map((bet: Bet) => (
              <div key={bet.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {bet.user?.firstName?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-semibold text-gray-800">
                          {bet.user?.firstName} {bet.user?.lastName}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          bet.betType === 'win' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {bet.betType === 'win' ? 'Ganho' : 'Perda'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Plataforma:</span>
                          <p className="font-medium">{bet.platform}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Jogo:</span>
                          <p className="font-medium">{bet.game}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Valor Apostado:</span>
                          <p className="font-medium">R$ {parseFloat(bet.betAmount).toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">
                            {bet.betType === 'win' ? 'Valor Ganho:' : 'Valor Perdido:'}
                          </span>
                          <p className={`font-medium ${
                            bet.betType === 'win' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            R$ {parseFloat(bet.winAmount || bet.lossAmount || '0').toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 text-sm">
                        <span className="text-gray-500">Período:</span>
                        <span className="font-medium ml-1">
                          {new Date(bet.startTime).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - {new Date(bet.endTime).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        <span className="text-gray-500 ml-4">Duração:</span>
                        <span className="font-medium ml-1">{bet.duration} minutos</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedImage(bet.proofImage || '/placeholder-image.jpg')}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Ver Comprovante
                    </Button>
                    <Button 
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => approveBetMutation.mutate(bet.id)}
                      disabled={approveBetMutation.isPending}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => rejectBetMutation.mutate(bet.id)}
                      disabled={rejectBetMutation.isPending}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Image Preview Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-screen p-4">
          <DialogHeader>
            <DialogTitle>Comprovante de Aposta</DialogTitle>
          </DialogHeader>
          <div className="relative">
            {selectedImage && (
              <img 
                src={selectedImage} 
                alt="Comprovante de aposta" 
                className="max-w-full max-h-[70vh] object-contain rounded-lg mx-auto"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}