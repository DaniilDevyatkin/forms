import { useEffect, useState } from 'react';
import { ArrowRight, Check, Loader2, RotateCcw } from 'lucide-react';
import { api } from '../api.js';
import { Field, Link, Mark, navigate } from '../App.jsx';

const isFilled = (f, v) => (f.type === 'specialties' ? Array.isArray(v) && v.length > 0 : !!(v || '').trim());
const asText = (v) => (Array.isArray(v) ? v.join(', ') : v || '');

function validate(fields, data) {
  const errors = {};
  for (const f of fields) {
    if (f.required && !isFilled(f, data[f.key])) errors[f.key] = 'Это поле нужно заполнить';
  }
  return errors;
}

function Sent({ title, onReset }) {
  return (
    <div className="mx-auto grid w-full max-w-2xl animate-rise place-items-center px-6 py-24 text-center">
      <div className="relative">
        <span className="absolute inset-0 -z-10 rounded-full bg-ok/20 blur-2xl" aria-hidden="true" />
        <Mark state="check" size={64} />
      </div>
      <p className="mt-8 text-[17px] text-muted">{title}</p>
      <h1 className="mt-2 text-[clamp(2.25rem,4vw,3rem)] font-semibold">Ответ отправлен</h1>

      <button onClick={onReset} className="btn-outline mt-10">
        <RotateCcw className="h-4 w-4" aria-hidden="true" /> Заполнить ещё раз
      </button>
    </div>
  );
}

export default function FormPage() {
  const [form, setForm] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [data, setData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState(null);

  const fields = form?.fields || [];

  useEffect(() => {
    setLoadError(null);
    setForm(null);
    setSent(false);
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    api
      .forms()
      .then((list) => {
        const match = list.find((f) => f.path.toLowerCase() === path || f.slug.toLowerCase() === path);
        if (!match) throw new Error('Форма не найдена');
        return api.form(match.slug);
      })
      .then(setForm)
      .catch((e) => setLoadError(e.message));
  }, []);

  const filled = fields.filter((f) => isFilled(f, data[f.key])).length;
  const pct = fields.length ? Math.round((filled / fields.length) * 100) : 0;

  function onChange(key, value) {
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    const next = validate(fields, data);
    setErrors(next);
    setServerError(null);
    const keys = Object.keys(next).filter((k) => next[k]);
    if (keys.length) {
      document.getElementById(`f-${keys[0]}`)?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const payload = Object.fromEntries(fields.map((f) => [f.key, f.type === 'specialties' ? data[f.key] || [] : asText(data[f.key])]));
      await api.submit(form.slug, payload);
      setSent(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setData({});
    setErrors({});
    setSent(false);
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="panel p-10 text-center" role="alert">
          <p>{loadError}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button className="btn-outline" onClick={() => navigate('/')}>Все формы</button>
            <button className="btn-outline" onClick={() => window.location.reload()}>Повторить</button>
          </div>
        </div>
      </div>
    );
  }

  if (sent) return <Sent title={form.title} onReset={reset} />;

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 pb-20 pt-12 lg:px-10 lg:pt-16">
      <Link to="/" className="animate-rise inline-flex items-center gap-1.5 text-[15px] text-muted hover:text-ink">
        ← Все формы
      </Link>
      <h1 id="form-title" className="animate-rise mt-4 text-[clamp(2.25rem,4vw,3.5rem)] font-semibold">
        {form?.title || '\u00a0'}
      </h1>

      <div className="mt-10 grid items-start gap-10 xl:mt-14 xl:grid-cols-[minmax(0,1fr)_400px]">
        <section aria-labelledby="form-title" className="panel animate-rise p-6 sm:p-9 xl:p-10">
          <form onSubmit={onSubmit} noValidate aria-describedby={serverError ? 'form-error' : undefined}>
            {!form && !loadError && (
              <div className="grid gap-7 sm:grid-cols-2" aria-hidden="true">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={i > 3 ? 'sm:col-span-2' : ''}>
                    <div className="mb-3 h-4 w-40 animate-pulse rounded bg-veil" />
                    <div className="h-[52px] animate-pulse rounded-md bg-veil" />
                  </div>
                ))}
              </div>
            )}
            <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-6">
              {fields.map((f) => (
                <Field key={f.key} field={f} value={data[f.key] ?? ''} error={errors[f.key]} onChange={onChange} />
              ))}
            </div>

            {serverError && (
              <p id="form-error" role="alert" className="mt-8 rounded-md border border-danger/40 bg-danger/10 px-5 py-4 text-[16px] text-danger">
                {serverError}
              </p>
            )}

            {fields.length > 0 && (
              <div className="mt-10 flex flex-wrap items-center justify-between gap-5 border-t border-line pt-8">
                <p className="text-[16px] text-muted" aria-live="polite">
                  Заполнено {filled} из {fields.length}
                </p>
                <button type="submit" className="btn-primary min-w-[200px]" disabled={submitting}>
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <ArrowRight className="h-5 w-5" aria-hidden="true" />}
                  {submitting ? 'Отправляем…' : 'Отправить'}
                </button>
              </div>
            )}
          </form>
        </section>

        <aside aria-label="Готовность" className="animate-rise [animation-delay:80ms] xl:sticky xl:top-[104px] xl:self-start">
          <div className="panel overflow-hidden">
            <div className="px-6 pt-6">
              <div className="flex items-baseline justify-between">
                <span className="text-[17px] font-semibold">Готовность</span>
                <span className="mono text-[19px] font-medium">{pct}%</span>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-veil">
                <div
                  className="h-full rounded-full bg-ember transition-[width] duration-500 ease-out-quart"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <ol className="mt-6 divide-y divide-line">
              {fields.map((f, i) => {
                const done = isFilled(f, data[f.key]);
                return (
                  <li key={f.key} className="flex items-start gap-3.5 px-6 py-3.5">
                    <span
                      className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[13px] font-semibold transition-colors duration-200 ${
                        done ? 'border-ember bg-ember text-white' : 'border-line text-muted'
                      }`}
                      aria-hidden="true"
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    <span className={`text-[16px] leading-snug transition-colors duration-200 ${done ? 'text-ink' : 'text-muted'}`}>
                      {f.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
