# Fixtures — deliberately bad (and good) PRs

Sample unified diffs used to prove the gate actually catches problems. Used by
`fixtures/fixtures.test.ts` and handy for a live demo (paste into the web form,
or `cat fixtures/bad-leaked-secret.diff | pnpm engine`).

The gate is **binary** (pass / fail). The headline verdict is driven only by
**blocking** checks (e.g. hardcoded secrets). Advisory checks (read-set, EARS,
"no tests touched") and **skipped** checks (test execution can't run from a diff)
show as rows but never block a merge.

| Fixture | What's wrong | Verdict (paste mode) |
|---|---|---|
| `bad-leaked-secret.diff` | Hardcoded OpenAI key + AWS key + password literal | **fail** (blocking: secrets) |
| `bad-no-tests.diff` | New auth function, no tests, SQL built by string concat | **pass** — with advisories (no tests; test-exec not run here) |
| `good-with-tests.diff` | Small change with a matching test | **pass** |

Paste (static) mode can't execute tests, so the `shell` check is reported as
**not run** (skipped, non-blocking) — enable the GitHub Action (working-tree mode)
for a real test pass/fail. The hard signal in paste mode is **fail** on blocking
checks (secrets / patterns), which is exactly what a vibe-coded repo leaks.

Known gaps to widen later (good slop to test against): `sk-proj-…` project keys,
Stripe `sk_live_…`, JWT literals, `.env` additions, base64 blobs, and promoting
more checks (SSRF/eval/injection patterns) to blocking.
