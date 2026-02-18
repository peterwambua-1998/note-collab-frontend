import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { Awareness, encodeAwarenessUpdate, applyAwarenessUpdate } from "y-protocols/awareness";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import { Placeholder } from "@tiptap/extensions";
import type { Socket } from "~/lib/socket";
import type { UserData } from "./useSocket";

interface UseCollabEditorOptions {
  socket: Socket | null;
  roomId: string;
  myUserData: UserData | null;
  isJoined: boolean;
}

export function useCollabEditor({
  socket,
  roomId,
  myUserData,
  isJoined,
}: UseCollabEditorOptions) {
  const ydocRef = useRef<Y.Doc>(new Y.Doc());
  const awarenessRef = useRef<Awareness>(new Awareness(ydocRef.current));
  const [isSynced, setIsSynced] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        undoRedo: false,
      }),
      Collaboration.configure({
        document: ydocRef.current,
      }),
      CollaborationCaret.configure({
        provider: { awareness: awarenessRef.current },
        user: myUserData
          ? { name: myUserData.username, color: myUserData.color }
          : { name: "Anonymous", color: "#999" },
      }),
      Placeholder.configure({
        placeholder: "Start writing your note...",
      }),
    ],
    editorProps: {
      attributes: { class: "focus:outline-none" },
    },
  });

  // When myUserData arrives (after socket join), update the caret user info
  useEffect(() => {
    if (!editor || !myUserData) return;
    editor.commands.updateUser({
      name: myUserData.username,
      color: myUserData.color,
    });
  }, [editor, myUserData]);

  // Sync Yjs updates via Socket.io
  useEffect(() => {
    if (!socket || !isJoined) return;

    const ydoc = ydocRef.current;
    const awareness = awarenessRef.current;

    // Send local doc changes to peers
    const onYjsUpdate = (update: Uint8Array, origin: unknown) => {
      if (origin !== "remote") {
        socket.emit("yjs-update", {
          roomId,
          update: Array.from(update),
        });
      }
    };

    // Apply incoming doc changes from peers
    const onRemoteUpdate = ({ update }: { update: number[] }) => {
      Y.applyUpdate(ydoc, new Uint8Array(update), "remote");
    };

    // Someone joined late and wants our current state
    const onSyncRequested = ({ from }: { from: string }) => {
      const state = Y.encodeStateAsUpdate(ydoc);
      socket.emit("send-sync", {
        to: from,
        roomId,
        state: Array.from(state),
      });
    };

    // We received full state from an existing peer
    const onReceiveSync = ({ state }: { state: number[] }) => {
      Y.applyUpdate(ydoc, new Uint8Array(state), "remote");
      setIsSynced(true);
    };

    // Send local awareness changes (cursor, selection) to peers
    const onAwarenessUpdate = () => {
      const update = Array.from(
        encodeAwarenessUpdate(awareness, [ydoc.clientID])
      );
      socket.emit("awareness-update", { roomId, update });
    };

    // Apply incoming awareness updates from peers
    const onRemoteAwareness = ({ update }: { update: number[] }) => {
      applyAwarenessUpdate(awareness, new Uint8Array(update), "remote");
    };

    ydoc.on("update", onYjsUpdate);
    socket.on("yjs-update", onRemoteUpdate);
    socket.on("sync-requested", onSyncRequested);
    socket.on("receive-sync", onReceiveSync);
    awareness.on("update", onAwarenessUpdate);
    socket.on("awareness-update", onRemoteAwareness);

    // Ask existing peers for their current state
    socket.emit("request-sync", { roomId });

    // Fall through to synced if we're the first in the room
    const syncTimeout = setTimeout(() => setIsSynced(true), 1500);

    return () => {
      ydoc.off("update", onYjsUpdate);
      socket.off("yjs-update", onRemoteUpdate);
      socket.off("sync-requested", onSyncRequested);
      socket.off("receive-sync", onReceiveSync);
      awareness.off("update", onAwarenessUpdate);
      socket.off("awareness-update", onRemoteAwareness);
      clearTimeout(syncTimeout);
    };
  }, [socket, roomId, isJoined]);

  return { editor, ydoc: ydocRef.current, isSynced };
}
