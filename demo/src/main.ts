import './style.css'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { asciidocSchema, defaultAsciiDocParser, defaultAsciiDocSerializer } from '../../dist/index.js'
import { asciidocTextFormattingandPunctuation } from './sampleAsciiDoc.js'
import { keymap } from 'prosemirror-keymap'
import { baseKeymap, toggleMark, setBlockType } from 'prosemirror-commands'
import { history } from 'prosemirror-history'

let editorView: EditorView | null = null
let outputTextarea: HTMLTextAreaElement | null = null

// Custom command to create unordered list
function createUnorderedList(state: any, dispatch: any) {
  const { $from, $to } = state.selection
  const range = $from.blockRange($to)

  if (!range) return false

  const tr = state.tr

  // Wrap the range in list_item, then in bullet_list
  tr.wrap(range, [{ type: state.schema.nodes.list_item }])
  tr.wrap(range, [{ type: state.schema.nodes.bullet_list }])

  if (dispatch) dispatch(tr)
  return true
}

// Custom command to create ordered list
function createOrderedList(state: any, dispatch: any) {
  const { $from, $to } = state.selection
  const range = $from.blockRange($to)

  if (!range) return false

  const tr = state.tr

  // Wrap the range in list_item, then in ordered_list
  tr.wrap(range, [{ type: state.schema.nodes.list_item }])
  tr.wrap(range, [{ type: state.schema.nodes.ordered_list }])

  if (dispatch) dispatch(tr)
  return true
}

// Custom command to create link
function createLink(state: any, dispatch: any) {
  const href = prompt('Enter the URL:')
  if (!href) return false

  const text = prompt('Enter the link text:')
  if (!text) return false

  const { $from, $to } = state.selection
  const tr = state.tr

  if ($from.pos === $to.pos) {
    // No selection, insert text and apply link
    tr.insertText(text, $from.pos)
    tr.addMark($from.pos, $from.pos + text.length, state.schema.marks.link.create({ href }))
  } else {
    // Apply link to selection
    tr.addMark($from.pos, $to.pos, state.schema.marks.link.create({ href }))
  }

  if (dispatch) dispatch(tr)
  return true
}

// Create the application UI
function createApp() {
  const app = document.querySelector<HTMLDivElement>('#app')!
  app.innerHTML = `
    <div class="container">
      <div class="toolbar">
          <button id="h2-btn">H2</button>
          <button id="h3-btn">H3</button>
          <button id="ul-btn">UL</button>
          <button id="ol-btn">OL</button>
          <button id="code-btn">Code</button>
          <button id="bold-btn">Bold</button>
          <button id="italic-btn">Italic</button>
          <button id="link-btn">Link</button>
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
    'Mod-8': createUnorderedList,
    'Mod-9': createOrderedList,
    'Mod-Shift-C': setBlockType(asciidocSchema.nodes.code_block),
    'Mod-b': toggleMark(asciidocSchema.marks.strong),
    'Mod-i': toggleMark(asciidocSchema.marks.em),
    'Mod-k': createLink
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
  document.getElementById('ul-btn')!.addEventListener('click', () => {
    createUnorderedList(editorView!.state, editorView!.dispatch)
    editorView!.focus()
  })
  document.getElementById('ol-btn')!.addEventListener('click', () => {
    createOrderedList(editorView!.state, editorView!.dispatch)
    editorView!.focus()
  })
  document.getElementById('code-btn')!.addEventListener('click', () => {
    setBlockType(asciidocSchema.nodes.code_block)(editorView!.state, editorView!.dispatch)
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
  document.getElementById('link-btn')!.addEventListener('click', () => {
    createLink(editorView!.state, editorView!.dispatch)
    editorView!.focus()
  })

  // Initial update
  updateOutput()
}

// Initialize the application
createApp()
