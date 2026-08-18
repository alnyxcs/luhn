# luhn.

**Test bank card number generator with Luhn-valid numbers**

A lightweight web tool for developers and testers: generates card numbers that pass the Luhn checksum validation, along with expiry dates and CVVs. Runs locally from a file — no server, no build step, no dependencies.

[![Live demo](https://img.shields.io/badge/Live%20demo-alnyxcs.github.io%2Fluhn-0aa85e)](https://alnyxcs.github.io/luhn) ![HTML5](https://img.shields.io/badge/HTML5-%23E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-%231572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-%23F7DF1E?logo=javascript&logoColor=black) ![No dependencies](https://img.shields.io/badge/dependencies-none-0aa85e)

---

## Features

- **5 payment networks** — Visa, Mastercard, Amex, Mir, UnionPay
- **Luhn-valid numbers** — every number passes the checksum validation (not just random digits)
- **BIN prefix** — generate with a custom 6-digit prefix; built-in network detector with soft warnings on mismatch
- **Quantity 1–1000** — stepper or direct input
- **Live card preview** — with brand mark, chip, expiry and CVV; subtle tilt following the cursor and a swap animation on the number
- **One-click copy** — the number alone, or number + expiry + CVV, or all numbers at once
- **Export to TXT** — `number|expiry|cvv` per line
- **Performance** — chunked list rendering (50 rows per frame), smooth even with 1000 cards
- **Accessibility** — ARIA attributes, full keyboard support, `prefers-reduced-motion` respected
- **Zero dependencies** — plain JS and CSS; works even when opened via `file://`

## Supported networks

| Network       | Number length | Prefixes                          |
| ------------- | ------------- | --------------------------------- |
| Visa          | 16            | `4`                               |
| Mastercard    | 16            | `51–55`, `2221–2720`              |
| American Express | 15         | `34`, `37` (`4-6-5` format)       |
| Mir           | 16            | `2200–2204`                       |
| UnionPay      | 16            | `62`                              |

## Quick start

No installation required:

1. Download the project folder (or clone the repository).
2. Open `index.html` in any modern browser — or use the [live demo](https://alnyxcs.github.io/luhn).
3. The page shows an example right away: the first result is generated automatically on load.

## How to use

1. **Pick a network** — the Visa / Mastercard / Amex / Mir / UnionPay switcher.
2. **Set a BIN (optional)** — up to 6 digits. If the prefix belongs to another network, a soft warning appears, but generation still proceeds. `Esc` clears the field.
3. **Set the quantity** — from 1 to 1000, via the stepper or direct input.
4. **Hit Generate** — results appear in the list below and the card preview updates.

**Copying:**

- Click a number in the list — copy just the number
- The copy icon on a row — copy `number|expiry|cvv`
- **Copy all numbers** — copy every number at once
- **Export TXT** — download a `luhn-numbers.txt` file
- Click the card preview — copy the number of the first generated card

## Keyboard shortcuts

| Shortcut              | Action                              |
| --------------------- | ----------------------------------- |
| `Ctrl`/`Cmd` + `Enter` | Generate (from anywhere)           |
| `Enter` in BIN field  | Generate                            |
| `Esc` in BIN field    | Clear the field and blur it         |

## Project structure

```
├── index.html   # interface markup (semantic, with ARIA attributes)
├── style.css    # dark theme, card, animations, responsiveness
└── script.js    # all logic: generation, validation, copying, export
```

## How it works

### The Luhn algorithm

The Luhn checksum is the core of the generator. Walking the digits from right to left, every second digit is doubled (subtracting 9 when the result exceeds 9), and all digits are summed. A number is valid when the total is a multiple of 10.

- `computeCheckDigit(body)` — builds the check digit for a number body. The parity is shifted (the rightmost body digit gets doubled), the sum is computed, and the check digit is `(10 − sum % 10) % 10`.
- `isValidLuhn(number)` — final verification: the number must be 12–19 digits and its checksum must equal 0.
- **Safety loop** — the number is rebuilt up to 100 times until it passes validation, so a valid result is guaranteed even with unusual BIN prefixes.

### Number generation

1. **Prefix** — either the user's BIN or a random prefix from the network's real IIN ranges (Visa `4`, Mastercard `51–55` / `2221–2720`, Amex `34` / `37`, Mir `2200–2204`, UnionPay `62`).
2. **Body** — the prefix is padded with random digits up to `length − 1`; the last digit is the computed check digit.
3. **Expiry and CVV** — expiry is a random month and a year 2–5 years ahead; CVV is 3 digits (4 for Amex). Amex numbers are formatted as `4-6-5`, all others as groups of 4.

### Page flow

- **On load** — the state is initialized and a demo generation runs immediately, so the page is never empty.
- **Network switcher** — a floating indicator slides between segments (position set via CSS variables by JS); switching restyles the card preview and resets it to the placeholder.
- **BIN field** — non-digit characters are stripped on input; validation requires exactly 6 digits. The prefix is checked against known networks: a mismatch or unknown prefix shows a soft warning but does not block generation. `Esc` clears the field.
- **Quantity** — stepper buttons and direct input (digits only), clamped to 1–1000; `Enter` commits the value and triggers generation.

### Rendering & performance

- **Chunked rendering** — the results list is built in batches of 50 rows per animation frame, keeping the UI responsive even with 1000 cards.
- **Render token** — each generation increments a token; a stale render in progress is cancelled the moment a new one starts.
- **Adaptive modes** — lists over 150 rows drop heavy per-row effects; lists over 10 rows get their own scroll area with a fade hint at the bottom.
- **Cascade animation** — only the first rows animate with a stagger; the rest appear instantly.

### Copy & export

- `navigator.clipboard` is used first, with a hidden-textarea `execCommand` fallback for `file://` and older browsers.
- Copy targets: the number alone (click on the row), `number|expiry|cvv` (row icon), or all numbers at once (built from state data, not the DOM — fast even at 1000 rows).
- Export creates a `Blob`, downloads it as `luhn-numbers.txt` via an object URL, one `number|expiry|cvv` per line.
- Every copy/export action flashes an inline "Copied ✓" state that fades after 1.5 s; failures surface as toasts.

### Keyboard & accessibility

- `Ctrl`/`Cmd` + `Enter` generates from anywhere; `Enter` in the BIN field generates; `Esc` clears the BIN field.
- The UI uses ARIA roles and labels throughout, visible focus rings, and respects `prefers-reduced-motion` (the card tilt and all animations are disabled).
- The card tilt follows the cursor only on fine-pointer devices; on touch screens it stays static.

## Tech stack

- Plain HTML / CSS / JavaScript — no frameworks, no build tools
- CSS variables and grid for responsive layout
- `navigator.clipboard` with an `execCommand` fallback for `file://`

## Disclaimer

All numbers, expiry dates and CVVs are generated randomly, do not correspond to real bank cards, and are intended **for testing purposes only** — development, debugging, QA workflows and education. Do not use them for real payments.