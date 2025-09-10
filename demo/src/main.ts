import './style.css'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { asciidocSchema, defaultAsciiDocParser } from '../../dist/index.js'
import applyDevTools from 'prosemirror-dev-tools'
import { sampleAsciiDoc } from './sampleAsciiDoc.js'

let editorView: EditorView | null = null

// Create the application UI
function createApp() {
  const app = document.querySelector<HTMLDivElement>('#app')!
  app.innerHTML = `
    <div class="container">
      <div id="editor" class="editor"></div>
    </div>
  `

  initializeEditor()
}


// Initialize ProseMirror editor
function initializeEditor() {
  const prosemirror = document.getElementById('editor')!

  editorView = new EditorView(prosemirror, {
    state: EditorState.create({
      schema: asciidocSchema,
      doc: defaultAsciiDocParser.parse(sampleAsciiDoc)
    }),
    dispatchTransaction: (transaction) => {
      if (!editorView) return

      const newState = editorView.state.apply(transaction)
      editorView.updateState(newState)
    }
  })

  // Apply dev tools for debugging
  applyDevTools(editorView)
}

// Initialize the application
createApp()
