# Lumina — Next Steps

**Goal:** Lumina compiles its own compiler.

**Definition of done:** the bootstrap fixpoint holds — a Lumina-authored compiler,
compiled by itself, produces byte-identical output on the next round (see
[Bootstrap protocol](#7-bootstrap-protocol)).

---

## 0. Where things stand

Working today:

- Parser combinator library (`src/lumina/parser/`) — scannerless, backtracking, `cut` for commit points
- AST → IR → JS pipeline with a real IR layer
- Namespaces, classes (fields, `extends`), methods, `let` assign, `<-` reassign
- Arithmetic, relational and boolean binaries, with grouping preserved via parenthesization
- `if` / `else if` / `else`
- `println`, string literals, lambdas, `new`, method calls, `++`/`--`
- Unit tests on parsers; integration tests that compile, execute, and diff stdout

The honest summary: **Lumina can compile a script. It cannot yet compile a program.**
The gap to self-hosting is not one or two features — it is roughly the whole middle of the
language. What follows is the ordered path across that gap.

---

## 1. The single most important decision

**Shrink the language required for self-hosting instead of growing the language to match the
current TypeScript compiler.**

The existing compiler leans on three TypeScript features that are individually expensive to
implement and, taken together, probably a year of work:

| Feature used today | Where | Cost to support in Lumina |
| --- | --- | --- |
| `switch (x.constructor)` dispatch | every `*ToIr` / `*ToCode` function | needs runtime class identity + class objects as values |
| `namespace X { }` with `import Y = X.Z` aliases | every AST/IR file | needs a whole module/aliasing semantics |
| Structural `implements` on empty marker classes | AST/IR hierarchies | needs a type system that does nothing at runtime |

None of these is load-bearing. Replace them in the **TypeScript** source first, while it is
still TypeScript and still testable:

- **Dispatch on a `kind` string field**, not `constructor`. `switch (node.kind) { case "IntConst": ... }`
  compiles to a plain string switch in any language. This is the highest-leverage change in
  this document — it deletes an entire category of required language features.
- **Flat modules, one export per concern**, not nested namespaces.
- **Plain classes / records**, no marker interfaces.

Do this as a refactor of the current TypeScript compiler, keeping all 46 tests green. Then the
eventual port to Lumina is close to mechanical rather than a redesign.

**Decide also, now, before writing more codegen:**

1. **Output target: JavaScript or TypeScript?** Today codegen emits `export namespace` and
   `constructor(public x)` — both TypeScript-only — into files named `.js`. This is currently
   broken either way. Pick one. Recommendation: **plain JS**, since the runtime is `node` and
   a self-hosted compiler gains nothing from emitting types it does not check.
2. **Module system: ESM or CommonJS?** Affects import codegen and how the bootstrap runs.
   Recommendation: **CommonJS**, because `node file.js` runs it with no `package.json` ceremony.

---

## 2. Feature gap, derived from `src/lumina/v2/*.lumina`

The v2 sources are the spec — they are what the language must eventually parse. Status of every
construct they use, plus what compiling a compiler additionally requires:

| Construct | Parse | AST | IR | Codegen | Notes |
| --- | :-: | :-: | :-: | :-: | --- |
| `namespace X { }` | ✅ | ✅ | ✅ | ⚠️ | emits TS `export namespace` |
| `class X (fields) extends Y` | ✅ | ✅ | ✅ | ⚠️ | ctor body is empty — fields never assigned |
| `field?: Type` optional | ✅ | ✅ | ✅ | ✅ | |
| `Array[string]` generics | ⚠️ | ❌ | ❌ | ❌ | brackets parsed then discarded in `typeRef` |
| method params | ✅ | ✅ | ❌ | ❌ | **dropped in `moduleMethodToIr`/`methodToIr`** |
| `return` | ❌ | ⚠️ | ❌ | ❌ | `StatementAst.Return` is an empty class, no payload |
| member access `a.b` | ❌ | ❌ | ❌ | ❌ | **no dot-access parser at all** |
| `this` | ❌ | ⚠️ | ❌ | ❌ | `This` class exists, unused |
| `true` / `false` | ⚠️ | ⚠️ | ❌ | ⚠️ | parse as `Variable`; works by accident |
| `==` equality | ❌ | ✅ | ✅ | ✅ | IR/codegen ready, no parser |
| `!` / `not` | ❌ | ⚠️ | ❌ | ❌ | `Not` class exists, unused |
| arrays: literals, index, `.map` | ❌ | ❌ | ❌ | ❌ | compiler source is saturated with these |
| string escapes | ❌ | — | — | ❌ | `charWhile(c => c !== '"')` has no escape handling |
| comments | ❌ | — | — | — | `comment()` is commented out |
| `import` | ⚠️ | ✅ | ❌ | ❌ | `importParser` written but unexported and unwired |
| `while` / `for` | ❌ | ✅ | ✅ | ❌ | AST+IR shapes exist, nothing else |
| `throw` / error handling | ❌ | ❌ | ❌ | ❌ | compiler throws everywhere |

Legend: ✅ done · ⚠️ partial or wrong · ❌ absent

---

## 3. Phase 1 — Make the JS we already emit valid

Nothing below matters if the output does not run. These are bugs in shipped features.

- [ ] **Constructor fields are never assigned.** `classToCode` emits `constructor(public x, public y){}`.
      In TS that auto-assigns; in JS it is a syntax error, and stripping `public` gives you a
      constructor that silently discards its arguments. Emit `constructor(x,y){this.x=x;this.y=y}`.
      *(`codegen/statement-to-code.ts`)*
- [ ] **Method parameters are dropped at AST→IR.** `moduleMethodToIr` and `methodToIr` pass only
      `name` and `statements`; `method.fields` is discarded, so codegen emits `function f(){`.
      **No function can take an argument today** — this alone blocks self-hosting.
      *(`asttoir/ast-to-ir.ts`)*
- [ ] **`return` statement**, end to end: parser → `StatementAst.Return(expression?)` → IR → codegen.
      Currently `Return` is an empty class no one constructs.
- [ ] **Resolve `export namespace`** per the Phase 0 decision — either lower namespaces to an
      object/IIFE, or drop them from the language.
- [ ] Add an integration test with a class, a method with parameters, and a return value.
      Classes are effectively untested today, which is why the above went unnoticed.

**Done when:** a Lumina file defining a class with fields, constructing it, calling a method
with arguments, and returning a value runs correctly under `node`.

---

## 4. Phase 2 — The language a compiler is written in

Ordered by how much they unblock.

- [ ] **Member access `a.b`** — the largest single gap. Extend `postfix` in
      `parser/expression-parser.ts` to a left-associative chain of `.name`, `.name(args)`,
      and `[index]`, so `x.y.z(1).w` parses. Every line of compiler source needs this.
- [ ] **Arrays** — literals `[a, b]`, indexing `xs[i]`, and enough of a method surface
      (`.length`, `.push`, `.map`, `.join`) to write a compiler. These can lower directly to the
      JS equivalents; no need for a collections library.
- [ ] **`this`** — required the moment classes have real methods.
- [ ] **Booleans as real literals**, `==`/`!=`, and `!`. Wire `BoolConst`, `Not`, and `Equal`
      (IR and codegen for `Equal` already exist; it only needs a parser).
- [ ] **String escapes** — at minimum `\"`, `\\`, `\n`. The compiler emits quoted code, so it
      must be able to write a quote.
- [ ] **Comments**, line and block. Un-comment and finish `comment()` in `statement-parser.ts`.
      Non-negotiable for a codebase of this size.
- [ ] **`while`** — `While` already has AST and IR shapes; it needs a parser and codegen.
      `for` can wait; `while` plus arrays is enough.
- [ ] **`throw`** or an equivalent error path.
- [ ] **Statement separation** — resolve the `// TODO Should repeat by either a semi-colon or a
      newline` in `block()`. Ambiguity here will bite hard as programs grow.

**Done when:** you can write a non-trivial Lumina program — suggested milestone: a JSON parser,
or a Lumina *tokenizer* — that compiles and runs.

---

## 5. Phase 3 — Multi-file programs

- [ ] Wire up `importParser` (currently written, unexported, and absent from `statement()`).
- [ ] Import codegen per the Phase 0 module decision.
- [ ] Resolve imports across the compiled file set — `app.ts` already walks a source tree, so
      this is mostly ordering and name resolution.
- [ ] Decide name resolution rules: are imports file-scoped? Is there a search path?

**Done when:** a Lumina program split across three files, importing each other, compiles and runs.

---

## 6. Phase 4 — Infrastructure the self-hosted compiler will need

The self-hosted compiler has to be *debuggable*, which means it needs what the current one lacks.

- [ ] **Source positions.** `InputStream` tracks only an integer index, so errors can only ever
      say "position 47", and no AST node carries a location. Add line/column to `InputStream` and
      a position to AST nodes. **Do this before the AST grows further** — retrofitting touches
      every constructor, and the cost only rises.
- [ ] **Real parse errors.** `ParseFailure.expected` is always `[]` and nothing tracks
      furthest-failure position, so no error message can improve until both are populated.
- [ ] **Fix combinator backtracking.** `opt` (`parser.ts:316`) and `rep` (`parser.ts:235`) return
      success without restoring `inputStream.position`, and `str` (`parser.ts:80`) does not rewind
      on a partial match. `eitherMany` currently masks this by resetting at alternative
      boundaries; as the grammar grows, it will stop masking it. Make save/restore explicit.
- [ ] Fix `index()` returning `Optional` from a `P<number>` (`parser.ts:339`).
- [ ] Fix the misplaced paren in the syntax-error throw (`app.ts:111`).
- [ ] Decide whether types are checked or decorative. `typeRef` parses generic brackets and
      discards them; nothing between AST and codegen checks anything. A self-hosted compiler
      does not *need* type checking — but if Lumina is to have it, the IR must start carrying
      types before the port, not after.

---

## 7. Phase 5 — Port the compiler

1. **Restrict the TypeScript source** to the Lumina-shaped subset from §1 — `kind`-tag dispatch,
   flat modules, no marker interfaces, no `import X = Y.Z` aliases. All tests stay green
   throughout. This is the bulk of the work and it happens entirely in TypeScript, where the
   tooling helps you.
2. **Port bottom-up**, keeping each stage testable against its TypeScript twin:
   `InputStream` → combinators → lexical → expression → statement → AST → IR → codegen.
3. **Differential-test each ported piece.** Run the TypeScript and Lumina implementations over
   the same corpus and diff. Divergence is a bug in the port or a bug in Lumina; either way you
   want to find it in one module, not in the whole compiler at once.

---

## 8. Bootstrap protocol

Once the compiler is written in Lumina, the bootstrap is mechanical:

```
stage1 = tsc-lumina-compiler(lumina-compiler-source)   # built by the TypeScript compiler
stage2 = node stage1  (lumina-compiler-source)         # built by Lumina, compiled by TS
stage3 = node stage2  (lumina-compiler-source)         # built by Lumina, compiled by Lumina

assert stage2 == stage3        # byte-identical → fixpoint reached
```

`stage1` and `stage2` may differ — two different implementations can emit different formatting
from the same input. `stage2` and `stage3` must not: both are the output of the *same* compiler
compiling the *same* source. Byte-identical output means the compiler correctly reproduces
itself, and Lumina is self-hosting.

Make this a CI job the moment `stage1` builds at all, even while it fails. A red bootstrap test
that gets closer each week is the best possible progress signal for this project.

Once green, delete nothing immediately — keep the TypeScript compiler until the Lumina one has
proven itself on real work. But from that point, new language features are written in Lumina.

---

## 9. Suggested order of attack

1. §1 decisions — output target, module system, `kind`-tag dispatch
2. §3 Phase 1 — make emitted JS valid (ctor assignment, method params, `return`)
3. §6 source positions — cheap now, expensive later
4. §4 member access, then arrays — the two that unblock everything else
5. §4 remainder — `this`, booleans, `==`, `!`, escapes, comments, `while`
6. §5 modules
7. §7 restrict the TypeScript source to the Lumina subset
8. §7 port, bottom-up, differential-tested
9. §8 bootstrap to fixpoint

Items 1–3 are days. Item 4 is the real work. Items 7–8 are long but low-risk if 1–6 were done
properly — most self-hosting attempts fail because the language was still moving underneath the
port, not because the port itself was hard.

---

## 10. Smaller cleanups, whenever convenient

- Unused `import exp from "constants"` in `ast-to-ir.ts` and `expression-to-code.ts` (auto-import misfires)
- Unused `namespace` / `statement` imports in `ast-to-ir.ts`
- Duplicate aliases: `Ref`/`RefLocal` alongside `Type`/`LocalType` for the same classes
- Debug `console.log`s and a commented-out block in `test/integration/compiler/utils/compiler-utils.ts`
- `ts-node` and `@types/js-beautify` are in `dependencies` but are dev-only
- Integration tests run `npm install -g .`; `node dist/app.js --source … --target …` gives the
  same coverage without polluting global state
- Codegen currently parenthesizes every binary expression, since grouping is discarded at parse
  time. Correct but noisy — a precedence-aware emitter would clean up the output when it matters
