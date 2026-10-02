import { useRef, useState } from 'react'

const ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp'
const MAX_MB = 5

const formatSize = (bytes) => bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`

const Upload = ({ file, onFile, disabled }) => {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const pick = (selected) => {
    if (!selected) return
    if (!/\.(pdf|png|jpe?g|webp)$/i.test(selected.name)) return onFile(null, 'Upload a PDF, PNG, JPG or WEBP file')
    if (selected.size > MAX_MB * 1024 * 1024) return onFile(null, `File is too large. Maximum size is ${MAX_MB} MB`)
    onFile(selected)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (!disabled) pick(e.dataTransfer.files?.[0])
  }

  if (file) {
    const isPdf = /\.pdf$/i.test(file.name)
    return (
      <div className='reveal flex items-center gap-4 rounded-2xl border border-line bg-white/[0.03] p-4'>
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl ${isPdf ? 'bg-bad/15 text-bad' : 'bg-accent-2/15 text-accent-2'}`}>
          <i className={isPdf ? 'ri-file-pdf-2-line' : 'ri-image-line'} />
        </span>
        <div className='min-w-0 flex-1'>
          <p className='truncate font-medium'>{file.name}</p>
          <p className='text-sm text-muted'>{formatSize(file.size)} · Ready to analyze</p>
        </div>
        <button
          type='button'
          disabled={disabled}
          onClick={() => { onFile(null); if (inputRef.current) inputRef.current.value = '' }}
          className='grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-white/10 hover:text-fg disabled:opacity-40'
          aria-label='Remove file'
        >
          <i className='ri-close-line text-lg' />
        </button>
      </div>
    )
  }

  return (
    <label
      htmlFor='file'
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`dropzone flex cursor-pointer flex-col items-center justify-center px-6 py-10 text-center ${dragging ? 'is-dragging' : ''}`}
    >
      <span className='float-y relative mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-accent/25 to-accent-2/15 text-3xl text-accent ring-1 ring-white/10'>
        <i className='ri-upload-cloud-2-line' />
      </span>
      <p className='text-lg font-medium'>{dragging ? 'Drop it here' : 'Drop your resume here'}</p>
      <p className='mt-1 text-sm text-muted'>
        or <span className='text-accent underline decoration-accent/40 underline-offset-4'>browse files</span> · PDF, PNG, JPG up to {MAX_MB} MB
      </p>
      <input
        ref={inputRef}
        type='file'
        id='file'
        accept={ACCEPT}
        className='hidden'
        disabled={disabled}
        onChange={(e) => pick(e.target.files?.[0])}
      />
    </label>
  )
}

export default Upload
