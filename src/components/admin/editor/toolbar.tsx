import { BubbleMenu } from '@tiptap/extension-bubble-menu'
import { type Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react'

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL del enlace', previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex items-center gap-1 bg-white border border-gray-200 shadow-lg rounded-lg p-1">
      <div className="flex items-center gap-1 border-r border-gray-200 pr-1">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${editor.isActive('bold') ? 'bg-gray-100 text-gov-blue' : 'text-gray-600'}`}
          title="Negrita"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${editor.isActive('italic') ? 'bg-gray-100 text-gov-blue' : 'text-gray-600'}`}
          title="Cursiva"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${editor.isActive('strike') ? 'bg-gray-100 text-gov-blue' : 'text-gray-600'}`}
          title="Tachado"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${editor.isActive('code') ? 'bg-gray-100 text-gov-blue' : 'text-gray-600'}`}
          title="Código en línea"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          onClick={setLink}
          className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${editor.isActive('link') ? 'bg-gray-100 text-gov-blue' : 'text-gray-600'}`}
          title="Insertar Enlace"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-1 pl-1">
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-100 text-gov-blue' : 'text-gray-600'}`}
          title="Alinear a la izquierda"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-100 text-gov-blue' : 'text-gray-600'}`}
          title="Centrar"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-100 text-gov-blue' : 'text-gray-600'}`}
          title="Alinear a la derecha"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-100 text-gov-blue' : 'text-gray-600'}`}
          title="Justificar"
        >
          <AlignJustify className="w-4 h-4" />
        </button>
      </div>
    </BubbleMenu>
  )
}
