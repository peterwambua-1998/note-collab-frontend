import { useParams, useSearchParams, useNavigate } from "react-router";
import { EditorContent } from "@tiptap/react";
import { useState, useEffect } from "react";
import type { Route } from "./+types/note";
import { useSocket } from "~/hooks/useSocket";
import { useCollabEditor } from "~/hooks/useCollabEditor";
import { EditorToolbar } from "~/components/EditorToolbar";
import { UserAvatar } from "~/components/UserAvatar";
import { ConnectionStatus } from "~/components/ConnectionStatus";
import { ShareButton } from "~/components/ShareButton";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { FileText, ChevronLeft, AlertCircle } from "lucide-react";

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Note ${params.roomId} — Collab Notes` }];
}

export default function NotePage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [username, setUsername] = useState(() => {
    return (
      searchParams.get("username") ||
      localStorage.getItem("collab-username") ||
      ""
    );
  });
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(!username);
  const [usernameInput, setUsernameInput] = useState("");

  // Persist username so refreshing the page doesn't lose it
  useEffect(() => {
    if (username) localStorage.setItem("collab-username", username);
  }, [username]);

  const { socket, isConnected, isJoined, users, myUserData, error } = useSocket({
    roomId: roomId!,
    username: username || "Anonymous",
  });

  const { editor, isSynced } = useCollabEditor({
    socket,
    roomId: roomId!,
    myUserData,
    isJoined,
  });

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    setUsername(usernameInput.trim());
    setShowUsernamePrompt(false);
  };

  // ── Username prompt (shown when opening a shared link directly) ──
  if (showUsernamePrompt) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="size-5 text-primary" />
              <CardTitle className="text-lg">Join note</CardTitle>
            </div>
            <CardDescription>
              Enter your name to start collaborating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUsernameSubmit} className="space-y-3">
              <Input
                autoFocus
                placeholder="Your name"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
              />
              <Button
                type="submit"
                disabled={!usernameInput.trim()}
                className="w-full"
              >
                Join
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">

      {/* Top bar */}
      <header className="bg-background border-b px-4 py-2.5 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={() => navigate("/")}
          title="Back to home"
        >
          <ChevronLeft />
        </Button>

        <Separator orientation="vertical" className="h-5" />

        {/* Room ID */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileText className="size-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-mono text-muted-foreground truncate">
            {roomId}
          </span>
        </div>

        {/* Collaborator avatars */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {users.slice(0, 5).map((user) => (
              <UserAvatar
                key={user.id}
                username={user.username}
                color={user.color}
                size="sm"
              />
            ))}
            {users.length > 5 && (
              <div className="size-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                +{users.length - 5}
              </div>
            )}
          </div>

          <ConnectionStatus
            isConnected={isConnected}
            isJoined={isJoined}
            isSynced={isSynced}
            userCount={users.length}
          />
        </div>

        <ShareButton roomId={roomId!} />
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Editor */}
      <main className="flex-1 flex justify-center py-8 px-4">
        <div className="w-full max-w-3xl space-y-3">
          <Card className="py-0 overflow-hidden">
            <EditorToolbar editor={editor} />
            <EditorContent editor={editor} className="min-h-[500px]" />
          </Card>

          {/* Footer */}
          <div className="flex items-center justify-between px-1">
            {myUserData && (
              <UserAvatar
                username={myUserData.username}
                color={myUserData.color}
                size="sm"
                showName
              />
            )}
            <p className="text-xs text-muted-foreground ml-auto">
              Syncs in real time · Not stored on any server
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
