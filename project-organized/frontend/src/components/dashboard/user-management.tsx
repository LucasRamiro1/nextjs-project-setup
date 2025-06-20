import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Edit, Eye, Ban, Plus } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  telegramId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  points: string;
  affiliateCode: string;
  isBanned: boolean;
  createdAt: string;
}

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pointsOperation, setPointsOperation] = useState("add");
  const [pointsAmount, setPointsAmount] = useState("");
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['/api/users', currentPage],
    select: (data: any) => data
  });

  const updatePointsMutation = useMutation({
    mutationFn: async ({ userId, points, operation }: { userId: number; points: number; operation: string }) => {
      return apiRequest('POST', `/api/users/${userId}/points`, { points, operation });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsPointsModalOpen(false);
      setPointsAmount("");
      toast({
        title: "Pontos atualizados",
        description: "Os pontos do usuário foram modificados com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar pontos do usuário.",
        variant: "destructive",
      });
    }
  });

  const banUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest('POST', `/api/users/${userId}/ban`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Usuário banido",
        description: "O usuário foi banido com sucesso.",
      });
    }
  });

  const unbanUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest('POST', `/api/users/${userId}/unban`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Usuário desbloqueado",
        description: "O usuário foi desbloqueado com sucesso.",
      });
    }
  });

  const handleUpdatePoints = () => {
    if (!selectedUser || !pointsAmount) return;
    
    updatePointsMutation.mutate({
      userId: selectedUser.id,
      points: parseFloat(pointsAmount),
      operation: pointsOperation
    });
  };

  const handleBanToggle = (user: User) => {
    if (user.isBanned) {
      unbanUserMutation.mutate(user.id);
    } else {
      banUserMutation.mutate(user.id);
    }
  };

  const filteredUsers = usersData?.users?.filter((user: User) =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
          <h3 className="text-lg font-semibold text-gray-800">Gerenciar Usuários</h3>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <Button className="bg-primary-500 hover:bg-primary-600">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Usuário
            </Button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pontos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código Afiliado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cadastro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user: User) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium">
                        {user.firstName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      {user.username && (
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {parseFloat(user.points).toLocaleString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsPointsModalOpen(true);
                      }}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    {user.affiliateCode}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.isBanned 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.isBanned ? 'Banido' : 'Ativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-yellow-600 hover:text-yellow-700">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={user.isBanned ? "text-green-600 hover:text-green-700" : "text-red-600 hover:text-red-700"}
                      onClick={() => handleBanToggle(user)}
                    >
                      <Ban className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Mostrando <span className="font-medium">1</span> a{" "}
          <span className="font-medium">{filteredUsers.length}</span> de{" "}
          <span className="font-medium">{usersData?.total || 0}</span> usuários
        </div>
        <div className="flex space-x-1">
          <Button variant="outline" size="sm" disabled={currentPage === 1}>
            Anterior
          </Button>
          <Button variant="outline" size="sm" className="bg-primary-500 text-white">
            {currentPage}
          </Button>
          <Button variant="outline" size="sm">
            Próximo
          </Button>
        </div>
      </div>

      {/* Points Modification Modal */}
      <Dialog open={isPointsModalOpen} onOpenChange={setIsPointsModalOpen}>
        <DialogContent className="w-full max-w-md">
          <DialogHeader>
            <DialogTitle>Modificar Pontos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Usuário</Label>
              <Input
                value={`${selectedUser?.firstName} ${selectedUser?.lastName}`}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label>Pontos Atuais</Label>
              <Input
                value={selectedUser ? parseFloat(selectedUser.points).toLocaleString() : ''}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label>Operação</Label>
              <Select value={pointsOperation} onValueChange={setPointsOperation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Adicionar Pontos</SelectItem>
                  <SelectItem value="remove">Remover Pontos</SelectItem>
                  <SelectItem value="set">Definir Pontos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantidade</Label>
              <Input
                type="number"
                placeholder="Ex: 100"
                value={pointsAmount}
                onChange={(e) => setPointsAmount(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setIsPointsModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdatePoints}
              disabled={updatePointsMutation.isPending}
              className="bg-primary-500 hover:bg-primary-600"
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}