import { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link as LinkIcon,
  Heading1,
  Heading2,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleLinkInsert = () => {
    if (linkUrl) {
      executeCommand('createLink', linkUrl);
      setShowLinkDialog(false);
      setLinkUrl('');
    }
  };

  const toolbarButtons = [
    { icon: Bold, command: 'bold', label: 'Bold', id: 'bold' },
    { icon: Italic, command: 'italic', label: 'Italic', id: 'italic' },
    { icon: Heading1, command: 'formatBlock', value: '<h1>', label: 'Heading 1', id: 'h1' },
    { icon: Heading2, command: 'formatBlock', value: '<h2>', label: 'Heading 2', id: 'h2' },
    { icon: List, command: 'insertUnorderedList', label: 'Bullet List', id: 'ul' },
    { icon: ListOrdered, command: 'insertOrderedList', label: 'Numbered List', id: 'ol' },
    { icon: AlignLeft, command: 'justifyLeft', label: 'Align Left', id: 'align-left' },
    { icon: AlignCenter, command: 'justifyCenter', label: 'Align Center', id: 'align-center' },
    { icon: AlignRight, command: 'justifyRight', label: 'Align Right', id: 'align-right' },
  ];

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
        {toolbarButtons.map((button) => {
          const Icon = button.icon;
          return (
            <button
              key={button.id}
              type="button"
              onClick={() => executeCommand(button.command, button.value)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title={button.label}
            >
              <Icon className="w-4 h-4 text-gray-700" />
            </button>
          );
        })}
        
        <button
          type="button"
          onClick={() => setShowLinkDialog(true)}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4 text-gray-700" />
        </button>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        className="min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none"
        style={{
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}
      />

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-gray-900 mb-4">Insert Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLinkInsert();
                }
              }}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkUrl('');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLinkInsert}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}