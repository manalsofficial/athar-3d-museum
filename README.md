# ATHAR — Living Digital Museum

ATHAR is a hackathon-ready prototype for a living digital museum built from the voices, memories and knowledge of Saudi heritage contributors.

## What is fixed in this version

- Real English/Arabic UI translations, not just RTL direction.
- Global Voice Mode available from every page.
- Voice navigation works in English and Arabic.
- First voice activation asks whether the user wants English or Arabic.
- Voice commands can navigate Home, Museum, Find a person, Share Story, Back and Stop.
- Voice queries can open the Find Person search with a spoken query.
- Voice commands can open a requested exhibit.
- Fixed 3D museum camera with left/right controls and keyboard arrows.
- Smooth camera movement that centers the selected artwork.
- Textured floor, walls and ceiling.
- Larger, thinner picture frames.
- Exhibit selection opens a clean list of recordings/stories by category.
- Play buttons are always visible; if no audio file exists, the story transcript is spoken as a fallback.
- Lucide icons replace text-symbol UI icons.
- Splash screen spacing is cleaned up.
- OpenAI Responses API backend for search, story Q&A and story transformation.
- OpenAI TTS endpoint with browser speech fallback.
- API health and test endpoints.

## Setup

From the project folder:

```bash
npm install
```

Create `.env` from `.env.example` and add your own API key:

```env
OPENAI_API_KEY=your_new_key_here
OPENAI_MODEL=gpt-6-luna
PORT=8787
```

Never commit `.env` or expose the API key in React code.

## Run

```bash
npm run dev
```

This starts:

- Vite: http://localhost:5173
- ATHAR API: http://localhost:8787

## Test backend before using the app

Open:

```text
http://localhost:8787/api/health
```

Expected shape:

```json
{"ok":true,"ai":true,"model":"gpt-6-luna","tts":true}
```

Then test an actual OpenAI request:

```text
http://localhost:8787/api/test-ai
```

Then test TTS from the browser console:

```js
fetch('/api/tts', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    text: 'Welcome to ATHAR. Every voice leaves an أثر.',
    language: 'en'
  })
}).then(r => r.blob()).then(blob => {
  const audio = new Audio(URL.createObjectURL(blob));
  audio.play();
});
```

## Important security note

The original project ZIP contained an OpenAI API key in `.env`. That key must be revoked and replaced before submission. The cleaned project contains an empty `.env` instead.

## Submission demo flow

1. Landing → Enter the museum.
2. Toggle Arabic → confirm the interface actually changes language.
3. Open Voice Mode from any page.
4. Say English or Arabic when prompted.
5. Say “Explore the museum.”
6. Use left/right arrows or keyboard arrows to move between exhibits.
7. Select an exhibit.
8. Show the list of voices/stories.
9. Play a story.
10. Go to Find a person.
11. Search for someone who can teach embroidery.
12. Open a contributor.
13. Ask the story a question.
14. Share a story and demonstrate AI exhibit processing if the API key is configured.
