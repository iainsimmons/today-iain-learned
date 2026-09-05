---
title: Text expansion and global snippets with espanso
date: 2026-09-05
description: "today iain learned: How to use espanso for text expansion and global snippets"
tags:
  - macos
  - linux
  - productivity
  - tools
hideTOC: false
draft: false
---

As mentioned in a previous post about [replacing Raycast with other tools on macOS](/posts/replacing-raycast-with-mac-os-built-in-and-open-source-alternatives), I've been trying to find good open source alternatives for the functionality that Raycast provided. One of those things was global snippets or text replacements.

[macOS provides some very basic built-in Text Replacements](https://support.apple.com/en-au/guide/mac-help/mh35735/26/mac/26), but these are restricted to one line of text and require confirming the replacement, which is kind of annoying and not all that useful. Certainly not a replacement for global snippet functionality.

I also tried [Vicinae](https://www.vicinae.com/), which is basically an open-source Raycast alternative that even has some compatibility with Raycast extensions, but I found its snippet functionality to be very buggy and also not suitable for daily use.

A colleague of mine recommended [espanso](https://espanso.org/). With it being lightweight, configurable, and open source, it ticked all the boxes. I gave it a shot and it's been excellent so far! It is even cross-platform so I can use it on my Linux PC too.

Out of the box, you get a service that runs in the background, waiting for particular "keywords" to be typed, and then it will simply replace the keyword with the configured text. But it can do so much more than that!

For my work, I had previously configured much longer snippets for things like assigning work items in Jira at different workflow stages and providing QA feedback. [Multi-line text in espanso is no problem](https://espanso.org/docs/matches/basics/#multi-line-expansions), but Jira being Jira, the new lines / line breaks would be formatted all wrong, and I wanted things like bulleted lists, bold text, etc. For that, [espanso gives you the ability to use markdown for the replacement](https://espanso.org/docs/matches/basics/#rich-text).

Here's an example (with the vertical pipe `|` character marking the start of a multi-line string):

```yaml title="~/.config/espanso/match/base.yml"
matches:
  - trigger: ":uat"
    markdown: |
      Hi ,

      This feature is ready for UAT. Please see the **Description** field for all testing information.

      If you are happy with the implementation, you can simply update the ticket workflow to mark this as “Done”.

      If issues have been detected, then the ticket workflow should be marked back to “In Progress”, assigned to the project manager and a comment placed on the ticket. In order to ensure rectification occurs as efficiently as possible the comment should include (where appropriate):

      - URLs
      - Asset ID
      - Description of the error
      - Browser or device used when the issue arose
      - Screenshots of the issue

      {{mysignature}}
```

You might have also noticed the double curly braces at the end there, that's for variables in the replacement.

I use my email signature in a lot of these replacements, so I've declared it once as a variable above, with it also referencing some other variables that I've tucked away in the appropriately named `secret.yml` (which is in my `.gitignore` and none of your business, thank you very much!). I have examples in my config so I know what I'm working with and so others can use this as a base too:

```yaml title="~/.config/espanso/match/base.yml"
imports:
  - secret.yml

global_vars:
  ## set the following in secret.yml:
  # - name: myname
  #   type: echo
  #   params:
  #     echo: Firstname Lastname
  # - name: myemail
  #   type: echo
  #   params:
  #     echo: email@example.com
  # - name: mytitle
  #   type: echo
  #   params:
  #     echo: Web Master
  - name: mysignature
    type: echo
    params:
      echo: "Regards,\n\n{{myname}}  \n{{mytitle}}  \n{{myemail}}"
```

The replacement for my signature here uses double new lines to get a regular paragraph tag after the `Regards,` and then two trailing spaces and single new line for a line break (`<br>` in HTML) after my name and job title. It assumes this will be used within other replacements that use the `markdown` output as I mentioned above.

For just outputting my signature, I use the following:

```yaml title="~/.config/espanso/match/base.yml"
matches:
  - trigger: ":sig"
    markdown: "{{mysignature}}"
```

espanso is very flexible, and using [extensions](https://espanso.org/docs/matches/extensions/) is where things get really wild. I have not dug further into it yet, but I hope to leverage some CLI tools and replace some functionality that I previously might have used a Raycast extension for, like URL or base64 encoding text. The default config file provides some examples:

```yaml title="~/.config/espanso/match/base.yml"
matches:
  # Print the current date
  - trigger: ":date"
    replace: "{{mydate}}"
    vars:
      - name: mydate
        type: date
        params:
          format: "%Y-%m-%d"

  # Print the output of a shell command
  - trigger: ":shell"
    replace: "{{output}}"
    vars:
      - name: output
        type: shell
        params:
          cmd: "echo 'Hello from your shell'"
```

You can view the rest of my [espanso matches config on my dotfiles repo](https://github.com/iainsimmons/dotfiles/blob/main/.config/espanso/match/base.yml)
