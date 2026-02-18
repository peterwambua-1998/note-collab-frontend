import { useState } from "react";
import { useNavigate } from "react-router";
import { FileText, Users, ArrowRight, Zap } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";

export function meta() {
  return [
    { title: "Collab Notes — P2P Collaborative Editing" },
    { name: "description", content: "Real-time peer-to-peer collaborative note taking" },
  ];
}

function generateRoomId() {
  return (
    Math.random().toString(36).substring(2, 8) +
    Math.random().toString(36).substring(2, 8)
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [joinId, setJoinId] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const validateUsername = () => {
    if (!username.trim()) {
      setUsernameError("Please enter your name first");
      return false;
    }
    setUsernameError("");
    return true;
  };

  const handleCreate = () => {
    if (!validateUsername()) return;
    const roomId = generateRoomId();
    navigate(`/note/${roomId}?username=${encodeURIComponent(username.trim())}`);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUsername()) return;
    if (!joinId.trim()) return;
    // Support pasting a full URL or just the ID
    const id = joinId.trim().split("/note/").pop() || joinId.trim();
    navigate(`/note/${id}?username=${encodeURIComponent(username.trim())}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center gap-2 border-b">
        <FileText className="size-5 text-primary" />
        <span className="font-semibold text-foreground">Collab Notes</span>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">

          {/* Hero */}
          <div className="text-center space-y-3">
            <Badge variant="secondary" className="gap-1.5">
              <Zap className="size-3" />
              Peer-to-peer · No data stored
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight">
              Write together,{" "}
              <span className="text-muted-foreground">in real time</span>
            </h1>
            <p className="text-muted-foreground">
              Collaborative notes that sync instantly between browsers. No account needed.
            </p>
          </div>

          {/* Card */}
          <Card className="py-0 overflow-hidden">
            <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle className="text-base">Get started</CardTitle>
              <CardDescription>
                Enter your name then create or join a note
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 pb-6 space-y-4">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Your name
                </label>
                <Input
                  placeholder="e.g. Alice"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setUsernameError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  aria-invalid={!!usernameError}
                />
                {usernameError && (
                  <p className="text-destructive text-xs">{usernameError}</p>
                )}
              </div>

              {/* Create button */}
              <Button className="w-full" onClick={handleCreate}>
                <FileText />
                Create new note
                <ArrowRight className="ml-auto" />
              </Button>

              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">
                  or join existing
                </span>
                <Separator className="flex-1" />
              </div>

              {/* Join form */}
              <form onSubmit={handleJoin} className="flex gap-2">
                <Input
                  placeholder="Paste note link or ID"
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={!joinId.trim()}
                  className="gap-1.5"
                >
                  <Users />
                  Join
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Feature pills */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Real-time sync", desc: "Changes appear instantly" },
              { label: "Private", desc: "No data on servers" },
              { label: "Shareable", desc: "One link to collaborate" },
            ].map(({ label, desc }) => (
              <div
                key={label}
                className="rounded-lg border bg-card p-3 space-y-0.5"
              >
                <p className="text-xs font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
