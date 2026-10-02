const LINKS = [
  { href: 'https://github.com/Amit-Kumar63', label: 'GitHub', icon: 'ri-github-fill' },
  { href: 'https://www.linkedin.com/in/amit-kumar-3688b4286', label: 'LinkedIn', icon: 'ri-linkedin-box-fill' },
  { href: 'https://wa.me/7651871602', label: 'WhatsApp', icon: 'ri-whatsapp-line' },
]

const SKILLS = [
  { icon: 'ri-reactjs-line', text: 'Expertise in JavaScript, React, and Next.js' },
  { icon: 'ri-server-line', text: 'Backend development with Node.js and Express' },
  { icon: 'ri-brain-line', text: 'AI and machine learning integration' },
  { icon: 'ri-database-2-line', text: 'Database management with MongoDB & Firebase' },
  { icon: 'ri-rocket-2-line', text: 'Passionate about building AI-driven applications' },
]

const DeveloperInfo = () => (
  <main className='mx-auto grid max-w-5xl items-start gap-6 px-4 pb-24 pt-12 md:grid-cols-[1fr_1.3fr] md:pt-20'>
    <section className='glass edge reveal rounded-[2rem] p-8 text-center'>
      <div className='relative mx-auto h-28 w-28'>
        <div className='absolute inset-0 animate-[spin_10s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,#9b8cff,#5eead4,#9b8cff)] p-[2px]'>
          <div className='h-full w-full rounded-full bg-panel' />
        </div>
        <div className='absolute inset-[6px] grid place-items-center rounded-full bg-gradient-to-br from-accent/30 to-accent-2/20 font-serif text-5xl italic'>A</div>
      </div>
      <p className='mt-6 font-mono text-xs uppercase tracking-[0.2em] text-accent-2'>Meet the developer</p>
      <h1 className='mt-2 text-3xl font-semibold tracking-tight'>Amit Kumar</h1>
      <p className='mt-1 text-muted'>Full-stack & AI developer</p>
      <div className='mt-7 flex flex-col gap-2'>
        {LINKS.map((l) => (
          <a key={l.label} href={l.href} target='_blank' rel='noreferrer' className='btn-ghost justify-between !rounded-2xl !px-4 !py-3'>
            <span className='flex items-center gap-2.5'><i className={`${l.icon} text-lg`} /> {l.label}</span>
            <i className='ri-arrow-right-up-line text-muted' />
          </a>
        ))}
      </div>
    </section>

    <section className='glass reveal rounded-[2rem] p-8' style={{ '--d': '120ms' }}>
      <h2 className='text-xl font-semibold tracking-tight'>Skills & technologies</h2>
      <ul className='mt-6 space-y-3'>
        {SKILLS.map((s, i) => (
          <li key={s.text} className='reveal flex items-center gap-4 rounded-2xl border border-line bg-white/[0.02] p-4' style={{ '--d': `${220 + i * 70}ms` }}>
            <span className='grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-lg text-accent'><i className={s.icon} /></span>
            <span className='text-fg/90'>{s.text}</span>
          </li>
        ))}
      </ul>
    </section>
  </main>
)

export default DeveloperInfo
