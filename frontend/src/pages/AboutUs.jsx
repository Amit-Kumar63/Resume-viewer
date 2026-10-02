import { Link } from 'react-router-dom'

const STEPS = [
  { icon: 'ri-upload-cloud-2-line', title: 'Upload your resume', text: 'PDF, PNG or JPG. Every page is read, including multi-column layouts.' },
  { icon: 'ri-focus-3-line', title: 'Add a target role (optional)', text: 'Paste a job description and the review is measured against that exact role.' },
  { icon: 'ri-scan-2-line', title: 'AI reviews it like a recruiter', text: 'A calibrated rubric scores impact, relevance, keywords, structure, writing and ATS fit.' },
  { icon: 'ri-magic-line', title: 'Get fixes you can apply today', text: 'Strengths, weaknesses, before → after rewrites, missing keywords and a salary estimate.' },
]

const AboutUs = () => (
  <main className='mx-auto max-w-5xl px-4 pb-24 pt-12 md:pt-20'>
    <div className='mx-auto max-w-2xl text-center'>
      <p className='reveal font-mono text-xs uppercase tracking-[0.2em] text-accent-2'>How it works</p>
      <h1 className='reveal mt-3 text-4xl font-semibold tracking-tight md:text-5xl' style={{ '--d': '80ms' }}>
        About our <span className='font-serif font-normal italic text-gradient'>AI resume</span> reviewer
      </h1>
      <p className='reveal mt-5 text-lg leading-relaxed text-muted' style={{ '--d': '160ms' }}>
        Our AI-powered resume analyzer takes your uploaded resume and provides insights into your strengths,
        weaknesses, and areas for improvement. It helps you craft the best version of your resume for potential employers.
      </p>
    </div>

    <ol className='relative mt-16 grid gap-4 md:grid-cols-2'>
      {STEPS.map((s, i) => (
        <li key={s.title} className='glass reveal group rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1' style={{ '--d': `${220 + i * 90}ms` }}>
          <div className='flex items-center justify-between'>
            <span className='grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-accent/25 to-accent-2/15 text-xl text-accent ring-1 ring-white/10'>
              <i className={s.icon} />
            </span>
            <span className='font-mono text-sm text-subtle'>0{i + 1}</span>
          </div>
          <h3 className='mt-5 text-lg font-semibold'>{s.title}</h3>
          <p className='mt-2 leading-relaxed text-muted'>{s.text}</p>
        </li>
      ))}
    </ol>

    <div className='reveal mt-12 text-center' style={{ '--d': '600ms' }}>
      <Link to='/' className='btn-primary'>
        <i className='ri-sparkling-2-fill' /> Get started
      </Link>
    </div>
  </main>
)

export default AboutUs
