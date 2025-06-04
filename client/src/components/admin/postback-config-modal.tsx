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
import { Edit, Trash2, Plus, Settings } from "lucide-react";
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
    queryKey: ["/api/admin/postbacks", houseId],
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/postbacks", houseId] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/postbacks", houseId] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/postbacks", houseId] });
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações de Postback - Casa: {postbackData?.house?.name}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Existing Postbacks Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Postbacks Configurados</CardTitle>
              </CardHeader>
              <CardContent>
                {postbackData?.postbacks && postbackData.postbacks.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Evento</TableHead>
                        <TableHead>URL de Postback</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {postbackData.postbacks.map((postback) => (
                        <TableRow key={postback.id}>
                          <TableCell>
                            <Badge className={`${eventTypeColors[postback.eventType as keyof typeof eventTypeColors]} text-white`}>
                              {eventTypeLabels[postback.eventType as keyof typeof eventTypeLabels]}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-md">
                            {editingPostback?.id === postback.id ? (
                              <div className="flex gap-2">
                                <Input
                                  defaultValue={postback.url}
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
                              <div className="text-sm font-mono truncate" title={postback.url}>
                                {postback.url}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
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
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(postback.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum postback configurado para esta casa
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add New Postback Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Adicionar Novo Postback
                  {!isAddingNew && (
                    <Button onClick={() => setIsAddingNew(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              {isAddingNew && (
                <CardContent>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="eventType">Tipo de Evento</Label>
                        <Select
                          value={form.watch("eventType")}
                          onValueChange={(value) => form.setValue("eventType", value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o evento" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="click">Clique</SelectItem>
                            <SelectItem value="register">Registro</SelectItem>
                            <SelectItem value="deposit">Depósito</SelectItem>
                            <SelectItem value="revenue">Receita/Lucro</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.eventType && (
                          <p className="text-sm text-red-600">{form.formState.errors.eventType.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="active">Status</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Switch
                            checked={form.watch("active")}
                            onCheckedChange={(checked) => form.setValue("active", checked)}
                          />
                          <span>{form.watch("active") ? "Ativo" : "Inativo"}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="url">URL do Postback</Label>
                      <Input
                        {...form.register("url")}
                        placeholder="https://meusite.com/pb/click?subid={subid}"
                        className="font-mono text-sm"
                      />
                      {form.formState.errors.url && (
                        <p className="text-sm text-red-600">{form.formState.errors.url.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Use {"{subid}"} como placeholder para o ID do afiliado
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={createPostbackMutation.isPending}
                      >
                        {createPostbackMutation.isPending ? "Salvando..." : "Salvar"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsAddingNew(false);
                          form.reset();
                        }}
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