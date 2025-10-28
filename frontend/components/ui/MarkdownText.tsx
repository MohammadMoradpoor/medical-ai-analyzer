'use client'

/**
 * Simple Markdown Text Component
 * Renders markdown formatting without external dependencies
 */

interface MarkdownTextProps {
  content: string
  className?: string
}

export function MarkdownText({ content, className = '' }: MarkdownTextProps) {
  const renderMarkdown = (text: string) => {
    if (!text) return null

    const lines = text.split('\n')
    const elements: JSX.Element[] = []
    let inCodeBlock = false
    let codeBlockLines: string[] = []
    let codeBlockLang = ''

    lines.forEach((line, index) => {
      // Code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          elements.push(
            <pre key={`code-${index}`} className="bg-gray-900 text-gray-100 rounded-lg p-3 my-2 overflow-x-auto">
              <code className="text-sm font-mono">{codeBlockLines.join('\n')}</code>
            </pre>
          )
          codeBlockLines = []
          inCodeBlock = false
        } else {
          // Start code block
          codeBlockLang = line.substring(3).trim()
          inCodeBlock = true
        }
        return
      }

      if (inCodeBlock) {
        codeBlockLines.push(line)
        return
      }

      // Headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-base font-bold text-gray-900 mt-3 mb-2">
            {line.substring(4)}
          </h3>
        )
        return
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-lg font-bold text-gray-900 mt-4 mb-2">
            {line.substring(3)}
          </h2>
        )
        return
      }
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-xl font-bold text-gray-900 mt-4 mb-3">
            {line.substring(2)}
          </h1>
        )
        return
      }

      // Lists
      if (line.match(/^[\-\*]\s/)) {
        const content = line.substring(2)
        elements.push(
          <li key={index} className="ml-4 mb-1">
            {formatInlineMarkdown(content)}
          </li>
        )
        return
      }

      if (line.match(/^\d+\.\s/)) {
        const content = line.replace(/^\d+\.\s/, '')
        elements.push(
          <li key={index} className="ml-4 mb-1 list-decimal">
            {formatInlineMarkdown(content)}
          </li>
        )
        return
      }

      // Empty lines
      if (line.trim() === '') {
        elements.push(<div key={index} className="h-2" />)
        return
      }

      // Regular paragraphs
      elements.push(
        <p key={index} className="mb-2">
          {formatInlineMarkdown(line)}
        </p>
      )
    })

    return <div className={className}>{elements}</div>
  }

  const formatInlineMarkdown = (text: string) => {
    const parts: (string | JSX.Element)[] = []
    let currentText = text
    let keyCounter = 0

    // Bold **text**
    currentText = currentText.replace(/\*\*(.*?)\*\*/g, (match, p1) => {
      const key = `bold-${keyCounter++}`
      parts.push(<strong key={key} className="font-bold">{p1}</strong>)
      return `__PLACEHOLDER_${key}__`
    })

    // Italic *text*
    currentText = currentText.replace(/\*(.*?)\*/g, (match, p1) => {
      const key = `italic-${keyCounter++}`
      parts.push(<em key={key} className="italic">{p1}</em>)
      return `__PLACEHOLDER_${key}__`
    })

    // Inline code `code`
    currentText = currentText.replace(/`(.*?)`/g, (match, p1) => {
      const key = `code-${keyCounter++}`
      parts.push(
        <code key={key} className="bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded text-sm font-mono">
          {p1}
        </code>
      )
      return `__PLACEHOLDER_${key}__`
    })

    // Split by placeholders and reconstruct
    const segments = currentText.split(/(__PLACEHOLDER_.*?__)/g)
    
    return segments.map((segment, index) => {
      if (segment.startsWith('__PLACEHOLDER_')) {
        const key = segment.replace('__PLACEHOLDER_', '').replace('__', '')
        const element = parts.find(p => typeof p === 'object' && p.key === key)
        return element || segment
      }
      return segment
    })
  }

  return renderMarkdown(content)
}

