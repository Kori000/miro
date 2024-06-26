'use client'

import qs from 'query-string'

import { useDebounceValue } from 'usehooks-ts'

import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type ChangeEvent } from 'react'

type SearchInputProps = {}
export const SearchInput = ({}: SearchInputProps) => {
  const router = useRouter()

  const [value, setValue] = useState('')

  const [debouncedSetValue] = useDebounceValue(value, 500)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  useEffect(() => {
    const url = qs.stringifyUrl(
      {
        url: '/',
        query: {
          search: debouncedSetValue,
        },
      },
      {
        skipNull: true,
        skipEmptyString: true,
      }
    )

    router.push(url)

    return () => {}
  }, [debouncedSetValue, router])

  return (
    <div className='w-full relative '>
      <Search className='absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground size-4' />
      <Input
        onChange={handleChange}
        value={value}
        className='w-full max-w-[516px] pl-9 '
        placeholder='Search boards'
      />
    </div>
  )
}
