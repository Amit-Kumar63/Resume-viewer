import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

const strength = (pw) => {
  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 12) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return Math.min(4, s)
}
const STRENGTH = [
  { label: 'Too short', color: 'bg-bad' },
  { label: 'Weak', color: 'bg-bad' },
  { label: 'Fair', color: 'bg-warn' },
  { label: 'Good', color: 'bg-accent-2' },
  { label: 'Strong', color: 'bg-good' },
]

const AuthForm = ({ mode }) => {
  const isSignup = mode === 'signup'
  const { user, authenticate } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (user) navigate('/', { replace: true }) }, [user, navigate])

  const update = (key) => (e) => { setForm({ ...form, [key]: e.target.value }); setError('') }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (isSignup && form.password.length < 8) return setError('Password must be at least 8 characters')
    setSubmitting(true)
    const { ok, message } = await authenticate(mode, isSignup ? form : { email: form.email, password: form.password })
    setSubmitting(false)
    if (ok) toast.success(isSignup ? 'Account created. Welcome!' : 'Welcome back')
    else setError(message || 'Something went wrong. Please try again')
  }

  const score = strength(form.password)

  return (
    <main className='grid min-h-[calc(100vh-88px)] place-items-center px-4 py-12'>
      <div className='w-full max-w-md'>
        <div className='reveal mb-8 text-center'>
          <span className='mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-accent/30 to-accent-2/20 text-2xl text-accent ring-1 ring-white/10'>
            <i className={isSignup ? 'ri-user-add-line' : 'ri-key-2-line'} />
          </span>
          <h1 className='text-3xl font-semibold tracking-tight'>
            {isSignup ? <>Create your <span className='font-serif font-normal italic text-gradient'>free</span> account</> : <>Welcome <span className='font-serif font-normal italic text-gradient'>back</span></>}
          </h1>
          <p className='mt-2 text-muted'>
            {isSignup ? 'More daily reviews. No email verification needed.' : 'Log in to keep reviewing your resume.'}
          </p>
        </div>

        <form onSubmit={onSubmit} className='glass edge reveal space-y-4 rounded-[2rem] p-6 md:p-8' style={{ '--d': '100ms' }} noValidate>
          {isSignup && (
            <label className='block'>
              <span className='mb-1.5 block text-sm text-muted'>Name <span className='text-subtle'>(optional)</span></span>
              <input className='field' value={form.name} onChange={update('name')} autoComplete='name' maxLength={60} placeholder='Your name' />
            </label>
          )}
          <label className='block'>
            <span className='mb-1.5 block text-sm text-muted'>Email</span>
            <input className='field' type='email' required value={form.email} onChange={update('email')} autoComplete='email' placeholder='you@example.com' />
          </label>
          <label className='block'>
            <span className='mb-1.5 block text-sm text-muted'>Password</span>
            <span className='relative block'>
              <input
                className='field pr-12'
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={update('password')}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                placeholder={isSignup ? 'At least 8 characters' : '••••••••'}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute inset-y-0 right-0 grid w-12 place-items-center text-muted hover:text-fg'
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
              </button>
            </span>
          </label>

          {isSignup && form.password && (
            <div className='flex items-center gap-3'>
              <div className='grid flex-1 grid-cols-4 gap-1.5'>
                {[1, 2, 3, 4].map((i) => (
                  <span key={i} className={`h-1 rounded-full transition-colors duration-300 ${i <= score ? STRENGTH[score].color : 'bg-white/10'}`} />
                ))}
              </div>
              <span className='w-16 text-right text-xs text-muted'>{STRENGTH[score].label}</span>
            </div>
          )}

          {error && (
            <p className='reveal flex items-start gap-2 rounded-xl bg-bad/10 px-3 py-2.5 text-sm text-bad'>
              <i className='ri-error-warning-line mt-0.5' /> {error}
            </p>
          )}

          <button type='submit' disabled={submitting} className='btn-primary w-full'>
            {submitting
              ? <span className='dots-loader'><span /><span /><span /></span>
              : isSignup ? 'Create account' : 'Log in'}
          </button>

          <p className='pt-1 text-center text-sm text-muted'>
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <Link to={isSignup ? '/login' : '/signup'} className='text-accent hover:underline'>
              {isSignup ? 'Log in' : 'Sign up free'}
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}

export default AuthForm
