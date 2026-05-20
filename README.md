# EX2 — Coordinated Views with D3

Extend a multi-chart movie visualization with smooth transitions and coordinated interactions using D3.

---

## Files

| File | Description |
|---|---|
| `index.html` | Full page layout — controls ribbon, sidebar, three chart containers. Do not modify. |
| `js/netflix.js` | Class skeletons with static rendering already working. Your work goes here. |
| `data/tmdb_votes1000.txt` | 1 000 highly-rated movies from TMDB (see column reference below). |

The starter code gives you three chart classes (`Scatterplot`, `BarChart`, `LineChart`) and an `App` class that wires them together. Each chart's `update()` method already draws its marks and axes without animation. The `App` class already loads data, buckets categories, and calls each chart on startup.

---

## What you need to implement

### Part 1 — Transitions

Add animated transitions wherever the charts update their visual marks. In D3, this is easy. Call `.transition().duration(ms)` on a selection before setting attributes, and use `.call(s => s.transition()...)` inside `.join()` callbacks. See the documentation <a href="https://d3js.org/d3-transition">here</a>, and a nice article <a href="https://www.d3indepth.com/transitions/"> here</a>.

**Scatterplot circles**

Inside `Scatterplot.update()`, modify the `.join()` so that:
- **Enter**: new circles start with `r = 0` and grow to their final radius over 500 ms.
- **Update**: existing circles slide to their new `cx`, `cy`, `r`, and `fill` over 500 ms.
- **Exit**: departing circles shrink back to `r = 0` over 300 ms, then are removed.

Also transition the axes:
```js
vis.select('.x-axis').transition().duration(500).call(d3.axisBottom(xScale));
vis.select('.y-axis').transition().duration(500).call(d3.axisLeft(yScale));
```

**Bar chart bars**

Inside `BarChart.update()`, modify the `.join()` so that:
- **Enter**: new bars start at `y = height`, `height = 0` (at the baseline) and rise to their final position over 500 ms.
- **Update**: existing bars slide to their new `x`, `y`, `width`, `height`, and `fill` over 500 ms.
- **Exit**: bars drop back to the baseline over 300 ms, then are removed.

Also transition the y-axis.

**Line chart**

Inside `LineChart.update()`, modify the joins so that:
- The **line path** morphs to its new shape over 500 ms on update (use `.attr('d', lineGen)` inside a transition).
- **Dots** slide to new positions over 500 ms; entering dots grow from `r = 0`, exiting dots shrink.

**Highlight transitions**

Add a short 200 ms transition to the `highlight()` and `clearHighlight()` methods in both `Scatterplot` and `BarChart`, so opacity fades smoothly rather than jumping.

> **Tip:** CSS stylesheet rules override SVG presentation attributes (set via `.attr()`). To ensure your opacity values are applied, use `.style('opacity', value)` instead of `.attr('opacity', value)`. Clearing with `.style('opacity', null)` removes the inline style and lets the CSS class default take effect again.

---

### Part 2 — Coordinated interactions

The three charts share data and visual state. The interactions are:

| Trigger | Effect |
|---|---|
| Drag in scatterplot | Brush filters which data the bar and line charts show |
| Click a bar | Highlights matching circles in scatterplot; fades others |
| Drag on line chart | Highlights circles in scatterplot for the selected year range |
| **Filter** button | Permanently narrows the dataset to the current selection |
| **Reset** button | Restores the full original dataset |

For an example of a brush interaction, see <a href="https://observablehq.com/@d3/focus-context?collection=@d3/d3-brush">this notebook</a>.

#### Scatter brush

In `Scatterplot.constructor()`, append a brush group and call `d3.brush()` on it:

```js
this._brushGroup = //Append an svg group;
this._brush = d3.brush()
  .extent(//How big can the brush be? Give in [x1,y1], [x2,y2].
    )
  .on('brush end', (event) => this._handleBrush(event));
this._brushGroup.call(this._brush);
```

> Append the brush group *before* circles are added in `update()`. SVG renders later elements on top, so circles end up above the brush overlay and still receive click events.

Implement `_handleBrush(event)`. When `event.selection` is null (brush cleared), call `this._onBrush(null)`. Otherwise, convert the pixel rectangle to data coordinates using the stored scales, filter `this._data`, fade non-matching circles with `.style('opacity', ...)`, and call `this._onBrush(filteredData)`.

Store the current scales, data, and field names in `update()` so `_handleBrush` can access them:
```js
this._data = data; this._xField = xField; this._yField = yField;
this._xScale = xScale; this._yScale = yScale;
this._onBrush = onBrush;   // callback passed in from App
```

Add a `clearBrush()` method that moves the brush to `null` without firing the callback. Use a `_suppressBrushEvent` flag:
```js
clearBrush() {
  this._suppressBrushEvent = true;
  this._brush.move(this._brushGroup, null);
  this._suppressBrushEvent = false;
}
```

Add `highlight(predicate)` and `clearHighlight()` methods that set/clear per-circle opacity.

#### Bar click

Pass a click callback `onBarClick` into `BarChart.update()` and attach it to each bar:
```js
.on('click', (_event, d) => onBarClick(d.key))
```

In `App.onBarClick(key)`:
1. Clear current selection so onlyl one set is active.
2. Fade non-matching circles.
3. Fade non-matching bars.
4. Toggle off if the same bar is clicked twice.

Add `highlight(activeKey)` and `clearHighlight()` methods to `BarChart`.

#### Line brush

At the end of `LineChart.update()`, set up a horizontal brush once:
```js
if (!this._brushGroup) {
  this._brushGroup = vis.append('g').attr('class', 'line-brush');
  this._brush = d3.brushX()
    .extent([[0, 0], [width, height]])
    .on('brush end', (event) => {
      if (!event.selection) { this._onBrush?.(null); return; }
      const [x0, x1] = event.selection.map(px => this._xScale.invert(px));
      this._onBrush?.([x0, x1]);
    });
  this._brushGroup.call(this._brush);
}
```

Store `this._xScale = xScale` and `this._onBrush = onLineBrush` in `update()` so the handler can use the latest scale and callback.

In `App.onLineBrush(yearRange)`:
1. Store `this._activeYearRange = yearRange`.
2. Call `this.scatter.clearBrush()` and `this.bar.clearHighlight()`.
3. If `yearRange` is null, clear scatter highlights. Otherwise, highlight circles whose `year` falls in `[y0, y1]`.

Add `clearBrush()` with the same suppress-flag pattern as the scatter brush.

#### App wiring

In `App._renderAll()`, pass the interaction callbacks into each chart's `update()`:

```js
this.scatter.update(
  this.data, xField, yField, sizeField, colorField, colorScale,
  (event, d) => this.showMovie(event, d),
  (brushed)  => this.onScatterBrush(brushed)   // ← new
);
this.bar.update(
  this._displayData, colorField, colorScale, metricField,
  (key) => this.onBarClick(key)                // ← new
);
this.line.update(
  this._displayData, metricField,
  (yearRange) => this.onLineBrush(yearRange)   // ← new
);
```

`App.onScatterBrush(brushedData)` should store the brushed subset in `this._displayData` and re-render the bar and line charts with it (not the scatterplot, it shows all data).

#### (Bonus) Filter and Reset

Implement `App._getSelection()` to return the currently highlighted/brushed subset:
- If a bar is active → filter by `colorField === activeBarKey`
- If a year range is active → filter by `year` within the range
- If a scatter brush is active → `this._displayData` already holds the subset

Implement `App.onFilterClick()` to permanently set `this.data = this._getSelection()` and call `this._renderAll()`.

For **Reset**, store a clean pre-bucketing copy of the original data in `init()`:
```js
this._originalData = this.data.map(d => ({...d}));  // before _bucketTop9
```

Then `onResetClick()` restores it, re-runs bucketing, and calls `this.update()`.

---

## Dataset columns

| Column | Type | Description |
|---|---|---|
| `year` | number | Release year |
| `title` | string | Movie title |
| `tmdb_id` | number | TMDB entry ID |
| `original_language` | string | ISO 639-1 code, e.g. `en`, `fr` |
| `overview` | string | Plot summary |
| `genres` | string | Comma-separated list, e.g. `"Drama, Comedy"` |
| `cast` | string | Top-billed cast members |
| `director` | string | Director name(s) |
| `runtime_min` | number | Runtime in minutes |
| `tmdb_vote_average` | number | Mean user rating (0–10) |
| `tmdb_vote_count` | number | Number of ratings |
| `popularity` | number | TMDB popularity score |
| `poster_path` | string | Full URL to the movie poster image |

> `primary_genre` and the bucketed `original_language` are derived in `App.init()` — they are not raw CSV columns but are available on every data object.

---

## Running locally

Browsers block file-based data loading (`d3.csv(...)`) for security reasons. Use a local server.

**VS Code** — Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension and click **Go Live** in the status bar.

**Node.js**
```bash
npx serve .
```

**Python**
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000`.

---

## File overview

```
ex2/
├── index.html               # Page layout — Shouldn't need to modify
├── js/
│   └── netflix.js           # Your implementation goes here
└── data/
    └── tmdb_votes1000.txt   # Dataset
```

---

## Collaboration and resource policy

Discussing the assignment with the instructor or peers, reading D3/web documentation, and looking at tutorials or online examples are all encouraged.

AI programming assistants (e.g. GitHub Copilot, ChatGPT, Claude) should **not** be used for this assignment. The goal is to build genuine understanding of data visualization principles and the D3 library — that only develops through working through the problems yourself.
