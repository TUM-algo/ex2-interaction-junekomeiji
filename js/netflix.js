// Movie Vis — Assignment 4


// ── Scatterplot ───────────────────────────────────────────────────────────────

class Scatterplot {
  constructor(containerId) {
    this.margin = { top: 20, right: 160, bottom: 55, left: 65 };
    const el = document.getElementById(containerId);
    this.width  = el.clientWidth  - this.margin.left - this.margin.right;
    this.height = el.clientHeight - this.margin.top  - this.margin.bottom;

    const svg = d3.select(`#${containerId}`).append('svg')
      .attr('width',  this.width  + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top  + this.margin.bottom);

    this.vis = svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    this.vis.append('g').attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${this.height})`);
    this.vis.append('g').attr('class', 'axis y-axis');

    this.vis.append('text').attr('class', 'axis-label x-label')
      .attr('text-anchor', 'middle')
      .attr('x', this.width / 2)
      .attr('y', this.height + 45);
    this.vis.append('text').attr('class', 'axis-label y-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -this.height / 2)
      .attr('y', -50);

    this.vis.append('g').attr('class', 'legend')
      .attr('transform', `translate(${this.width + 10}, 0)`);

    // TODO (Part 2): Append a brush group here (before circles so circles render on top)
    // and initialise d3.brush() on it. Store as this._brushGroup and this._brush.
    this._suppressBrushEvent = false;
    this._onBrush = null;
    this._data    = null;
    this._xScale  = null;
    this._yScale  = null;
    this._xField  = null;
    this._yField  = null;
  }

  // TODO (Part 2): Handle brush events.
  // When event.selection is null, restore all circle opacities and call this._onBrush(null).
  // Otherwise, filter this._data to points inside the pixel rectangle [[x0,y0],[x1,y1]],
  // fade non-matching circles with .style('opacity', ...), and call this._onBrush(filteredData).
  _handleBrush(_event) {
    // TODO
  }

  // TODO (Part 2): Move the brush to null without firing the callback.
  // Use the this._suppressBrushEvent flag to block the event.
  clearBrush() {
    // TODO
  }

  // TODO (Part 1 + Part 2): Fade all circles to 0.1 opacity except those where predicate(d) is true (0.85).
  // Use a short 200 ms transition.
  highlight(_predicate) {
    // TODO
  }

  // TODO (Part 1 + Part 2): Restore all circle opacities with a 200 ms transition.
  clearHighlight() {
    // TODO
  }

  // TODO (Part 2): Also accept onBrush as a parameter and store it as this._onBrush.
  update(data, xField, yField, sizeField, colorField, colorScale, onClickMovie) {
    const { vis, width, height } = this;
    this._data   = data;
    this._xField = xField;
    this._yField = yField;

    const xScale    = d3.scaleLinear(d3.extent(data, d => d[xField]),    [0, width]).nice();
    const yScale    = d3.scaleLinear(d3.extent(data, d => d[yField]),    [height, 0]).nice();
    const sizeScale = d3.scaleSqrt(  d3.extent(data, d => d[sizeField]), [5, 15]);
    this._xScale = xScale;
    this._yScale = yScale;

    // TODO (Part 1): Add .transition().duration(500) to both axis calls below.
    vis.select('.x-axis').call(d3.axisBottom(xScale));
    vis.select('.y-axis').call(d3.axisLeft(yScale));
    vis.select('.x-label').text(xField);
    vis.select('.y-label').text(yField);

    vis.selectAll('.scatter-dot').data(data).join(
      enter => enter.append('circle')
        .attr('class', 'scatter-dot')
        .attr('cx',   d => xScale(d[xField]))
        .attr('cy',   d => yScale(d[yField]))
        .attr('r',    d => sizeScale(d[sizeField]))
        .attr('fill', d => colorScale(d[colorField]))
        .on('click',  onClickMovie),
      update => update
        .on('click', onClickMovie)
        .attr('cx',   d => xScale(d[xField]))
        .attr('cy',   d => yScale(d[yField]))
        .attr('r',    d => sizeScale(d[sizeField]))
        .attr('fill', d => colorScale(d[colorField])),
      exit => exit.remove(),
    );
    // TODO (Part 1): Animate the join above:
    //   Enter:  start with r = 0 and grow to the final radius over 500 ms.
    //   Update: slide cx, cy, r, and fill to their new values over 500 ms.
    //   Exit:   shrink back to r = 0 over 300 ms, then remove.

    const legend = vis.select('.legend');
    legend.selectAll('*').remove();
    [...colorScale.domain()].sort().forEach((val, i) => {
      const g = legend.append('g').attr('transform', `translate(0,${i * 20})`);
      g.append('rect').attr('width', 12).attr('height', 12).attr('fill', colorScale(val));
      g.append('text').attr('x', 16).attr('y', 10).text(val);
    });
  }
}


// ── Bar chart ─────────────────────────────────────────────────────────────────

class BarChart {
  constructor(containerId) {
    this.margin = { top: 20, right: 20, bottom: 80, left: 65 };
    const el = document.getElementById(containerId);
    this.width  = el.clientWidth  - this.margin.left - this.margin.right;
    this.height = el.clientHeight - this.margin.top  - this.margin.bottom;

    const svg = d3.select(`#${containerId}`).append('svg')
      .attr('width',  this.width  + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top  + this.margin.bottom);

    this.vis = svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    this.vis.append('g').attr('class', 'axis bar-x-axis')
      .attr('transform', `translate(0,${this.height})`);
    this.vis.append('g').attr('class', 'axis bar-y-axis');

    this.vis.append('text').attr('class', 'axis-label bar-x-label')
      .attr('text-anchor', 'middle')
      .attr('x', this.width / 2).attr('y', this.height + 72);
    this.vis.append('text').attr('class', 'axis-label bar-y-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -this.height / 2).attr('y', -50);
  }

  // TODO (Part 2): Also accept onBarClick as a parameter and attach it to each bar.
  update(data, colorField, colorScale, metricField) {
    const { vis, width, height } = this;

    const groups = d3.rollup(data, v => d3.mean(v, d => d[metricField]), d => d[colorField]);
    const barData = Array.from(groups, ([key, value]) => ({ key, value }))
      .sort((a, b) => d3.ascending(a.key, b.key));

    const xScale = d3.scaleBand(barData.map(d => d.key), [0, width])
      .paddingInner(0.15).paddingOuter(0.1);
    const yScale = d3.scaleLinear([0, d3.max(barData, d => d.value)], [height, 0]).nice();

    vis.select('.bar-x-axis').call(d3.axisBottom(xScale))
      .selectAll('text')
        .attr('transform', 'rotate(-35)')
        .attr('text-anchor', 'end')
        .attr('dx', '-0.4em')
        .attr('dy', '0.6em');
    // TODO (Part 1): Add .transition().duration(500) to the y-axis call below.
    vis.select('.bar-y-axis').call(d3.axisLeft(yScale));
    vis.select('.bar-x-label').text(colorField);
    vis.select('.bar-y-label').text(`avg ${metricField}`);

    vis.selectAll('.bar').data(barData, d => d.key).join(
      enter => enter.append('rect').attr('class', 'bar')
        .attr('cursor', 'pointer')
        .attr('x',      d => xScale(d.key))
        .attr('width',  xScale.bandwidth())
        .attr('y',      d => yScale(d.value))
        .attr('height', d => height - yScale(d.value))
        .attr('fill',   d => colorScale(d.key)),
      update => update
        .attr('x',      d => xScale(d.key))
        .attr('y',      d => yScale(d.value))
        .attr('width',  xScale.bandwidth())
        .attr('height', d => height - yScale(d.value))
        .attr('fill',   d => colorScale(d.key)),
      exit => exit.remove(),
    );
    // TODO (Part 1): Animate the join above:
    //   Enter:  start at y = height, height = 0 (baseline) and rise to final position over 500 ms.
    //   Update: slide x, y, width, height, and fill to new values over 500 ms.
    //   Exit:   drop back to the baseline over 300 ms, then remove.
    // TODO (Part 2): Attach the onBarClick callback to each bar with .on('click', ...).
  }

  // TODO (Part 1 + Part 2): Fade all bars to 0.25 opacity except the one where d.key === activeKey.
  // Use a 200 ms transition.
  highlight(_activeKey) {
    // TODO
  }

  // TODO (Part 1 + Part 2): Restore all bar opacities with a 200 ms transition.
  clearHighlight() {
    // TODO
  }
}


// ── Line chart ────────────────────────────────────────────────────────────────

class LineChart {
  constructor(containerId) {
    this.margin = { top: 20, right: 20, bottom: 55, left: 65 };
    const el = document.getElementById(containerId);
    this.width  = el.clientWidth  - this.margin.left - this.margin.right;
    this.height = el.clientHeight - this.margin.top  - this.margin.bottom;

    const svg = d3.select(`#${containerId}`).append('svg')
      .attr('width',  this.width  + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top  + this.margin.bottom);

    this.vis = svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    this.vis.append('g').attr('class', 'axis line-x-axis')
      .attr('transform', `translate(0,${this.height})`);
    this.vis.append('g').attr('class', 'axis line-y-axis');

    this.vis.append('text').attr('class', 'axis-label line-x-label')
      .attr('text-anchor', 'middle')
      .attr('x', this.width / 2).attr('y', this.height + 45);
    this.vis.append('text').attr('class', 'axis-label line-y-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -this.height / 2).attr('y', -50);

    this._xScale = null;
    this._onBrush = null;
    this._suppressBrushEvent = false;
    this._brushGroup = null;
    this._brush = null;
  }

  // TODO (Part 2): Clear the line brush without firing the callback.
  // Use the this._suppressBrushEvent flag to block the event.
  clearBrush() {
    // TODO
  }

  // TODO (Part 2): Also accept onLineBrush as a parameter and store it as this._onBrush.
  update(data, metricField) {
    const { vis, width, height } = this;

    const yearMap = d3.rollup(data, v => d3.mean(v, d => d[metricField]), d => d.year);
    const lineData = Array.from(yearMap, ([year, value]) => ({ year, value }))
      .filter(d => d.year > 0)
      .sort((a, b) => d3.ascending(a.year, b.year));

    if (lineData.length === 0) return;

    const xScale = d3.scaleLinear(d3.extent(lineData, d => d.year), [0, width]);
    const yScale = d3.scaleLinear([0, d3.max(lineData, d => d.value)], [height, 0]).nice();
    this._xScale = xScale;

    // TODO (Part 1): Add .transition().duration(500) to both axis calls below.
    vis.select('.line-x-axis').call(d3.axisBottom(xScale).tickFormat(d3.format('d')));
    vis.select('.line-y-axis').call(d3.axisLeft(yScale));
    vis.select('.line-x-label').text('Year');
    vis.select('.line-y-label').text(`avg ${metricField}`);

    const lineGen = d3.line().x(d => xScale(d.year)).y(d => yScale(d.value));

    vis.selectAll('.trend-line').data([lineData]).join(
      enter => enter.append('path').attr('class', 'trend-line')
        .attr('fill', 'none').attr('stroke', '#555').attr('stroke-width', 2)
        .attr('d', lineGen),
      update => update.attr('d', lineGen),
      exit  => exit.remove(),
    );
    // TODO (Part 1): Animate the line:
    //   Enter:  fade in from opacity 0 over 500 ms.
    //   Update: morph path to new shape via .attr('d', lineGen) over 500 ms.
    //   Exit:   fade out over 300 ms, then remove.

    vis.selectAll('.line-dot').data(lineData, d => d.year).join(
      enter => enter.append('circle').attr('class', 'line-dot')
        .attr('r', 3).attr('fill', '#555').attr('stroke', '#fff').attr('stroke-width', 1)
        .attr('cx', d => xScale(d.year)).attr('cy', d => yScale(d.value)),
      update => update
        .attr('cx', d => xScale(d.year)).attr('cy', d => yScale(d.value)),
      exit  => exit.remove(),
    );
    // TODO (Part 1): Animate the dots:
    //   Enter:  start with r = 0 and grow to 3 over 500 ms.
    //   Update: slide cx and cy over 500 ms.
    //   Exit:   shrink to r = 0 over 300 ms, then remove.

    // TODO (Part 2): Set up a horizontal brush once (guard with if (!this._brushGroup)).
    // Use d3.brushX(). In the event handler, invert pixel positions back to years and
    // call this._onBrush([y0, y1]), or this._onBrush(null) when the brush is cleared.
  }
}


// ── App ───────────────────────────────────────────────────────────────────────

class App {
  constructor() {
    this.scatter = null;
    this.bar     = null;
    this.line    = null;
    this.data    = null;

    this._xField      = null;
    this._yField      = null;
    this._sizeField   = null;
    this._colorField  = null;
    this._metricField = null;
    this._colorScale  = null;

    this._displayData    = null;
    this._activeBarKey   = null;
    this._activeYearRange = null;
  }

  init() {
    this.scatter = new Scatterplot('scatter');
    this.bar     = new BarChart('barchart');
    this.line    = new LineChart('linechart');

    d3.csv('data/tmdb_votes1000.txt').then(rawdata => {
      this.data = rawdata.map(d => ({
        ...d,
        year:              +d.year,
        runtime_min:       +d.runtime_min,
        tmdb_vote_average: +d.tmdb_vote_average,
        tmdb_vote_count:   +d.tmdb_vote_count,
        popularity:        +d.popularity,
        primary_genre:     d.genres.split(',')[0].trim()
      }));

      // TODO (Bonus): Store a clean pre-bucketing copy here for the Reset feature.
      // this._originalData = this.data.map(d => ({...d}));

      this._bucketTop9('primary_genre');
      this._bucketTop9('original_language');

      this.update();
    });
  }

  _bucketTop9(field) {
    const counts = this.data.reduce((acc, d) => {
      acc[d[field]] = (acc[d[field]] || 0) + 1;
      return acc;
    }, {});
    const top9 = new Set(
      Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 9).map(([v]) => v)
    );
    this.data.forEach(d => { if (!top9.has(d[field])) d[field] = 'Other'; });
  }

  update() {
    this._xField      = this._dropdownVal('xdropdown');
    this._yField      = this._dropdownVal('ydropdown');
    this._sizeField   = this._dropdownVal('sizedropdown');
    this._colorField  = this._dropdownVal('colordropdown');
    this._metricField = this._dropdownVal('metricdropdown');

    this._colorScale = d3.scaleOrdinal(
      [...new Set(this.data.map(d => d[this._colorField]))].sort(),
      d3.schemeTableau10
    );

    this._displayData    = this.data;
    this._activeBarKey   = null;
    this._activeYearRange = null;
    // TODO (Part 2): Once the chart methods exist, also call:
    //   this.scatter.clearBrush();  this.scatter.clearHighlight();
    //   this.line.clearBrush();     this.bar.clearHighlight();

    this._renderAll();
  }

  _renderAll() {
    this.scatter.update(
      this.data,
      this._xField, this._yField, this._sizeField,
      this._colorField, this._colorScale,
      (event, d) => this.showMovie(event, d)
      // TODO (Part 2): Add the scatter brush callback: (brushed) => this.onScatterBrush(brushed)
    );
    this.bar.update(
      this._displayData,
      this._colorField, this._colorScale, this._metricField
      // TODO (Part 2): Add the bar click callback: (key) => this.onBarClick(key)
    );
    this.line.update(
      this._displayData,
      this._metricField
      // TODO (Part 2): Add the line brush callback: (yearRange) => this.onLineBrush(yearRange)
    );
  }

  // TODO (Part 2): Store brushedData in this._displayData and re-render the bar and line charts
  // with the brushed subset (the scatterplot always shows all data).
  onScatterBrush(_brushedData) {
    // TODO
  }

  // TODO (Part 2): Highlight scatterplot circles matching key and fade other bars.
  // Toggle off if the same bar is clicked again.
  onBarClick(_key) {
    // TODO
  }

  // TODO (Part 2): Highlight scatterplot circles whose year falls within yearRange,
  // or clear all highlights if yearRange is null.
  onLineBrush(_yearRange) {
    // TODO
  }

  // TODO (Bonus): Return the currently highlighted/brushed subset, or null if nothing is active.
  //   Active bar  → filter by colorField === activeBarKey
  //   Active year → filter by year within [y0, y1]
  //   Scatter brush → this._displayData already holds the subset
  _getSelection() {
    // TODO
    return null;
  }

  // TODO (Bonus): Permanently narrow this.data to the current selection and re-render.
  onFilterClick() {
    // TODO
  }

  // TODO (Bonus): Restore the full original dataset (this._originalData) and re-render.
  onResetClick() {
    // TODO
  }

  showMovie(event, d) {
    d3.selectAll('.scatter-dot').classed('selected', false);
    d3.select(event.currentTarget).classed('selected', true);

    const poster = document.getElementById('movie-poster');
    if (d.poster_path) {
      poster.src = d.poster_path;
      poster.style.display = 'block';
    } else {
      poster.style.display = 'none';
    }

    document.getElementById('placeholder').style.display = 'none';
    document.getElementById('movie-title').style.display = 'block';
    document.getElementById('movie-title').textContent = `${d.title} (${d.year})`;
    document.getElementById('movie-meta').style.display = 'block';
    document.getElementById('movie-meta').innerHTML =
      `<b>Director:</b> ${d.director}<br>` +
      `<b>Cast:</b> ${d.cast}<br>` +
      `<b>Genres:</b> ${d.genres}<br>` +
      `<b>Runtime:</b> ${d.runtime_min} min<br>` +
      `<b>Vote avg:</b> ${d.tmdb_vote_average.toFixed(1)} (${d.tmdb_vote_count} votes)<br>` +
      `<b>Popularity:</b> ${d.popularity.toFixed(2)}<br>` +
      `<b>Language:</b> ${d.original_language}`;
    document.getElementById('movie-overview').style.display = 'block';
    document.getElementById('movie-overview').textContent = d.overview;
  }

  _dropdownVal(id) {
    const node = document.getElementById(id);
    return node.options[node.selectedIndex].value;
  }
}


// ── Entry points called from HTML ─────────────────────────────────────────────

const app = new App();
function init()           { app.init();           }
function updateClicked()  { app.update();          }
function filterClicked()  { app.onFilterClick();   }
function resetClicked()   { app.onResetClick();    }
