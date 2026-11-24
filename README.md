# Rhodes Recruitment Calculator

A fan-made Arknights recruitment calculator for exploring the English recruitment pool. Select your available tags, compare combinations, and browse matching operators in a lightweight interface built with HTML, CSS, and JavaScript.

## Features

- **Tag combinations:** Select up to five tags and compare subsets of one to three tags.
- **Minimum rarity:** See the lowest-rarity operator for each combination, ranked by highest minimum rarity first.
- **Three result views:** Browse combinations, operators matching every selected tag, or the full roster.
- **Search and filters:** Search operator names, toggle lower rarities, and sort by name or rarity.
- **Operator details:** Open a card to view its class, position, rarity, and tags.
- **Quick selections:** Start with Top Operator, Senior Operator, Healing + Support, or Robot.
- **Responsive layout:** Use the calculator on desktop or mobile.
- **Offline use:** Run the downloaded files without an account, backend, or build step.

## Getting started

### Open locally

1. Clone this repository or choose **Code → Download ZIP** and extract it.
2. Open `index.html` in a modern browser.
3. Keep `index.html`, `style.css`, `operators.js`, and `script.js` in the same folder.

No installation or local server is required. External source links need an internet connection.

### Optional local server

If you have [Node.js](https://nodejs.org/) installed, open a terminal in the project folder and run:

```sh
npx http-server . -a 127.0.0.1 -p 8080 -c-1
```

In Windows PowerShell, use `npx.cmd` if `npx` is blocked by the script execution policy.

Open [http://127.0.0.1:8080](http://127.0.0.1:8080). Keep the terminal running, refresh the browser after editing files, and press **Ctrl+C** to stop the server.

## How to use

1. Select up to five tags from your recruitment options.
2. Open **Combinations** to compare valid subsets of up to three tags.
3. Check each combination's **Lowest match** value and operator list.
4. Use **All selected tags** to inspect operators matching every selected tag. When more than three are selected, this is a comparison view; an actual recruitment accepts at most three tags.
5. Open **Full roster** to browse every operator in the embedded dataset, regardless of selected tags.

Search and rarity filters only change which results are visible. They do **not** raise a combination's minimum rarity. Six-star operators appear in tag-matching views only when the relevant tags include **Top Operator**.

## Dataset and limitations

The embedded English recruitment snapshot contains **158 operators**:

| Rarity | Operators |
| --- | ---: |
| 6★ | 34 |
| 5★ | 54 |
| 4★ | 41 |
| 3★ | 16 |
| 2★ | 5 |
| 1★ | 8 |

This dataset is maintained in the repository and does not refresh automatically. It may differ from the current in-game recruitment pool.

The calculator compares tag compatibility and assumes the selected tags remain. It does not calculate recruitment odds, tag-drop probabilities, or availability at a particular recruitment duration. Operator cards use initials instead of portrait artwork.

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | Page structure, controls, and script loading |
| `style.css` | Theme, component styles, and responsive layout |
| `operators.js` | Embedded operator records |
| `script.js` | Tag matching, combinations, filtering, and interactions |

The project uses plain HTML, CSS, and JavaScript with no runtime dependencies or build step. Operator data is loaded as a regular script, so the calculator can work directly from a local file.

### Updating operator data

Edit the records in `operators.js` using this structure:

```javascript
{
  "name": "Saria",
  "stars": 6,
  "cls": "Defender",
  "pos": "Melee",
  "tags": ["Defense", "Healing", "Support"]
}
```

The app adds class, position, and rarity tags automatically. If you introduce a new selectable tag, update `TAG_GROUPS` in `script.js` as well. When changing the dataset size, update the snapshot counts in `index.html` and this README.

### Hosting on GitHub Pages

In the repository, open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select **main** and **/ (root)**, then save. Once deployment completes, use the **Visit site** link shown there.

## Sources and credits

- [Arknights EN game data](https://github.com/ArknightsAssets/ArknightsGamedata/tree/master/en/gamedata/excel) — operator properties and recruitment membership.
- [Original recruitment calculator](https://akgcc.github.io/recruit/) — reference calculator credited by this project.

This is an unofficial fan project and is not affiliated with or endorsed by Arknights or its developers and publishers.
