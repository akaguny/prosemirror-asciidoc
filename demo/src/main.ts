import './style.css'
import { asciidocSchema, defaultAsciiDocParser, defaultAsciiDocSerializer } from '../../src/index.ts'
import { sampleAsciiDoc } from './sampleAsciiDoc.js'
import AsciiDocEditor from './AsciiDocEditor'

let asciidocEditor: AsciiDocEditor | null = null
let outputTextarea: HTMLTextAreaElement | null = null

// Create the application UI
function createApp() {
  const app = document.querySelector<HTMLDivElement>('#app')!
  app.innerHTML = `
    <div class="container">
      <div class="toolbar">
        <button id="h2-btn">H2</button>
        <button id="h3-btn">H3</button>
        <button id="bold-btn">Bold</button>
        <button id="italic-btn">Italic</button>
        <button id="reset-btn">Reset</button>
      </div>
      <div id="editor" class="editor"></div>
      <textarea id="output" class="output-textarea" readonly></textarea>
    </div>
  `

  initializeEditor()
}


// Initialize AsciiDocEditor
function initializeEditor() {
  const editorContainer = document.getElementById('editor')!
  outputTextarea = document.getElementById('output') as HTMLTextAreaElement

  // Создаем экземпляр AsciiDocEditor
  asciidocEditor = new AsciiDocEditor({
    container: editorContainer,
    initialContent: sampleAsciiDoc,
    onChange: (content: string) => {
      if (outputTextarea) {
        outputTextarea.value = content
      }
    },
    placeholder: 'Начните писать AsciiDoc...',
  })

  // Add toolbar button handlers
  document.getElementById('h2-btn')!.addEventListener('click', () => {
    // Вставляем заголовок H2 через клавиатурное сочетание
    asciidocEditor?.focus()
    // Имитируем нажатие клавиш для создания заголовка
    const editorElement = document.querySelector('.ProseMirror') as HTMLElement
    if (editorElement) {
      const event = new KeyboardEvent('keydown', {
        key: '2',
        ctrlKey: true,
        metaKey: true,
        bubbles: true,
      })
      editorElement.dispatchEvent(event)
    }
  })

  document.getElementById('h3-btn')!.addEventListener('click', () => {
    // Вставляем заголовок H3 через клавиатурное сочетание
    asciidocEditor?.focus()
    const editorElement = document.querySelector('.ProseMirror') as HTMLElement
    if (editorElement) {
      const event = new KeyboardEvent('keydown', {
        key: '3',
        ctrlKey: true,
        metaKey: true,
        bubbles: true,
      })
      editorElement.dispatchEvent(event)
    }
  })

  document.getElementById('bold-btn')!.addEventListener('click', () => {
    // Вставляем жирный текст через клавиатурное сочетание
    asciidocEditor?.focus()
    const editorElement = document.querySelector('.ProseMirror') as HTMLElement
    if (editorElement) {
      const event = new KeyboardEvent('keydown', {
        key: 'b',
        ctrlKey: true,
        metaKey: true,
        bubbles: true,
      })
      editorElement.dispatchEvent(event)
    }
  })

  document.getElementById('italic-btn')!.addEventListener('click', () => {
    // Вставляем курсив через клавиатурное сочетание
    asciidocEditor?.focus()
    const editorElement = document.querySelector('.ProseMirror') as HTMLElement
    if (editorElement) {
      const event = new KeyboardEvent('keydown', {
        key: 'i',
        ctrlKey: true,
        metaKey: true,
        bubbles: true,
      })
      editorElement.dispatchEvent(event)
    }
  })

  document.getElementById('reset-btn')!.addEventListener('click', () => {
    // Сбрасываем содержимое редактора
    asciidocEditor?.updateContent('')
    asciidocEditor?.focus()
  })

  // Initial update
  if (outputTextarea) {
    outputTextarea.value = sampleAsciiDoc
  }
}

// Initialize the application
createApp()
