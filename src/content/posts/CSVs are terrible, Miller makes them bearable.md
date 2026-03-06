---
title: CSVs are terrible, Miller makes them bearable
date: 2026-03-06
description: "today iain learned: CSVs are terrible, Miller makes them bearable"
tags:
  - CLI
  - data
  - terminal
  - tools
hideTOC: false
draft: true
aliases:
---
CSVs are terrible. If you're a web developer like me, or have worked with computers for a long time, then I'm sure you've come across them at one point.

They seem to be unavoidable. They are a common format used to export data from various applications. Sometimes they seem like a database for [normies](https://en.wiktionary.org/wiki/normie). But, I get it. They are relatively compact, somewhat human-readable (as long as you don't stray too far from the header rows), and most importantly for many, they can be opened in Excel.

But they also have an inconsistent format, and using something as common as a comma as a separator just makes things more difficult than they need to be.

So, when faced with a task involving parsing, processing or transforming a CSV, you've got some options.

First, you could just use Excel or any other spreadsheet application. Fine, but you'll likely need to do quite a bit of manual work. Need to filter rows? Enable filters, click around to hopefully match what you need, then select things and delete or copy to a new sheet, save again, etc, etc.

Second, you could throw AI at it and see how it goes. It's just text, right? How hard could it be? No thanks! How do I know it won't just delete a ton of rows or even hallucinate new ones?

I went with a third option: [Miller](https://miller.readthedocs.io); an excellent command line tool for working with CSVs.

I had discovered Miller a while back, but didn't have a reason to use it, until now. Today, I had a CSV with tens of thousands of rows, and I needed to remove a large number of those (based on a value in one column), and I needed to replace all instances of a string with another, in only a single column.

Miller has its [own language](https://miller.readthedocs.io/en/6.17.0/10min/), and works with "flags", "verbs" and "functions", operating on files. For this task I needed the `filter` and `put` verbs and the `gsub` function.

For example, to [`filter`](https://miller.readthedocs.io/en/6.17.0/reference-verbs/index.html#filter) (keep) rows of a CSV containing a URL pattern, you might do something like this:

```sh
mlr --csv filter '$url =~ "www\.example\.com"' input.csv > output.csv
```

Where:
- `mlr` is the CLI command
- `--csv` is the flag, indicating to use the CSV format for both input and output
- `filter` is the verb
- `'$url =~ "www\.example\.com"'` is the expression in Miller's [DSL](https://miller.readthedocs.io/en/6.17.0/reference-dsl/), where:
	- `$url` means the column with header `url`
	- `=~` means contains a string
	- `"www\.example\.com"` is the regex to match (hence, escaped period `\.`)
- `input.csv` is the file to operate on
- `> output.csv` is redirecting the output to another file

So if `input.csv` looked like this:

```csv
id,url,referrer
1,https://www.example.com,https://www.other.com
2,https://www.example.com/posts,https://www.example.com
3,https://www.different.com,https://www.example.com
4,https://www.example.com/rss.xml,https://www.another.com
```

Then `output.csv` would look like this:

```csv
id,url,referrer
1,https://www.example.com,https://www.other.com
2,https://www.example.com/posts,https://www.example.com
4,https://www.example.com/rss.xml,https://www.another.com
```

The [`put`](https://miller.readthedocs.io/en/6.17.0/reference-verbs/index.html#put)  verb is used to modify the CSV data and output the new version. In my case, updating a domain name from one string to another, using the [`gsub`](https://miller.readthedocs.io/en/6.17.0/reference-dsl-builtin-functions/index.html#gsub) function:

```sh
mlr --csv put '$url = gsub($url, "www\.example\.com", "til.iainsimmons.com")' input.csv > output.csv
```

Again, with the same pieces: the command, flag, verb, expression (with column references and a regex), input file and redirected to the output file.

Resulting in the following `output.csv` (from the same previous `input.csv`), noting that it is leaving the `referrer` column alone:

```csv
id,url,referrer
1,https://til.iainsimmons.com,https://www.other.com
2,https://til.iainsimmons.com/posts,https://www.example.com
3,https://www.different.com,https://www.example.com
4,https://til.iainsimmons.com/rss.xml,https://www.another.com
```

Putting the two verbs together is as simple as chaining with the [`then`](https://miller.readthedocs.io/en/6.17.0/reference-main-then-chaining/) keyword:

```sh
mlr --csv filter '$url =~ "www\.example\.com"' then put '$url = gsub($url, "www\.example\.com", "til.iainsimmons.com")' input.csv > output.csv
```

And getting the final `output.csv`:

```csv
id,url,referrer
1,https://til.iainsimmons.com,https://www.other.com
2,https://til.iainsimmons.com/posts,https://www.example.com
4,https://til.iainsimmons.com/rss.xml,https://www.another.com
```

If you wanted to [replace the string across all columns](https://miller.readthedocs.io/en/6.17.0/operating-on-all-fields/#search-and-replace-over-all-fields), you could use the following:

```sh
mlr --csv filter '$url =~ "www\.example\.com"' then put 'for (k,v in $*) { if (is_string(v)) { $[k] = gsub(v, "www\.example\.com", "til.iainsimmons.com") } }' input.csv > output.csv
```

Where:
- [`for`](https://miller.readthedocs.io/en/6.17.0/reference-dsl-control-structures/#key-value-for-loops) is basically a for-each loop
- `k,v in` is getting the key (column) and value for each iteration of the loop
- `$*` is all columns
- [`if`](https://miller.readthedocs.io/en/6.17.0/reference-dsl-control-structures/#if-statements) is the typical control structure for comparisons
- [`is_string`](https://miller.readthedocs.io/en/6.17.0/reference-dsl-builtin-functions/#is_string) is another function, checking the type of the column is a string that can be replaced

This would produce the following in `output.csv`:

```csv
id,url,referrer
1,https://til.iainsimmons.com,https://www.other.com
2,https://til.iainsimmons.com/posts,https://til.iainsimmons.com
4,https://til.iainsimmons.com/rss.xml,https://www.another.com
```

There's a ton more it can do, so I'd encourage you to try it out (only takes [10 mins to learn!](https://miller.readthedocs.io/en/6.17.0/10min/)) if you ever find yourself having to work with CSV files.