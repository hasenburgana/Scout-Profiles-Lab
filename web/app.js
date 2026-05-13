const state = {
  positions: [],
  metricsByPosition: {},
  players: [],
  selectedView: "player-view"
};

const els = {
  status: document.querySelector("#status"),
  empty: document.querySelector("#empty-state"),
  position: document.querySelector("#position-select"),
  search: document.querySelector("#player-search"),
  player: document.querySelector("#player-select"),
  playerTitle: document.querySelector("#player-title"),
  playerSubtitle: document.querySelector("#player-subtitle"),
  clusterPill: document.querySelector("#cluster-pill"),
  strengths: document.querySelector("#strengths"),
  weaknesses: document.querySelector("#weaknesses"),
  similar: document.querySelector("#similar-list"),
  metricWeights: document.querySelector("#metric-weights"),
  runProfile: document.querySelector("#run-profile"),
  clearWeights: document.querySelector("#clear-weights")
};

init();

async function init() {
  bindEvents();
  const health = await fetchJson("/api/health");
  if (!health.dataLoaded) {
    els.status.textContent = "Sin datos";
    els.empty.classList.remove("hidden");
    return;
  }
  els.status.textContent = `${health.players} jugadoras cargadas`;
  await refreshPlayers();
}

function bindEvents() {
  document.querySelectorAll(".tab").forEach(button => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });
  els.position.addEventListener("change", refreshPlayers);
  els.search.addEventListener("input", debounce(refreshPlayers, 180));
  els.player.addEventListener("change", () => loadPlayer(els.player.value));
  els.runProfile.addEventListener("click", runProfile);
  els.clearWeights.addEventListener("click", () => {
    document.querySelectorAll(".metric-row input").forEach(input => input.value = 0);
  });
}

function switchView(viewId) {
  state.selectedView = viewId;
  document.querySelectorAll(".tab").forEach(button => {
    button.classList.toggle("active", button.dataset.view === viewId);
  });
  document.querySelectorAll(".view").forEach(view => {
    view.classList.toggle("active", view.id === viewId);
  });
  document.querySelector(".player-controls").classList.toggle("hidden", viewId !== "player-view");
  document.querySelector(".profile-controls").classList.toggle("hidden", viewId !== "profile-view");
}

async function refreshPlayers() {
  const params = new URLSearchParams({
    position: els.position.value,
    search: els.search.value
  });
  const data = await fetchJson(`/api/players?${params}`);
  state.players = data.players;
  state.positions = data.positions;
  state.metricsByPosition = data.metricsByPosition;

  renderPositions();
  renderPlayers();
  renderMetricWeights();

  if (state.players.length && state.selectedView === "player-view") {
    els.player.value = state.players[0].id;
    await loadPlayer(state.players[0].id);
  }
}

function renderPositions() {
  const current = els.position.value;
  if (els.position.options.length) return;
  els.position.innerHTML = state.positions.map(pos => `<option value="${escapeHtml(pos)}">${escapeHtml(pos)}</option>`).join("");
  if (current) els.position.value = current;
}

function renderPlayers() {
  els.player.innerHTML = state.players.map(player => {
    const label = `${player.name} · ${player.team || "Sin equipo"} · C${player.cluster}`;
    return `<option value="${escapeHtml(player.id)}">${escapeHtml(label)}</option>`;
  }).join("");
}

function renderMetricWeights() {
  const metrics = state.metricsByPosition[els.position.value] || [];
  els.metricWeights.innerHTML = metrics.map(metric => `
    <label class="metric-row">
      <span>${formatMetric(metric)}</span>
      <input type="range" min="-5" max="5" step="1" value="0" data-metric="${escapeHtml(metric)}">
    </label>
  `).join("");
}

async function loadPlayer(id) {
  if (!id) return;
  const data = await fetchJson(`/api/player?id=${encodeURIComponent(id)}`);
  const player = data.player;
  els.playerTitle.textContent = player.name;
  els.playerSubtitle.textContent = `${player.team || "Sin equipo"} · ${player.position}`;
  els.clusterPill.textContent = `Cluster ${player.cluster}`;

  renderRadar(data);
  renderSummary(data.clusterSummary);
  renderSimilar(data.similarPlayers);
}
/*
function renderRadar(data) {
  const labels = data.metrics.map(formatMetric);
  const playerValues = data.metrics.map(metric => Math.round((data.playerPercentiles[metric] || 0) * 100));
  const clusterValues = data.metrics.map(metric => Math.round((data.clusterPercentiles[metric] || 0) * 100));

  const traces = [
    {
      type: "scatterpolar",
      r: [...playerValues, playerValues[0]],
      theta: [...labels, labels[0]],
      fill: "toself",
      name: data.player.name,
      line: { color: "#2357c6", width: 3 }
    },
    {
      type: "scatterpolar",
      r: [...clusterValues, clusterValues[0]],
      theta: [...labels, labels[0]],
      fill: "toself",
      name: `Media C${data.player.cluster}`,
      line: { color: "#0f8f8c", width: 2 }
    }
  ];

  Plotly.react("radar-chart", traces, {
    margin: { l: 52, r: 52, t: 32, b: 32 },
    polar: {
      radialaxis: { visible: true, range: [0, 100], ticksuffix: "%" }
    },
    legend: { orientation: "h" },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)"
  }, { responsive: true, displaylogo: false });
}
*/
function renderRadar(data) {
  // 1. Usamos las métricas originales (nombres técnicos) para los ejes 
  // para que Plotly no se confunda, pero guardamos los nombres bonitos.
  const technicalMetrics = data.metrics;
  const prettyLabels = data.metrics.map(formatMetric);
  
  const playerValues = technicalMetrics.map(metric => Math.round((data.playerPercentiles[metric] || 0) * 100));
  const clusterValues = technicalMetrics.map(metric => Math.round((data.clusterPercentiles[metric] || 0) * 100));

  const traces = [
    {
      type: "scatterpolar",
      r: [...playerValues, playerValues[0]],
      // IMPORTANTE: Usamos los nombres originales aquí para evitar el cruce
      theta: [...technicalMetrics, technicalMetrics[0]], 
      fill: "toself",
      name: data.player.name,
      line: { color: "#2357c6", width: 3 },
      // Añadimos esto para que al pasar el ratón se vea el nombre bonito
      hovertext: [...prettyLabels, prettyLabels[0]],
      hoverinfo: "text+r"
    },
    {
      type: "scatterpolar",
      r: [...clusterValues, clusterValues[0]],
      theta: [...technicalMetrics, technicalMetrics[0]],
      fill: "toself",
      name: `Media C${data.player.cluster}`,
      line: { color: "#0f8f8c", width: 2 },
      hovertext: [...prettyLabels, prettyLabels[0]],
      hoverinfo: "text+r"
    }
  ];

  Plotly.react("radar-chart", traces, {
    margin: { l: 80, r: 80, t: 32, b: 32 }, // Aumentamos márgenes para los textos
    polar: {
      radialaxis: { visible: true, range: [0, 100], ticksuffix: "%" },
      angularaxis: {
        // AQUÍ mapeamos los nombres técnicos a los nombres bonitos en el gráfico
        tickvals: technicalMetrics,
        ticktext: prettyLabels,
        direction: "clockwise",
        period: technicalMetrics.length
      }
    },
    legend: { orientation: "h" },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)"
  }, { responsive: true, displaylogo: false });
}

function renderSummary(summary) {
  els.strengths.innerHTML = summary.topStrengths.map(item =>
    `<li>${formatMetric(item.metric)} <span class="small">z ${signed(item.z)}</span></li>`
  ).join("");
  els.weaknesses.innerHTML = summary.topWeaknesses.map(item =>
    `<li>${formatMetric(item.metric)} <span class="small">z ${signed(item.z)}</span></li>`
  ).join("");
}

function renderSimilar(players) {
  els.similar.innerHTML = players.map(player => `
    <div class="compact-item">
      <div>
        <strong>${escapeHtml(player.name)}</strong>
        <span class="small">${escapeHtml(player.team || "Sin equipo")} · ${escapeHtml(player.position)}</span>
      </div>
      <span>C${player.cluster}</span>
    </div>
  `).join("");
}

async function runProfile() {
  const weights = {};
  document.querySelectorAll(".metric-row input").forEach(input => {
    const value = Number(input.value);
    if (value !== 0) weights[input.dataset.metric] = value;
  });

  const data = await fetchJson("/api/profile-score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ position: els.position.value, weights })
  });

  renderScores(data.scores);
}

function renderScores(scores) {
  const top = scores.slice(0, 12).reverse();
  Plotly.react("score-chart", [{
    type: "bar",
    orientation: "h",
    x: top.map(row => row.score),
    y: top.map(row => row.name),
    marker: { color: "#2357c6" },
    hovertemplate: "%{y}<br>Score %{x:.1f}<extra></extra>"
  }], {
    margin: { l: 150, r: 24, t: 20, b: 42 },
    xaxis: { range: [0, 100], title: "Score" },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)"
  }, { responsive: true, displaylogo: false });

  document.querySelector("#score-table").innerHTML = scores.map((row, index) => `
    <div class="table-row">
      <div>
        <strong>${index + 1}. ${escapeHtml(row.name)}</strong>
        <span class="small">${escapeHtml(row.team || "Sin equipo")} · C${row.cluster}</span>
      </div>
      <span class="score">${row.score.toFixed(1)}</span>
    </div>
  `).join("");
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function formatMetric(metric) {
  return metric
    .replaceAll("_p90", "")
    .replaceAll("pct_", "% ")
    .replaceAll("_", " ");
}

function signed(value) {
  return Number(value) >= 0 ? `+${value}` : `${value}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
