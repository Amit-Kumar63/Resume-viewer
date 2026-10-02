import { useEffect, useState } from 'react'

// Rough timeline of the backend pipeline (no real progress events, so stages advance on a timer)
const STAGES = [
  { label: 'Uploading resume', icon: 'ri-upload-2-line', at: 0 },
  { label: 'Reading every page', icon: 'ri-scan-2-line', at: 2 },
  { label: 'Mapping skills & experience', icon: 'ri-node-tree', at: 7 },
  { label: 'Scoring against recruiter rubric', icon: 'ri-bar-chart-box-line', at: 13 },
  { label: 'Writing your personalised feedback', icon: 'ri-quill-pen-line', at: 19 },
]

const TIPS = [
  'Recruiters spend about 7 seconds on a first pass. Your top third matters most.',
  'Bullets that start with a strong verb and end with a number get noticed.',
  'Mirror keywords from the job description so ATS filters let you through.',
  'One page per ~10 years of experience is a good rule of thumb.',
  'Cut "Responsible for". Say what changed because you were there.',
]

const CHIPS = [
  { text: 'impact', x: '-150px', y: '-60px', d: '0s' },
  { text: 'React', x: '140px', y: '-90px', d: '.65s' },
  { text: 'ATS ✓', x: '-160px', y: '50px', d: '1.3s' },
  { text: 'metrics', x: '150px', y: '40px', d: '1.95s' },
  { text: 'leadership', x: '-120px', y: '120px', d: '2.6s' },
  { text: 'keywords', x: '130px', y: '120px', d: '3.25s' },
]

const LINES = [62, 88, 74, 0, 92, 80, 86, 0, 70, 90, 58, 84, 0, 76, 66]

const AnalyzingLoader = () => {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const stage = STAGES.reduce((current, s, i) => (elapsed >= s.at ? i : current), 0)
  // Ease toward 95% so the bar never claims to be finished before the server is
  const progress = Math.min(95, Math.round(100 * (1 - Math.exp(-elapsed / 14))))
  const tip = TIPS[Math.floor(elapsed / 6) % TIPS.length]

  return (
    <div className='reveal grid items-center gap-12 py-6 md:grid-cols-[1fr_1.1fr]' role='status' aria-live='polite'>
      {/* Scanning document */}
      <div className='relative mx-auto grid h-[300px] w-full max-w-sm place-items-center md:h-[340px]'>
        <div className='absolute h-64 w-64 rounded-full bg-accent/20 blur-3xl' />
        <div className='relative'>
          <div className='orbit' />
          <div className='scan-doc'>
            <div className='flex items-center gap-2.5 px-5 pt-5'>
              <span className='h-9 w-9 rounded-full bg-white/10' />
              <div className='flex-1 space-y-1.5'>
                <div className='h-2 w-3/4 rounded-full bg-white/20' />
                <div className='h-1.5 w-1/2 rounded-full bg-white/10' />
              </div>
            </div>
            <div className='mt-4 space-y-2.5 px-5'>
              {LINES.map((w, i) => w === 0
                ? <div key={i} className='h-1' />
                : <div key={i} className='scan-line' style={{ width: `${w}%`, '--d': `${(i / LINES.length) * 2.6 - 0.2}s` }} />
              )}
            </div>
            <div className='scan-beam' />
          </div>
          {CHIPS.map((c) => (
            <span key={c.text} className='scan-chip left-1/2 top-1/2 -translate-x-1/2' style={{ '--x': c.x, '--y': c.y, '--d': c.d }}>
              {c.text}
            </span>
          ))}
        </div>
      </div>

      {/* Stage tracker */}
      <div>
        <p className='font-mono text-xs uppercase tracking-[0.2em] text-accent-2'>Analyzing · {elapsed}s</p>
        <h2 className='mt-2 text-3xl font-semibold tracking-tight md:text-4xl'>
          Reading your resume <span className='font-serif font-normal italic text-muted'>like a recruiter would</span>
        </h2>

        <div className='mt-6 h-1.5 overflow-hidden rounded-full bg-white/[0.06]'>
          <div className='progress-sheen h-full rounded-full transition-[width] duration-1000 ease-out' style={{ width: `${progress}%` }} />
        </div>

        <ol className='mt-6 space-y-1'>
          {STAGES.map((s, i) => {
            const done = i < stage
            const active = i === stage
            return (
              <li key={s.label} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-500 ${active ? 'bg-white/[0.05]' : ''}`}>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm transition-all duration-500 ${
                  done ? 'bg-good/15 text-good' : active ? 'pulse-ring bg-accent-2/15 text-accent-2' : 'bg-white/[0.04] text-subtle'
                }`}>
                  <i className={done ? 'ri-check-line' : s.icon} />
                </span>
                <span className={`text-sm transition-colors duration-500 ${done ? 'text-muted line-through decoration-white/20' : active ? 'text-fg' : 'text-subtle'}`}>
                  {s.label}
                </span>
                {active && <span className='dots-loader ml-auto text-accent-2'><span /><span /><span /></span>}
              </li>
            )
          })}
        </ol>

        <p key={tip} className='reveal mt-6 flex gap-2.5 rounded-xl border border-line bg-white/[0.02] p-3.5 text-sm text-muted'>
          <i className='ri-lightbulb-flash-line text-warn' />
          <span>{tip}</span>
        </p>
      </div>
    </div>
  )
}

export default AnalyzingLoader
