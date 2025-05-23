import mediaUpload from '@/services/media-upload.service'
import { createContext, useContext, useState } from 'react'

type TMediaUploadServiceContext = {
  service: string
  updateService: (service: string) => void
}

const MediaUploadServiceContext = createContext<TMediaUploadServiceContext | undefined>(undefined)

export const useMediaUploadService = () => {
  const context = useContext(MediaUploadServiceContext)
  if (!context) {
    throw new Error('useMediaUploadService must be used within MediaUploadServiceProvider')
  }
  return context
}

export function MediaUploadServiceProvider({ children }: { children: React.ReactNode }) {
  const [service, setService] = useState(mediaUpload.getService())

  const updateService = (newService: string) => {
    setService(newService)
    mediaUpload.setService(newService)
  }

  return (
    <MediaUploadServiceContext.Provider value={{ service, updateService }}>
      {children}
    </MediaUploadServiceContext.Provider>
  )
}
