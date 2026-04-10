import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Youtube from '@tiptap/extension-youtube'
import Typography from '@tiptap/extension-typography'
import TextAlign from '@tiptap/extension-text-align'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Dropcursor from '@tiptap/extension-dropcursor'
import DragHandle from '@tiptap/extension-drag-handle-react'
import { GripVertical } from 'lucide-react'

import { SlashCommand } from './blocks/slash-command'
import { getSuggestionItems, renderItems } from './blocks/slash-menu'
import { EditorToolbar } from './toolbar'
import { MediaLibraryModal } from '../media/media-library-modal'
import { useState } from 'react'

import '@/styles/tiptap.css' // Importaremos los estilos base

interface BlockEditorProps {
  content: string
  onChange: (content: string) => void
  editable?: boolean
  placeholder?: string
}

export function BlockEditor({
  content,
  onChange,
  editable = true,
  placeholder = "Presiona '/' para ver los comandos, o empieza a escribir...",
}: BlockEditorProps) {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)

  const editor = useEditor({
    editable,
    content,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4], // H1 is reserved for the page title and SEO
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return `Título ${node.attrs.level}`
          }
          return placeholder
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg border border-gray-200 shadow-sm max-w-full my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-gov-blue hover:underline cursor-pointer',
        },
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-lg my-4',
        },
      }),
      Typography,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Dropcursor.configure({
        color: '#3366cc',
        width: 3,
        class: 'rounded-full',
      }),
      SlashCommand.configure({
        suggestion: {
          items: ({ query }: { query: string }) => getSuggestionItems({ 
            query, 
            onOpenMediaLibrary: () => setIsMediaModalOpen(true) 
          }),
          render: renderItems,
        },
      }),
    ],
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-blue prose-slate max-w-none focus:outline-none min-h-[300px] px-2 py-4',
      },
    },
  })

  const handleInsertMedia = (url: string, type: 'image' | 'document' | 'other') => {
    if (editor) {
      if (type === 'image') {
        editor.chain().focus().setImage({ src: url }).run()
      } else {
        // Para documentos, creamos un enlace
        editor.chain().focus().setLink({ href: url }).insertContent(url).run()
      }
    }
  }

  return (
    <div className="relative border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden focus-within:border-gov-blue focus-within:ring-1 focus-within:ring-gov-blue transition-all">
      {editable && <EditorToolbar editor={editor} />}
      
      <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[800px] relative">
        {editable && (
          <DragHandle editor={editor} className="flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gov-blue hover:bg-gov-blue/10 rounded cursor-grab active:cursor-grabbing transition-colors">
            <GripVertical className="w-4 h-4" />
          </DragHandle>
        )}
        <EditorContent editor={editor} />
      </div>

      {editable && (
        <MediaLibraryModal
          isOpen={isMediaModalOpen}
          onClose={() => setIsMediaModalOpen(false)}
          onSelect={handleInsertMedia}
        />
      )}
    </div>
  )
}
