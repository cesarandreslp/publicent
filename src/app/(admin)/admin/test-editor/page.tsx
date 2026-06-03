'use client'

import { useState } from 'react'
import { BlockEditor } from '@/components/admin/editor'

export default function EditorTestPage() {
  const [content, setContent] = useState('<h1>Prueba del Editor Tiptap</h1><p>Escribe aquí...</p>')

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test de Block Editor</h1>
      <div className="mb-8">
        <BlockEditor 
          content={content} 
          onChange={setContent} 
        />
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="font-semibold text-sm text-gray-500 mb-2">HTML Output:</h2>
        <pre className="text-xs whitespace-pre-wrap font-mono mt-4">
          {content}
        </pre>
      </div>
    </div>
  )
}
