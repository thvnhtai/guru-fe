"use client";

import { useEffect, useRef, useState } from "react";
import Editor, { loader, type OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import * as Y from "yjs";
import { useRoomStore } from "@/stores/roomStore";
import { MONACO_LANGUAGE_MAP } from "@/types/room";
import type { AwarenessState } from "@/types/yjs";
import type { WebsocketProvider } from "y-websocket";

// Use the locally installed monaco-editor instead of loading from CDN.
loader.config({ monaco });

type Awareness = WebsocketProvider["awareness"];

interface Props {
  yText: Y.Text | null;
  awareness?: Awareness | null;
  readOnly?: boolean;
}

// Inject per-user cursor CSS into <head> once per color.
// Monaco renders in the regular DOM so head styles apply.
const injectedColors = new Set<string>();
function injectCursorStyle(sessionId: string, color: string) {
  const key = `${sessionId}:${color}`;
  if (injectedColors.has(key)) return;
  injectedColors.add(key);

  const style = document.createElement("style");
  // Cursor bar: thin colored border-left on empty inline range
  style.textContent = [
    `.cursor-caret-${sessionId} {`,
    `  border-left: 2px solid ${color};`,
    `  margin-left: -1px;`,
    `}`,
    `.cursor-selection-${sessionId} {`,
    `  background: ${color}33;`, // 20% opacity
    `}`,
    `.cursor-label-${sessionId}::after {`,
    `  content: attr(data-name);`,
    `  position: absolute;`,
    `  top: -1.4em;`,
    `  left: 0;`,
    `  font-size: 11px;`,
    `  padding: 1px 4px;`,
    `  border-radius: 3px 3px 3px 0;`,
    `  background: ${color};`,
    `  color: #fff;`,
    `  white-space: nowrap;`,
    `  pointer-events: none;`,
    `}`,
  ].join("\n");
  document.head.appendChild(style);
}

export function CollaborativeEditor({ yText, awareness, readOnly = false }: Props) {
  const { language } = useRoomStore();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const isApplyingRemote = useRef(false);
  const decorationIds = useRef<string[]>([]);
  const [editorReady, setEditorReady] = useState(false);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
    setEditorReady(true);
  };

  // ── Monaco ↔ Y.Text CRDT binding ─────────────────────────────────────────
  useEffect(() => {
    const editor = editorRef.current;
    if (!editorReady || !editor || !yText) return;

    const model = editor.getModel();
    if (!model) return;

    const initial = yText.toString();
    if (model.getValue() !== initial) {
      isApplyingRemote.current = true;
      model.setValue(initial);
      isApplyingRemote.current = false;
    }

    // Monaco → Y.Text: map content-change events to Y.Text ops (end-to-start)
    // Skipped in observer mode — observers may not write to the shared doc.
    const monacoDisposable = readOnly
      ? { dispose: () => {} }
      : editor.onDidChangeModelContent((event) => {
          if (isApplyingRemote.current) return;
          Y.transact(yText.doc!, () => {
            const sorted = [...event.changes].sort(
              (a, b) => b.rangeOffset - a.rangeOffset
            );
            for (const change of sorted) {
              if (change.rangeLength > 0) yText.delete(change.rangeOffset, change.rangeLength);
              if (change.text) yText.insert(change.rangeOffset, change.text);
            }
          });
        });

    // Y.Text → Monaco: map Yjs delta ops to Monaco applyEdits (remote only)
    const onYTextChange = (event: Y.YTextEvent) => {
      if (event.transaction.local) return;
      const currentModel = editor.getModel();
      if (!currentModel) return;
      isApplyingRemote.current = true;
      try {
        const edits: monaco.editor.IIdentifiedSingleEditOperation[] = [];
        let index = 0;
        for (const op of event.delta) {
          if (op.retain !== undefined) {
            index += op.retain;
          } else if (op.insert !== undefined) {
            const text = op.insert as string;
            const pos = currentModel.getPositionAt(index);
            edits.push({
              range: new monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column),
              text,
            });
            index += text.length;
          } else if (op.delete !== undefined) {
            const start = currentModel.getPositionAt(index);
            const end = currentModel.getPositionAt(index + op.delete);
            edits.push({
              range: new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
              text: null,
            });
          }
        }
        if (edits.length > 0) currentModel.applyEdits(edits);
      } finally {
        isApplyingRemote.current = false;
      }
    };

    yText.observe(onYTextChange);
    return () => {
      monacoDisposable.dispose();
      yText.unobserve(onYTextChange);
    };
  }, [editorReady, yText, readOnly]);

  // ── Awareness: local cursor broadcast + remote cursor decorations ──────────
  useEffect(() => {
    const editor = editorRef.current;
    if (!editorReady || !editor || !awareness) return;

    // Broadcast local cursor position on every cursor move.
    // Observers do not broadcast — they remain invisible to collaborators.
    const cursorDisposable = readOnly
      ? { dispose: () => {} }
      : editor.onDidChangeCursorSelection((event) => {
          const model = editor.getModel();
          if (!model) return;
          const index = model.getOffsetAt(event.selection.getStartPosition());
          const endIndex = model.getOffsetAt(event.selection.getEndPosition());
          const localState = awareness.getLocalState() as { user?: AwarenessState } | null;
          if (!localState?.user) return;
          awareness.setLocalStateField("user", {
            ...localState.user,
            cursor: { index, length: Math.max(0, endIndex - index) },
          });
        });

    // Render remote cursors as Monaco decorations
    const updateDecorations = () => {
      const model = editor.getModel();
      if (!model) return;

      const decorations: monaco.editor.IModelDeltaDecoration[] = [];

      (awareness.getStates() as Map<number, { user?: AwarenessState }>).forEach(
        (state, clientId) => {
          if (clientId === awareness.clientID) return;
          const user = state.user;
          if (!user?.cursor) return;

          injectCursorStyle(user.sessionId, user.color);

          const { index, length } = user.cursor;
          const startPos = model.getPositionAt(index);

          if (length > 0) {
            // Selection range
            const endPos = model.getPositionAt(index + length);
            decorations.push({
              range: new monaco.Range(
                startPos.lineNumber,
                startPos.column,
                endPos.lineNumber,
                endPos.column
              ),
              options: { inlineClassName: `cursor-selection-${user.sessionId}` },
            });
          }

          // Cursor caret (zero-width decoration at start position)
          decorations.push({
            range: new monaco.Range(
              startPos.lineNumber,
              startPos.column,
              startPos.lineNumber,
              startPos.column
            ),
            options: { inlineClassName: `cursor-caret-${user.sessionId}` },
          });
        }
      );

      decorationIds.current = editor.deltaDecorations(
        decorationIds.current,
        decorations
      );
    };

    awareness.on("change", updateDecorations);
    updateDecorations(); // render current state immediately

    return () => {
      cursorDisposable.dispose();
      awareness.off("change", updateDecorations);
      // Clear decorations on cleanup
      if (editorRef.current) {
        decorationIds.current = editorRef.current.deltaDecorations(
          decorationIds.current,
          []
        );
      }
    };
  }, [editorReady, awareness, readOnly]);

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={MONACO_LANGUAGE_MAP[language]}
        onMount={handleMount}
        theme="vs"
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 12, bottom: 12 },
          fontFamily: "'Geist Mono', 'Fira Code', 'Cascadia Code', monospace",
          wordWrap: "on",
          tabSize: 2,
          readOnly,
        }}
      />
    </div>
  );
}
