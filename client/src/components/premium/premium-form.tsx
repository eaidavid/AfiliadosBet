import { cn } from "@/lib/utils";
import { useState } from "react";
import { PremiumInput, PremiumPasswordInput, PremiumTextarea } from "./premium-input";
import { PremiumSelect, PremiumSelectOption } from "./premium-select";
import { PremiumButton } from "./premium-button";

// Premium Form Types
export interface PremiumFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'number';
  placeholder?: string;
  required?: boolean;
  validation?: (value: string) => string | null;
  options?: PremiumSelectOption[]; // Para campos select
  help?: string;
  disabled?: boolean;
}

export interface PremiumFormProps {
  fields: PremiumFieldConfig[];
  onSubmit: (data: Record<string, string>) => Promise<void> | void;
  submitText?: string;
  loading?: boolean;
  className?: string;
  initialValues?: Record<string, string>;
}

const PremiumForm = ({
  fields,
  onSubmit,
  submitText = "Enviar",
  loading = false,
  className,
  initialValues = {}
}: PremiumFormProps) => {
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, values[name] || "");
  };

  const validateField = (name: string, value: string) => {
    const field = fields.find(f => f.name === name);
    if (!field) return;

    let error = "";

    // Validação de campo obrigatório
    if (field.required && !value.trim()) {
      error = `${field.label} é obrigatório`;
    }
    
    // Validação customizada
    else if (field.validation && value.trim()) {
      const customError = field.validation(value);
      if (customError) {
        error = customError;
      }
    }
    
    // Validação de email
    else if (field.type === 'email' && value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        error = "Email inválido";
      }
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      const value = values[field.name] || "";
      const error = validateField(field.name, value);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.fromEntries(fields.map(f => [f.name, true])));
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const renderField = (field: PremiumFieldConfig) => {
    const value = values[field.name] || "";
    const error = touched[field.name] ? errors[field.name] : "";

    switch (field.type) {
      case 'password':
        return (
          <PremiumPasswordInput
            key={field.name}
            label={field.label}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field.name)}
            error={error}
            help={field.help}
            disabled={field.disabled || loading}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <PremiumTextarea
            key={field.name}
            label={field.label}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field.name)}
            error={error}
            help={field.help}
            disabled={field.disabled || loading}
            required={field.required}
          />
        );

      case 'select':
        return (
          <PremiumSelect
            key={field.name}
            label={field.label}
            placeholder={field.placeholder}
            options={field.options || []}
            value={value}
            onChange={(selectedValue) => handleChange(field.name, selectedValue as string)}
            error={error}
            help={field.help}
            disabled={field.disabled || loading}
          />
        );

      default:
        return (
          <PremiumInput
            key={field.name}
            type={field.type}
            label={field.label}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field.name)}
            error={error}
            help={field.help}
            disabled={field.disabled || loading}
            required={field.required}
          />
        );
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn("space-y-6", className)}
    >
      {fields.map(renderField)}
      
      <div className="pt-4">
        <PremiumButton
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full"
        >
          {submitText}
        </PremiumButton>
      </div>
    </form>
  );
};

// Premium Field Group Component
interface PremiumFieldGroupProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const PremiumFieldGroup = ({
  title,
  description,
  children,
  className
}: PremiumFieldGroupProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-white">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-slate-400">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

// Premium Form Wizard
interface PremiumFormWizardStep {
  title: string;
  description?: string;
  fields: PremiumFieldConfig[];
}

interface PremiumFormWizardProps {
  steps: PremiumFormWizardStep[];
  onComplete: (data: Record<string, string>) => Promise<void> | void;
  className?: string;
}

const PremiumFormWizard = ({
  steps,
  onComplete,
  className
}: PremiumFormWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [allValues, setAllValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];

  const handleStepSubmit = async (stepData: Record<string, string>) => {
    const newAllValues = { ...allValues, ...stepData };
    setAllValues(newAllValues);

    if (isLastStep) {
      setLoading(true);
      try {
        await onComplete(newAllValues);
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* Progress Indicator */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {currentStepData.title}
          </h2>
          <span className="text-sm text-slate-400">
            {currentStep + 1} de {steps.length}
          </span>
        </div>
        
        {currentStepData.description && (
          <p className="text-slate-400">
            {currentStepData.description}
          </p>
        )}
        
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Step Form */}
      <PremiumForm
        fields={currentStepData.fields}
        onSubmit={handleStepSubmit}
        submitText={isLastStep ? "Finalizar" : "Próximo"}
        loading={loading}
        initialValues={allValues}
      />

      {/* Navigation */}
      {currentStep > 0 && (
        <div className="pt-4">
          <PremiumButton
            variant="secondary"
            onClick={handleBack}
            disabled={loading}
          >
            Voltar
          </PremiumButton>
        </div>
      )}
    </div>
  );
};

export { PremiumForm, PremiumFieldGroup, PremiumFormWizard };