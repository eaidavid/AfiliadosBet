import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function SimplePostbackForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Registrar Novo Postback</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}