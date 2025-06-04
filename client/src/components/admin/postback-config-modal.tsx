import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Plus, Settings, Copy, Bot, User, CheckCircle, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostbackSchema, type Postback, type BettingHouse } from "@shared/schema";
import { z } from "zod";

interface PostbackConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  houseId: number;
}

interface PostbackData {
  house: BettingHouse;
  postbacks: Postback[];
}

const eventTypeLabels = {
  click: "Clique",
  register: "Registro", 
  deposit: "Depósito",
  revenue: "Receita/Lucro"
} as const;

const eventTypeColors = {
  click: "bg-blue-500",
  register: "bg-green-500",
  deposit: "bg-orange-500", 
  revenue: "bg-purple-500"
} as const;

export default function PostbackConfigModal({ isOpen, onClose, houseId }: PostbackConfigModalProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingPostback, setEditingPostback] = useState<Postback | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: postbackData, isLoading } = useQuery<PostbackData>({
    queryKey: ["/api/admin/betting-houses", houseId, "postbacks"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/admin/betting-houses/${houseId}/postbacks`);
      if (!response.ok) {
        throw new Error("Failed to fetch postback data");
      }
      return response.json();
    },
    enabled: isOpen && !!houseId,
  });

  const form = useForm<z.infer<typeof insertPostbackSchema>>({
    resolver: zodResolver(insertPostbackSchema),
    defaultValues: {
      houseId: houseId,
      eventType: "click",
      url: "",
      active: true,
    },
  });

  const createPostbackMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertPostbackSchema>) => {
      const response = await apiRequest("POST", "/api/admin/postbacks", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar postback");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Postback criado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/betting-houses", houseId, "postbacks"] });
      setIsAddingNew(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePostbackMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Postback> }) => {
      const response = await apiRequest("PUT", `/api/admin/postbacks/${id}`, data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar postback");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Postback atualizado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/betting-houses", houseId, "postbacks"] });
      setEditingPostback(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePostbackMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/postbacks/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao deletar postback");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Postback deletado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/betting-houses", houseId, "postbacks"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: z.infer<typeof insertPostbackSchema>) => {
    createPostbackMutation.mutate(data);
  };

  const handleEdit = (postback: Postback) => {
    setEditingPostback(postback);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este postback?")) {
      deletePostbackMutation.mutate(id);
    }
  };

  const handleToggleActive = (postback: Postback) => {
    updatePostbackMutation.mutate({
      id: postback.id,
      data: { ...postback, active: !postback.active }
    });
  };

  const handleUpdatePostback = (postback: Postback, url: string) => {
    updatePostbackMutation.mutate({
      id: postback.id,
      data: { ...postback, url }
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700 text-white"
        aria-describedby="postback-config-description"
      >
        <DialogHeader className="border-b border-slate-700 pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-white">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-xl">Configurações de Postback</div>
              <div className="text-sm font-normal text-slate-400">
                Casa: {postbackData?.house?.name || 'Carregando...'}
              </div>
            </div>
          </DialogTitle>
          <div id="postback-config-description" className="sr-only">
            Configure e gerencie postbacks para receber notificações de eventos desta casa de apostas
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-slate-400">Carregando configurações...</div>
          </div>
        ) : (
          <div className="space-y-6 mt-6">
            {/* Existing Postbacks Table */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Postbacks Configurados
                </CardTitle>
                <p className="text-sm text-slate-400">
                  Gerencie os postbacks configurados para esta casa de apostas
                </p>
              </CardHeader>
              <CardContent className="p-0">
                {postbackData?.postbacks && postbackData.postbacks.length > 0 ? (
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-750">
                        <TableRow className="border-slate-600 hover:bg-slate-750">
                          <TableHead className="text-slate-300 font-semibold">Evento</TableHead>
                          <TableHead className="text-slate-300 font-semibold">URL de Postback</TableHead>
                          <TableHead className="text-slate-300 font-semibold">Status</TableHead>
                          <TableHead className="text-slate-300 font-semibold">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {postbackData.postbacks.map((postback) => (
                          <TableRow key={postback.id} className="border-slate-700 hover:bg-slate-800/50">
                            <TableCell className="text-white">
                            <Badge className={`${eventTypeColors[postback.eventType as keyof typeof eventTypeColors]} text-white`}>
                              {eventTypeLabels[postback.eventType as keyof typeof eventTypeLabels]}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-md text-slate-300">
                            {editingPostback?.id === postback.id ? (
                              <div className="flex gap-2">
                                <Input
                                  defaultValue={postback.url}
                                  className="bg-slate-700 border-slate-600 text-white"
                                  onBlur={(e) => {
                                    if (e.target.value !== postback.url) {
                                      handleUpdatePostback(postback, e.target.value);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleUpdatePostback(postback, e.currentTarget.value);
                                    }
                                    if (e.key === 'Escape') {
                                      setEditingPostback(null);
                                    }
                                  }}
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <div className="text-sm font-mono truncate text-slate-300" title={postback.url}>
                                {postback.url}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={postback.active}
                                onCheckedChange={() => handleToggleActive(postback)}
                              />
                              <span className={postback.active ? "text-green-600" : "text-red-600"}>
                                {postback.active ? "Ativo" : "Inativo"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(postback)}
                                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(postback.id)}
                                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
                      <Settings className="w-8 h-8 text-slate-400" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-white mb-2">Nenhum postback configurado</h3>
                      <p className="text-slate-400 text-sm">
                        Configure seu primeiro postback para começar a receber notificações de eventos
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add New Postback Section */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-xl text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Adicionar Novo Postback
                  </div>
                  {!isAddingNew && (
                    <Button 
                      onClick={() => setIsAddingNew(true)}
                      className="bg-green-600 hover:bg-green-700 text-white border-0"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  )}
                </CardTitle>
                <p className="text-sm text-slate-400">
                  Configure um novo postback para receber notificações de eventos
                </p>
              </CardHeader>
              {isAddingNew && (
                <CardContent className="pt-6">
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="eventType" className="text-slate-200 font-medium">Tipo de Evento</Label>
                        <Select
                          value={form.watch("eventType")}
                          onValueChange={(value) => form.setValue("eventType", value as any)}
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Selecione o evento" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="click" className="text-white hover:bg-slate-600">Clique</SelectItem>
                            <SelectItem value="register" className="text-white hover:bg-slate-600">Registro</SelectItem>
                            <SelectItem value="deposit" className="text-white hover:bg-slate-600">Depósito</SelectItem>
                            <SelectItem value="revenue" className="text-white hover:bg-slate-600">Receita/Lucro</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.eventType && (
                          <p className="text-sm text-red-400">{form.formState.errors.eventType.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="active" className="text-slate-200 font-medium">Status</Label>
                        <div className="flex items-center space-x-3 mt-3">
                          <Switch
                            checked={form.watch("active")}
                            onCheckedChange={(checked) => form.setValue("active", checked)}
                          />
                          <span className="text-slate-300">{form.watch("active") ? "Ativo" : "Inativo"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="url" className="text-slate-200 font-medium">URL do Postback</Label>
                      <Input
                        {...form.register("url")}
                        placeholder="https://meusite.com/pb/click?subid={subid}"
                        className="font-mono text-sm bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                      {form.formState.errors.url && (
                        <p className="text-sm text-red-400">{form.formState.errors.url.message}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-2">
                        Use {"{subid}"} como placeholder para o ID do afiliado
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="submit"
                        disabled={createPostbackMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white border-0"
                      >
                        {createPostbackMutation.isPending ? "Salvando..." : "Salvar Postback"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsAddingNew(false);
                          form.reset();
                        }}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              )}
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}