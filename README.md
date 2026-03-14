# PaperXBecoming

Live demo: [khanaaaaaa.github.io/PaperXBecoming](https://khanaaaaaa.github.io/PaperXBecoming/)

---

## What it is

PaperXBecoming is a mindfulness web app built around affirmation cards. You tell it how you're arriving and it gives you a quote to sit withtailored to that mood. You can save cards you want to keep, and use the meditation tab for a breathing guide and session timer.

---

## Why I made it

I wanted to build something that felt intentional, something that slows you down for a minute. I also wanted a project that was fully mine in terms of design direction, not just a tutorial clone.

---

## How I built it

Plain HTML, CSS, and vanilla JavaScript — no frameworks, no build tools. Just three files and a clear head.

- **Quotes** come from the [ZenQuotes API](https://zenquotes.io/) via an allorigins CORS proxy. A local fallback array loads instantly while the fetch runs in the background, so the card is never blank.
- **Mood check-in** is a full-screen splash on load. Selecting a mood (Heavy / Searching / Grateful) sets which reflection pool gets used for the back of the card.
- **Flip cards** use CSS `transform-style: preserve-3d` and `rotateY` — no JavaScript for the animation at all.
- **Library** persists saved cards to `localStorage` and renders them in a slide-in panel.
- **Meditation tab** has a configurable countdown timer and a breathing guide that cycles through inhale / hold / exhale phases.
- **Typewriter effect** types out each quote character by character with a cancellation token so switching cards mid-animation doesn't cause overlap.

---

## What I struggled with and what I learned

**CORS** was the first real wall. ZenQuotes doesn't allow direct browser requests, so I had to route through a proxy (`allorigins.win`). That proxy also caches responses, which caused the same quote to repeat — fixed by appending `&t=Date.now()` to bust the cache.

**The blank card bug** took longer than it should have. The issue was that `loadCard()` is async, so the card rendered before the fetch resolved. The fix was to show a fallback quote immediately and silently replace it if the API responded in time.

**CSS flip cards** looked simple but `backface-visibility` behaves inconsistently across browsers without `transform-style: preserve-3d` set on the parent. Small thing, annoying to debug.

The biggest thing I learned is that debugging your own code after you've been staring at it for hours is genuinely hard. Reading the file when you're fresh or having someone else read it catches things you've gone blind to.
