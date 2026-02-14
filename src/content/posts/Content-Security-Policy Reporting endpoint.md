---
title: Content-Security-Policy Reporting endpoint
description: "today iain learned: Content-Security-Policy Reporting endpoint"
date: 2025-11-04
tags:
  - webdev
  - security
draft: false
aliases:
---
While looking at an implementation of the [Content-Security-Policy-Report-Only](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy-Report-Only) HTTP header with a colleague at work, we saw mention of a reporting endpoint.

Using a combination of a CSP directive [`report-to`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/report-to) and a [`Reporting-Endpoints`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Reporting-Endpoints)
HTTP Header you can have the _user's browser_ log CSP violations!

Here is a minimal example of the headers (from MDN):

```
Reporting-Endpoints: csp-endpoint="https://example.com/csp-reports"
Content-Security-Policy: default-src 'self'; report-to csp-endpoint
```

Where `https://example.com/csp-reports` would be a server endpoint that accepts `POST` requests with a JSON payload and `Content-Type` of `application/reports+json` that looks something like this:

```json
{
  "age": 53531,
  "body": {
    "blockedURL": "inline",
    "columnNumber": 39,
    "disposition": "enforce",
    "documentURL": "https://example.com/page-with-violation",
    "effectiveDirective": "script-src-elem",
    "lineNumber": 121,
    "originalPolicy": "default-src 'self'; report-to csp-endpoint",
    "referrer": "https://www.google.com/",
    "sample": "console.log(\"lo\")",
    "sourceFile": "https://example.com/page-with-violation",
    "statusCode": 200
  },
  "type": "csp-violation",
  "url": "https://example.com/page-with-violation",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
}
```

That endpoint could log or email the violations as needed.

On this very site I've implemented the endpoint with a [Cloudflare Worker](https://developers.cloudflare.com/workers/).

Here's the relevant code to handle the CSP reporting requests:

```js
export default {
  async fetch(request, env, ctx) {
    // handle POST requests
    if (request.method === "POST") {
      try {
	    // Try get and parse the request payload as JSON
        const reports = await request.json();
        
        // log the violation
        // this only goes to the Cloudflare logs,
        // but you could store in a database or KV
        // or send an email
        console.log("CSP Violation:", JSON.stringify(reports, null, 2));
        
        // return an OK response and plain text content
        return new Response("CSP Report received", { status: 200 });
      } catch (e) {
        // if the request payload did not parse correctly as valid JSON
        // return a Bad Request status code and message
        return new Response("Invalid JSON", { status: 400 });
      }
    }

	// otherwise for GET requests or anything else
	// just return an OK response and message
    return new Response("Endpoint active. Send CSP reports here.", { status: 200 });
  },
};
```

Here's a random placeholder image from an external site that should trigger it:

![Placeholder image](https://placehold.co/200x50?text=CSP+Violation!)
