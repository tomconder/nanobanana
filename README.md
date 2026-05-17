# nanobanana

A Cloudflare Worker that generates images from text prompts using Google's [nano-banana-2](https://developers.cloudflare.com/ai/models/google/nano-banana-2/) model via [Workers AI](https://developers.cloudflare.com/workers-ai/).

## Features

- Text-to-image generation with aspect ratio and resolution controls
- Optional reference image upload for style/content guidance
- Simple browser UI served directly from the Worker

## Requirements

- [Cloudflare account](https://dash.cloudflare.com/sign-up) with Workers AI enabled
- [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/)

## Setup

```bash
pnpm install
npx wrangler login
```

## Development

```bash
npx wrangler dev --remote
```

The `--remote` flag is required so the AI binding can reach Cloudflare's inference API. Open [http://localhost:8787](http://localhost:8787).

## Deploy

```bash
npx wrangler deploy
```

## Usage

Open the deployed URL in a browser. Enter a prompt, optionally upload a reference image, choose an aspect ratio and resolution, and click **Generate**.

The image endpoint is also accessible directly:

```
POST /generate
Content-Type: application/json

{
  "prompt": "A sunset over mountains",
  "aspect_ratio": "16:9",
  "resolution": "2K"
}
```

An optional `image_base64` field accepts a base64-encoded reference image.

## Pre-commit hooks

```bash
pip install pre-commit
pre-commit install
```

## License

MIT
