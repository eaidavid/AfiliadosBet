import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Zap, 
  Copy, 
  Plus, 
  Settings, 
  Database,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  Edit,
  Eye
} from 'lucide-react';

interface BettingHouse {
  id: number;
  name: string;
  token: string;
  isActive: boolean;
}

interface RegisteredPostback {
  id: number;
  name: string;
  url: string;
  house_id: number;
  houseName: string;
  event_type: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminPostbackFixed() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedHouse, setSelectedHouse] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingPostback, setEditingPostback] = useState<RegisteredPostback | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    houseId: '',
    eventType: '',
    description: '',
    isActive: true
  });

  // Fetch betting houses
  const { data: bettingHouses = [], isLoading: housesLoading } = useQuery({
    queryKey: ["/api/admin/houses"],
    retry: 1,
  });

  // Fetch registered postbacks
  const { data: registeredPostbacks = [], isLoading: postbacksLoading, refetch: refetchPostbacks } = useQuery({
    queryKey: ["/api/admin/registered-postbacks"],
    retry: 1,
  });

  // Create postback mutation
  const createPostbackMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/registered-postbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar postback');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Postback criado com sucesso.",
      });
      setShowForm(false);
      resetForm();
      refetchPostbacks();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update postback mutation
  const updatePostbackMutation = useMutation({
    mutationFn: async (data: { id: number; updates: any }) => {
      const response = await fetch(`/api/admin/registered-postbacks/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data.updates)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar postback');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Postback atualizado com sucesso.",
      });
      setEditingPostback(null);
      setShowForm(false);
      resetForm();
      refetchPostbacks();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete postback mutation
  const deletePostbackMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/registered-postbacks/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir postback');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Postback excluído com sucesso.",
      });
      refetchPostbacks();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      houseId: '',
      eventType: '',
      description: '',
      isActive: true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.url || !formData.houseId || !formData.eventType) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (editingPostback) {
      updatePostbackMutation.mutate({
        id: editingPostback.id,
        updates: {
          name: formData.name,
          url: formData.url,
          houseId: parseInt(formData.houseId),
          eventType: formData.eventType,
          description: formData.description,
          isActive: formData.isActive
        }
      });
    } else {
      createPostbackMutation.mutate({
        name: formData.name,
        url: formData.url,
        houseId: parseInt(formData.houseId),
        eventType: formData.eventType,
        description: formData.description,
        isActive: formData.isActive
      });
    }
  };

  const handleEdit = (postback: RegisteredPostback) => {
    setEditingPostback(postback);
    setFormData({
      name: postback.name,
      url: postback.url,
      houseId: postback.house_id.toString(),
      eventType: postback.event_type,
      description: postback.description || '',
      isActive: postback.is_active
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este postback?')) {
      deletePostbackMutation.mutate(id);
    }
  };

  const generatePostbackUrl = (house: BettingHouse, eventType: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/api/postback/${house.name.toLowerCase().replace(/\s+/g, '-')}/${eventType}?token=${house.token}&subid={SUBID}&amount={AMOUNT}&customer_id={CUSTOMER_ID}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "URL copiada para a área de transferência.",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar a URL.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Zap className="h-8 w-8 text-yellow-500" />
            Gerador de Postbacks
          </h1>
          <p className="text-slate-400 mt-2">
            Configure e gerencie postbacks para integração com casas de apostas
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingPostback(null);
            resetForm();
          }}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Postback
        </Button>
      </div>

      {/* URL Generator */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-400" />
            Gerador de URLs de Postback
          </CardTitle>
          <CardDescription className="text-slate-400">
            Gere URLs de postback personalizadas para cada casa de apostas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="houseSelect">Casa de Apostas</Label>
              <Select value={selectedHouse} onValueChange={setSelectedHouse}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue placeholder="Selecione uma casa" />
                </SelectTrigger>
                <SelectContent>
                  {bettingHouses.map((house: BettingHouse) => (
                    <SelectItem key={house.id} value={house.id.toString()}>
                      {house.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedHouse && (
            <div className="space-y-4">
              <Separator className="bg-slate-700" />
              <h3 className="text-lg font-semibold text-white">URLs de Postback Geradas</h3>
              
              {['register', 'deposit', 'profit', 'chargeback'].map((eventType) => {
                const house = bettingHouses.find((h: BettingHouse) => h.id.toString() === selectedHouse);
                if (!house) return null;
                
                const url = generatePostbackUrl(house, eventType);
                
                return (
                  <div key={eventType} className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="capitalize">
                        {eventType === 'register' ? 'Registro' :
                         eventType === 'deposit' ? 'Depósito' :
                         eventType === 'profit' ? 'Lucro' : 'Chargeback'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(url)}
                        className="border-slate-600 hover:bg-slate-600"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar
                      </Button>
                    </div>
                    <code className="text-sm text-slate-300 break-all bg-slate-800/50 p-2 rounded block">
                      {url}
                    </code>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form for creating/editing postbacks */}
      {showForm && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              {editingPostback ? 'Editar Postback' : 'Criar Novo Postback'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Postback *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-700 border-slate-600"
                    placeholder="Ex: Postback Bet365 Registros"
                  />
                </div>
                <div>
                  <Label htmlFor="eventType">Tipo de Evento *</Label>
                  <Select 
                    value={formData.eventType} 
                    onValueChange={(value) => setFormData({ ...formData, eventType: value })}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="register">Registro</SelectItem>
                      <SelectItem value="deposit">Depósito</SelectItem>
                      <SelectItem value="profit">Lucro</SelectItem>
                      <SelectItem value="chargeback">Chargeback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="houseId">Casa de Apostas *</Label>
                <Select 
                  value={formData.houseId} 
                  onValueChange={(value) => setFormData({ ...formData, houseId: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue placeholder="Selecione a casa" />
                  </SelectTrigger>
                  <SelectContent>
                    {bettingHouses.map((house: BettingHouse) => (
                      <SelectItem key={house.id} value={house.id.toString()}>
                        {house.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="url">URL do Postback *</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="bg-slate-700 border-slate-600"
                  placeholder="https://example.com/postback?param1={PARAM1}"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-700 border-slate-600"
                  placeholder="Descrição opcional do postback"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Postback ativo</Label>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={createPostbackMutation.isPending || updatePostbackMutation.isPending}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                >
                  {(createPostbackMutation.isPending || updatePostbackMutation.isPending) ? 'Salvando...' : 
                   editingPostback ? 'Atualizar' : 'Criar'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPostback(null);
                    resetForm();
                  }}
                  className="border-slate-600 hover:bg-slate-700"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Registered Postbacks Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-green-400" />
            Postbacks Registrados
          </CardTitle>
          <CardDescription className="text-slate-400">
            Lista de todos os postbacks configurados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {postbacksLoading ? (
            <div className="text-center py-8 text-slate-400">Carregando...</div>
          ) : registeredPostbacks.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum postback registrado</p>
              <p className="text-sm">Crie seu primeiro postback para começar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Nome</TableHead>
                    <TableHead className="text-slate-300">Casa</TableHead>
                    <TableHead className="text-slate-300">Evento</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Criado</TableHead>
                    <TableHead className="text-slate-300">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registeredPostbacks.map((postback: RegisteredPostback) => (
                    <TableRow key={postback.id} className="border-slate-700">
                      <TableCell className="text-white font-medium">
                        {postback.name}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {postback.houseName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {postback.event_type === 'register' ? 'Registro' :
                           postback.event_type === 'deposit' ? 'Depósito' :
                           postback.event_type === 'profit' ? 'Lucro' : 'Chargeback'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={postback.is_active ? "default" : "secondary"}>
                          {postback.is_active ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ativo
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Inativo
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {new Date(postback.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(postback)}
                            className="border-slate-600 hover:bg-slate-700"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(postback.id)}
                            className="border-red-600 text-red-400 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            Instruções de Uso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Parâmetros disponíveis nas URLs:</strong>
              <br />
              • <code>{'{SUBID}'}</code> - ID do afiliado (username)
              <br />
              • <code>{'{AMOUNT}'}</code> - Valor da transação
              <br />
              • <code>{'{CUSTOMER_ID}'}</code> - ID do cliente na casa de apostas
              <br />
              • <code>{'{EVENT_TYPE}'}</code> - Tipo do evento (register, deposit, etc.)
            </AlertDescription>
          </Alert>

          <div className="text-slate-300 space-y-2">
            <p><strong>Como usar:</strong></p>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Selecione uma casa de apostas no gerador acima</li>
              <li>Copie a URL do evento desejado</li>
              <li>Configure na casa de apostas para enviar postbacks</li>
              <li>Os postbacks serão processados automaticamente</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}