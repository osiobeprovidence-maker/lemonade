export type AuthMethod = 'email' | 'google' | 'apple';

interface LastLoginMethodHintProps {
  method: AuthMethod | null;
}

const METHOD_LABEL: Record<AuthMethod, string> = {
  email: 'Email',
  google: 'Google',
  apple: 'Apple',
};

export function LastLoginMethodHint({ method }: LastLoginMethodHintProps) {
  if (!method) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-xs font-medium text-white/72">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
      Last used: {METHOD_LABEL[method]}
    </div>
  );
}
