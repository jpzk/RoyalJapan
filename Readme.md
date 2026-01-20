# Using Cursor Cloud Agents for Malware analysis

I forked the malicious repository and analyzed it using the Cursor Background
Agents sandbox and GPT-5.2 Codex. For the social engineering part, see [LinkedIn Post](https://www.linkedin.com/feed/update/urn:li:activity:7419343455384014848/). 

This repository contained a multi-stage, malicious execution chain embedded in
the frontend configuration. The stage-0 trigger has been commented out so the
repo is safe to check out, but the remaining files are kept for analysis.
This attack occurred on 20 January 2026.

## Technical attack chain

### Stage 0: Next.js config execution (trigger)
**File:** `frontend/next.config.js`

An appended one-liner executed on every Next.js startup or build:

- Reads a local file: `frontend/public/assets/js/jquery.min.js`
- Executes its contents with `eval`

This is dangerous because `next.config.js` runs in the Node.js process during
`next dev`, `next build`, CI, or any tooling that loads the config.

The malicious block is now commented out.

### Stage 1: Local loader disguised as jQuery
**File:** `frontend/public/assets/js/jquery.min.js`

This file is not jQuery. It:

- Decodes a base64 URL
- Fetches remote JavaScript via `node-fetch`
- Executes the response with `eval`

Decoded URL:
```
http://api-web3-auth.vercel.app/api/auth
```

### Stage 2: Remote payload (downloaded for analysis)
**File (captured):** `analysis/api-auth.js`

Behavior:

- Collects host data (hostname, MACs, OS info)
- Sends it to a command-and-control (C2) server
- If the server replies with `status: "error"`, it executes arbitrary code
  using `new Function('require', message)` which enables full Node.js RCE

The C2 endpoint seen in the payload:
```
http://66.235.168.136:3000/api/errorMessage
```

### Stage -2: Social engineering via LinkedIn

Message sent to target:

Sender profile:
https://www.linkedin.com/in/arturo-molleda/

```
Hi Jendrik,

I'd like to arrange the meeting with our manager
https://calendly.com/japanese-royal/interview

Please schedule the call on your available time
Our manager will join the call to know more about your project experience and also discuss our project details

Best regards
Arturo
```

### Stage -1: Social engineering via Google Meet

- Video on for the first ~1 minute, then video off; mic-only conversation.
- Asks about credentials and why the job is a fit, then shares a link to the repo.
- Requests screen sharing; request denied due to multiple red flags.
- Says he does not understand the concern and claims he is on mobile, so cannot
  screen share, and suggests rescheduling.

## Why this is severe

- The attack triggers automatically during normal development workflows.
- Remote code execution can run arbitrary Node.js code, read files, or access
  environment secrets.
- Beaconing every 5 seconds creates a persistent control channel.

## Indicators of Compromise (IOCs)

**Network:**
- `http://api-web3-auth.vercel.app/api/auth`
- `http://66.235.168.136:3000/api/errorMessage`

**Malicious files:**
- `frontend/next.config.js` (stage-0 trigger, now commented)
- `frontend/public/assets/js/jquery.min.js` (stage-1 loader)
- `analysis/api-auth.js` (captured stage-2 payload)

## Safe checkout guidance

- Do not run `next dev` or `next build` until the stage-0 code is removed.
- Verify `frontend/next.config.js` contains only the legitimate config export.
- Remove or quarantine the fake `jquery.min.js` if not needed.

If you need the original project instructions, refer to the git history or
recreate them in a separate clean README.


