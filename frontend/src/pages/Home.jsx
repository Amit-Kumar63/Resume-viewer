import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Upload from '../components/Upload'
import ResumeReviewPreview from '../components/ResumeReviewPreview'
import AnalyzingLoader from '../components/AnalyzingLoader'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  { icon: 'ri-speed-up-line', title: 'Recruiter rubric', text: 'Scored across 6 categories hiring managers actually use.' },
  { icon: 'ri-robot-2-line', title: 'ATS keyword scan', text: 'See which keywords pass the filters and which are missing.' },
  { icon: 'ri-quill-pen-line', title: 'Line-by-line rewrites', text: 'Before → after bullets that keep your real experience.' },
]

const UsageMeter = ({ usage, user }) => {
  if (!usage) return <div className='skeleton h-5 w-56 rounded-full' />
  const pct = usage.limit ? (usage.remaining / usage.limit) * 100 : 0
  return (
    <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted'>
      <span className='flex items-center gap-2'>
        <span className='relative h-1.5 w-16 overflow-hidden rounded-full bg-white/10'>
          <span className={`absolute inset-y-0 left-0 rounded-full ${pct > 0 ? 'bg-accent-2' : 'bg-bad'}`} style={{ width: `${pct}%` }} />
        </span>
        <span><span className='font-mono text-fg'>{usage.remaining}</span> of {usage.limit} free {usage.limit === 1 ? 'review' : 'reviews'} left today</span>
      </span>
      {!user && <Link to='/signup' className='text-accent hover:underline'>Sign up for more free reviews →</Link>}
    </div>
  )
}

const Home = () => {
  const { user, ready } = useAuth()
  const [file, setFile] = useState(null)
  const [targetRole, setTargetRole] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [showTargeting, setShowTargeting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [usage, setUsage] = useState(null)
  const topRef = useRef(null)

  const refreshUsage = useCallback(async () => {
    const { ok, data } = await api('/usage')
    if (ok) setUsage(data.usage)
  }, [])

  // Re-fetch when auth state settles or changes (guest vs user quotas differ)
  useEffect(() => { if (ready) refreshUsage() }, [ready, user, refreshUsage])

  const onFile = (selected, error) => {
    if (error) toast.error(error)
    setFile(selected)
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (!file || isLoading) return

    const formData = new FormData()
    formData.append('targetRole', targetRole)
    formData.append('jobDescription', jobDescription)
    formData.append('file', file)

    setIsLoading(true)
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
    const { ok, status, data } = await api('/get-response', { method: 'POST', body: formData })
    setIsLoading(false)

    if (data.usage) setUsage(data.usage)
    if (ok) {
      setResult(data.data)
      toast.success('Your review is ready')
    } else if (data.code === 'QUOTA_EXCEEDED') {
      toast.error(data.message)
    } else {
      toast.error(data.message || `Something went wrong (${status})`)
      refreshUsage()
    }
  }

  const reset = () => {
    setResult(null)
    setFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const outOfQuota = usage && usage.remaining === 0

  return (
    <main ref={topRef} className='mx-auto max-w-6xl scroll-mt-24 px-4 pb-24 pt-10 md:pt-16'>
      {isLoading ? (
        <AnalyzingLoader />
      ) : result ? (
        <ResumeReviewPreview result={result} onReset={reset} />
      ) : (
        <div className='grid items-start gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-x-16'>
          {/* Hero copy (mobile order: copy → form → features) */}
          <div className='lg:col-start-1 lg:row-start-1 lg:pt-8'>
            <span className='reveal inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-xs text-muted'>
              <span className='h-1.5 w-1.5 rounded-full bg-accent-2 shadow-[0_0_8px_#5eead4]' />
              AI review in under 30 seconds
            </span>
            <h1 className='reveal mt-6 text-5xl font-semibold leading-[1.02] tracking-tight md:text-6xl' style={{ '--d': '80ms' }}>
              The resume feedback <span className='font-serif font-normal italic text-gradient'>recruiters</span> won't tell you.
            </h1>
            <p className='reveal mt-6 max-w-lg text-lg leading-relaxed text-muted' style={{ '--d': '160ms' }}>
              Upload your resume and get an honest score, ATS keyword gaps, rewritten bullets and a salary estimate,
              grounded in what's actually on your page.
            </p>
          </div>

          <div className='grid gap-3 max-lg:order-2 sm:grid-cols-3 lg:col-start-1 lg:row-start-2 lg:grid-cols-1 xl:grid-cols-3'>
            {FEATURES.map((f, i) => (
              <div key={f.title} className='reveal rounded-2xl border border-line bg-white/[0.02] p-4' style={{ '--d': `${240 + i * 80}ms` }}>
                <i className={`${f.icon} text-xl text-accent`} />
                <p className='mt-2 font-medium'>{f.title}</p>
                <p className='mt-1 text-sm leading-relaxed text-muted'>{f.text}</p>
              </div>
            ))}
          </div>

          {/* Analyzer card */}
          <form onSubmit={onSubmitHandler} className='glass edge reveal rounded-[2rem] p-5 max-lg:order-1 md:p-7 lg:col-start-2 lg:row-span-2 lg:row-start-1' style={{ '--d': '200ms' }}>
            <div className='mb-5 flex items-center justify-between'>
              <h2 className='text-lg font-semibold tracking-tight'>Analyze your resume</h2>
              <span className='flex items-center gap-1.5 text-xs text-subtle'><i className='ri-file-text-line' /> PDF · PNG · JPG</span>
            </div>

            <Upload file={file} onFile={onFile} disabled={isLoading} />

            <button
              type='button'
              onClick={() => setShowTargeting(!showTargeting)}
              className='mt-5 flex w-full items-center justify-between rounded-xl px-1 py-2 text-left text-sm'
            >
              <span className='flex items-center gap-2'>
                <i className='ri-focus-3-line text-accent' />
                <span className='font-medium'>Tailor to a job</span>
                <span className='rounded-full bg-accent/10 px-2 py-0.5 text-[11px] text-accent'>more accurate</span>
              </span>
              <i className={`ri-arrow-down-s-line text-lg text-muted transition-transform duration-300 ${showTargeting ? 'rotate-180' : ''}`} />
            </button>

            <div className={`grid transition-all duration-500 ease-out ${showTargeting ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className='overflow-hidden'>
                <div className='space-y-3 pt-2'>
                  <input
                    className='field'
                    placeholder='Target role, e.g. Senior Frontend Engineer'
                    value={targetRole}
                    maxLength={120}
                    onChange={(e) => setTargetRole(e.target.value)}
                  />
                  <textarea
                    className='field min-h-32 resize-y'
                    placeholder='Paste the job description (optional). We will match keywords and requirements against it.'
                    value={jobDescription}
                    maxLength={8000}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button type='submit' disabled={!file || isLoading || outOfQuota} className='btn-primary mt-6 w-full text-base'>
              {outOfQuota ? (
                <><i className='ri-time-line' /> Daily limit reached</>
              ) : (
                <><i className='ri-sparkling-2-fill' /> Analyze resume</>
              )}
            </button>

            <div className='mt-4'>
              <UsageMeter usage={usage} user={user} />
            </div>
          </form>
        </div>
      )}
    </main>
  )
}

export default Home
