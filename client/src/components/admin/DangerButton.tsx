import { useEffect, useState } from "react";

interface Props {
  label: string;
  onConfirm: () => void;
  disabled?: boolean;
}

/** Two-click delete: first click arms, second (within 3s) confirms. */
export function DangerButton({ label, onConfirm, disabled }: Props) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);

  return (
    <button
      type="button"
      className={armed ? "danger armed" : "danger"}
      disabled={disabled}
      onClick={() => (armed ? onConfirm() : setArmed(true))}
    >
      {armed ? "confirm?" : label}
    </button>
  );
}
