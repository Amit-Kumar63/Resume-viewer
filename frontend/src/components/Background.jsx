// Fixed ambient backdrop: drifting aurora blobs over a fading grid
const Background = () => (
  <div aria-hidden className='pointer-events-none fixed inset-0 -z-10 overflow-hidden'>
    <div className='absolute inset-0 bg-grid' />
    <div className='blob' style={{ width: 520, height: 520, top: -180, left: '8%', background: '#6d5dfc' }} />
    <div className='blob' style={{ width: 420, height: 420, top: -120, right: '4%', background: '#14b8a6', animationDelay: '-8s', opacity: 0.3 }} />
    <div className='blob' style={{ width: 380, height: 380, bottom: -200, left: '40%', background: '#7c3aed', animationDelay: '-14s', opacity: 0.18 }} />
    <div className='absolute inset-0' style={{ background: 'linear-gradient(180deg, rgb(7 8 12 / 0) 0%, rgb(7 8 12 / 0.35) 55%, #07080c 100%)' }} />
  </div>
)

export default Background
