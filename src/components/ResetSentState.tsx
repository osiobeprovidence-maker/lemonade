import { CheckCircle2 } from 'lucide-react';

interface ResetSentStateProps {
  onBackToLogin: () => void;
}

export function ResetSentState({ onBackToLogin }: ResetSentStateProps) {
  return (
    <div className="space-y-5 text-white">
      <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/16 text-primary">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold text-white">Reset instructions sent</p>
            <p className="mt-2 text-sm leading-6 text-white/68">
              If that email is connected to an account, reset instructions are on the way.
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onBackToLogin}
        className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_18px_45px_rgba(0,0,0,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/92"
      >
        Return to log in
      </button>
    </div>
  );
}
