# Lumina — Ordered Implementation Plan

**Goal:** Lumina compiles its own compiler, verified by a bootstrap fixpoint.

**How to use this document.** Steps are numbered 1–41 and are in dependency order — each assumes
the ones before it. Phases group related steps; within a phase, order still matters. Every step
lists the tests that must exist before it counts as done.

This supersedes `NEXT-STEPS.md`, which can be deleted once you're happy with this plan.

---

## Verdict on restructuring first: yes

Three restructures should land **before any new language feature**, and steps 11–13 should be
done as a **single pass over the AST/IR**, not three.

The current scale of the thing being restructured:

| | Count | Grows with every new feature? |
| --- | ---: | --- |
| AST + IR node classes | 108 | yes |
| `switch (x.constructor)` dispatch cases | 76 | yes |
| `import X = Y.Z` namespace aliases | 118 across 13 files | yes |

Phase F adds roughly twenty node types. Restructuring at 108 classes rather than ~130 is not the
main saving — the main saving is that **every feature written under the old structure has to be
rewritten under the new one.** Do it once, now, on a codebase that 44 tests already cover.

The three restructures, and why each is now-or-much-worse-later:

1. **Test harness (steps 4–6).** Absolutely first. Everything downstream is validated by it, and
   adding a test must be cheap or the "very well tested" goal quietly dies. Today there are two
   integration tests and each requires `npm install -g .`.
2. **Parser primitives (steps 7–10).** `opt`, `rep`, and `str` leak input position on failure.
   Right now `eitherMany` masks it by resetting at alternative boundaries. Every grammar rule
   added makes the masking less reliable and the eventual debugging harder. Fix the primitives
   while the grammar is small.
3. **AST/IR node model (steps 11–13).** `kind`-tag dispatch, flat modules, and source positions.
   All three rewrite every node constructor and every dispatch site, so doing them as one pass
   costs roughly what one of them costs separately.

---

## Testing ground rules

These apply to every step below. A step is not done until its tests exist and pass.

**Five test layers, each catching what the others can't:**

| Layer | What it asserts | Speed | Exists today |
| --- | --- | --- | --- |
| L1 Parser unit | source → AST shape | ms | ✅ 44 tests |
| L2 AST/IR snapshot | source → AST/IR as JSON | ms | ❌ (unlocked by step 11) |
| L3 Codegen golden | source → exact emitted JS text | ms | ❌ |
| L4 Execution | source → compile → run → stdout | ~1s | ⚠️ 2 tests, slow |
| L5 Differential / bootstrap | two implementations agree | slow | ❌ |

**Definition of done for any language feature:** L1 + L3 + L4 tests, plus an L1 negative test
asserting the error position for malformed input. No feature merges with fewer.

**Why L3 golden tests matter most.** They are the layer this project is missing and needs most.
Execution tests tell you *that* something broke; golden tests tell you *what changed in the
output*. They're also fast enough to run on every save, and they make codegen refactors safe —
which matters, because phases E–G are largely codegen refactors.

---

## Phase A — Decisions ✅ ratified

Nothing here is code. All of it constrains everything after it.

- [x] **1. Output target: plain JavaScript.**
- [x] **2. Module system: CommonJS.**
- [x] **3. Dispatch: `kind` string tag.**

### Decision 1 — emit plain JavaScript

The runtime is `node`, and a self-hosted compiler gains nothing from emitting types it never
checks. Codegen currently emits `export namespace` and `constructor(public x)` — both TS-only —
into files named `.js`, so today it is broken either way.

**Binds:**

- **Step 14** emits `constructor(x,y){this.x=x;this.y=y}`. The `public` prefix in
  `classFieldToCode` goes away.
- **Step 17 is resolved: `namespace` has been removed from the language.** ✅
  With CommonJS chosen, files already provide scoping — `require("./expression-ast")` *is* the
  namespace, so the feature was redundant with the module system. Keeping it would have meant
  building IIFE lowering *and* porting the feature to the self-hosted compiler, for a construct
  step 12 removes from the compiler source anyway. `DeclarationAst.Namespace` also never
  extended `Statement` despite being dispatched as one — a latent bug that keeping it would
  have required fixing.
  Removed from parser, AST, IR, codegen, the keyword list, and the `v2/*.lumina` drafts (now
  flat). `test/cases/namespace-removed/` asserts the syntax no longer compiles.
- **Type annotations are parsed and discarded at codegen.** Consistent with step 26 defaulting
  to "decorative unless proven otherwise". Revisit only if you decide Lumina checks types.
- No `tsc` in the compile path, and none in the bootstrap.

### Decision 2 — CommonJS

`node file.js` runs with no `package.json` ceremony, and it matches the project's existing
tsconfig setting.

**Binds:**

- **Step 29** emits `const {X} = require("./path")` for imports and `module.exports` for
  top-level declarations.
- **Step 39** runs each bootstrap stage as `node stageN.js` with no flags.
- Generated output needs no `package.json`, and `require` paths do not need file extensions —
  both of which keep the bootstrap simple.

### Decision 3 — `kind` string tag dispatch

This is the decision that shrinks the language Lumina must support in order to host itself.
`switch (node.kind)` needs only string comparison; `switch (x.constructor)` needs runtime class
identity, classes as first-class values, and namespace semantics.

**Binds:**

- **Steps 11–13 go ahead as a single pass.** Every AST and IR node gets a `kind`; all 76
  dispatch sites convert.
- **Model the node types as TypeScript discriminated unions**, not just classes with a `kind`
  field. This buys exhaustiveness checking: an unhandled case becomes a *compile* error via a
  `never` check in the `default` branch, instead of a runtime `throw` discovered by whoever
  happens to write the right test.

  This is not hypothetical — two bugs found this session would have been compile errors:
  the missing `BBinOp` branch in `chain()` (so `&&` and `||` never worked), and the missing
  `If`/`Block` cases in `statementToCode`. Both were silent until something exercised them.
- **L2 snapshot tests become possible**, since nodes become meaningfully JSON-serializable.
  Today `JSON.stringify(ast)` loses class identity. Add an L2 layer to the corpus harness
  during step 11 — the plumbing in `test/corpus/harness.ts` is already there.

### Target JavaScript subset

What codegen is allowed to emit, given decisions 1 and 2. Keep this list short — every
construct added here is one the self-hosted compiler must eventually generate.

```js
const x = 1;                       // assign
function f(a, b) { return a + b; } // module method
class C { constructor(a) { this.a = a; } m(x) { ... } }
class D extends C { ... }
if (c) { ... } else if (c) { ... } else { ... }
while (c) { ... }
const {X} = require("./path");     // import
module.exports = {X};              // export
console.log(x);                    // println
(a) => { ... }                     // lambda
```

---

## Phase B — Test harness restructure (steps 4–6)

**Why first:** every later step is validated here, and the current harness makes adding a test
expensive enough to discourage it.

- [x] **4. Build a corpus-driven test runner.** One directory per case under `test/cases/`:
      ```
      test/cases/if-else/
        input.lumina        # source
        expected.js         # L3 golden — exact codegen output
        expected.out        # L4 golden — stdout after running it
      ```
      A single Jest file discovers every directory and generates both an L3 and an L4 test.
      **Adding a feature test becomes adding a directory, not writing test code.**
      Support an `expected.error` file for cases that must fail to compile.
- [x] **5. Drop the global install from the test path.** `test:integration` runs
      `npm install -g .` before every run. Invoke the built compiler directly
      (`node dist/app.js --source … --target …`) for the same coverage without mutating global
      state — and fast enough to run in a watch loop.
- [x] **6. Add a golden-update mode** (`npm run test:update`) that rewrites `expected.js` /
      `expected.out` in place. Without this, golden tests are painful enough that people stop
      adding them. Review the diff on every update — that diff *is* the codegen review.

**Done when:** porting the existing arithmetic and if-statement tests to `test/cases/` produces
identical coverage, and a new case is one directory with three files. ✅

**Outcome:** 67 tests across 9 suites; the corpus layer runs 20 tests in under half a second.
`test/integration/` was removed as superseded. Five bugs surfaced during the work and were
fixed — see the notes on steps 7 and 9 below, and:

- `chain()` in `expression-parser.ts` had branches for `ABinOp` and `RBinOp` but none for
  `BBinOp`, so `&&` and `||` parsed and then threw `Unknown operator` during AST construction.
  Boolean operators never worked. Found by the first corpus case that used them.
- `app.ts` hard-coded Windows `\` path separators while CI runs `ubuntu-latest`, so compiled
  output landed in a file literally named `<dir>\name.js`. Now `path.resolve`.
- Jest collected `dist/` as tests. Masked until now because every script passed
  `--testPathPattern`; a bare `jest` run picked up compiled artifacts.
- `dist/` was never cleaned, so it held orphaned output from September 2023 whose sources no
  longer exist — and the `lumina` bin shipped it. `npm run build` now cleans first.

---

## Phase C — Parser foundations (steps 7–10)

**Why here:** these change the meaning of every parse. Doing them before the grammar triples in
size means the 44 existing tests are enough to catch regressions.

- [x] **7. Fix position leaks in the combinators.** `opt`, `rep` and `str` now save and restore
      the stream position, and `rep` gives back a trailing separator that no element followed.
      *Tests:* `positionAfter()` in `parser.test.ts` asserts stream position directly rather than
      through `parse()`, whose reported position is now the furthest failure instead.
- [x] **8. Track furthest-failure position and populate `ParseFailure.expected`.**
      `InputStream` records the deepest failure across all alternatives; `parse()` reports that
      rather than wherever the outermost parser gave up after backtracking.
      Two combinators keep the expected set usable: `quiet()` suppresses recording (whitespace
      never belongs in an error) and `label()` collapses a parser's internals to one name, so
      `identifier()` reports "identifier" instead of `[a-z] or [A-Z] or "_"`.
      `describeFailure()` is shared by the CLI and the harness so they cannot drift.
      *Result:* `let = = broken` now reports `position 15: expected identifier or ...`.
- [x] **9. Fold comments into `spaces()`.** `//` line and `/* */` block comments are handled as
      whitespace by a Lumina-specific `spaces()` in `lexical-parser.ts`, so no grammar rule
      knows comments exist. The generic combinator library stays language-agnostic.
      *Tests:* `test/cases/comments/` covers every position — top level, trailing, multi-line,
      inline before a statement, inside a block, and after a statement.
- [x] **10. Settle statement separation.** **Decided: a newline or a `;`.**

      | input | before | now |
      | --- | --- | --- |
      | `println(1)println(2)` | accepted | rejected |
      | `println(1) println(2)` | accepted | rejected |
      | `println(1)` / newline / `println(2)` | accepted | accepted |
      | `println(1); println(2)` | **rejected** | accepted |

      The work was not the separator but the whitespace around it: statement rules consumed
      their own trailing whitespace, so `expressionAsStatement` — `seq(spaces(), expressions(),
      spaces())` — ate the very newline the separator needed. Statement rules no longer consume
      surrounding whitespace; `block()` keeps its *leading* `spaces()` so callers can still
      write `) block()`, but not its trailing one.
      A trailing separator before `}` or end of file is allowed, via a separator that maps to
      `void` so `seq`'s void-filtering leaves the surrounding rule's shape unchanged.
      *Tests:* six L1 assertions in `statement-parser.test.ts` plus
      `test/cases/statement-separators/`.

**Phase C outcome:** 77 tests across 9 suites. The corpus caught every regression during the
whitespace rework, which is the harness from Phase B doing its job.

---

## Phase D — The AST/IR restructure (steps 11–13, one pass)

**Do these together.** Each rewrites every node constructor and every dispatch site; done
separately you pay that cost three times.

- [ ] **11. Add a `kind` discriminant to every AST and IR node, and convert all 76 dispatch
      sites** from `switch (x.constructor)` to `switch (x.kind)`.
      Side benefit worth naming: nodes become JSON-serializable in a meaningful way, which is
      what makes **L2 snapshot tests possible at all** — today `JSON.stringify(ast)` loses class
      identity, so the AST can't be golden-tested.
- [ ] **12. Flatten the namespaces.** Replace `namespace ExpressionAst { }` + the 118
      `import X = Y.Z` aliases with plain module exports. This is the structure the self-hosted
      compiler must be written in anyway (Lumina will not support namespace aliasing for a long
      time, if ever).
- [ ] **13. Add source positions.** Line and column on `InputStream`; a position on every AST
      node. `InputStream` currently tracks only an integer index, so errors can only ever say
      "position 47".
      *Tests:* L1 negative tests asserting `line:column` for malformed input — the first error
      messages this project can actually assert on.

**Done when:** zero references to `.constructor` remain in dispatch, zero `import X = Y.Z`
aliases remain, every node carries a position, and the full suite is green. Add L2 snapshot
tests for the existing corpus as you go.

---

## Phase E — Make the emitted JavaScript valid (steps 14–17)

These are bugs in features that already ship. Nothing further is trustworthy until they're fixed.

- [ ] **14. Assign constructor fields.** `classToCode` emits `constructor(public x, public y){}`.
      In TS that auto-assigns; as JS it's a syntax error, and merely stripping `public` yields a
      constructor that silently discards its arguments. Emit
      `constructor(x,y){this.x=x;this.y=y}`.
- [ ] **15. Stop dropping method parameters.** `moduleMethodToIr` and `methodToIr` pass only
      `name` and `statements`; `method.fields` is discarded, so codegen emits `function f(){`.
      **No function can currently take an argument** — this alone blocks self-hosting.
      The parser already handles parameters; they die at AST→IR.
- [ ] **16. Implement `return`,** end to end: parser → `Return(expression?)` → IR → codegen.
      `StatementAst.Return` is presently an empty class nobody constructs.
- [x] **17. Resolve namespace codegen** — done ahead of schedule: `namespace` was removed from
      the language entirely rather than lowered. See decision 1 for the reasoning.

*Tests:* a `test/cases/` directory per item. Specifically a class with fields that is
constructed, has a method called on it with arguments, and returns a value — the combination
none of these were caught by.

**Done when:** that program runs correctly under `node`.

---

## Phase F — The language a compiler is written in (steps 18–26)

Ordered by what unblocks the most. Each gets L1 + L3 + L4 + negative tests.

- [ ] **18. Member access `a.b`.** The single largest gap — there is no dot-access parser at all.
      Extend `postfix` in `expression-parser.ts` to a left-associative chain of `.name`,
      `.name(args)`, and `[index]` so `x.y.z(1).w` parses. Every line of compiler source needs it.
- [ ] **19. `this`.** Required as soon as classes have real methods. `This` exists in the AST, unused.
- [ ] **20. Booleans as real literals,** plus `==`, `!=`, `!`. Today `true` parses as a `Variable`
      and works by accident. `Equal` already has IR and codegen — it needs only a parser.
- [ ] **21. String escapes** — at minimum `\"`, `\\`, `\n`. The compiler emits quoted code, so it
      must be able to write a quote. `charWhile(c => c !== '"')` has no escape handling.
- [ ] **22. Arrays:** literals `[a, b]`, indexing, and enough method surface (`.length`, `.push`,
      `.map`, `.join`) to write a compiler. Lower directly to JS equivalents; no collections
      library needed. Depends on 18.
- [ ] **23. `while`.** `While` already has AST and IR shapes; it needs a parser and codegen.
      Depends on 20 for conditions. `for` can wait.
- [ ] **24. `throw` / error propagation.** The compiler throws everywhere.
- [ ] **25. Generic type arguments** (`Array[string]`). `typeRef` parses the brackets and
      discards them. Needed only if types are load-bearing — see step 26.
- [ ] **26. Decide: are types checked or decorative?** Nothing between AST and codegen checks
      anything today. A self-hosted compiler does not *need* type checking. But if Lumina is to
      have it, the IR must start carrying types **before** the port, not after — retrofitting
      types through a self-hosted compiler is far worse than through this one.

**Milestone:** write a non-trivial Lumina program that compiles and runs — a JSON parser, or
better, a Lumina *tokenizer*. It will find bugs no unit test does.

---

## Phase G — Multi-file programs (steps 27–29)

- [ ] **27. Wire up `importParser`** — currently written, but neither exported nor present in
      `statement()`. Dead code today.
- [ ] **28. Name resolution.** Are imports file-scoped? Is there a search path? Decide and test.
- [ ] **29. Import codegen** per decision 2, and resolution across the compiled file set.
      `app.ts` already walks a source tree, so this is mostly ordering and resolution.

**Done when:** a three-file Lumina program with cross-imports compiles and runs.

---

## Phase H — Prepare the port (steps 30–32)

- [ ] **30. Restrict the TypeScript compiler to the Lumina-supported subset.** After phase D most
      of this is already true. Remove anything remaining that Lumina can't compile — closures over
      mutable state, structural typing tricks, TS-only syntax.
- [ ] **31. Freeze the language.** No new syntax during the port. Most self-hosting attempts fail
      because the language kept moving underneath the port, not because the port was hard.
- [ ] **32. Build the differential harness (L5).** Run the TypeScript and Lumina implementations
      over the same corpus and diff outputs. Needed before the port starts, not during it.

---

## Phase I — Port the compiler (steps 33–36)

Bottom-up, each stage differential-tested against its TypeScript twin before moving on.

- [ ] **33. `InputStream` + combinators.** The foundation; port and diff-test in isolation.
- [ ] **34. Lexical + expression + statement parsers.** Diff the AST as JSON (L2) against the
      TypeScript parser over the whole corpus.
- [ ] **35. AST → IR.** Diff the IR as JSON.
- [ ] **36. Codegen.** Diff emitted text byte-for-byte.

Divergence at any stage is either a bug in the port or a bug in Lumina. Finding it inside one
module is the whole point of going bottom-up.

---

## Phase J — Bootstrap (steps 37–41)

- [ ] **37. Build stage1:** compile the Lumina compiler source with the TypeScript compiler.
- [ ] **38. Build stage2:** `node stage1` compiling the Lumina compiler source.
- [ ] **39. Build stage3:** `node stage2` compiling the Lumina compiler source.
- [ ] **40. Assert `stage2 == stage3`, byte-identical.**
      ```
      stage1 = tsc-lumina-compiler(lumina-src)   # built by TypeScript
      stage2 = node stage1 (lumina-src)          # built by Lumina, compiled by TS
      stage3 = node stage2 (lumina-src)          # built by Lumina, compiled by Lumina
      assert stage2 == stage3                    # fixpoint → self-hosting
      ```
      `stage1` and `stage2` may legitimately differ — two implementations can format differently
      from the same input. `stage2` and `stage3` must not: both are the same compiler compiling
      the same source.
- [ ] **41. Run the whole test suite against stage3.** Fixpoint proves reproduction, not
      correctness — a compiler can reproduce itself and still be wrong.

**Add the bootstrap job to CI as soon as stage1 builds at all, even while it fails.** A red
bootstrap test getting closer each week is the best progress signal this project can have.

Once green, keep the TypeScript compiler until the Lumina one has proven itself on real work —
but from that point, new language features are written in Lumina.

---

## Appendix — cleanups, any time

Not blocking; do them when touching the surrounding code.

- Unused `import exp from "constants"` in `ast-to-ir.ts` and `expression-to-code.ts`
- Unused `namespace` / `statement` imports in `ast-to-ir.ts`
- Duplicate aliases: `Ref`/`RefLocal` alongside `Type`/`LocalType` for the same classes
- Debug `console.log`s and a commented-out block in `test/integration/compiler/utils/compiler-utils.ts`
- `ts-node` and `@types/js-beautify` sit in `dependencies` but are dev-only
- Misplaced paren in the syntax-error throw (`app.ts:111`) — the closing paren lands before the
  final concat, so part of the message is discarded
- `index()` returns an `Optional` from a `P<number>` (`parser.ts:339`)
- Codegen parenthesizes every binary expression because grouping is discarded at parse time.
  Correct but noisy; a precedence-aware emitter would clean up output when that starts to matter
