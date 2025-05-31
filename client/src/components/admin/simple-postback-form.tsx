import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Globe, Building, Activity, Calendar } from "lucide-react";

export default function PostbackManagement() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar postbacks registrados
  const { data: postbacks = [], isLoading } = useQuery({
    queryKey: ["/api/admin/registered-postbacks"],
    queryFn: async () => {
      const response = await fetch('/api/admin/registered-postbacks', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Erro ao carregar postbacks');
      return response.json();
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      url: formData.get('url') as string,
      houseId: formData.get('houseId') ? parseInt(formData.get('houseId') as string) : null,
      houseName: formData.get('houseName') as string,
      eventType: formData.get('eventType') as string,
      description: formData.get('description') as string,
      isActive: true
    };

    try {
      const response = await fetch('/api/admin/registered-postbacks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Postback registrado com sucesso!"
        });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/registered-postbacks"] });
        (e.target as HTMLFormElement).reset();
        setIsDialogOpen(false);
      } else {
        const error = await response.json();
        toast({
          title: "Erro",
          description: error.error || "Erro ao registrar postback",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro de conexão",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/registered-postbacks/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Postback removido com sucesso!"
        });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/registered-postbacks"] });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao remover postback",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro de conexão",
        variant: "destructive"
      });
    }
  };

  // Agrupar postbacks por casa
  const postbacksByHouse = postbacks.reduce((acc: any, postback: any) => {
    const houseName = postback.houseName || 'Sem Casa';
    if (!acc[houseName]) {
      acc[houseName] = [];
    }
    acc[houseName].push(postback);
    return acc;
  }, {});

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'registration': return 'bg-blue-600';
      case 'deposit': return 'bg-green-600';
      case 'revenue': return 'bg-purple-600';
      case 'profit': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case 'registration': return 'Registro';
      case 'deposit': return 'Depósito';
      case 'revenue': return 'Receita';
      case 'profit': return 'Lucro';
      default: return eventType;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-white">Carregando postbacks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de adicionar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Postbacks Registrados</h2>
          <p className="text-slate-400">Gerencie os postbacks por casa de apostas</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Postback
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Registrar Novo Postback</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-white">Nome do Postback</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ex: Brazino Registro"
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="url" className="text-white">URL do Postback</Label>
                <Input
                  id="url"
                  name="url"
                  placeholder="https://exemplo.com/postback"
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="houseId" className="text-white">ID da Casa (opcional)</Label>
                  <Input
                    id="houseId"
                    name="houseId"
                    type="number"
                    placeholder="4"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="houseName" className="text-white">Nome da Casa</Label>
                  <Input
                    id="houseName"
                    name="houseName"
                    placeholder="Brazino"
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="eventType" className="text-white">Tipo de Evento</Label>
                <select
                  id="eventType"
                  name="eventType"
                  required
                  className="w-full p-2 bg-slate-700 border border-slate-600 text-white rounded-md"
                >
                  <option value="">Selecione o tipo</option>
                  <option value="registration">Registro</option>
                  <option value="deposit">Depósito</option>
                  <option value="revenue">Receita</option>
                  <option value="profit">Lucro</option>
                </select>
              </div>

              <div>
                <Label htmlFor="description" className="text-white">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Descrição do postback..."
                  className="bg-slate-700 border-slate-600 text-white"
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? "Registrando..." : "Registrar Postback"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de postbacks por casa */}
      {Object.keys(postbacksByHouse).length === 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="w-16 h-16 text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum postback registrado</h3>
            <p className="text-slate-400 text-center">
              Registre seu primeiro postback para começar a rastrear conversões
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(postbacksByHouse).map(([houseName, housePostbacks]: [string, any]) => (
            <Card key={houseName} className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  {houseName}
                  <Badge variant="secondary" className="ml-2">
                    {housePostbacks.length} postback{housePostbacks.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {housePostbacks.map((postback: any) => (
                    <div
                      key={postback.id}
                      className="bg-slate-700 rounded-lg p-4 border border-slate-600"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-white">{postback.name}</h4>
                            <Badge className={`${getEventTypeColor(postback.eventType)} text-white`}>
                              {getEventTypeLabel(postback.eventType)}
                            </Badge>
                            {postback.isActive ? (
                              <Badge className="bg-green-600 text-white">
                                <Activity className="w-3 h-3 mr-1" />
                                Ativo
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Inativo</Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                            <Globe className="w-4 h-4" />
                            <span className="font-mono break-all">{postback.url}</span>
                          </div>
                          
                          {postback.description && (
                            <p className="text-sm text-slate-400 mb-2">{postback.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Criado: {new Date(postback.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                            {postback.houseId && (
                              <span>ID Casa: {postback.houseId}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-600 text-slate-300 hover:bg-slate-600"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                            onClick={() => handleDelete(postback.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}