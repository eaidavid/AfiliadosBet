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
    mutationFn: async (data: typeof formData) => {
      const payload = {
        name: data.name,
        url: data.url,
        houseId: data.houseId ? parseInt(data.houseId) : null,
        houseName: data.houseName,
        eventType: data.eventType,
        description: data.description,
        isActive: data.isActive
      };
      
      const response = await apiRequest("/api/admin/registered-postbacks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/registered-postbacks"] });
      setShowDialog(false);
      resetForm();
      toast({
        title: "Postback registrado",
        description: "O postback foi registrado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao criar postback:", error);
      toast({
        title: "Erro ao registrar",
        description: "Ocorreu um erro ao registrar o postback. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const payload = {
        name: data.name,
        url: data.url,
        houseId: data.houseId ? parseInt(data.houseId) : null,
        houseName: data.houseName,
        eventType: data.eventType,
        description: data.description,
        isActive: data.isActive
      };
      
      return apiRequest(`/api/admin/registered-postbacks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    },
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

  const handleSubmit = async () => {
    // Validar campos obrigatórios
    if (!formData.name || !formData.url || !formData.houseName || !formData.eventType) {
      toast({
        title: "Erro de validação",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
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
      registration: "bg-blue-500/20 text-blue-400 border-blue-500/20",
      deposit: "bg-green-500/20 text-green-400 border-green-500/20",
      revenue: "bg-purple-500/20 text-purple-400 border-purple-500/20",
      profit: "bg-yellow-500/20 text-yellow-400 border-yellow-500/20"
    };
    
    const labels = {
      registration: "Registro",
      deposit: "Depósito",
      revenue: "Receita",
      profit: "Lucro"
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full border ${colors[eventType as keyof typeof colors] || 'bg-slate-500/20 text-slate-400'}`}>
        {labels[eventType as keyof typeof labels] || eventType}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-slate-400">Carregando postbacks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Postbacks Registrados</h2>
          <p className="text-slate-400">Gerencie os postbacks configurados no sistema</p>
        </div>
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
              resetForm();
              setShowDialog(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Postback
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingPostback ? "Editar Postback" : "Registrar Novo Postback"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Postback</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Braz Reg"
                  required
                />
              </div>

              <div>
                <Label htmlFor="url">URL do Postback</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com/postback"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="houseId">Casa de Apostas</Label>
                  <Select 
                    value={formData.houseId} 
                    onValueChange={(value) => {
                      const selectedHouse = houses.find((h: any) => h.id.toString() === value);
                      setFormData({ 
                        ...formData, 
                        houseId: value,
                        houseName: selectedHouse?.name || ""
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a casa" />
                    </SelectTrigger>
                    <SelectContent>
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
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="eventType">Tipo de Evento</Label>
                <Select 
                  value={formData.eventType} 
                  onValueChange={(value) => setFormData({ ...formData, eventType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="registration">Registro</SelectItem>
                    <SelectItem value="deposit">Depósito</SelectItem>
                    <SelectItem value="revenue">Receita</SelectItem>
                    <SelectItem value="profit">Lucro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do postback..."
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
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  onClick={handleSubmit}
                >
                  {createMutation.isPending || updateMutation.isPending ? "Processando..." : (editingPostback ? "Atualizar" : "Registrar")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total de Postbacks</p>
                <p className="text-2xl font-bold text-white">{postbacks.length}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Postbacks Ativos</p>
                <p className="text-2xl font-bold text-white">
                  {postbacks.filter((p: RegisteredPostback) => p.isActive).length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Casas Cobertas</p>
                <p className="text-2xl font-bold text-white">
                  {new Set(postbacks.map((p: RegisteredPostback) => p.houseName)).size}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-400" />
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
                      <p className="text-slate-400 text-sm mb-2">{postback.url}</p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>Casa: {postback.houseName}</span>
                        <span>•</span>
                        <span>Criado: {new Date(postback.createdAt).toLocaleDateString()}</span>
                      </div>
                      {postback.description && (
                        <p className="text-slate-400 text-sm mt-2">{postback.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(postback)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(postback.id)}
                        className="border-red-600 text-red-400 hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
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