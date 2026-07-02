---
name: use-upstream-types-whole
description: Type against real upstream types taken whole (Cloudflare Think, shell, agents, ai) instead of Pick/Omit subsets or mirror interfaces. Use when declaring any prop, parameter, or exported type that describes an upstream domain shape (workspace, tools, messages, browser), when writing test/story fakes for those shapes, or when reviewing a diff that adds type algebra.
---

# Use Upstream Types Whole

## The rule

If a shape comes from an upstream framework (`@cloudflare/think`, `@cloudflare/shell`, `agents`, `ai`, `@cloudflare/codemode`), type against the real exported upstream type, whole. Consume only the keys you need at the call site and ignore the rest.

Never:

- `Pick<UpstreamType, ...>` / `Omit<UpstreamType, ...>` on domain types.
- Re-declared "narrow" interfaces that mirror a slice of an upstream shape.
- Narrowing a public type so that test or story mocks are easier to write. Tests adapt to the real types — types are never designed around tests.

## Patterns

**Accept the whole thing.** The component uses two methods? Fine — the type still says `Workspace | WorkspaceLike`, the implementation just calls the two methods:

```ts
/** Explorer only calls readDir/readFile and ignores the rest. */
export type WorkspaceSource = Workspace | WorkspaceLike;
```

**Optional capability on the bigger class:** use a union and an `in` check, not `Partial<Pick<...>>`:

```ts
if ("getWorkspaceInfo" in source) setInfo(await source.getWorkspaceInfo());
```

**Test and story fakes:** stub only the methods the code under test calls, then cast, with a one-line comment. Match the real parameter/return signatures on the stubs (a zero-arg stub for a one-arg upstream method breaks the cast's overlap check):

```ts
// WorkspaceSource is upstream's full shape; the explorer calls only these.
const source = {
  readDir: async (dir = "/") => listings[dir] ?? [],
  readFile: async (path: string): Promise<string | null> => null,
} as WorkspaceSource;
```

**Type derivation from upstream is encouraged** — it couples, it doesn't mirror: `InferUITools<WorkspaceTools>`, `Awaited<ReturnType<Workspace["getWorkspaceInfo"]>>`.

**Genuinely untyped upstream** (runtime zod only, e.g. skill tools): a hand-rolled mirror is the last resort. Document it as a mirror with a re-alignment note (see think-chat README's "Upstream source map").

## The one exception

Props-level `Omit` in React components stays allowed where it is load-bearing: resolving HTML attribute conflicts (`Omit<HTMLAttributes, "title">` for a `ReactNode` title prop) or blocking `children` from a component whose DOM a library owns. That is plumbing, not a domain shape.
