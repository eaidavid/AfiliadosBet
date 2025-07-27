import { cn } from "@/lib/utils";
import { forwardRef, useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { PremiumInput } from "./premium-input";

// Premium Select Types
export interface PremiumSelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface PremiumSelectProps {
  options: PremiumSelectOption[];
  value?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  help?: string;
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  onChange: (value: string | string[]) => void;
  className?: string;
}

const PremiumSelect = forwardRef<HTMLDivElement, PremiumSelectProps>(
  ({ 
    options,
    value,
    placeholder = "Selecione uma opção",
    label,
    error,
    help,
    disabled = false,
    searchable = false,
    clearable = false,
    multiple = false,
    onChange,
    className,
    ...props 
  }, ref) => {
    
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedValues, setSelectedValues] = useState<string[]>(
      multiple ? (Array.isArray(value) ? value : value ? [value] : []) : (value ? [value] : [])
    );
    
    const selectRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Filtrar opções baseado na busca
    const filteredOptions = searchable && searchTerm
      ? options.filter(option => 
          option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          option.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

    // Fechar dropdown quando clicar fora
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchTerm("");
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focar no input de busca quando abrir
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    const handleToggle = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    };

    const handleOptionSelect = (optionValue: string) => {
      if (multiple) {
        const newValues = selectedValues.includes(optionValue)
          ? selectedValues.filter(v => v !== optionValue)
          : [...selectedValues, optionValue];
        
        setSelectedValues(newValues);
        onChange(newValues);
      } else {
        setSelectedValues([optionValue]);
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedValues([]);
      onChange(multiple ? [] : "");
    };

    const getDisplayValue = () => {
      if (selectedValues.length === 0) return placeholder;
      
      if (multiple) {
        return selectedValues.length === 1 
          ? options.find(opt => opt.value === selectedValues[0])?.label || ""
          : `${selectedValues.length} selecionados`;
      }
      
      return options.find(opt => opt.value === selectedValues[0])?.label || "";
    };

    const isSelected = (optionValue: string) => selectedValues.includes(optionValue);

    return (
      <div className="space-y-2">
        {label && (
          <label className="form-label">
            {label}
          </label>
        )}
        
        <div 
          ref={selectRef} 
          className={cn("relative", className)}
          {...props}
        >
          {/* Select Trigger */}
          <div
            onClick={handleToggle}
            className={cn(
              "form-input cursor-pointer flex items-center justify-between",
              disabled && "opacity-50 cursor-not-allowed",
              error && "border-red-500 focus:border-red-500",
              isOpen && "ring-2 ring-emerald-500/20"
            )}
          >
            <span className={cn(
              "truncate",
              selectedValues.length === 0 && "text-slate-400"
            )}>
              {getDisplayValue()}
            </span>
            
            <div className="flex items-center gap-2">
              {clearable && selectedValues.length > 0 && !disabled && (
                <button
                  onClick={handleClear}
                  className="text-slate-400 hover:text-slate-300 transition-colors"
                >
                  ×
                </button>
              )}
              
              <ChevronDown className={cn(
                "w-4 h-4 text-slate-400 transition-transform duration-200",
                isOpen && "rotate-180"
              )} />
            </div>
          </div>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 z-50 mt-2 glass-premium border border-slate-600/50 rounded-xl shadow-2xl animate-scale-in max-h-60 overflow-hidden">
              {/* Search Input */}
              {searchable && (
                <div className="p-3 border-b border-slate-700/50">
                  <PremiumInput
                    ref={searchInputRef}
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<Search className="w-4 h-4" />}
                    variant="glass"
                    className="text-sm"
                  />
                </div>
              )}
              
              {/* Options List */}
              <div className="overflow-y-auto max-h-48">
                {filteredOptions.length === 0 ? (
                  <div className="p-3 text-center text-slate-400 text-sm">
                    Nenhuma opção encontrada
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => !option.disabled && handleOptionSelect(option.value)}
                      className={cn(
                        "flex items-center gap-3 p-3 cursor-pointer transition-colors duration-150",
                        option.disabled 
                          ? "opacity-50 cursor-not-allowed" 
                          : "hover:bg-slate-700/50",
                        isSelected(option.value) && "bg-emerald-500/10 text-emerald-400"
                      )}
                    >
                      {/* Option Icon */}
                      {option.icon && (
                        <span className="flex-shrink-0 text-slate-400">
                          {option.icon}
                        </span>
                      )}
                      
                      {/* Option Content */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="text-sm text-slate-400 truncate">
                            {option.description}
                          </div>
                        )}
                      </div>
                      
                      {/* Check Icon */}
                      {isSelected(option.value) && (
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <p className="form-error">{error}</p>
        )}
        
        {help && !error && (
          <p className="form-help">{help}</p>
        )}
      </div>
    );
  }
);

PremiumSelect.displayName = "PremiumSelect";

export { PremiumSelect };