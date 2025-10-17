'use client'

interface CollaborativeCanvasProps {
  projectId?: string;
  initialObjects?: any[];
  className?: string;
  [key: string]: any;
}

export function CollaborativeCanvas(props: CollaborativeCanvasProps) {
  return (
    <div className="p-8 text-center text-gray-500">
      <p>Collaborative canvas is currently disabled for performance optimization.</p>
    </div>
  )
}