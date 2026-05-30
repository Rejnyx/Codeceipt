# Fixtures — deliberately bad (and good) PRs

Sample unified diffs used to prove the gate actually catches problems. Used by
`fixtures/fixtures.test.ts` and handy for a live demo (paste into the web form,
or `cat fixtures/bad-leaked-secret.diff | pnpm engine`).

| Fixture | What's wrong | Expected verdict (static / paste mode) |
|---|---|---|
| `bad-leaked-secret.diff` | Hardcoded OpenAI key + AWS key + password literal | **fail** (regex) |
| `bad-no-tests.diff` | New auth function, no tests, SQL built by string concat | **warn** (no tests touched) |
| `good-with-tests.diff` | Small change with a matching test | **warn** in static mode → **pass** with a working tree (tests actually run) |

Static (paste) mode can't run tests from a diff alone, so a clean PR tops out at
`warn`; `pass` requires the working-tree mode (GitHub Action) that executes the
suite. The hard signal in paste mode is **fail** (secrets / patterns), which is
exactly what a vibe-coded repo leaks.

Known gaps to widen later (good slop to test against): `sk-proj-…` project keys,
Stripe `sk_live_…`, JWT literals, `.env` additions, base64 blobs.
