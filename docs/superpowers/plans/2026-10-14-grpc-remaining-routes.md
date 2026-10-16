# gRPC remaining routes (Update/Delete/Finish) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the gRPC `TodoService` with the three routes that already exist over HTTP: `UpdateTodo` and `DeleteTodo` implemented by the agent, `FinishTodo` implemented by the user with guided help.

**Architecture:** Same pattern as the existing gRPC routes — `proto/todo.proto` → `ts-proto` codegen → thin handler in `src/interfaces/grpc/controllers` → wiring in `routes/todoService.ts` + `factories/makeTodoHandlers.ts` → unit tests (callback mock) + e2e tests (real client). `Delete`/`Finish` respond `google.protobuf.Empty`, mirroring HTTP 204. One commit per route, each verified green (typecheck + tests) before committing.

**Tech Stack:** `@grpc/grpc-js`, `ts-proto`/`grpc-tools`, Vitest, TypeScript NodeNext (ESM).

**Execution:** inline, one commit per route (`feat: add update todo grpc route`, `feat: add delete todo grpc route`, user commits `FinishTodo`).

---

## Decisions

- **One route per commit, always green.** Each route adds its proto RPC in the same commit as its handler/wiring/tests, so `tsc` never sees a service method without an implementation. The user's practice includes editing the proto themselves.
- **`google.protobuf.Empty`** for `DeleteTodo`/`FinishTodo` (chosen by user), faithful to HTTP 204.
- **`importSuffix=.js`** added to `proto:generate` when the proto first imports another file: ts-proto emits extensionless relative imports by default (`importSuffix: ""`), which breaks NodeNext/ESM (`tsconfig.json` uses `module: NodeNext`). Verified the option only affects relative proto imports (not `@grpc/grpc-js` / `@bufbuild/protobuf/wire`) and that `parseParameter` accepts `.js`.
- **WKT resolution verified:** grpc-tools' `protoc` resolves `google/protobuf/empty.proto` with only `--proto_path=.` (tested empirically against a proto importing WKTs). No script change beyond `importSuffix`.
- **No new validation in gRPC handlers** — consistent with `CreateTodoHandler`/`GetTodoByIdHandler`: use cases raise `VALIDATION_ERROR`/`NOT_FOUND`, `toGrpcError` maps them to `INVALID_ARGUMENT`/`NOT_FOUND`.
- **Commits:** user requested one commit per route (agent does Update + Delete commits; user commits Finish).

## Gotchas

- NodeNext imports require `.js` extensions everywhere, including test files and generated-code imports.
- Vitest transpiles without typechecking — only `npx tsc --noEmit` / `pnpm typecheck:tests` catch wiring gaps.
- Generated code is gitignored (`src/interfaces/grpc/generated/`); never commit it. `empty.ts` appears under `generated/google/protobuf/` after the Delete route's codegen.
- E2E delete test must be appended **after** the pagination test (it removes a todo from the shared `FakeTodoRepository`).
- `docs/` was untracked before this plan; it gets committed with the first commit here.

---

## Task 1: Save this plan

- [x] Write `docs/superpowers/plans/2026-10-14-grpc-remaining-routes.md`

## Task 2: UpdateTodo route (proto → red test → handler → wiring → e2e → docs → commit)

**Files:**

- Modify: `proto/todo.proto`
- Create: `tests/unit/grpc/update-todo-handler.test.ts`
- Create: `src/interfaces/grpc/controllers/UpdateTodoHandler.ts`
- Modify: `src/interfaces/grpc/routes/todoService.ts`
- Modify: `src/interfaces/grpc/factories/makeTodoHandlers.ts`
- Modify: `tests/e2e/grpc.routes.test.ts`
- Modify: `README.md` (gRPC table row + grpcurl example)

- [ ] **Step 1: proto + codegen** — add to `proto/todo.proto`:

```proto
message UpdateTodoRequest {
  string id = 1;
  string name = 2;
}
```

and `rpc UpdateTodo (UpdateTodoRequest) returns (Todo);` in the service. Run `pnpm proto:generate`; confirm `updateTodo` appears in `TodoServiceServer`/`TodoServiceClient`.

- [ ] **Step 2: failing unit test** — create `tests/unit/grpc/update-todo-handler.test.ts` (full code in plan chat), run `pnpm test:unit` → FAIL (module not found).
- [ ] **Step 3: handler** — create `src/interfaces/grpc/controllers/UpdateTodoHandler.ts`:

```ts
import type { UpdateTodoContract } from '../../../domain/contracts/todo/UpdateTodoContract.js'
import { TodoPresenter } from '../../presenters/TodoPresenter.js'
import { toGrpcError } from '../errors/grpcErrorMapper.js'
import type { TodoServiceServer } from '../generated/proto/todo.js'

export class UpdateTodoHandler {
  constructor(private readonly updateTodoUseCase: UpdateTodoContract) {}

  handle: TodoServiceServer['updateTodo'] = async (call, callback) => {
    try {
      const todo = await this.updateTodoUseCase.execute({
        id: call.request.id,
        name: call.request.name,
      })

      callback(null, TodoPresenter.toJSON(todo))
    } catch (error) {
      callback(toGrpcError(error))
    }
  }
}
```

Run `pnpm test:unit` → PASS.

- [ ] **Step 4: wiring** — `todoService.ts` adds `updateTodoHandler: UpdateTodoHandler` to `TodoServiceDependencies` and `updateTodo: deps.updateTodoHandler.handle` to `buildTodoService`; `makeTodoHandlers.ts` adds `updateTodoHandler: new UpdateTodoHandler(makeUpdateTodoUseCase(repository))`.
- [ ] **Step 5: e2e** — append `updates a todo by id` test (create → update → get asserts new name).
- [ ] **Step 6: README** — add `UpdateTodo` table row and grpcurl example.
- [ ] **Step 7: verify** — `pnpm test`, `npx tsc --noEmit`, `pnpm typecheck:tests`, `pnpm format`.
- [ ] **Step 8: commit** — `feat: add update todo grpc route`

## Task 3: DeleteTodo route (proto + Empty + importSuffix → red test → handler → wiring → e2e → docs → commit)

**Files:**

- Modify: `proto/todo.proto` (`import "google/protobuf/empty.proto";`, `DeleteTodoRequest`, `DeleteTodo` RPC)
- Modify: `package.json` (`proto:generate` gains `importSuffix=.js`)
- Create: `tests/unit/grpc/delete-todo-handler.test.ts`
- Create: `src/interfaces/grpc/controllers/DeleteTodoHandler.ts`
- Modify: `src/interfaces/grpc/routes/todoService.ts`
- Modify: `src/interfaces/grpc/factories/makeTodoHandlers.ts`
- Modify: `tests/e2e/grpc.routes.test.ts` (+ `type Empty` import from `generated/google/protobuf/empty.js`)
- Modify: `README.md`

- [ ] **Step 1: proto + script + codegen** — as above; verify `generated/google/protobuf/empty.ts` exists and `todo.ts` imports `Empty` from `../google/protobuf/empty.js`.
- [ ] **Step 2: failing unit test** → FAIL → **Step 3: handler**:

```ts
import type { DeleteTodoContract } from '../../../domain/contracts/todo/DeleteTodoContract.js'
import { toGrpcError } from '../errors/grpcErrorMapper.js'
import type { TodoServiceServer } from '../generated/proto/todo.js'

export class DeleteTodoHandler {
  constructor(private readonly deleteTodoUseCase: DeleteTodoContract) {}

  handle: TodoServiceServer['deleteTodo'] = async (call, callback) => {
    try {
      await this.deleteTodoUseCase.execute(call.request.id)

      callback(null, {})
    } catch (error) {
      callback(toGrpcError(error))
    }
  }
}
```

- [ ] **Step 4: wiring** — `deleteTodoHandler` in both files, factory `makeDeleteTodoUseCase`.
- [ ] **Step 5: e2e** — `deletes a todo and then reports NOT_FOUND` (create → delete → `{}` → get → NOT_FOUND), appended at the end of the describe.
- [ ] **Step 6: README** — `DeleteTodo` row + example.
- [ ] **Step 7: verify** → **Step 8: commit** — `feat: add delete todo grpc route`

## Task 4: FinishTodo — guided user practice (NO solution code in this plan)

The user writes everything. Agent gives per-step hints, references, and verification. Steps for the user:

1. Read `finishTodo` in `src/interfaces/grpc/generated/proto/todo.ts` (`handleUnaryCall<FinishTodoRequest, Empty>`) — wait, the RPC does not exist yet: **first add `FinishTodoRequest` + `rpc FinishTodo ... returns (google.protobuf.Empty)` to `proto/todo.proto`** and run `pnpm proto:generate` (full gRPC flow practice).
2. `npx tsc --noEmit` → wiring error is the checklist.
3. Create `src/interfaces/grpc/controllers/FinishTodoHandler.ts` (closest reference: `DeleteTodoHandler`; contract `FinishTodoContract.execute(id: string): Promise<void>`; factory `makeFinishTodoUseCase`).
4. Wire in **both** `routes/todoService.ts` (type + map) and `factories/makeTodoHandlers.ts`.
5. Unit test `tests/unit/grpc/finish-todo-handler.test.ts` (mirror `delete-todo-handler.test.ts`; also `done: true` e2e case).
6. E2E: create → `client.finishTodo({ id })` → `{}` → `getTodoById` shows `done: true`; unknown id → `NOT_FOUND`.
7. README row + grpcurl example.
8. Verify: `pnpm test`, `npx tsc --noEmit`, `pnpm typecheck:tests`, `pnpm format`.
9. User commits: `feat: add finish todo grpc route`.

**Pitfalls to remind:** wiring in both files; `callback(null, {})` not `callback(null)`; never throw — `callback(toGrpcError(error))`; `.js` on relative imports.

## Task 5: Final verification

- [ ] `pnpm proto:generate && pnpm test && npx tsc --noEmit && pnpm typecheck:tests && pnpm format:check` — all green, zero type errors.
