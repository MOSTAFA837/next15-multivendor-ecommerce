import { FormLabel } from "@/components/ui/form";
import { Dot } from "lucide-react";
import { ReactNode } from "react";

export default function InputFieldset({
  label,
  description,
  children,
  icon,
}: {
  label: string;
  description?: string;
  children: ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={`bg-form rounded-xl border border-form-border shadow-sm transition-all duration-200 hover:shadow-md`}
    >
      <div className="p-6 border-b border-form-border bg-gradient-to-r from-form-accent to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">{label}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
