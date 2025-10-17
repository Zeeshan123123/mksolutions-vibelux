'use client'

import { useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function CloudUploadManager() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [lastUrl, setLastUrl] = useState<string | null>(null)

  const onSelect = async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    setUploading(true)
    try {
      const res = await fetch('/api/storage/upload', { method: 'POST', body: form })
      const data = await res.json().catch(() => ({}))
      if (data?.url) setLastUrl(data.url)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="border-gray-700 bg-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Cloud Upload</CardTitle>
        <CardDescription>Upload files to S3-backed storage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <input ref={inputRef} type="file" className="hidden" onChange={e => e.target.files && onSelect(e.target.files[0])} />
          <Button onClick={() => inputRef.current?.click()} disabled={uploading}>{uploading ? 'Uploading...' : 'Choose File'}</Button>
          {lastUrl && (
            <a className="text-purple-300 underline" href={lastUrl} target="_blank">Open Uploaded File</a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


