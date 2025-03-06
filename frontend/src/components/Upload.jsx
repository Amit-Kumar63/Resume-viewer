

const Upload = ({onChangeHander}) => {

  return (
    <>
    <label htmlFor="file" className=''>
        <img 
        src="upload-icon.png" 
        alt="uplaod-icon" 
        className='w-64 h-fit object-cover max-lg:w-50 max-sm:w-40'
        />
    </label>
    <input 
    type="file" 
    name='file' 
    id='file'
    className='hidden'
    required
    onChange={(e)=> onChangeHander(e)}
    />
    </>
  )
}

export default Upload