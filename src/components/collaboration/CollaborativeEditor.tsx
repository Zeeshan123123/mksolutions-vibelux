'use client'

interface CollaborativeEditorProps {
  projectId?: string;
  initialContent?: string;
  className?: string;
  [key: string]: any;
}

export function CollaborativeEditor(props: CollaborativeEditorProps) {
  return (
    <div className="p-8 text-center text-gray-500">
      <p>Collaborative editor is currently disabled for performance optimization.</p>
    </div>
  )
}