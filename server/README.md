# ATHAR API

Run from the project root:

```bash
npm install
npm run dev
```

The API runs on port 8787 by default.

## Endpoints

- `GET /api/health` — configuration/status check
- `GET /api/test-ai` — real OpenAI Responses API test
- `POST /api/search` — contributor matching
- `POST /api/ask-story` — answers only from a contributor transcript
- `POST /api/process-story` — transforms a submitted story into exhibit JSON
- `POST /api/tts` — OpenAI text-to-speech with Arabic/English instructions

The OpenAI key is server-side only. Never put it in `src/` or expose it through Vite.
