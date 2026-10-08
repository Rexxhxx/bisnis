import { useEffect, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";

function gen() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b };
}

export function Captcha({ onValidChange }) {
  const [{ a, b }, setQ] = useState(gen());
  const [value, setValue] = useState("");

  const refresh = useCallback(() => {
    setQ(gen());
    setValue("");
    onValidChange(false);
  }, [onValidChange]);

  useEffect(() => {
    const ok = value !== "" && Number(value) === a + b;
    onValidChange(ok);
  }, [value, a, b, onValidChange]);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">Verifikasi CAPTCHA</label>
      <div className="flex items-center gap-3">
        <div className="flex select-none items-center gap-1 rounded-lg border bg-secondary px-4 py-2 font-heading text-lg font-bold tracking-widest text-secondary-foreground">
          <span>{a}</span>
          <span>+</span>
          <span>{b}</span>
          <span>=</span>
        </div>
        <input
          type="number"
          data-testid="captcha-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="?"
          className="h-11 w-20 rounded-lg border border-input bg-background px-3 text-center text-base outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="button"
          data-testid="captcha-refresh-btn"
          onClick={refresh}
          className="rounded-lg border p-2.5 text-muted-foreground transition-colors hover:bg-accent"
          aria-label="Refresh captcha"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
