import { useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { toast } from 'react-toastify'

const tone = (pct) => (pct >= 75 ? 'good' : pct >= 55 ? 'warn' : 'bad')
const TONE = {
  good: { text: 'text-good', bg: 'bg-good', soft: 'bg-good/10', hex: '#34d399', label: 'Strong' },
  warn: { text: 'text-warn', bg: 'bg-warn', soft: 'bg-warn/10', hex: '#fbbf24', label: 'Needs polish' },
  bad: { text: 'text-bad', bg: 'bg-bad', soft: 'bg-bad/10', hex: '#fb7185', label: 'Needs work' },
}
const SEVERITY = {
  high: 'bg-bad/15 text-bad ring-bad/30',
  medium: 'bg-warn/15 text-warn ring-warn/30',
  low: 'bg-white/10 text-muted ring-white/15',
}

const arr = (v) => (Array.isArray(v) ? v : [])

function useCountUp(target, duration = 1400) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let raf
    const start = performance.now()
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration)
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))))
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

const ScoreRing = ({ score, size = 168, stroke = 12, label = 'Overall' }) => {
  const [drawn, setDrawn] = useState(false)
  const value = useCountUp(score)
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const t = TONE[tone(score)]
  useEffect(() => { const id = requestAnimationFrame(() => setDrawn(true)); return () => cancelAnimationFrame(id) }, [])

  return (
    <div className='relative shrink-0' style={{ width: size, height: size }}>
      <div className='absolute inset-3 rounded-full blur-2xl' style={{ background: t.hex, opacity: 0.18 }} />
      <svg width={size} height={size} className='relative -rotate-90'>
        <defs>
          <linearGradient id={`ring-${label}`} x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor={t.hex} />
            <stop offset='100%' stopColor='#9b8cff' />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill='none' stroke='rgb(255 255 255 / 0.07)' strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill='none'
          stroke={`url(#ring-${label})`} strokeWidth={stroke} strokeLinecap='round'
          strokeDasharray={c}
          strokeDashoffset={drawn ? c * (1 - score / 100) : c}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.2,.8,.2,1)' }}
        />
      </svg>
      <div className='absolute inset-0 grid place-items-center text-center'>
        <div>
          <div className='font-mono text-5xl font-semibold tracking-tighter' style={{ fontSize: size * 0.28 }}>{value}</div>
          <div className='text-xs uppercase tracking-[0.18em] text-muted'>{label}</div>
        </div>
      </div>
    </div>
  )
}

const Section = ({ icon, title, children, delay = 0, className = '' }) => (
  <section className={`glass reveal rounded-3xl p-6 md:p-7 ${className}`} style={{ '--d': `${delay}ms` }}>
    <h3 className='mb-5 flex items-center gap-2.5 text-lg font-semibold tracking-tight'>
      <span className='grid h-8 w-8 place-items-center rounded-lg bg-white/[0.06] text-accent'><i className={icon} /></span>
      {title}
    </h3>
    {children}
  </section>
)

const Bar = ({ pct, delay = 200 }) => (
  <div className='h-2 overflow-hidden rounded-full bg-white/[0.06]'>
    <div className={`bar-fill h-full rounded-full ${TONE[tone(pct)].bg}`} style={{ width: `${pct}%`, '--d': `${delay}ms` }} />
  </div>
)

const formatMoney = (amount, currency) => {
  try {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : undefined, {
      style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1,
    }).format(amount)
  } catch {
    return `${currency || ''} ${Number(amount).toLocaleString()}`
  }
}

// Plain-text version of the report for copy / download
const toMarkdown = (a) => {
  const lines = [
    `# Resume Review${a.candidate?.name ? `: ${a.candidate.name}` : ''}`,
    `**Overall score:** ${a.overall_score}/100  ·  **ATS:** ${a.ats?.score ?? '-'}/100`,
    '', a.verdict, '', '## Category scores',
    ...arr(a.category_scores).map((c) => `- **${c.category}**: ${c.score}/10 · ${c.comment}`),
    '', '## Strengths', ...arr(a.strengths).map((s) => `- **${s.title}**: ${s.detail}`),
    '', '## Weaknesses', ...arr(a.weaknesses).map((w) => `- **${w.title}** (${w.severity}): ${w.detail}`),
    '', '## Improvements',
    ...arr(a.improvements).flatMap((imp, i) => [
      `${i + 1}. **${imp.title}**: ${imp.action}`,
      ...(imp.before ? [`   - Before: ${imp.before}`] : []),
      ...(imp.after ? [`   - After: ${imp.after}`] : []),
    ]),
    '', '## Missing keywords', arr(a.ats?.missing_keywords).join(', ') || 'None',
    '', '## Best-fit roles', ...arr(a.best_fit_roles).map((r) => `- ${r.role} (${r.match}%): ${r.reason}`),
  ]
  if (a.salary?.min) lines.push('', '## Expected salary', `${formatMoney(a.salary.min, a.salary.currency)} – ${formatMoney(a.salary.max, a.salary.currency)} / year (${a.salary.region})`)
  return lines.join('\n')
}

const StructuredReport = ({ a, onReset }) => {
  const cats = arr(a.category_scores)
  const atsScore = a.ats?.score ?? null
  const topRole = arr(a.best_fit_roles)[0]
  const overallTone = TONE[tone(a.overall_score)]

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toMarkdown(a))
      toast.success('Report copied to clipboard')
    } catch {
      toast.error('Could not copy. Try the download button')
    }
  }
  const download = () => {
    const url = URL.createObjectURL(new Blob([toMarkdown(a)], { type: 'text/markdown' }))
    const link = Object.assign(document.createElement('a'), { href: url, download: 'resume-review.md' })
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className='space-y-5'>
      {/* Hero summary */}
      <section className='glass edge reveal overflow-hidden rounded-[2rem] p-6 md:p-9'>
        <div className='flex flex-col gap-8 md:flex-row md:items-center'>
          <ScoreRing score={a.overall_score} />
          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${overallTone.soft} ${overallTone.text}`}>{overallTone.label}</span>
              {a.candidate?.experience_level && <span className='rounded-full bg-white/[0.06] px-3 py-1 text-xs text-muted'>{a.candidate.experience_level} level</span>}
              {a.candidate?.inferred_target_role && <span className='rounded-full bg-accent/10 px-3 py-1 text-xs text-accent'><i className='ri-focus-3-line' /> {a.candidate.inferred_target_role}</span>}
            </div>
            <h2 className='mt-4 text-2xl font-semibold tracking-tight md:text-3xl'>
              {a.candidate?.name || 'Your resume'}
            </h2>
            {a.candidate?.headline && <p className='mt-1 text-muted'>{a.candidate.headline}</p>}
            <p className='mt-5 border-l-2 border-accent/60 pl-4 font-serif text-xl leading-relaxed text-fg/90 italic'>
              {a.verdict}
            </p>
          </div>
        </div>

        <div className='mt-8 grid grid-cols-2 gap-3 md:grid-cols-4'>
          {[
            { k: 'ATS score', v: atsScore != null ? `${atsScore}` : '–', unit: '/100', icon: 'ri-robot-2-line' },
            { k: 'Experience', v: a.candidate?.years_experience != null ? `${a.candidate.years_experience}` : '–', unit: ' yrs', icon: 'ri-briefcase-4-line' },
            { k: 'Best match', v: topRole ? `${topRole.match}` : '–', unit: '%', icon: 'ri-crosshair-2-line', sub: topRole?.role },
            { k: 'Red flags', v: `${arr(a.red_flags).length}`, unit: '', icon: 'ri-flag-2-line' },
          ].map((s, i) => (
            <div key={s.k} className='reveal rounded-2xl border border-line bg-white/[0.02] p-4' style={{ '--d': `${300 + i * 80}ms` }}>
              <p className='flex items-center gap-1.5 text-xs text-muted'><i className={s.icon} /> {s.k}</p>
              <p className='mt-1.5 font-mono text-2xl font-semibold'>{s.v}<span className='text-sm text-subtle'>{s.unit}</span></p>
              {s.sub && <p className='mt-0.5 truncate text-xs text-muted'>{s.sub}</p>}
            </div>
          ))}
        </div>

        <div className='mt-6 flex flex-wrap gap-2'>
          <button onClick={copy} className='btn-ghost text-sm'><i className='ri-file-copy-line' /> Copy report</button>
          <button onClick={download} className='btn-ghost text-sm'><i className='ri-download-2-line' /> Download .md</button>
          <button onClick={onReset} className='btn-ghost ml-auto text-sm'><i className='ri-refresh-line' /> Analyze another</button>
        </div>
      </section>

      {/* Category breakdown */}
      {cats.length > 0 && (
        <Section icon='ri-bar-chart-grouped-line' title='Score breakdown' delay={150}>
          <div className='grid gap-x-10 gap-y-6 md:grid-cols-2'>
            {cats.map((c, i) => (
              <div key={c.category}>
                <div className='mb-2 flex items-baseline justify-between gap-3'>
                  <span className='font-medium'>{c.category}</span>
                  <span className={`font-mono text-sm ${TONE[tone(c.score * 10)].text}`}>{c.score}<span className='text-subtle'>/10</span></span>
                </div>
                <Bar pct={c.score * 10} delay={300 + i * 90} />
                <p className='mt-2 text-sm leading-relaxed text-muted'>{c.comment}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Strengths & weaknesses */}
      <div className='grid gap-5 lg:grid-cols-2'>
        <Section icon='ri-thumb-up-line' title='What works' delay={250}>
          <ul className='space-y-4'>
            {arr(a.strengths).map((s) => (
              <li key={s.title} className='flex gap-3'>
                <i className='ri-checkbox-circle-fill mt-0.5 text-lg text-good' />
                <div className='min-w-0'>
                  <p className='font-medium'>{s.title}</p>
                  <p className='mt-1 text-sm leading-relaxed text-muted'>{s.detail}</p>
                  {s.evidence && (
                    <p className='mt-2 rounded-lg border-l-2 border-good/50 bg-good/[0.06] px-3 py-1.5 font-mono text-xs leading-relaxed text-good/90'>
                      “{s.evidence}”
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Section>
        <Section icon='ri-alert-line' title='What holds it back' delay={320}>
          <ul className='space-y-4'>
            {arr(a.weaknesses).map((w) => (
              <li key={w.title} className='flex gap-3'>
                <i className='ri-error-warning-fill mt-0.5 text-lg text-bad' />
                <div className='min-w-0'>
                  <p className='flex flex-wrap items-center gap-2 font-medium'>
                    {w.title}
                    {w.severity && <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${SEVERITY[w.severity] || SEVERITY.low}`}>{w.severity}</span>}
                  </p>
                  <p className='mt-1 text-sm leading-relaxed text-muted'>{w.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* Improvements with rewrites */}
      {arr(a.improvements).length > 0 && (
        <Section icon='ri-magic-line' title='Highest-impact fixes' delay={380}>
          <ol className='space-y-5'>
            {arr(a.improvements).map((imp, i) => (
              <li key={imp.title} className='flex gap-4'>
                <span className='grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent/30 to-accent-2/20 font-mono text-sm text-fg ring-1 ring-white/10'>{i + 1}</span>
                <div className='min-w-0 flex-1'>
                  <p className='font-medium'>{imp.title}</p>
                  <p className='mt-1 text-sm leading-relaxed text-muted'>{imp.action}</p>
                  {(imp.before || imp.after) && (
                    <div className='mt-3 grid gap-2 md:grid-cols-2'>
                      {imp.before && (
                        <div className='rounded-xl border border-bad/20 bg-bad/[0.05] p-3'>
                          <p className='mb-1 text-[10px] font-semibold uppercase tracking-widest text-bad'>Before</p>
                          <p className='text-sm text-fg/70 line-through decoration-bad/40'>{imp.before}</p>
                        </div>
                      )}
                      {imp.after && (
                        <div className='rounded-xl border border-good/25 bg-good/[0.06] p-3'>
                          <p className='mb-1 text-[10px] font-semibold uppercase tracking-widest text-good'>After</p>
                          <p className='text-sm text-fg'>{imp.after}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* ATS + roles */}
      <div className='grid gap-5 lg:grid-cols-[1.2fr_1fr]'>
        {a.ats && (
          <Section icon='ri-robot-2-line' title='ATS keyword check' delay={440}>
            <div className='flex items-center gap-5'>
              <ScoreRing score={a.ats.score ?? 0} size={92} stroke={8} label='ATS' />
              <p className='text-sm leading-relaxed text-muted'>{a.ats.notes}</p>
            </div>
            {arr(a.ats.missing_keywords).length > 0 && (
              <>
                <p className='mt-6 mb-2.5 text-xs font-semibold uppercase tracking-widest text-bad'>Missing · add these</p>
                <div className='flex flex-wrap gap-2'>
                  {a.ats.missing_keywords.map((k) => (
                    <span key={k} className='rounded-full border border-dashed border-bad/40 px-3 py-1 text-sm text-bad/90'>+ {k}</span>
                  ))}
                </div>
              </>
            )}
            {arr(a.ats.matched_keywords).length > 0 && (
              <>
                <p className='mt-5 mb-2.5 text-xs font-semibold uppercase tracking-widest text-good'>Found</p>
                <div className='flex flex-wrap gap-2'>
                  {a.ats.matched_keywords.map((k) => (
                    <span key={k} className='rounded-full bg-good/10 px-3 py-1 text-sm text-good'>{k}</span>
                  ))}
                </div>
              </>
            )}
          </Section>
        )}

        <div className='space-y-5'>
          {arr(a.best_fit_roles).length > 0 && (
            <Section icon='ri-compass-3-line' title='Best-fit roles' delay={500}>
              <div className='space-y-4'>
                {a.best_fit_roles.map((r, i) => (
                  <div key={r.role}>
                    <div className='mb-1.5 flex justify-between gap-3'>
                      <span className='font-medium'>{r.role}</span>
                      <span className='font-mono text-sm text-muted'>{r.match}%</span>
                    </div>
                    <Bar pct={r.match} delay={600 + i * 100} />
                    <p className='mt-1.5 text-xs leading-relaxed text-muted'>{r.reason}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {a.salary?.min > 0 && (
            <section className='glass edge reveal rounded-3xl p-6' style={{ '--d': '560ms' }}>
              <p className='flex items-center gap-2 text-sm text-muted'><i className='ri-money-dollar-circle-line text-accent-2' /> Expected salary · {a.salary.region}</p>
              <p className='mt-2 font-mono text-3xl font-semibold tracking-tight'>
                {formatMoney(a.salary.min, a.salary.currency)}
                <span className='mx-2 text-subtle'>–</span>
                {formatMoney(a.salary.max, a.salary.currency)}
                <span className='ml-1 text-sm font-normal text-subtle'>/yr</span>
              </p>
              <p className='mt-3 text-sm leading-relaxed text-muted'>{a.salary.rationale}</p>
            </section>
          )}
        </div>
      </div>

      {/* Red flags + interview prep */}
      <div className='grid gap-5 lg:grid-cols-2'>
        <Section icon='ri-flag-2-line' title='Red flags' delay={600}>
          {arr(a.red_flags).length ? (
            <ul className='space-y-2.5'>
              {a.red_flags.map((f) => (
                <li key={f} className='flex gap-2.5 text-sm leading-relaxed text-muted'><i className='ri-flag-fill text-bad' /> {f}</li>
              ))}
            </ul>
          ) : (
            <p className='flex items-center gap-2 text-sm text-good'><i className='ri-shield-check-line' /> No red flags spotted.</p>
          )}
        </Section>
        {arr(a.interview_questions).length > 0 && (
          <Section icon='ri-question-answer-line' title='Prepare for these questions' delay={660}>
            <ul className='space-y-3'>
              {a.interview_questions.map((q, i) => (
                <li key={q} className='flex gap-3 text-sm leading-relaxed'>
                  <span className='font-mono text-accent'>Q{i + 1}</span>
                  <span className='text-fg/85'>{q}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  )
}

const ResumeReviewPreview = ({ result, onReset }) => {
  if (!result) return null
  if (result.format === 'structured') return <StructuredReport a={result.content} onReset={onReset} />

  // Fallback when the model returned prose instead of JSON
  return (
    <section className='glass reveal rounded-3xl p-6 md:p-9'>
      <div className='prose-report'>
        <Markdown remarkPlugins={[remarkGfm]}>{result.content}</Markdown>
      </div>
      <button onClick={onReset} className='btn-ghost mt-6 text-sm'><i className='ri-refresh-line' /> Analyze another</button>
    </section>
  )
}

export default ResumeReviewPreview
