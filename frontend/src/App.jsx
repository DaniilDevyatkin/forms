import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import HomePage from './pages/HomePage.jsx';
import FormPage from './pages/FormPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

const MARK_PATHS = {
  mark: 'M10 9h12M10 16h8M10 23h12',
  check: 'M10 16.5l4 4 8-9',
};

const EASE = 'ease-out-quart';

// Real URLs: /, /pedsostav, /admin. nginx (or the FastAPI fallback) serves
// index.html for all of them, so no hash routing needed.
export function navigate(path) {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function usePath() {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => {
    const on = () => setPath(window.location.pathname);
    window.addEventListener('popstate', on);
    return () => window.removeEventListener('popstate', on);
  }, []);
  return path;
}

function Link({ to, className, children, ...rest }) {
  return (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

function Logo() {
  return (
    <Link to="/" className="inline-flex items-center gap-3 rounded-md px-1 py-1" aria-label="Все формы — на главную">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="var(--ember)" />
        <path d={MARK_PATHS.mark} stroke="var(--surface)" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
      <span className="text-[19px] font-semibold tracking-[-0.02em]">Формы</span>
    </Link>
  );
}

function Mark({ state = 'mark', size = 54 }) {
  return (
    <svg viewBox="0 0 32 32" style={{ width: size, height: size }} className="shrink-0" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--surface)" stroke="var(--line)" />
      <path
        key={state}
        d={MARK_PATHS[state]}
        fill="none"
        stroke={state === 'check' ? 'var(--ok)' : 'var(--ember)'}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Shell({ children }) {
  const isAdminArea = usePath().startsWith('/admin');
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-sticky border-b border-line bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between px-6 lg:px-10">
          <Logo />
          <Link
            to="/admin"
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[16px] font-medium transition-colors ${
              isAdminArea ? 'bg-ink text-white' : 'bg-bg text-ink hover:bg-raised'
            }`}
            aria-current={isAdminArea ? 'page' : undefined}
          >
            Админка <ChevronRight className="h-4 w-4 opacity-60" aria-hidden="true" />
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

function Field({ field, value, error, onChange }) {
  const id = `f-${field.key}`;
  const errId = `${id}-err`;
  const isSpecialties = field.type === 'specialties';
  const selected = isSpecialties ? (Array.isArray(value) ? value : []) : [];
  const describedBy = error ? errId : field.hint ? `${id}-hint` : undefined;

  const common = {
    required: true,
    id,
    name: field.key,
    onChange: (e) => onChange(field.key, e.target.value),
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': describedBy,
    className: 'field',
  };

  return (
    <div className={field.type === 'specialties' ? 'col-span-2 lg:col-span-6' : 'col-span-2 lg:col-span-3'}>
      <div className="mb-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <label htmlFor={id} className="label-text cursor-pointer">
          {field.label}
        </label>
        <span className="text-danger" aria-hidden="true">*</span>
        {field.hint && (
          <span id={`${id}-hint`} className="hint-text">
            — {field.hint}
          </span>
        )}
      </div>
      {isSpecialties ? (
        <div
          className="overflow-hidden rounded-md border border-line bg-surface"
          role="group"
          aria-labelledby={id}
          aria-describedby={error ? errId : undefined}
        >
          <div id={id} tabIndex={-1} aria-label={field.label} className="grid gap-x-4 p-3 sm:grid-cols-2 xl:grid-cols-3">
            {field.options.map((opt) => {
              const on = selected.includes(opt);
              return (
                <label
                  key={opt}
                  className={`flex cursor-pointer items-start gap-3 rounded-md px-3 py-2.5 text-[16px] leading-[1.4] transition-colors ${
                    on ? 'bg-raised text-ink' : 'text-ink hover:bg-raised'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => {
                      const next = on ? selected.filter((s) => s !== opt) : [...selected, opt];
                      onChange(field.key, next);
                    }}
                    className="mt-1 h-[18px] w-[18px] shrink-0 cursor-pointer accent-[var(--ember)]"
                  />
                  <span className="min-w-0">{opt}</span>
                </label>
              );
            })}
          </div>
          <div className="border-t border-line px-4 py-2.5 text-[15px] text-muted">
            Выбрано: {selected.length}
            {selected.length > 0 && <span className="text-ink"> — {selected.join(', ')}</span>}
          </div>
        </div>
      ) : field.type === 'textarea' || field.type === 'list' ? (
        <textarea
          {...common}
          value={value || ''}
          rows={field.type === 'list' ? 2 : 3}
          placeholder={field.placeholder}
          className="field resize-y"
        />
      ) : (
        <input {...common} value={value || ''} type={field.type} placeholder={field.placeholder} autoComplete={field.key === 'full_name' ? 'name' : 'off'} />
      )}
      {error && (
        <p id={errId} role="alert" className="animate-fade pt-2 text-[15px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function Router() {
  const path = usePath();
  if (path.startsWith('/admin')) return <AdminPage />;
  if (path !== '/') return <FormPage />;
  return <HomePage />;
}

export default function App() {
  return (
    <Shell>
      <Router />
    </Shell>
  );
}

export { Field, Mark, EASE, Link };
