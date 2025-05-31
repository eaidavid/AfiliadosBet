import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Globe, Calendar, Activity } from "lucide-react";

interface RegisteredPostback {
  id: number;
  name: string;
  url: string;
  houseId: number | null;
  houseName: string;
  eventType: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RegisteredPostbacksProps {
  onPageChange?: (page: string) => void;
}

export default function RegisteredPostbacks({ onPageChange }: RegisteredPostbacksProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingPostback, setEditingPostback] = useState<RegisteredPostback | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    houseId: "",
    houseName: "",
    eventType: "",
    description: "",
    isActive: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: postbacks = [], isLoading } = useQuery({
    queryKey: ["/api/admin/registered-postbacks"]
  });

  const { data: houses = [] } = useQuery({
    queryKey: ["/api/admin/houses"]
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => apiRequest("/api/admin/registered-postbacks", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/registered-postbacks"] });
      setShowDialog(false);
      resetForm();
      toast({
        title: "Postback registrado",
        description: "O postback foi registrado com sucesso.",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof formData }) => 
      apiRequest(`/api/admin/registered-postbacks/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/registered-postbacks"] });
      setShowDialog(false);
      resetForm();
      toast({
        title: "Postback atualizado",
        description: "O postback foi atualizado com sucesso.",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/registered-postbacks/${id}`, {
      method: "DELETE"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/registered-postbacks"] });
      toast({
        title: "Postback removido",
        description: "O postback foi removido com sucesso.",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      houseId: "",
      houseName: "",
      eventType: "",
      description: "",
      isActive: true
    });
    setEditingPostback(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPostback) {
      updateMutation.mutate({ id: editingPostback.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (postback: RegisteredPostback) => {
    setEditingPostback(postback);
    setFormData({
      name: postback.name,
      url: postback.url,
      houseId: postback.houseId?.toString() || "",
      houseName: postback.houseName,
      eventType: postback.eventType,
      description: postback.description || "",
      isActive: postback.isActive
    });
    setShowDialog(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover este postback?")) {
      deleteMutation.mutate(id);
    }
  };

  const getEventTypeBadge = (eventType: string) => {
    const colors = {
      register: "bg-green-500",
      deposit: "bg-blue-500",
      profit: "bg-purple-500",
      payout: "bg-orange-500",
    };
    return (
      <Badge className={`${colors[eventType as keyof typeof colors] || "bg-gray-500"} text-white`}>
        {eventType.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Carregando postbacks registrados...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Postbacks Registrados</h2>
          <p className="text-slate-400">Gerencie todos os postbacks registrados no sistema</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Registrar Postback
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPostback ? "Editar Postback" : "Registrar Novo Postback"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Postback</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Brazino Register"
                    className="bg-slate-700 border-slate-600"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="eventType">Tipo de Evento</Label>
                  <Select value={formData.eventType} onValueChange={(value) => setFormData({ ...formData, eventType: value })}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="Selecione o evento" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="register">Registro</SelectItem>
                      <SelectItem value="deposit">Depósito</SelectItem>
                      <SelectItem value="profit">Lucro</SelectItem>
                      <SelectItem value="payout">Saque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="url">URL do Postback</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://exemplo.com/postback/register"
                  className="bg-slate-700 border-slate-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="houseId">Casa de Apostas</Label>
                  <Select value={formData.houseId} onValueChange={(value) => {
                    const house = houses.find((h: any) => h.id.toString() === value);
                    setFormData({ 
                      ...formData, 
                      houseId: value,
                      houseName: house ? house.name : ""
                    });
                  }}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="Selecione a casa" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {houses.map((house: any) => (
                        <SelectItem key={house.id} value={house.id.toString()}>
                          {house.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="houseName">Nome da Casa (Manual)</Label>
                  <Input
                    id="houseName"
                    value={formData.houseName}
                    onChange={(e) => setFormData({ ...formData, houseName: e.target.value })}
                    placeholder="Nome da casa"
                    className="bg-slate-700 border-slate-600"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do postback..."
                  className="bg-slate-700 border-slate-600"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Ativo</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingPostback ? "Atualizar" : "Registrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Total de Postbacks</p>
                <p className="text-2xl font-bold text-white">{postbacks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Ativos</p>
                <p className="text-2xl font-bold text-white">
                  {postbacks.filter((p: RegisteredPostback) => p.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Casas Únicas</p>
                <p className="text-2xl font-bold text-white">
                  {new Set(postbacks.map((p: RegisteredPostback) => p.houseName)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-orange-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Eventos Únicos</p>
                <p className="text-2xl font-bold text-white">
                  {new Set(postbacks.map((p: RegisteredPostback) => p.eventType)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Postbacks List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Lista de Postbacks</CardTitle>
        </CardHeader>
        <CardContent>
          {postbacks.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Nenhum postback registrado ainda</p>
              <p className="text-slate-500 text-sm">Clique em "Registrar Postback" para adicionar o primeiro</p>
            </div>
          ) : (
            <div className="space-y-4">
              {postbacks.map((postback: RegisteredPostback) => (
                <div
                  key={postback.id}
                  className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{postback.name}</h3>
                        {getEventTypeBadge(postback.eventType)}
                        <Badge variant={postback.isActive ? "default" : "secondary"}>
                          {postback.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{postback.houseName}</p>
                      <p className="text-slate-300 text-sm font-mono bg-slate-800 p-2 rounded">
                        {postback.url}
                      </p>
                      {postback.description && (
                        <p className="text-slate-400 text-sm mt-2">{postback.description}</p>
                      )}
                      <p className="text-slate-500 text-xs mt-2">
                        Criado em: {new Date(postback.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(postback)}
                        className="border-slate-600 hover:bg-slate-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(postback.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}