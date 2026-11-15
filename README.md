# KriolBridge AI

**[Try KriolBridge AI](https://mykeil-tzul.github.io/kriolbridge-ai/)**

I built KriolBridge so people can practice everyday Belizean Kriol alongside English and Spanish. Try a greeting, a market visit, or asking for help. The phrasebook shows the source for each entry so you can see where the wording came from.

## What it does

- Look up phrases in all six language directions. Results are drawn from 21 sourced entries. Common paraphrases and spelling variants can resolve to a phrasebook entry or a related suggestion.
- Browse side-by-side translations and practice three conversations covering greetings, a market visit, and asking for help.
- Play local synthetic English or Spanish voices where supported. Record and replay up to 20 seconds of your own practice in the tab. Recordings aren't uploaded or saved by the app.
- Download a private review draft. This prototype has no public submission service, community review workflow, or native-speaker recordings.

## NLP and sourcing

Lookup normalizes accents and punctuation, prioritizes exact matches and curated aliases, then ranks character trigram vectors using TF-IDF weights and cosine similarity. It can report no match. Similarity is a retrieval heuristic and doesn't establish translation accuracy. This MVP is a small phrase finder, not open-ended machine translation or speech recognition.

The parallel entries are sourced from the [Air University Belize expeditionary culture field guide](https://www.airuniversity.af.edu/AFCLC/Ready-Airman-Training/Field-Guides/) language section. Examples reflect that guide's spelling and have not been independently reviewed by community speakers for this app. Belizean Kriol has regional and speaker variation. The [JHU CreoleMT paper](https://aclanthology.org/2025.wmt-1.93/) informs a possible next research phase. Its dataset was not used to train or populate this app.

## Run locally

```sh
python3 -m http.server 8000 --directory site
node --test tests/*.test.mjs
```

Localhost and HTTPS support microphone access where the browser allows it. Audio capture is optional. Automated tests verify all three lookup languages, aliases, misspellings, abstention, and conversation references. GitHub Pages hosts the public app.
