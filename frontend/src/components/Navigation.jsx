import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

const LINKS = [
  { to: '/', label: 'Review' },
  { to: '/about-us', label: 'How it works' },
  { to: '/developer-info', label: 'Developer' },
]

const Navigation = () => {
  const [openMenu, setOpenMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, ready, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => { setOpenMenu(false) }, [pathname])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const logoutHandler = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/')
  }

  const initial = (user?.name || user?.email || '?').charAt(0).toUpperCase()

  return (
    <header className='sticky top-0 z-40 px-4 pt-4'>
      <div className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-3 py-2 transition-all duration-300 ${scrolled || openMenu ? 'glass' : 'border border-transparent'}`}>
        <Link to='/' className='flex items-center gap-2.5 pl-2'>
          <span className='grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-ink shadow-[0_0_24px_-4px_#9b8cff]'>
            <i className='ri-file-search-line text-lg' />
          </span>
          <span className='font-semibold tracking-tight'>Resume <span className='font-serif text-[1.15em] font-normal italic text-accent'>Reviewer</span></span>
        </Link>

        <nav className='hidden items-center gap-1 md:flex'>
          {LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) => `rounded-full px-4 py-2 text-sm transition-colors ${isActive ? 'bg-white/[0.07] text-fg' : 'text-muted hover:text-fg'}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className='hidden items-center gap-2 md:flex'>
          {!ready ? (
            <span className='skeleton h-9 w-36 rounded-full' />
          ) : user ? (
            <>
              <span className='flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 text-sm text-muted'>
                <span className='grid h-7 w-7 place-items-center rounded-full bg-accent/20 font-medium text-accent'>{initial}</span>
                <span className='max-w-40 truncate'>{user.name || user.email}</span>
              </span>
              <button onClick={logoutHandler} className='btn-ghost text-sm' title='Log out'>
                <i className='ri-logout-box-r-line' />
              </button>
            </>
          ) : (
            <>
              <Link to='/login' className='rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-fg'>Log in</Link>
              <Link to='/signup' className='btn-primary !px-5 !py-2 text-sm'>Get started</Link>
            </>
          )}
        </div>

        <button
          className='grid h-10 w-10 place-items-center rounded-full text-2xl md:hidden'
          onClick={() => setOpenMenu(!openMenu)}
          aria-label='Toggle menu'
        >
          <i className={openMenu ? 'ri-close-line' : 'ri-menu-4-line'} />
        </button>
      </div>

      {openMenu && (
        <div className='glass reveal mx-auto mt-2 flex max-w-6xl flex-col gap-1 rounded-3xl p-3 md:hidden'>
          {LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) => `rounded-2xl px-4 py-3 ${isActive ? 'bg-white/[0.07] text-fg' : 'text-muted'}`}
            >
              {label}
            </NavLink>
          ))}
          <div className='mt-2 border-t border-line pt-3'>
            {user ? (
              <button onClick={logoutHandler} className='btn-ghost w-full'>
                <i className='ri-logout-box-r-line' /> Log out ({user.email})
              </button>
            ) : (
              <div className='grid grid-cols-2 gap-2'>
                <Link to='/login' className='btn-ghost'>Log in</Link>
                <Link to='/signup' className='btn-primary !py-2.5'>Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navigation
