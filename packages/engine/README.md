# @codeceipt/engine

The Codeceipt verification engine. Reads a unified git diff, checks whether the
change did what it claimed, and emits a JSON `Verdict`.

**Apache-2.0** — this package is open source (the rest of the repo is proprietary).

## Contract

```
diff (stdin)  ->  Verdict (stdout JSON)
```

```ts
import { verifyDiff, type Verdict } from "@codeceipt/engine";

const verdict: Verdict = await verifyDiff(diff);
// { verdict: "pass"|"fail"|"warn", criteria: [...], cost_usd, duration_ms, engine_version }
```

## CLI

```bash
git diff main | pnpm --filter @codeceipt/engine cli      # dev (tsx)
# after build:
git diff main | codeceipt-engine
codeceipt-engine --working-dir . < pr.diff               # run executable criteria too
```

## Criterion kinds

| kind | static (diff only) | with `--working-dir` |
|---|---|---|
| `regex` | secret/pattern scan of added lines | same |
| `file_predicate` | files declared in diff | on-disk existence |
| `read_set` | files/lines covered | same |
| `shell` | reported as not-runnable | runs `npm test` for real |
| `ears` | criteria well-formedness | same |
| `llm_judge` | optional (demo) | optional |

Static mode is honest about what it cannot prove from a diff alone (you can't run
tests without the repo). The GitHub Action runs in a checked-out tree and fills in
the executable criteria.
