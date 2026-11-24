# Rhodes Recruitment Calculator

## Open the site

1. Extract the entire ZIP into a folder.
2. Double-click `index.html` to open it in your browser.
3. Keep the four website files together in that folder.

No installation, internet connection, or local server is needed to use the calculator. The source links open external websites if you choose to click them.

## What each file does

| File | Responsibility | Start here when changing… |
| --- | --- | --- |
| `index.html` | Structure, sections, controls, and links to the other files | Headings, page text, buttons, or layout sections |
| `style.css` | Appearance and responsive layout | Colors, spacing, card sizes, or phone styling |
| `operators.js` | The 158 operator records | Names, rarities, classes, positions, and affix tags |
| `script.js` | Matching, combinations, interactions, and rendering | How selections and results behave |

`operators.js` is a JavaScript data file rather than a fetched JSON file. This lets you open `index.html` directly: browsers can restrict loading a separate JSON file with `fetch()` when a page is opened from your computer.

## Suggested reading order

1. Read `index.html` to see the page structure.
2. Read the first operator in `operators.js` to understand a data record.
3. In `script.js`, read `state`, `findMatches()`, and `generateCombinations()`.
4. Follow `toggleTag()` into `render()` to see how clicks update results.
5. Read `buildOperatorCard()` to see how data becomes HTML.
6. Read the numbered sections of `style.css` to understand the design.

## How the files connect

The HTML loads the stylesheet, then runs `operators.js` before `script.js`. Both scripts use `defer`, so the page structure is ready before startup runs.

`operators.js` supplies an array named `window.RECRUITMENT_OPERATORS`. `script.js` reads that array, adds class/position/rarity tags, attaches event listeners, and renders the initial Top Operator selection.

## Editing an operator

Each operator record has these fields:

```javascript
{
  "name": "Saria",
  "stars": 6,
  "cls": "Defender",
  "pos": "Melee",
  "tags": ["Defense", "Healing", "Support"]
}
```

Keep the field names and punctuation intact. `tags` contains affixes; the program adds the class, position, and rarity tag automatically. Save changes, then refresh the browser.

## Behavior retained

- 158 operators, including 34 Top Operators and 54 Senior Operators.
- Up to five selected tags; combinations use one to three.
- Six-star operators require Top Operator in tag-matching views.
- Full roster includes everyone regardless of selected tags.
- Operator name search, rarity visibility controls, and name/rarity sorting.
- Clickable operator details, quick selections, and Reset.
- Rarity minimums use every matching operator before display filters.
- Responsive layouts for desktop and phone screens.

## Data scope

This preserves the EN dataset embedded in the previous version. It is a snapshot, not an automatically updated live list. No operator data was added or removed during separation.

Sources: [EN game data](https://github.com/ArknightsAssets/ArknightsGamedata/tree/master/en/gamedata/excel) and the [original calculator](https://akgcc.github.io/recruit/).

The calculator compares tag compatibility and assumes tags remain. It does not model recruitment time, tag-drop probabilities, or recruitment odds. Initials are used instead of portrait artwork. Fan-made and not affiliated with Arknights.
