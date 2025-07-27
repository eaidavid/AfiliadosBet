import { cn } from "@/lib/utils";
import { forwardRef, useState } from "react";
import { ChevronUp, ChevronDown, MoreHorizontal } from "lucide-react";
import { PremiumBadge } from "./premium-badge";
import { PremiumButton, PremiumIconButton } from "./premium-button";

// Premium Table Types
export interface PremiumTableColumn<T = any> {
  key: string;
  title: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface PremiumTableProps<T = any> {
  columns: PremiumTableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  sortable?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selectedKeys: string[]) => void;
  className?: string;
  emptyText?: string;
  actions?: {
    label: string;
    onClick: (record: T) => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
}

const PremiumTable = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  pagination,
  sortable = true,
  selectable = false,
  onSelectionChange,
  className,
  emptyText = "Nenhum dado encontrado",
  actions
}: PremiumTableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Sorting logic
  const handleSort = (key: string) => {
    if (!sortable) return;

    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Selection logic
  const handleSelectAll = (checked: boolean) => {
    const newSelectedKeys = checked ? data.map((_, index) => index.toString()) : [];
    setSelectedKeys(newSelectedKeys);
    onSelectionChange?.(newSelectedKeys);
  };

  const handleSelectRow = (key: string, checked: boolean) => {
    const newSelectedKeys = checked
      ? [...selectedKeys, key]
      : selectedKeys.filter(k => k !== key);
    setSelectedKeys(newSelectedKeys);
    onSelectionChange?.(newSelectedKeys);
  };

  const isAllSelected = selectedKeys.length === data.length && data.length > 0;
  const isIndeterminate = selectedKeys.length > 0 && selectedKeys.length < data.length;

  if (loading) {
    return <PremiumTableSkeleton />;
  }

  return (
    <div className={cn("glass-card overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead>
            <tr className="border-b border-slate-700/50">
              {selectable && (
                <th className="w-12 p-4">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500/20"
                  />
                </th>
              )}
              
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "p-4 text-left font-semibold text-slate-300 bg-slate-800/50",
                    column.sortable && sortable && "cursor-pointer hover:text-white transition-colors",
                    column.align === 'center' && "text-center",
                    column.align === 'right' && "text-right"
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.title}</span>
                    {column.sortable && sortable && (
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={cn(
                            "w-3 h-3 -mb-1",
                            sortConfig?.key === column.key && sortConfig.direction === 'asc'
                              ? "text-emerald-400"
                              : "text-slate-500"
                          )} 
                        />
                        <ChevronDown 
                          className={cn(
                            "w-3 h-3",
                            sortConfig?.key === column.key && sortConfig.direction === 'desc'
                              ? "text-emerald-400"
                              : "text-slate-500"
                          )} 
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              
              {actions && actions.length > 0 && (
                <th className="w-20 p-4 text-center font-semibold text-slate-300 bg-slate-800/50">
                  Ações
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                  className="p-8 text-center text-slate-400"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              sortedData.map((record, index) => {
                const rowKey = index.toString();
                const isSelected = selectedKeys.includes(rowKey);
                
                return (
                  <tr
                    key={rowKey}
                    className={cn(
                      "border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors",
                      isSelected && "bg-emerald-500/10"
                    )}
                  >
                    {selectable && (
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(rowKey, e.target.checked)}
                          className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500/20"
                        />
                      </td>
                    )}
                    
                    {columns.map((column) => {
                      const value = record[column.key];
                      const displayValue = column.render 
                        ? column.render(value, record, index)
                        : value;
                      
                      return (
                        <td
                          key={column.key}
                          className={cn(
                            "p-4 text-slate-300",
                            column.align === 'center' && "text-center",
                            column.align === 'right' && "text-right"
                          )}
                        >
                          {displayValue}
                        </td>
                      );
                    })}
                    
                    {actions && actions.length > 0 && (
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {actions.map((action, actionIndex) => (
                            <PremiumButton
                              key={actionIndex}
                              variant={action.variant || 'secondary'}
                              size="sm"
                              onClick={() => action.onClick(record)}
                            >
                              {action.label}
                            </PremiumButton>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between p-4 border-t border-slate-700/50 bg-slate-800/30">
          <div className="text-sm text-slate-400">
            Mostrando {((pagination.current - 1) * pagination.pageSize) + 1} a{' '}
            {Math.min(pagination.current * pagination.pageSize, pagination.total)} de{' '}
            {pagination.total} registros
          </div>
          
          <div className="flex items-center gap-2">
            <PremiumButton
              variant="secondary"
              size="sm"
              disabled={pagination.current <= 1}
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
            >
              Anterior
            </PremiumButton>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.ceil(pagination.total / pagination.pageSize) }, (_, i) => i + 1)
                .filter(page => {
                  const current = pagination.current;
                  return page === 1 || page === Math.ceil(pagination.total / pagination.pageSize) ||
                         (page >= current - 1 && page <= current + 1);
                })
                .map((page, index, array) => {
                  const showEllipsis = index > 0 && array[index - 1] !== page - 1;
                  
                  return (
                    <div key={page} className="flex items-center gap-1">
                      {showEllipsis && <span className="text-slate-400 px-2">...</span>}
                      <PremiumButton
                        variant={page === pagination.current ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => pagination.onChange(page, pagination.pageSize)}
                        className="min-w-[36px]"
                      >
                        {page}
                      </PremiumButton>
                    </div>
                  );
                })}
            </div>
            
            <PremiumButton
              variant="secondary"
              size="sm"
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
            >
              Próximo
            </PremiumButton>
          </div>
        </div>
      )}
    </div>
  );
};

// Premium Table Skeleton (moved from loading component for consistency)
const PremiumTableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800/50">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-700 rounded animate-shimmer" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-slate-700">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-4 bg-slate-700 rounded animate-shimmer" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { PremiumTable, PremiumTableSkeleton };