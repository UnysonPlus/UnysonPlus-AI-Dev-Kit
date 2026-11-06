# The Kit Assistant — the dashboard chat

The chat at **`http://localhost:4600/#chat`** in the kit dashboard. It is a tool-using
assistant for conversions, the kit's own docs and Kinetic Scenes projects: on its own it is **not** a coding agent, and
for a project it hands the work to the Kinetic Scenes agent behind one Confirm. This file is the reference
for how it is built, so a change to it keeps the pieces in step.

Public manual: **https://unysonplus.github.io/docs/extensions/site-converter/kit-assistant**

## Where the pieces live

All paths under `assembled/UnysonPlus-Capture-Service/tools/design-capture/` (the **kit** copy — the
one the user runs; the `Github Repository` clone is push-only).

| File | What it holds |
|---|---|
| `chat-tools.mjs` | The four **read-only** tools: `look_at_url`, `conversion_report`, `search_docs`, `read_doc`. Also `captureSummaryForChat` (injected as context, not a tool). |
| `chat-actions.mjs` | The **gated** tools: `start_capture`, `hand_to_studio`, `work_on_project` (all propose), plus read-only `capture_status` and `list_projects`. `runChatToolGated` is the single entry point; `ALL_CHAT_TOOL_DEFS` is the full set. |
| `to-ai.mjs` | `chatWithTools` — the loop, per backend. Image handling and the native Anthropic path. |
| `serve.mjs` | `POST /local-ai/chat`, `/chat-command`, `/chat-history`, `/chat-clear`, `/chat-confirm`, `/chat-job`; `chatAgent`; attachment storage; the `CHAT_COMMANDS` table. |
| `dashboard/server.mjs` | Proxies `/api/local-ai/chat*` to the service. Serves `/artifact/_chat/<file>`. |
| `dashboard/index.html` | The chat view: composer, attachments, the `/command` menu, `CHAT_CMDS`. |

## The loop, per backend

`chatWithTools({ messages, tools, runTool, context })` keeps the **last 12 turns**
(`CHAT_CONTEXT_TURNS`) and runs at most **6 rounds** (`CHAT_TOOL_ROUNDS`). On the last round the tools
are withheld so the model answers with what it gathered instead of asking for one more.

- **`api`** → `chatAnthropicNative`. Real Messages-API `tool_use` / `tool_result` blocks and real
  image blocks. This is the good path: images arrive as images.
- **`ollama` / `endpoint`** → native tool calls. Images ride as `images: [...]` on the message;
  `localChat` narrows them to bare base64 for Ollama, while `endpointChatRaw` emits OpenAI
  `image_url` parts. A provider that refuses native tools falls back to `textToolLoop`.
- **`claude-code`** → `textToolLoop`, the `TOOL {…}`-in-prose protocol, because the CLI takes a text
  prompt. An attached image is passed **by file path** for the CLI to open.

### Why the text protocol exists, and what it costs

`textToolLoop` flattens the conversation into one string. That is fine for text and impossible for
images — which is why `api` got its own native path rather than having image blocks bolted onto the
flattening loop.

## Attachments

Shape on a message: `images: [{ mime, b64, name, path }]`. `content` stays a plain string throughout;
`images` rides alongside it. Everything that maps messages must carry it (this is the trap — there
were four places that did `String(m.content)` and dropped it).

**Storage.** `storeChatImages()` in `serve.mjs` decodes the base64 once, writes the bytes to
`<capture-out>/_chat/upload-<id>.<ext>`, and returns both the model's copy (with `path`) and a small
`{ name, mime, file, bytes }` **ref** for the history. The history stores only refs — base64 in a
200-message history would be hundreds of megabytes. On a later turn the page sends the ref back and
the service reloads the bytes from disk, so an image stays in the conversation without re-uploading.

Limits: PNG / JPEG / GIF / WebP, **4 per message**, 8 MB each decoded. The page downscales to
1568px on the long edge first (PNG kept for screenshots, JPEG for photos, GIF untouched so the
animation survives).

**Vision check.** `modelSeesImages(tag)` consults `LOCAL_AI_MODELS` (the `vision: true` flag) and
falls back to naming patterns. Unknown means **no**, and the attachment is refused with a message
naming a model that would work — a text-only model handed an image answers confidently about nothing.

### The gotchas on the `claude-code` path

The first two produced a confident refusal rather than an error, so they are easy to re-introduce:

1. **`--allowedTools Read`.** Without it the CLI asks for permission that nobody can grant in a
   non-interactive run, and replies "I need permission to open the image". `--max-turns` is also
   raised so it can read *and then* answer.
2. **`tailNote` goes after the tool list.** The system brief says the assistant's tools are read-only
   and lists them. A note about `Read` placed *before* that list is read as describing the kit's tools,
   and the model concludes `Read` "isn't actually available in this environment". Appended **last**,
   after the tool list, it works. That is what `tailNote` in `textToolLoop` is for.
3. **A one-turn call must not offer tools.** `--max-turns 1` with tools available let the model reach for one while
   writing a long scene: the turn ran out and the answer was lost (`error_max_turns`, after minutes of work). One-turn
   calls go through `runClaudeOneTurn`, which adds `--tools "" --strict-mcp-config`. MCP tools count too: `--tools ""` alone
   did not stop it.

## Commands

A typed `/command` runs **one tool directly**, with no model in the loop — deterministic, instant,
and equally reliable on a small local model that would otherwise need persuading to pick the right
tool. `POST /local-ai/chat-command { command, arg }`.

The table is **`CHAT_COMMANDS` in `serve.mjs`** (tool, argument mapping, the line shown above the
result) and **`CHAT_CMDS` in `index.html`** (the menu: name, argument hint, description). **Adding a
command means editing both** — the page will not offer one the service does not know, and the service
will reject one the page invents.

`/clear` and `/help` are answered in the page and never reach the service. A `/help` message is marked
`local: true`, and `chatMerge()` folds local messages back in when the history is reloaded — without
that, the help text vanished the moment the next command ran.

A command goes through `runChatToolGated` like any model call, so `/capture` returns a **proposal**
awaiting Confirm; it does not start a capture.

## Working on a Kinetic Scenes project

`work_on_project` proposes; **Confirm** runs `chatAgent.start` in `serve.mjs`, which is `startAgent` from
`studio-agent.mjs`, the same run as the Studio's Create button and AI assist in steps (see `kinetic-workspace.md`).

- The Confirm's history message carries `agentJob: { id, project, snapshot, fresh, link, state }`.
- The page polls `GET /api/local-ai/chat-job?id=` every 1.5 s while a job is `running`, and shows its steps and Stop.
  `POST { id, action: 'stop' }` stops it; `POST { project, snapshot, action: 'restore' }` is **Put it back**.
- **The service, not the page, writes the result into the history** (a timer in `chatAgent.start`), so a closed tab loses
  nothing. A 404 from `chat-job` means the kit restarted and the run stopped.
- **`POST /local-ai/chat` replaces the saved history with the `messages` it is sent.** The page always sends the whole
  conversation; a script calling it directly overwrites the chat.

## Rules that must not drift

- **Nothing that changes something runs inside the model's turn.** A write tool returns a proposal;
  only the person's click runs it, once, within 30 minutes. For `work_on_project`, that one click approves the whole
  run, because an agent cannot ask before every edit: it is limited to the project's folder, the scene is copied first,
  and rendering, pushing and live sites stay out of its reach.
- **The chat endpoints answer the dashboard only** (`chatOriginOk`). Without that, any page open in
  the same browser could drive the tools or confirm a proposal by reading its id from a reply.
- **Tool results are capped** — 9000 chars to the model (`RESULT_MAX`), 1200 in stored history.
