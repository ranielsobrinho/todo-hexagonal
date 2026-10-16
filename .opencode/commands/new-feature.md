---
description: Scaffold a new todo feature across all hexagonal layers, with tests
agent: build
---

Add the feature `$ARGUMENTS` to this hexagonal project end to end, following the conventions in `AGENTS.md`.

1. Read `AGENTS.md` and an existing analogous feature (`CreateTodo` / `UpdateTodo`) and mirror its exact structure.
2. **Domain**: create `src/domain/contracts/todo/<Name>Contract.ts`; update `src/domain/entities/Todo.ts` or the `TodoRepository` port in `src/domain/repositories/ITodoRepository.ts` only if needed.
3. **Use case**: create `src/usecases/todo/<Name>UseCase.ts` implementing the contract with a constructor-injected `TodoRepository`; throw `ApplicationError` with an appropriate code for business-rule violations.
4. **HTTP**: controller in `src/interfaces/controllers/<Name>Controller.ts`, factory in `src/interfaces/http/factories/controllers/make<Name>Controller.ts`, register it in `makeTodoControllers.ts`, and add the route (inline JSON Schema + `rateLimit`) in `src/interfaces/http/routes/todoRoutes.ts`.
5. **gRPC** (if applicable): update `proto/todo.proto`, run `pnpm proto:generate`, add the handler in `src/interfaces/grpc/controllers/`, and register it in `makeTodoHandlers.ts` and `src/interfaces/grpc/routes/todoService.ts`.
6. **Tests**: a unit test for the use case (and controller/handler) under the matching `tests/unit/...` folder, plus an e2e test in `tests/e2e/`. Reuse helpers from `tests/support/`.
7. Run `pnpm format`, then `pnpm typecheck:tests` and `pnpm test` until green.

If the route/RPC shape (method, path, request/response) is not already specified, ask me to confirm it before writing code. Use `.js` suffixes on relative imports.
