import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { api } from '../api.js';
import { Link } from '../App.jsx';

export default function HomePage() {
  const [forms, setForms] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.forms().then(setForms).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 pb-20 pt-16 lg:px-10 lg:pt-24">
      {error && (
        <p role="alert" className="rounded-md border border-danger/40 bg-danger/10 px-5 py-4 text-[16px] text-danger">
          {error}
        </p>
      )}

      {!forms && !error && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
          {[0, 1].map((i) => (
            <div key={i} className="h-[128px] animate-pulse rounded-xl bg-veil" />
          ))}
        </div>
      )}

      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {(forms || []).map((f) => (
          <li key={f.slug}>
            <Link
              to={`/${f.path}`}
              className="group flex min-h-[128px] items-center justify-between gap-6 rounded-xl border border-line bg-surface px-8 py-7 text-left transition-colors duration-200 hover:border-line-strong hover:bg-raised focus-visible:border-ink"
            >
              <span className="text-[22px] font-semibold leading-tight tracking-[-0.02em]">{f.title}</span>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-bg text-muted transition-colors duration-200 group-hover:bg-ink group-hover:text-white">
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
