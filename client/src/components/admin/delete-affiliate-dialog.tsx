import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteAffiliateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  affiliateName: string;
  isDeleting: boolean;
}

export function DeleteAffiliateDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  affiliateName, 
  isDeleting 
}: DeleteAffiliateDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-slate-900 border-slate-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            Confirmar Exclusão
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            Tem certeza que deseja excluir o afiliado <span className="font-semibold text-white">"{affiliateName}"</span>?
            <br />
            <br />
            Esta ação é irreversível e irá remover:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Todos os dados do afiliado</li>
              <li>Histórico de cliques e conversões</li>
              <li>Links de afiliação associados</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            disabled={isDeleting}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Excluindo...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Excluir Definitivamente
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}