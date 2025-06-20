import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Send } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BroadcastMessage {
  id: number;
  title: string;
  message: string;
  targetUsers: string;
  sentAt: string;
  recipientCount: number;
  readCount: number;
}

export default function Broadcast() {
  const [targetUsers, setTargetUsers] = useState("all");
  const [messageType, setMessageType] = useState("info");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [scheduleMessage, setScheduleMessage] = useState(false);
  const { toast } = useToast();

  const { data: broadcastHistory, isLoading } = useQuery({
    queryKey: ['/api/broadcast/history'],
  });

  const sendBroadcastMutation = useMutation({
    mutationFn: async (broadcastData: any) => {
      return apiRequest('POST', '/api/broadcast', broadcastData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/broadcast/history'] });
      setTitle("");
      setMessage("");
      setTargetUsers("all");
      setMessageType("info");
      setScheduleMessage(false);
      toast({
        title: "Mensagem enviada",
        description: "A mensagem foi enviada para todos os usuários selecionados.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao enviar mensagem.",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = () => {
    if (!title || !message) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e mensagem são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const broadcastData = {
      title,
      message,
      targetUsers,
      sentBy: 1, // This would be the actual admin ID
    };

    sendBroadcastMutation.mutate(broadcastData);
  };

  const getReadRate = (readCount: number, recipientCount: number) => {
    if (recipientCount === 0) return 0;
    return Math.round((readCount / recipientCount) * 100);
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Enviar Mensagem para Usuários
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Message Composer */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-4">
              Compor Mensagem
            </h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="targetUsers">Destinatários</Label>
                <Select value={targetUsers} onValueChange={setTargetUsers}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os usuários</SelectItem>
                    <SelectItem value="active">Apenas usuários ativos</SelectItem>
                    <SelectItem value="high_points">Usuários com mais de 100 pontos</SelectItem>
                    <SelectItem value="specific">Usuários específicos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="messageType">Tipo de Mensagem</Label>
                <Select value={messageType} onValueChange={setMessageType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Informativa</SelectItem>
                    <SelectItem value="promotion">Promoção</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="important">Aviso Importante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título da mensagem"
                />
              </div>
              <div>
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite sua mensagem aqui..."
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Suporte a markdown: *negrito*, _itálico_, `código`
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="schedule"
                  checked={scheduleMessage}
                  onCheckedChange={setScheduleMessage}
                />
                <Label htmlFor="schedule">Agendar envio</Label>
              </div>
              <Button 
                onClick={handleSendMessage}
                disabled={sendBroadcastMutation.isPending}
                className="w-full bg-primary-500 hover:bg-primary-600"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar Mensagem
              </Button>
            </div>
          </div>

          {/* Message History */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-4">
              Histórico de Mensagens
            </h4>
            <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              ) : !broadcastHistory || broadcastHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600">Nenhuma mensagem enviada</p>
                  <p className="text-sm text-gray-500">
                    As mensagens enviadas aparecerão aqui
                  </p>
                </div>
              ) : (
                broadcastHistory.map((msg: BroadcastMessage) => (
                  <div key={msg.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-800">
                        {msg.title}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.sentAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {msg.message}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Enviado para: {msg.recipientCount.toLocaleString()} usuários
                      </span>
                      <span>
                        Taxa de leitura: {getReadRate(msg.readCount, msg.recipientCount)}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}