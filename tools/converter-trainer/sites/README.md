# Corpus lists

A corpus list names the source sites the training loop captures, scores and audits. One file per
corpus, named by a **neutral internal id** — `corpus-01.txt`, `corpus-02.txt` — never by the
platform or brand the sites belong to.

`example.txt` documents the format and is the only list committed. **Every real list is
gitignored**, because its lines are real source-site URLs and those must not appear in this
repository. Keep your own lists here; they stay local.

The same id namespaces everything derived from the corpus, so two corpora can never clobber each
other's numbers:

| file | what it holds |
|---|---|
| `sites/corpus-NN.txt` | the list (gitignored) |
| `score/_baseline.corpus-NN.json` | the baseline to compare against (gitignored) |
| `score/_scores.corpus-NN.json` | the latest scores (gitignored) |
| `score/_sample.corpus-NN.txt` | optional curated fast-loop sample (gitignored) |

Pass the id through with `--corpus corpus-NN`. Without it the unsuffixed files are used.

Sites are captured under a per-slug parent directory. That matters when a corpus is served from a
single preview endpoint that ignores the query string: the capture service would otherwise derive
one identical output directory name for every site in the corpus, and they would overwrite each
other. The tools locate a capture's `rendered.html` at either depth, so no corpus's directory
naming is ever hardcoded.
