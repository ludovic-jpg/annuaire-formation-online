import type { ReactNode } from "react";

/**
 * Champ de formulaire accessible : label relié, aide, erreur inline annoncée,
 * aria-invalid et aria-describedby posés automatiquement.
 */
export function FormField({
  id,
  label,
  optional,
  hint,
  error,
  children,
}: {
  id: string;
  label: ReactNode;
  optional?: boolean;
  hint?: ReactNode;
  error?: string | null;
  children: (a11y: { id: string; "aria-invalid"?: true; "aria-describedby"?: string }) => ReactNode;
}) {
  const hintId = hint ? `${id}-aide` : undefined;
  const errId = error ? `${id}-erreur` : undefined;
  const describedBy = [errId, hintId].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}{" "}
        {optional ? <span className="font-normal text-encre/70">(facultatif)</span> : null}
      </label>
      {children({ id, ...(error ? { "aria-invalid": true as const } : {}), "aria-describedby": describedBy })}
      {error && (
        <p id={errId} className="field-error">
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className="hint mt-1">
          {hint}
        </p>
      )}
    </div>
  );
}
