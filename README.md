# Lumina

A compiler for the Lumina language, targeting JavaScript.

See [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md) for the roadmap toward self-hosting.

## Build

```
npm install
npm run build      # cleans dist/ then runs tsc
```

## Compile something

```
node dist/app.js --source path/to/sources --target path/to/output
```

Or install the `lumina` binary globally with `npm run install-compiler`.

## Tests

```
npm test              # everything: build, unit, corpus, CLI
npm run test:unit     # parser unit tests
npm run test:corpus   # compiler corpus — fast, in-process
npm run test:cli      # command line smoke test (requires a build)
npm run test:update   # re-baseline every golden file
```

### Adding a compiler test

Each directory under `test/cases/` is one case:

```
test/cases/my-feature/
  input.lumina      the source to compile                      (required)
  expected.js       exact generated JavaScript                  (golden)
  expected.out      stdout after running the generated code     (golden)
  expected.error    compiler error, for sources that must fail
```

Create a directory with an `input.lumina` and run `npm run test:corpus`. Missing goldens are
generated on the first run — **review them before committing**, since they define correct
behaviour from that point on. A case containing `expected.error` is expected to fail
compilation and is not executed.

After an intentional codegen change, run `npm run test:update` and review the resulting diff.
That diff is the codegen review.

On CI, missing goldens fail rather than being generated.
