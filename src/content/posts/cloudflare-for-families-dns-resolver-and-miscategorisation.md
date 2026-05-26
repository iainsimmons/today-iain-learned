---
title: Cloudflare for Families DNS resolver and miscategorisation
description: "today iain learned: How to report a miscategorisation of a site/domain in the Cloudflare for Families DNS resolver service."
date: 2026-05-26
tags:
  - webdev
  - Cloudflare
  - parenthood
  - DNS
  - safety
  - security
draft: false
---

I'm a big fan of [Cloudflare](https://www.cloudflare.com/) (this blog is hosted on [Cloudflare Workers](https://developers.cloudflare.com/workers/)). I'm also a big fan of protecting my children from stumbling across adult content, malware, and any other "bad" content while using the internet.

So when I heard about [Cloudflare's 1.1.1.1 for Families DNS resolver service](https://blog.cloudflare.com/introducing-1-1-1-1-for-families/) a while back (I think perhaps on the [Syntax.fm podcast](https://syntax.fm/)), I almost immediately configured my router to use it for its <a href="https://www.cloudflare.com/learning/dns/what-is-dns/"><abbr title="Domain Name System">DNS</abbr></a> server configuration. That is, I changed my primary and secondary DNS server to point to `1.1.1.3` and `1.0.0.3`, respectively. This will resolve domain names that exist in their naughty list to just `0.0.0.0` (`localhost` or just nothing really) instead of their actual IP address, preventing anyone on my network from connecting to those sites. See the [Cloudflare docs on 1.1.1.1 for Families](https://developers.cloudflare.com/1.1.1.1/setup/#1111-for-families).

I mostly don't have to think about it, which is good. It's nice to have a free service that just does what it is meant to and gets out of your way. I think it is also meant to be faster than your average DNS service (something something Cloudflare is everywhere).

Recently I was going to recommend [Cassidy Williams' FancyGist markdown editor service](https://github.com/cassidoo/fancygist) to a friend, but when I visited the site at [fancygist.com](https://fancygist.com/), I saw the usual browser error for a failed connection:

![[attachments/chrome-error-refused-to-connect.png|Chrome error: Refused to connect]]

I reached out to [Cassidy](https://cassidoo.co/) by replying to her email newsletter (which you should absolutely [subscribe to](https://cassidoo.co/newsletter)!) to ask if it was down for her. It seemed like it was just me, and connecting via a different network I had no problems, so that was what brought to mind the Cloudflare for Families DNS.

I did some research and eventually found a link to the [Cloudflare Radar Domain Categorization form](https://radar.cloudflare.com/domains/feedback) where you can check and then report a miscategorisation of a domain. Sure enough, after entering `fancygist.com`, it reported that it had been flagged as a… "naughty" site. I sent the link to the form to Cassidy and we both suggested a new categorisation and in less than a day it was correctly categorised as a Technology site. 🙂
