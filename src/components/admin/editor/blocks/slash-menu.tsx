/**
 * Menú de sugerencias que aparece al escribir '/' en el editor Tiptap (estilo Notion)
 */
import { ReactRenderer } from '@tiptap/react'
import tippy, { Instance as TippyInstance } from 'tippy.js'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { Heading1, Heading2, Heading3, Text, List, ListOrdered, Quote, Image, Minus, Video } from 'lucide-react'

// Opciones del menú
export const getSuggestionItems = ({ query, onOpenMediaLibrary }: { query: string, onOpenMediaLibrary?: () => void }) => {
  return [
    {
      title: 'Texto',
      description: 'Empezar a escribir con texto normal',
      icon: Text,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('paragraph').run()
      },
    },
    {
      title: 'Título 1',
      description: 'Título de sección grande',
      icon: Heading1,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run() // H2 for SEO compliance in content
      },
    },
    {
      title: 'Título 2',
      description: 'Título de sección mediano',
      icon: Heading2,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
      },
    },
    {
      title: 'Título 3',
      description: 'Título de subsección',
      icon: Heading3,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 4 }).run()
      },
    },
    {
      title: 'Lista de viñetas',
      description: 'Crear una lista desordenada',
      icon: List,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run()
      },
    },
    {
      title: 'Lista numerada',
      description: 'Crear una lista ordenada',
      icon: ListOrdered,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run()
      },
    },
    {
      title: 'Cita',
      description: 'Capturar una cita textual',
      icon: Quote,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run()
      },
    },
    {
      title: 'Divisor',
      description: 'Separar bloques de contenido visualmente',
      icon: Minus,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run()
      },
    },
    {
      title: 'Imagen',
      description: 'Buscar en la biblioteca de medios',
      icon: Image,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).run()
        if (onOpenMediaLibrary) {
          // Guardamos la posición actual para saber dónde insertar luego
          onOpenMediaLibrary()
        } else {
          const url = window.prompt("URL de la imagen (temporal hasta integrar Media Library)")
          if (url) {
            editor.chain().focus().setImage({ src: url }).run()
          }
        }
      },
    },
    {
      title: 'YouTube',
      description: 'Insertar video de YouTube',
      icon: Video,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).run()
        const url = window.prompt("URL del video de YouTube")
        if (url) {
          editor.chain().focus().setYoutubeVideo({ src: url }).run()
        }
      },
    },
  ].filter((item) => item.title.toLowerCase().startsWith(query.toLowerCase())).slice(0, 10)
}

// Renderizador del Popup de React usando Tippy
export const renderItems = () => {
  let component: ReactRenderer
  let popup: TippyInstance[]

  return {
    onStart: (props: any) => {
      component = new ReactRenderer(CommandMenu, {
        props,
        editor: props.editor,
      })

      if (!props.clientRect) return

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
      })
    },

    onUpdate(props: any) {
      component.updateProps(props)

      if (!props.clientRect) return

      popup[0].setProps({
        getReferenceClientRect: props.clientRect,
      })
    },

    onKeyDown(props: any) {
      if (props.event.key === 'Escape') {
        popup[0].hide()
        return true
      }
      // @ts-ignore
      return component.ref?.onKeyDown(props)
    },

    onExit() {
      popup[0].destroy()
      component.destroy()
    },
  }
}

// Componente React de Menú
const CommandMenu = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command(item)
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => {
    setSelectedIndex(0)
  }, [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }
      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }
      if (event.key === 'Enter') {
        enterHandler()
        return true
      }
      return false
    },
  }))

  return (
    <div className="z-50 min-w-[280px] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden py-2 text-sm flex flex-col">
      {props.items.length ? (
        props.items.map((item: any, index: number) => {
          const Icon = item.icon
          return (
            <button
              className={`flex items-center gap-3 px-4 py-2 mx-2 rounded-md text-left transition-colors ${
                index === selectedIndex ? 'bg-gov-blue text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
              key={index}
              disabled={index === selectedIndex}
              onClick={() => selectItem(index)}
            >
              <div className={`p-1.5 rounded-md ${index === selectedIndex ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                <Icon className={`w-4 h-4 ${index === selectedIndex ? 'text-white' : ''}`} />
              </div>
              <div>
                <div className="font-medium">{item.title}</div>
                <div className={`text-xs ${index === selectedIndex ? 'text-blue-100' : 'text-gray-500'}`}>
                  {item.description}
                </div>
              </div>
            </button>
          )
        })
      ) : (
        <div className="text-gray-500 text-center py-4 px-4 text-sm">
          No hay resultados
        </div>
      )}
    </div>
  )
})

CommandMenu.displayName = 'CommandMenu'
