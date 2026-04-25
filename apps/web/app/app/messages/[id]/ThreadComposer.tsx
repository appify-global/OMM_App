"use client";

import { useState } from "react";

export default function ThreadComposer({
  recipient,
}: {
  recipient: string;
}) {
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<string[]>([]);

  const send = () => {
    const value = draft.trim();
    if (!value) return;
    setSent((prev) => [...prev, value]);
    setDraft("");
  };

  return (
    <div className="thread-composer">
      {sent.length > 0 ? (
        <ul className="thread-entries thread-entries--ephemeral" role="list">
          {sent.map((body, i) => (
            <li key={i} className="thread-entry is-out is-run-first">
              <header className="thread-entry-head">
                <span className="thread-entry-name">You</span>
                <span className="thread-entry-rule" aria-hidden="true" />
                <span className="thread-entry-time">Just now</span>
              </header>
              <p className="thread-entry-body">{body}</p>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="thread-composer-bar">
        <button
          type="button"
          className="thread-composer-attach"
          aria-label="Attach file"
        >
          ＋
        </button>
        <textarea
          className="thread-composer-input"
          placeholder={"Reply to " + recipient + "…"}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
        />
        <button
          type="button"
          className="thread-composer-send"
          onClick={send}
          aria-label="Send"
          disabled={!draft.trim()}
        >
          ➤
        </button>
      </div>
      <p className="thread-composer-hint">
        ⌘↵ to send · Drop files to attach · Use <em>/soi</em> or{" "}
        <em>/listing</em> for shortcuts
      </p>
    </div>
  );
}
