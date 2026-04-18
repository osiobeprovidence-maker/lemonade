import { MessageSquare } from 'lucide-react';

interface CommentsProps {
  targetId: string;
  type: 'series' | 'chapter';
}

export function Comments({ targetId, type }: CommentsProps) {
  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-6 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <MessageSquare className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-bold">Comments live in the current Lemonade app shell</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        This legacy component no longer writes to Firebase. Open the current reader or series screen to view comments for {type} {targetId}.
      </p>
    </div>
  );
}
