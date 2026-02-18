import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";

interface UserAvatarProps {
  username: string;
  color: string;
  size?: "sm" | "md";
  showName?: boolean;
  className?: string;
}

export function UserAvatar({
  username,
  color,
  size = "md",
  showName = false,
  className,
}: UserAvatarProps) {
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Avatar
        className={cn("ring-2 ring-background", size === "sm" ? "size-7" : "size-9")}
        style={{ backgroundColor: color }}
        title={username}
      >
        <AvatarFallback
          className="text-white font-semibold bg-transparent"
          style={{ fontSize: size === "sm" ? "0.65rem" : "0.75rem" }}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      {showName && (
        <span className="text-sm text-foreground font-medium truncate max-w-[120px]">
          {username}
        </span>
      )}
    </div>
  );
}
