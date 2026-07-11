---
title: Replacing Raycast with macOS built-in and open source alternatives
date: 2026-07-11
description: "today iain learned: How to replace most of the common Raycast features with macOS built-in software and functionality, and/or open source alternatives"
tags:
  - macos
  - Raycast
  - productivity
  - tools
hideTOC: false
draft: false
atUri: "at://did:plc:aoqs4f5ru6ztomatyvept7bf/site.standard.document/3mqeqy5apgj2i"
---
Recently two things have happened to cause me to have to switch away from Raycast on macOS.

First, the company I work for starting locking down the software we can use, particularly those that are not open source or that make use of AI (aside from a couple of approved AI tools we use internally). Raycast is both of those things.

Second, with the recent release of macOS Tahoe, [Spotlight got a massive upgrade](https://support.apple.com/en-au/guide/mac-help/mchlp1008/26/mac/26). People were quick to declare that Raycast had been "Sherlocked" by Apple's new version of Spotlight.

So here's how I replaced the majority of the functionality I use on a daily basis with either built-in macOS / Spotlight functionality, or with suitable open source replacement tools.

## Global keyboard shortcuts

The main thing I use Raycast for is quickly launching apps. The most commonly used apps have a Hyper keyboard shortcut (Hyper is basically <kbd>Ctrl</kbd> + <kbd>Opt</kbd> + <kbd>Cmd</kbd> + <kbd>Shift</kbd>, and I have it mapped to my CapsLock key when I hold it down). For that I used the popular open source tool [skhd](https://github.com/asmvik/skhd), which describes itself as a "Simple hotkey daemon for macOS".

As you can see below, it is pretty simple to configure. You just run it as a daemon (service running in the background) and set up your keymaps.

```txt title=".config/skhd/skhdrc"
# hyper keymaps to switch to apps
hyper - return : open -a "kitty"
hyper - 1 : open -a "1Password"
hyper - b : open -a "Microsoft Edge"
hyper - c : open -a "Google Chrome"
hyper - e : open -a "Finder"
hyper - f : open -a "Figma"
hyper - m : open -a "Spotify"
hyper - o : open -a "Obsidian"
hyper - p : open -a "Privileges"
hyper - s : open -a "Slack"
hyper - t : open -a "TickTick"
```

Here I've mapped them to run the built-in macOS CLI command `open` with the `-a` flag, which will open the specified application (or focus if already open).

For anything else, I can simply [find and open apps in Spotlight](https://support.apple.com/en-au/guide/mac-help/mh35840/26/mac/26).

## Window management

A lot of the regular window management actions I use have existing keyboard shortcuts in macOS Tahoe. See [Mac window tiling icons & keyboard shortcuts](https://support.apple.com/en-au/guide/mac-help/mchl9674d0b0/26/mac/26).

I've changed the ones for moving a window to fill the half screen in each direction to match what I had in Raycast, which is <kbd>Ctrl</kbd> + <kbd>Opt</kbd> + <kbd>Cmd</kbd> + <kbd>Left</kbd>, etc for each of the arrows/directions; and resize the window to fill the screen with <kbd>Ctrl</kbd> + <kbd>Opt</kbd> + <kbd>Shift</kbd> + <kbd>Enter</kbd>.

I will miss the "Almost Maximise" window management action that Raycast has though.

## Clipboard history/management

I'm now using [Maccy](https://github.com/p0deje/Maccy), which describes itself as a "Lightweight clipboard manager for macOS". It's fantastic! I've mapped the same global keyboard shortcut that I used in Raycast, which was <kbd>Ctrl</kbd> + <kbd>Cmd</kbd> + <kbd>C</kbd>.

You can now also [search your clipboard history directly in Spotlight](https://support.apple.com/en-au/guide/mac-help/mchl40d5b86b/26/mac/26) .

## Snippets

For short snippets that are less than one line, with no newlines/line breaks, there's the macOS built-in [Text Replacements](https://support.apple.com/en-au/guide/mac-help/mh35735/26/mac/26). It's slightly annoying to have to accept it instead of automatically replacing it, but I can live with that.

Some examples of snippets I occasionally use:

```txt
!iife => (function() { })();
shruggie => ¯\_(ツ)_/¯
... => …
```

For longer snippets, I just pin them in Maccy (see above), then add a shortcut, which are all <kbd>Cmd</kbd> plus a single letter. e.g. <kbd>Cmd</kbd> + <kbd>S</kbd> for inserting my signature for work correspondence, etc. In Raycast I used to type `!sig` to achieve the same thing, so it's a similar amount of keystrokes.

## Quicklinks

Most of these can just be regular browser bookmarks. Those can often be exported/imported into other browsers if need be.

Simply add custom "search engines" in your browser of choice. Here's the docs for doing that in Google Chrome: [Manage search engines and site shortcuts](https://support.google.com/chrome/answer/95426?hl=en&co=GENIE.Platform%3DDesktop#zippy=%2Csearch-engine-field%2Cshortcut-field%2Curl-with-s-in-place-of-query-field).

For example, to add a search for the [Mozilla Developer Network docs](https://developer.mozilla.org):

**Search engine:** Mozilla Developer Network
**Shortcut:** `mdn`
**URL:** `https://developer.mozilla.org/en-US/search?q=%s`

Then you can type `mdn`, press <kbd>Space</kbd> or <kbd>Tab</kbd> and then your search query and it will open the search results page directly.

It doesn't have to be a "search" in the normal sense, it can fill any part of the URL.

Here's an example for checking what a HTTP status code means (thank me later):

**Search engine:** HTTP Status Dogs
**Shortcut:** `status`
**URL:** `https://http.dog/%s`

So typing `status 418` in the address bar will take me to https://http.dog/418

For some of the other features of Quicklinks, like choosing from a list, I used [Shortcuts](https://support.apple.com/en-au/guide/shortcuts-mac/apdf22b0444c/mac). Shortcuts in macOS are a little funky to use. I almost prefer the old Automator, but maybe it will just take some time to get used to. Maybe I'll see if there's a good way to replace more things with CLI commands and mapping them to keys via skhd.

## Calculations and conversions

Some of these are now also [built in to Spotlight](https://support.apple.com/en-au/guide/mac-help/mchldd6ba066/26/mac/26).

## Other actions

There's [a bunch of other things you can now do in Spotlight with Actions](https://support.apple.com/en-au/guide/mac-help/mchl4953dfeb/26/mac/26). I just needed to disable Actions from a bunch of built-in Apple apps that I don't use, most of which I have an alternative that I like better:
- Notes (TickTick/Obsidian)
* Reminders (TickTick)
* Mail & Calendar (Google Mail / Calendar in the browser)
* Podcasts (either Spotify or AntennaPod on my Android Phone)

## Other features of Raycast

I was not using the AI features of Raycast. If you do, then I expect you would just use the individual AI tools directly. Anything else I would try to find a CLI equivalent.