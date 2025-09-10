import './style.css'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { asciidocSchema, defaultAsciiDocParser, defaultAsciiDocSerializer } from '../../dist/index.js'
import { sampleAsciiDoc } from './sampleAsciiDoc.js'
import { keymap } from 'prosemirror-keymap'
import { baseKeymap, toggleMark, setBlockType } from 'prosemirror-commands'
import { history } from 'prosemirror-history'

let editorView: EditorView | null = null
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
      </div>
      <div id="editor" class="editor"></div>
      <textarea id="output" class="output-textarea" readonly></textarea>
    </div>
  `

  initializeEditor()
}


// Initialize ProseMirror editor
function initializeEditor() {
  const prosemirror = document.getElementById('editor')!
  outputTextarea = document.getElementById('output') as HTMLTextAreaElement

  const updateOutput = () => {
    if (editorView && outputTextarea) {
      outputTextarea.value = defaultAsciiDocSerializer.serialize(editorView.state.doc)
    }
  }

  const customKeymap = {
    'Mod-1': setBlockType(asciidocSchema.nodes.heading, { level: 1 }),
    'Mod-2': setBlockType(asciidocSchema.nodes.heading, { level: 2 }),
    'Mod-3': setBlockType(asciidocSchema.nodes.heading, { level: 3 }),
    'Mod-b': toggleMark(asciidocSchema.marks.strong),
    'Mod-i': toggleMark(asciidocSchema.marks.em)
  }

  editorView = new EditorView(prosemirror, {
    state: EditorState.create({
      schema: asciidocSchema,
      doc: defaultAsciiDocParser.parse(sampleAsciiDoc),
      plugins: [keymap(customKeymap), keymap(baseKeymap), history()]
    }),
    dispatchTransaction: (transaction) => {
      if (!editorView) return

      const newState = editorView.state.apply(transaction)
      editorView.updateState(newState)
      updateOutput()
    }
  })

  // Add toolbar button handlers
  document.getElementById('h2-btn')!.addEventListener('click', () => {
    setBlockType(asciidocSchema.nodes.heading, { level: 2 })(editorView!.state, editorView!.dispatch)
    editorView!.focus()
  })
  document.getElementById('h3-btn')!.addEventListener('click', () => {
    setBlockType(asciidocSchema.nodes.heading, { level: 3 })(editorView!.state, editorView!.dispatch)
    editorView!.focus()
  })
  document.getElementById('bold-btn')!.addEventListener('click', () => {
    toggleMark(asciidocSchema.marks.strong)(editorView!.state, editorView!.dispatch)
    editorView!.focus()
  })
  document.getElementById('italic-btn')!.addEventListener('click', () => {
    toggleMark(asciidocSchema.marks.em)(editorView!.state, editorView!.dispatch)
    editorView!.focus()
  })

  // Initial update
  updateOutput()
}

// Initialize the application
createApp()
