import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { Badge } from "~/components/ui/badge";

interface ConnectionStatusProps {
  isConnected: boolean;
  isJoined: boolean;
  isSynced: boolean;
  userCount: number;
}

export function ConnectionStatus({
  isConnected,
  isJoined,
  isSynced,
  userCount,
}: ConnectionStatusProps) {
  if (!isConnected) {
    return (
      <Badge variant="destructive" className="gap-1.5">
        <WifiOff className="size-3" />
        Disconnected
      </Badge>
    );
  }

  if (!isJoined || !isSynced) {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <Loader2 className="size-3 animate-spin" />
        {!isJoined ? "Joining..." : "Syncing..."}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="gap-1.5 border-green-200 bg-green-50 text-green-700"
    >
      <Wifi className="size-3" />
      {userCount > 1 ? `${userCount} online` : "Live"}
    </Badge>
  );
}
