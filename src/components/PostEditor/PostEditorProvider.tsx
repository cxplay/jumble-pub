import { createContext, Dispatch, SetStateAction, useContext, useState } from 'react'

type TPostEditorContext = {
  uploadingFiles: number
  setUploadingFiles: Dispatch<SetStateAction<number>>
}

const PostEditorContext = createContext<TPostEditorContext | undefined>(undefined)

export const usePostEditor = () => {
  const context = useContext(PostEditorContext)
  if (!context) {
    throw new Error('usePostEditor must be used within a PostEditorProvider')
  }
  return context
}

export function PostEditorProvider({ children }: { children: React.ReactNode }) {
  const [uploadingFiles, setUploadingFiles] = useState(0)

  return (
    <PostEditorContext.Provider value={{ uploadingFiles, setUploadingFiles }}>
      {children}
    </PostEditorContext.Provider>
  )
}
