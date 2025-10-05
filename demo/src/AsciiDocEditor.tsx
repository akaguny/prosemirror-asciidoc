import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { asciidocSchema, defaultAsciiDocParser, defaultAsciiDocSerializer } from '../../src/index';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap, toggleMark, setBlockType } from 'prosemirror-commands';
import { history } from 'prosemirror-history';

/**
 * Интерфейс конфигурации для AsciiDocEditor
 */
export interface AsciiDocEditorConfig {
  /** Начальный контент в формате AsciiDoc */
  initialContent?: string;
  /** Обработчик изменения контента */
  onChange?: (content: string) => void;
  /** Дополнительные CSS классы */
  className?: string;
  /** Placeholder для пустого редактора */
  placeholder?: string;
  /** Режим только для чтения */
  readOnly?: boolean;
  /** Родительский элемент для монтирования */
  container: HTMLElement;
}

/**
 * Состояние редактора для отслеживания ошибок
 */
interface EditorInternalState {
  view: EditorView | null;
  error: string | null;
  isRecovering: boolean;
  config: AsciiDocEditorConfig;
}

/**
 * AsciiDocEditor - устойчивый редактор AsciiDoc с обработкой ошибок
 *
 * Особенности:
 * - Сохраняет некорректный контент без краха приложения
 * - Автоматически восстанавливается после ошибок парсинга
 * - Поддерживает базовую функциональность редактирования
 * - Интегрируется с существующей архитектурой prosemirror-asciidoc
 */
export class AsciiDocEditor {
  private state: EditorInternalState;
  private errorPanel: HTMLElement | null = null;
  private placeholderElement: HTMLElement | null = null;

  constructor(config: AsciiDocEditorConfig) {
    this.state = {
      view: null,
      error: null,
      isRecovering: false,
      config,
    };

    this.initialize();
  }

  /**
   * Безопасный парсинг AsciiDoc контента
   * В случае ошибки возвращает пустой документ вместо краха
   */
  private safeParseContent(content: string): any {
    try {
      this.setError(null);
      this.setRecovering(false);

      // Попытка парсинга контента
      const parsed = defaultAsciiDocParser.parse(content);

      // Проверка на корректность результата
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Некорректный результат парсинга');
      }

      return parsed;
    } catch (parseError) {
      console.warn('[AsciiDocEditor] Ошибка парсинга:', parseError);

      // Устанавливаем состояние ошибки
      const errorMessage = parseError instanceof Error ? parseError.message : 'Ошибка парсинга контента';
      this.setError(errorMessage);

      // Возвращаем документ с исходным текстом как plain text для сохранения контента
      try {
        const textNode = asciidocSchema.text(content);
        const paragraph = asciidocSchema.nodes.paragraph.create(textNode ? { content: [textNode] } : {});
        return asciidocSchema.topNodeType.create({ content: [paragraph] });
      } catch (fallbackError) {
        console.error('[AsciiDocEditor] Ошибка создания fallback документа:', fallbackError);
        return asciidocSchema.topNodeType.createAndFill();
      }
    }
  }

  /**
   * Создание состояния редактора с обработкой ошибок
   */
  private createEditorState(content: string) {
    try {
      const doc = this.safeParseContent(content);

      return EditorState.create({
        schema: asciidocSchema,
        doc,
        plugins: [
          keymap({
            'Mod-b': toggleMark(asciidocSchema.marks.strong),
            'Mod-i': toggleMark(asciidocSchema.marks.em),
            'Mod-`': toggleMark(asciidocSchema.marks.code),
          }),
          keymap(baseKeymap),
          history(),
        ],
      });
    } catch (stateError) {
      console.error('[AsciiDocEditor] Критическая ошибка создания состояния:', stateError);

      // Fallback - создаем пустое состояние
      return EditorState.create({
        schema: asciidocSchema,
        plugins: [keymap(baseKeymap), history()],
      });
    }
  }

  /**
   * Инициализация редактора
   */
  private initialize() {
    const { container, initialContent = '', placeholder = 'Начните писать AsciiDoc...', readOnly = false } = this.state.config;

    try {
      // Создаем контейнер для редактора
      const editorContainer = document.createElement('div');
      editorContainer.className = `asciidoc-editor ${this.state.config.className || ''}`;

      // Создаем элемент редактора
      const editorElement = document.createElement('div');
      editorElement.className = 'editor';
      editorElement.style.cssText = `
        position: relative;
        min-height: 200px;
        padding: 1rem;
        border: 2px solid var(--border-color, #dee2e6);
        border-radius: var(--border-radius, 8px);
        background-color: white;
      `;

      editorContainer.appendChild(editorElement);
      container.appendChild(editorContainer);

      // Создаем состояние редактора
      const state = this.createEditorState(initialContent);

      // Создаем EditorView
      const view = new EditorView(editorElement, {
        state,
        editable: () => !readOnly,
        attributes: {
          class: 'ProseMirror',
          'data-placeholder': placeholder,
        },
        dispatchTransaction: (transaction) => {
          this.handleTransaction(transaction);
        },
        handleDOMEvents: {
          focus: () => {
            this.setError(null); // Сбрасываем ошибки при фокусе
          },
          input: () => {
            // Сбрасываем состояние восстановления при вводе
            if (this.state.isRecovering) {
              this.setRecovering(false);
            }
          },
        },
      });

      this.state.view = view;

      // Добавляем обработчик клавиш
      editorElement.addEventListener('keydown', this.handleKeyDown.bind(this));

      // Создаем элементы интерфейса
      this.createErrorPanel();
      this.createPlaceholder();

      // Обновляем интерфейс
      this.updateInterface();

    } catch (initError) {
      console.error('[AsciiDocEditor] Критическая ошибка инициализации:', initError);
      this.setError('Не удалось инициализировать редактор');
    }
  }

  /**
   * Обработка транзакций редактора
   */
  private handleTransaction(transaction: any) {
    if (!this.state.view) return;

    try {
      const newState = this.state.view.state.apply(transaction);
      this.state.view.updateState(newState);

      // Отправляем изменения контента
      if (this.state.config.onChange) {
        try {
          const serializedContent = defaultAsciiDocSerializer.serialize(newState.doc);
          this.state.config.onChange(serializedContent);
        } catch (serializeError) {
          console.warn('[AsciiDocEditor] Ошибка сериализации:', serializeError);
          // Продолжаем работу даже при ошибке сериализации
          this.state.config.onChange('');
        }
      }

      this.updateInterface();
    } catch (transactionError) {
      console.error('[AsciiDocEditor] Ошибка обработки транзакции:', transactionError);
      this.setError('Ошибка обработки изменений');
    }
  }

  /**
   * Обработка нажатий клавиш
   */
  private handleKeyDown(event: KeyboardEvent) {
    if (!this.state.view || this.state.config.readOnly) return;

    const { state, dispatch } = this.state.view;

    switch (event.key) {
      case 'Enter':
        // Обработка Enter для заголовков
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          const headingCommand = setBlockType(asciidocSchema.nodes.heading, { level: 1 });
          if (headingCommand(state, dispatch)) {
            this.state.view.focus();
          }
        }
        break;
      case '2':
      case '3':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          const level = parseInt(event.key);
          const headingCommand = setBlockType(asciidocSchema.nodes.heading, { level });
          if (headingCommand(state, dispatch)) {
            this.state.view.focus();
          }
        }
        break;
      case 'b':
      case 'B':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          const boldCommand = toggleMark(asciidocSchema.marks.strong);
          if (boldCommand(state, dispatch)) {
            this.state.view.focus();
          }
        }
        break;
      case 'i':
      case 'I':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          const italicCommand = toggleMark(asciidocSchema.marks.em);
          if (italicCommand(state, dispatch)) {
            this.state.view.focus();
          }
        }
        break;
    }
  }

  /**
   * Создание панели ошибок
   */
  private createErrorPanel() {
    this.errorPanel = document.createElement('div');
    this.errorPanel.className = 'editor-error-panel';
    this.errorPanel.style.cssText = `
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
      padding: 0.75rem;
      margin-top: 0.5rem;
      color: #721c24;
      font-size: 0.9rem;
      display: none;
    `;

    const { container } = this.state.config;
    container.appendChild(this.errorPanel);
  }

  /**
   * Создание placeholder элемента
   */
  private createPlaceholder() {
    this.placeholderElement = document.createElement('div');
    this.placeholderElement.className = 'editor-placeholder';
    this.placeholderElement.style.cssText = `
      position: absolute;
      top: 1rem;
      left: 1rem;
      color: #6c757d;
      pointer-events: none;
      font-style: italic;
      display: none;
    `;

    const editorElement = this.state.config.container.querySelector('.editor');
    if (editorElement) {
      editorElement.appendChild(this.placeholderElement);
    }
  }

  /**
   * Обновление интерфейса на основе состояния
   */
  private updateInterface() {
    this.updateErrorPanel();
    this.updatePlaceholder();
    this.updateEditorAppearance();
  }

  /**
   * Обновление панели ошибок
   */
  private updateErrorPanel() {
    if (!this.errorPanel) return;

    if (this.state.error) {
      this.errorPanel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>⚠️ ${this.state.error}</span>
          <button id="recovery-btn" style="
            padding: 0.25rem 0.5rem;
            background-color: #dc3545;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: ${this.state.isRecovering ? 'not-allowed' : 'pointer'};
            font-size: 0.8rem;
          " ${this.state.isRecovering ? 'disabled' : ''}>
            ${this.state.isRecovering ? 'Восстановление...' : 'Восстановить'}
          </button>
        </div>
      `;

      // Добавляем обработчик кнопки восстановления
      const recoveryBtn = this.errorPanel.querySelector('#recovery-btn') as HTMLButtonElement;
      if (recoveryBtn) {
        recoveryBtn.addEventListener('click', this.handleRecovery.bind(this));
      }

      this.errorPanel.style.display = 'block';
    } else {
      this.errorPanel.style.display = 'none';
    }
  }

  /**
   * Обновление placeholder
   */
  private updatePlaceholder() {
    if (!this.placeholderElement) return;

    const hasContent = this.state.view && this.state.view.state.doc.textContent.trim().length > 0;
    const hasError = !!this.state.error;

    if (!hasContent && !hasError) {
      this.placeholderElement.textContent = this.state.config.placeholder || 'Начните писать AsciiDoc...';
      this.placeholderElement.style.display = 'block';
    } else {
      this.placeholderElement.style.display = 'none';
    }
  }

  /**
   * Обновление внешнего вида редактора
   */
  private updateEditorAppearance() {
    const editorElement = this.state.config.container.querySelector('.editor') as HTMLElement;
    if (!editorElement) return;

    if (this.state.error) {
      editorElement.style.backgroundColor = '#fff5f5';
      editorElement.classList.add('editor--error');
    } else {
      editorElement.style.backgroundColor = 'white';
      editorElement.classList.remove('editor--error');
    }

    if (this.state.isRecovering) {
      editorElement.classList.add('editor--recovering');
    } else {
      editorElement.classList.remove('editor--recovering');
    }
  }

  /**
   * Попытка восстановления после ошибки
   */
  private handleRecovery() {
    this.setRecovering(true);
    this.setError(null);

    if (this.state.view) {
      try {
        // Попытка пересоздания состояния с текущим контентом
        const currentContent = defaultAsciiDocSerializer.serialize(this.state.view.state.doc);
        const newState = this.createEditorState(currentContent);
        this.state.view.updateState(newState);
        this.setRecovering(false);
        this.updateInterface();
      } catch (recoveryError) {
        console.error('[AsciiDocEditor] Ошибка восстановления:', recoveryError);
        this.setError('Не удалось восстановить редактор');
        this.setRecovering(false);
        this.updateInterface();
      }
    }
  }

  /**
   * Установка состояния ошибки
   */
  private setError(error: string | null) {
    this.state.error = error;
  }

  /**
   * Установка состояния восстановления
   */
  private setRecovering(isRecovering: boolean) {
    this.state.isRecovering = isRecovering;
  }

  /**
   * Обновление контента извне
   */
  public updateContent(content: string) {
    if (this.state.view && this.state.view.state) {
      try {
        const currentContent = defaultAsciiDocSerializer.serialize(this.state.view.state.doc);
        if (currentContent !== content) {
          const newState = this.createEditorState(content);
          this.state.view.updateState(newState);
          this.updateInterface();

          // Вызываем onChange callback для синхронизации output textarea
          if (this.state.config.onChange) {
            this.state.config.onChange(content);
          }
        }
      } catch (updateError) {
        console.warn('[AsciiDocEditor] Ошибка обновления контента:', updateError);
      }
    }
  }

  /**
   * Получение текущего контента
   */
  public getContent(): string {
    if (this.state.view) {
      try {
        return defaultAsciiDocSerializer.serialize(this.state.view.state.doc);
      } catch (error) {
        console.warn('[AsciiDocEditor] Ошибка получения контента:', error);
        return '';
      }
    }
    return '';
  }

  /**
   * Установка фокуса на редактор
   */
  public focus() {
    if (this.state.view) {
      this.state.view.focus();
    }
  }

  /**
   * Уничтожение редактора
   */
  public destroy() {
    if (this.state.view) {
      this.state.view.destroy();
      this.state.view = null;
    }

    // Удаляем созданные элементы
    if (this.errorPanel && this.errorPanel.parentNode) {
      this.errorPanel.parentNode.removeChild(this.errorPanel);
    }

    const { container } = this.state.config;
    const editorContainer = container.querySelector('.asciidoc-editor');
    if (editorContainer && editorContainer.parentNode) {
      editorContainer.parentNode.removeChild(editorContainer);
    }
  }
}

export default AsciiDocEditor;