import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Clock } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AnalysisPeriod {
  id: number;
  periodMinutes: number;
  costMultiplier: string;
  isActive: boolean;
  createdAt: string;
}

export default function AnalysisPeriods() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<AnalysisPeriod | null>(null);
  const [periodMinutes, setPeriodMinutes] = useState("");
  const [costMultiplier, setCostMultiplier] = useState("");
  const { toast } = useToast();

  const { data: periods, isLoading } = useQuery({
    queryKey: ['/api/analysis-periods'],
    refetchInterval: 30000,
  });

  const createPeriodMutation = useMutation({
    mutationFn: async (periodData: any) => {
      return apiRequest('POST', '/api/analysis-periods', periodData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/analysis-periods'] });
      setIsModalOpen(false);
      resetForm();
      toast({
        title: "Período criado",
        description: "Novo período de análise criado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao criar período de análise.",
        variant: "destructive",
      });
    }
  });

  const updatePeriodMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest('PUT', `/api/analysis-periods/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/analysis-periods'] });
      setIsModalOpen(false);
      resetForm();
      toast({
        title: "Período atualizado",
        description: "Período de análise atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar período de análise.",
        variant: "destructive",
      });
    }
  });

  const deletePeriodMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/analysis-periods/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/analysis-periods'] });
      toast({
        title: "Período removido",
        description: "Período de análise removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao remover período de análise.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setPeriodMinutes("");
    setCostMultiplier("");
    setEditingPeriod(null);
  };

  const handleSubmit = () => {
    if (!periodMinutes || !costMultiplier) {
      toast({
        title: "Campos obrigatórios",
        description: "Período em minutos e multiplicador de custo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const periodData = {
      periodMinutes: parseInt(periodMinutes),
      costMultiplier: parseFloat(costMultiplier),
      isActive: true,
    };

    if (editingPeriod) {
      updatePeriodMutation.mutate({ id: editingPeriod.id, data: periodData });
    } else {
      createPeriodMutation.mutate(periodData);
    }
  };

  const handleEdit = (period: AnalysisPeriod) => {
    setEditingPeriod(period);
    setPeriodMinutes(period.periodMinutes.toString());
    setCostMultiplier(period.costMultiplier);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover este período de análise?")) {
      deletePeriodMutation.mutate(id);
    }
  };

  const getCostForPeriod = (basePoints: number, multiplier: string) => {
    return Math.round(basePoints * parseFloat(multiplier));
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-64 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Períodos de Análise</h3>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary-500 hover:bg-primary-600" onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Período
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingPeriod ? 'Editar Período' : 'Novo Período de Análise'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="periodMinutes">Período (minutos)</Label>
                  <Select value={periodMinutes} onValueChange={setPeriodMinutes}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutos</SelectItem>
                      <SelectItem value="10">10 minutos</SelectItem>
                      <SelectItem value="20">20 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="costMultiplier">Multiplicador de Custo</Label>
                  <Input
                    id="costMultiplier"
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10"
                    placeholder="Ex: 1.0, 1.5, 2.0"
                    value={costMultiplier}
                    onChange={(e) => setCostMultiplier(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Custo base: 25 BP. Custo final: {costMultiplier ? getCostForPeriod(25, costMultiplier) : '?'} BP
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createPeriodMutation.isPending || updatePeriodMutation.isPending}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  {editingPeriod ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <CardContent className="p-6">
        {!periods || (Array.isArray(periods) && periods.length === 0) ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Nenhum período configurado
            </h3>
            <p className="text-gray-600">
              Configure os períodos de análise disponíveis para os usuários.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(periods) && periods.map((period: AnalysisPeriod) => (
              <div key={period.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-primary-600" />
                    <span className="text-lg font-semibold text-gray-800">
                      {period.periodMinutes} min
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(period)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(period.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Multiplicador:</span>
                    <span className="font-medium">{period.costMultiplier}x</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Custo:</span>
                    <span className="font-medium text-primary-600">
                      {getCostForPeriod(25, period.costMultiplier)} BP
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      period.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {period.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}