---
title: Raycast Extension fetch error
description: "today iain learned: Raycast Extension fetch error"
date: 2025-12-02
tags:
  - Raycast
  - extension
  - security
---
While trying to use a [custom Raycast extension](https://developers.raycast.com) that I built for work, it kept throwing a fetch error, something like this:

```
FetchError: request to https://path.to.my/api/endpoint failed, reason: self-signed certificate in certificate chain
```

Turns out it doesn't like self signed certificates and uses some sort of default set of [certificate authorities](https://en.wikipedia.org/wiki/Certificate_authority) (CA).

It's a simple fix, and just requires a change to the Raycast Advanced Settings to set the Certificates to **Keychain** instead of **Default**:

![[Raycast-Settings-Advanced-Certificates.png]]

As is often the case, the fix was found in the [GitHub issues for raycast/extensions](https://github.com/raycast/extensions/issues/12514#issuecomment-2437587019).
