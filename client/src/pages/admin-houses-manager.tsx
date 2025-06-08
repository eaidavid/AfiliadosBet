import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AdminSidebar } from '@/components/admin/sidebar';
import { Plus, Edit, Trash2, Copy, ExternalLink, Building, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BettingHouse {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  baseUrl: string;
  identifier: string;
  securityToken: string;
  primaryParam: string;
  additionalParams?: string;
  commissionType: string;
  commissionValue: string;
  minDeposit: string;
  paymentMethods: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface HouseFormData {
  name: string;
  description: string;
  logoUrl: string;
  baseUrl: string;
  primaryParam: string;
  additionalParams: string;
  commissionType: string;
  commissionValue: string;
  minDeposit: string;
  paymentMethods: string;
  isActive: boolean;
}

export default function AdminHousesManager() {
  const [currentPage, setCurrentPage] = useState("houses");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<BettingHouse | null>(null);
  const [formData, setFormData] = useState<HouseFormData>({
    name: '',
    description: '',
    logoUrl: '',
    baseUrl: '',
    primaryParam: 'subid',
    additionalParams: '',
    commissionType: 'RevShare',
    commissionValue: '30',
    minDeposit: '100',
    paymentMethods: 'Pix',
    isActive: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  // Query para buscar casas
  const { data: houses, isLoading } = useQuery<BettingHouse[]>({
    queryKey: ['betting-houses'],
    queryFn: async () => {
      const response = await fetch('/api/admin/betting-houses');
      if (!response.ok) {
        throw new Error('Erro ao buscar casas');
      }
      return response.json();
    }
  });

  // Mutation para criar/atualizar casa
  const saveMutation = useMutation({
    mutationFn: async (data: HouseFormData) => {
      const url = editingHouse 
        ? `/api/admin/betting-houses/${editingHouse.id}`
        : '/api/admin/betting-houses';
      
      const response = await fetch(url, {
        method: editingHouse ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar casa');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['betting-houses'] });
      setIsDialogOpen(false);
      setEditingHouse(null);
      resetForm();
      toast({
        title: "Sucesso",
        description: editingHouse ? "Casa atualizada com sucesso" : "Casa criada com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation para deletar casa
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/betting-houses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar casa');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['betting-houses'] });
      toast({
        title: "Sucesso",
        description: "Casa deletada com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      logoUrl: '',
      baseUrl: '',
      primaryParam: 'subid',
      additionalParams: '',
      commissionType: 'RevShare',
      commissionValue: '30',
      minDeposit: '100',
      paymentMethods: 'Pix',
      isActive: true
    });
  };

  const handleEdit = (house: BettingHouse) => {
    setEditingHouse(house);
    setFormData({
      name: house.name,
      description: house.description || '',
      logoUrl: house.logoUrl || '',
      baseUrl: house.baseUrl,
      primaryParam: house.primaryParam,
      additionalParams: house.additionalParams || '',
      commissionType: house.commissionType,
      commissionValue: house.commissionValue,
      minDeposit: house.minDeposit,
      paymentMethods: house.paymentMethods,
      isActive: house.isActive
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Texto copiado para a área de transferência",
    });
  };

  const generatePostbackUrl = (house: BettingHouse) => {
    return `${window.location.origin}/postback/${house.identifier}?token=${house.securityToken}&event={EVENT}&subid={SUBID}&amount={AMOUNT}&customer_id={CUSTOMER_ID}`;
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      <AdminSidebar currentPage={currentPage} onPageChange={handlePageChange} />
      <div className="flex-1 ml-64">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Gerenciar Casas de Apostas</h1>
              <p className="text-gray-400">Crie e gerencie casas de apostas com postbacks automáticos</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setEditingHouse(null); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Casa
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-800 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingHouse ? 'Editar Casa' : 'Nova Casa de Apostas'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Configure os dados da casa de apostas e integração
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Nome da Casa *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Bet365"
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="baseUrl" className="text-white">URL Base *</Label>
                      <Input
                        id="baseUrl"
                        value={formData.baseUrl}
                        onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                        placeholder="https://casa.com/register"
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição da casa de apostas"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="logoUrl" className="text-white">URL do Logo</Label>
                    <Input
                      id="logoUrl"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      placeholder="https://exemplo.com/logo.png"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="commissionType" className="text-white">Tipo de Comissão</Label>
                      <Select value={formData.commissionType} onValueChange={(value) => setFormData({ ...formData, commissionType: value })}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RevShare">RevShare (%)</SelectItem>
                          <SelectItem value="CPA">CPA (Fixo)</SelectItem>
                          <SelectItem value="Hybrid">Híbrido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="commissionValue" className="text-white">Valor da Comissão</Label>
                      <Input
                        id="commissionValue"
                        value={formData.commissionValue}
                        onChange={(e) => setFormData({ ...formData, commissionValue: e.target.value })}
                        placeholder="30"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minDeposit" className="text-white">Depósito Mínimo (R$)</Label>
                      <Input
                        id="minDeposit"
                        value={formData.minDeposit}
                        onChange={(e) => setFormData({ ...formData, minDeposit: e.target.value })}
                        placeholder="100"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="paymentMethods" className="text-white">Métodos de Pagamento</Label>
                      <Input
                        id="paymentMethods"
                        value={formData.paymentMethods}
                        onChange={(e) => setFormData({ ...formData, paymentMethods: e.target.value })}
                        placeholder="Pix, Cartão, Transferência"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive" className="text-white">Casa Ativa</Label>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={saveMutation.isPending}>
                      {saveMutation.isPending ? 'Salvando...' : editingHouse ? 'Atualizar' : 'Criar Casa'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de Casas */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Casas de Apostas Cadastradas</CardTitle>
              <CardDescription className="text-gray-400">
                Gerencie suas casas de apostas e URLs de postback
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center text-gray-400 py-8">Carregando...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Casa</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Comissão</TableHead>
                        <TableHead className="text-gray-300">Depósito Min.</TableHead>
                        <TableHead className="text-gray-300">URL Postback</TableHead>
                        <TableHead className="text-gray-300">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {houses?.map((house) => (
                        <TableRow key={house.id} className="border-gray-700">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {house.logoUrl && (
                                <img src={house.logoUrl} alt={house.name} className="w-8 h-8 rounded" />
                              )}
                              <div>
                                <div className="font-medium text-white">{house.name}</div>
                                <div className="text-sm text-gray-400">{house.description}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={house.isActive ? "default" : "secondary"}>
                              {house.isActive ? "Ativa" : "Inativa"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {house.commissionValue}% {house.commissionType}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            R$ {house.minDeposit}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(generatePostbackUrl(house))}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(house.baseUrl, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(house)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteMutation.mutate(house.id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
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
        </div>
      </div>
    </div>
  );
}