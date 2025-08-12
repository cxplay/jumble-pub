import mediaUpload from '@/services/media-upload.service'
import { useRef } from 'react'
import { toast } from 'sonner'

export default function Uploader({
  children,
  onUploadSuccess,
  onUploadingChange,
  onUploadStart,
  onUploadEnd,
  onProgress,
  onProvideCancel,
  className,
  accept = 'image/*'
}: {
  children: React.ReactNode
  onUploadSuccess: ({ url, tags }: { url: string; tags: string[][] }) => void
  onUploadingChange?: (uploading: boolean) => void
  onUploadStart?: (file: File) => void
  onUploadEnd?: () => void
  onProgress?: (progress: number, file: File) => void
  onProvideCancel?: (cancel: () => void) => void
  className?: string
  accept?: string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return

    onUploadingChange?.(true)
    try {
      for (const file of event.target.files) {
        abortControllerRef.current = new AbortController()
        const cancel = () => abortControllerRef.current?.abort()
        onProvideCancel?.(cancel)
        onUploadStart?.(file)
        const result = await mediaUpload.upload(file, {
          onProgress: (p) => onProgress?.(p, file),
          signal: abortControllerRef.current.signal
        })
        onUploadSuccess(result)
        abortControllerRef.current = null
        onUploadEnd?.()
      }
    } catch (error) {
      console.error('Error uploading file', error)
      const message = (error as Error).message
      if (message !== 'Upload aborted') {
        toast.error(`Failed to upload file: ${message}`)
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      abortControllerRef.current = null
      onUploadEnd?.()
    } finally {
      onUploadingChange?.(false)
    }
  }

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '' // clear the value so that the same file can be uploaded again
      fileInputRef.current.click()
    }
  }

  return (
    <div className={className}>
      <div onClick={handleUploadClick}>{children}</div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept={accept}
        multiple
      />
    </div>
  )
}
