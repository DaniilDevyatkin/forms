import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Download, Inbox, Loader2, LogOut, Search } from 'lucide-react';
import { api } from '../api.js';

function fmtDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  return sameDay ? `Сегодня, ${time}` : `${d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}, ${time}`;
}

function Login({ onDone }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.login(username, password);
      onDone();
    } catch (err) {
      setError(err.message);
      setPassword('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-md place-items-center px-6 py-28 animate-rise">
      <form onSubmit={onSubmit} className="w-full" aria-labelledby="login-title">
        <h1 id="login-title" className="text-[2.25rem] font-semibold">Вход в админку</h1>
        <p className="mt-3 text-[17px] leading-relaxed text-muted">Доступ только для администратора.</p>

        <div className="mt-10 space-y-6">
          <div>
            <label htmlFor="login-user" className="label-text mb-2.5 block">Логин</label>
            <input
              id="login-user"
              className="field"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="login-pass" className="label-text mb-2.5 block">Пароль</label>
            <input
              id="login-pass"
              className="field"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-describedby={error ? 'login-error' : undefined}
              aria-invalid={error ? 'true' : undefined}
            />
          </div>
          {error && (
            <p id="login-error" role="alert" className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-[16px] text-danger">
              {error}
            </p>
          )}
          <button className="btn-primary w-full" disabled={busy}>
            {busy && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
            {busy ? 'Проверяем…' : 'Войти'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Entry({ row, selected, onSelect }) {
  const name = row.payload.full_name || 'Без имени';
  const initial = name.trim().charAt(0).toUpperCase();
  const sub = [row.payload.position, row.payload.education_level].filter(Boolean).join(' · ');
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? 'true' : undefined}
      className={`group flex w-full items-center gap-4 rounded-lg border px-4 py-3.5 text-left transition-colors duration-150 ${
        selected ? 'border-ember/30 bg-ember/[0.05]' : 'border-transparent hover:bg-bg'
      }`}
    >
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border text-[17px] font-semibold ${
          selected ? 'border-ember bg-ember text-white' : 'border-line bg-surface text-muted'
        }`}
        aria-hidden="true"
      >
        {initial || '?'}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[17px] font-semibold">{name}</span>
        <span className="mt-0.5 block truncate text-[15px] text-muted">{sub || '—'}</span>
      </span>
      <time dateTime={row.created_at} className="mono shrink-0 text-[14px] text-muted">
        {fmtDate(row.created_at)}
      </time>
    </button>
  );
}

function Detail({ row }) {
  const entries = Object.entries(row.payload);
  const labels = Object.fromEntries(row.fields.map((f) => [f.key, f.label]));
  return (
    <article key={row.id}>
      <header className="border-b border-line px-6 py-6 sm:px-9">
        <h2 className="text-[1.75rem] font-semibold leading-tight">{row.payload.full_name || 'Без имени'}</h2>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-muted">
          <span className="mono font-medium text-ember">{row.id}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={row.created_at}>{fmtDate(row.created_at)}</time>
          {row.ip && (
            <>
              <span aria-hidden="true">·</span>
              <span className="mono">{row.ip}</span>
            </>
          )}
        </div>
      </header>
      <dl>
        {entries.map(([key, raw], i) => {
          const value = Array.isArray(raw) ? raw.join(', ') : raw;
          return (
            <div
              key={key}
              className={`grid gap-1 px-6 py-5 sm:grid-cols-[260px_minmax(0,1fr)] sm:gap-8 sm:px-9 ${i ? 'border-t border-line/70' : ''}`}
            >
              <dt className="text-[16px] text-muted">{labels[key] || key}</dt>
              <dd className={`text-[17px] leading-relaxed ${value ? 'whitespace-pre-wrap break-words' : 'text-muted'}`}>
                {value || 'Не заполнено'}
              </dd>
            </div>
          );
        })}
      </dl>
    </article>
  );
}

export default function AdminPage() {
  const [state, setState] = useState('checking');
  const [rows, setRows] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState('');
  const [showList, setShowList] = useState(true);

  async function load() {
    const data = await api.submissions();
    setRows(data);
    setSelectedId((cur) => cur ?? data[0]?.id ?? null);
  }

  useEffect(() => {
    api
      .me()
      .then(load)
      .then(() => setState('ready'))
      .catch((e) => setState(e.status === 401 ? 'login' : 'error'));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      `${r.id} ${Object.values(r.payload)
        .map((v) => (Array.isArray(v) ? v.join(' ') : v))
        .join(' ')}`.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const selected = rows.find((r) => r.id === selectedId) || null;

  async function logout() {
    await api.logout().catch(() => {});
    setState('login');
    setRows([]);
  }

  if (state === 'checking') {
    return (
      <div className="grid place-items-center py-32 text-muted">
        <Loader2 className="h-6 w-6 animate-spin" aria-label="Загрузка" />
      </div>
    );
  }
  if (state === 'login') return <Login onDone={async () => { setState('checking'); await load(); setState('ready'); }} />;
  if (state === 'error') {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center" role="alert">
        <p>Не удалось получить ответы.</p>
        <button className="btn-outline mt-6" onClick={() => window.location.reload()}>Повторить</button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 pb-20 pt-12 lg:px-10 lg:pt-16">
      <div className="flex flex-wrap items-end justify-between gap-5 pb-8">
        <div>
          <h1 className="text-[clamp(2.25rem,4vw,3.5rem)] font-semibold">Ответы</h1>
          <p className="mt-2 text-[17px] text-muted" aria-live="polite">
            {rows.length === 0 ? 'Пока никто не отправил форму' : `Всего ${rows.length}`}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <a href="/api/admin/submissions.csv" className="btn-outline" download>
            <Download className="h-5 w-5" aria-hidden="true" /> CSV
          </a>
          <button className="btn-ghost" onClick={logout}>
            <LogOut className="h-5 w-5" aria-hidden="true" /> Выйти
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="panel grid place-items-center px-6 py-28 text-center animate-fade">
          <Inbox className="h-10 w-10 text-muted" aria-hidden="true" />
          <p className="mt-5 text-[19px] font-semibold">Ответов ещё нет</p>
          <p className="mt-2 max-w-sm text-[16px] leading-relaxed text-muted">
            Как только кто-то отправит форму, запись появится здесь со всеми пунктами.
          </p>
          <a href="/" className="btn-outline mt-8">Открыть формы</a>
        </div>
      ) : (
        <div className="grid gap-8 xl:grid-cols-[400px_minmax(0,1fr)]">
          <section aria-label="Список ответов" className={showList ? '' : 'hidden xl:block'}>
            <div className="panel overflow-hidden">
              <div className="relative border-b border-line">
                <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Поиск по ответам"
                  aria-label="Поиск по ответам"
                  className="h-14 w-full bg-transparent pl-12 pr-4 text-[17px] text-ink placeholder:opacity-55 focus:outline-none"
                />
              </div>
              <div className="max-h-[calc(100dvh-300px)] overflow-y-auto p-2">
                {filtered.length === 0 ? (
                  <p className="px-3 py-10 text-center text-[16px] text-muted">Ничего не найдено</p>
                ) : (
                  filtered.map((r) => (
                    <Entry
                      key={r.id}
                      row={r}
                      selected={r.id === selectedId}
                      onSelect={() => { setSelectedId(r.id); setShowList(false); }}
                    />
                  ))
                )}
              </div>
            </div>
          </section>

          <section className={`panel self-start overflow-hidden ${showList ? 'hidden xl:block' : ''}`} aria-label="Детали ответа">
            {selected ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowList(true)}
                  className="flex w-full items-center gap-2 border-b border-line px-5 py-3.5 text-[16px] text-muted hover:text-ink xl:hidden"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> К списку
                </button>
                <Detail row={selected} />
              </>
            ) : (
              <p className="px-8 py-20 text-center text-[16px] text-muted">Выберите ответ слева</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
