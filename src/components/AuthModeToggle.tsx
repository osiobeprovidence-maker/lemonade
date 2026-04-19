interface AuthModeToggleProps {
  value: 'create' | 'login';
  onChange: (value: 'create' | 'login') => void;
}

export function AuthModeToggle({ value, onChange }: AuthModeToggleProps) {
  return (
    <div className="relative inline-grid grid-cols-2 rounded-full border border-white/12 bg-white/6 p-1">
      <div
        className={`absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-full bg-white transition-transform duration-250 ease-out ${
          value === 'login' ? 'translate-x-[calc(100%+0.25rem)]' : 'translate-x-0'
        }`}
      />
      <button
        type="button"
        onClick={() => onChange('create')}
        className={`relative z-10 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
          value === 'create' ? 'text-zinc-950' : 'text-white/72 hover:text-white'
        }`}
      >
        Create Account
      </button>
      <button
        type="button"
        onClick={() => onChange('login')}
        className={`relative z-10 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
          value === 'login' ? 'text-zinc-950' : 'text-white/72 hover:text-white'
        }`}
      >
        Log In
      </button>
    </div>
  );
}
