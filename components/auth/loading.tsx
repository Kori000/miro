import Image from 'next/image'

const Loading = () => {
  return (
    <div className='h-full w-full flex items-center justify-center flex-col '>
      <Image
        src='/logo.svg'
        alt='Logo'
        width={120}
        height={120}
        className='animate-pulse duration-700 '
      />
    </div>
  )
}

export default Loading
