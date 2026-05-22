const PASSWORD = "scout2026";
const POSITION_LABELS = {
  CB: "Central",
  LAT: "Lateral",
  MCD: "Mediocentro defensivo",
  MC: "Interior / centrocampista",
  EXT: "Extremo",
  DEL: "Delantera"
};

const CLUSTER_COLORS = ["#0f766e", "#2563eb", "#f97316", "#dc2626", "#7c3aed", "#059669", "#0891b2", "#be123c"];
const PLAYER_COLORS = ["#E74C3C", "#2357c6", "#0f8f8c", "#F4A261", "#8E44AD", "#2A9D8F"];

const PROFILE_DEFAULT_METRICS = {
  CB: ["pct_pases", "pct_pases_largos", "pct_pases_prog", "pct_pases_bajo_presion", "pases_ult_tercio_p90", "carries_prog_p90", "ratio_intercepciones_vs_entradas", "duelos_ter_ganados_p90", "despejes_p90", "pct_aereos", "pct_duelos_total", "recuperaciones_p90", "acciones_defensivas_campo_rival_p90"],
  LAT: ["pct_toques_en_campo_rival", "centros_p90", "pases_al_area_p90", "ratio_centros_vs_pases_al_area", "deep_progressions_p90", "xa_real_p90", "carries_prog_p90", "pct_regates", "ratio_intercepciones_vs_entradas", "acciones_defensivas_p90", "duelos_ter_ganados_p90", "despejes_p90", "pct_duelos_total", "recuperaciones_p90"],
  MCD: ["distancia_media_pases", "pct_pases_prog", "pct_pases_bajo_presion", "pases_progresivos_p90", "pases_largos_p90", "ratio_intercepciones_vs_entradas", "intercepciones_p90", "recuperaciones_p90", "acciones_agresivas_p90", "presiones_p90"],
  MC: ["carries_prog_p90", "velocidad_cond_m_s", "pct_pases", "pases_completados_p90", "pct_pases_prog", "distancia_media_pases", "pases_bajo_presion_p90", "xa_real_p90", "presiones_p90", "intercepciones_p90", "recuperaciones_p90", "pct_duelos_total", "pases_al_area_p90", "through_balls_p90", "pct_toques_en_area", "tiros_p90"],
  EXT: ["regates_p90", "pct_regates", "carries_prog_p90", "ratio_centros_vs_pases_al_area", "centros_p90", "pct_pases", "pases_completados_p90", "pct_toques_en_area", "tiros_p90", "xg_por_tiro", "xa_real_p90", "pases_clave_p90"],
  DEL: ["ratio_tiros_vs_pases", "xg_por_tiro", "distancia_media_tiros", "pct_toques_en_area", "tiros_puerta_p90", "pases_completados_p90", "pct_pases", "pct_pases_prog", "pases_clave_p90", "xa_real_p90", "through_balls_p90", "recibidos_de_espaldas_p90", "presiones_p90", "aereos_ganados_p90"]
};

const HYBRID_BLOCK_LIBRARY = {
  CB: [
    {
      id: "salida_balon",
      name: "Pase y salida de balón",
      description: "Centrales que ayudan a iniciar juego, progresar en corto o largo y sostener la posesión bajo presión.",
      metrics: { pct_pases: 1, pct_pases_prog: 1, pct_pases_bajo_presion: 1, pases_ult_tercio_p90: 1, carries_prog_p90: 1 }
    },
    {
      id: "defensa_clasica",
      name: "Defensa clásica",
      description: "Perfil de central dominante en duelos, despejes y juego aéreo, más orientado a proteger el área.",
      metrics: { duelos_ter_ganados_p90: 1, despejes_p90: 1, pct_aereos: 1, pct_duelos_total: 1 }
    },
    {
      id: "anticipacion_recuperacion",
      name: "Anticipación y recuperación",
      description: "Centrales que defienden hacia delante, cortan líneas de pase y recuperan lejos de su portería.",
      metrics: { ratio_intercepciones_vs_entradas: 1, recuperaciones_p90: 1, acciones_defensivas_campo_rival_p90: 1 }
    }
  ],
  LAT: [
    {
      id: "carrilera_ofensiva",
      name: "Carrilera ofensiva",
      description: "Laterales que ganan altura, progresan por fuera y producen centros, xA o pases al área.",
      metrics: { pct_toques_en_campo_rival: 1, deep_progressions_p90: 1, centros_p90: 1, pases_al_area_p90: 1, xa_real_p90: 1, carries_prog_p90: 1 }
    },
    {
      id: "falsa_lateral",
      name: "Falsa lateral / interior",
      description: "Laterales con más peso asociativo, progresión interior y pases hacia zonas de peligro.",
      metrics: { pases_al_area_p90: 1, ratio_centros_vs_pases_al_area: 1, pct_pases: 1, pct_pases_prog: 1, carries_prog_p90: 1 }
    },
    {
      id: "defensiva",
      name: "Lateral defensiva",
      description: "Laterales fiables en duelos, recuperaciones y acciones defensivas, con foco en proteger su banda.",
      metrics: { acciones_defensivas_p90: 1, duelos_ter_ganados_p90: 1, recuperaciones_p90: 1, pct_duelos_total: 1, despejes_p90: 1 }
    }
  ],
  MCD: [
    {
      id: "organizacion_salida",
      name: "Organización y salida",
      description: "Pivotes que ordenan la posesión, progresan con pase y ofrecen seguridad bajo presión.",
      metrics: { pct_pases_prog: 1, pct_pases_bajo_presion: 1, pases_progresivos_p90: 1, distancia_media_pases: 1 }
    },
    {
      id: "distribucion_larga",
      name: "Distribución larga",
      description: "Pivotes capaces de cambiar orientación, saltar líneas y progresar con envíos largos.",
      metrics: { pases_largos_p90: 1, distancia_media_pases: 1, pct_pases_prog: 1 }
    },
    {
      id: "recuperacion_contencion",
      name: "Recuperación y contención",
      description: "Pivotes que sostienen el centro del campo mediante intercepciones, duelos y recuperaciones.",
      metrics: { ratio_intercepciones_vs_entradas: 1, intercepciones_p90: 1, recuperaciones_p90: 1, pct_duelos_total: 1 }
    },
    {
      id: "presion_agresividad",
      name: "Presión y agresividad",
      description: "Mediocentros defensivos que saltan a presionar, fuerzan pérdidas y defienden hacia delante.",
      metrics: { presiones_p90: 1, acciones_agresivas_p90: 1, recuperaciones_p90: 1 }
    }
  ],
  MC: [
    {
      id: "organizacion_control",
      name: "Organización y control",
      description: "Interiores que dan continuidad a la posesión, completan pases y progresan sin perder seguridad.",
      metrics: { pct_pases: 1, pases_completados_p90: 1, pct_pases_prog: 1, pases_bajo_presion_p90: 1, distancia_media_pases: 1 }
    },
    {
      id: "llegada_creacion",
      name: "Llegada y creación",
      description: "Interiores con último pase, presencia en zonas de remate y capacidad para generar ocasiones.",
      metrics: { xa_real_p90: 1, pases_al_area_p90: 1, through_balls_p90: 1, pct_toques_en_area: 1, tiros_p90: 1 }
    },
    {
      id: "defensa_cobertura",
      name: "Defensa y cobertura",
      description: "Interiores que equilibran al equipo con presión, intercepciones, duelos y recuperaciones.",
      metrics: { presiones_p90: 1, intercepciones_p90: 1, recuperaciones_p90: 1, pct_duelos_total: 1 }
    },
    {
      id: "conduccion_recorrido",
      name: "Conducción y recorrido",
      description: "Jugadoras que rompen líneas conduciendo y cubren mucho campo con balón o sin él.",
      metrics: { carries_prog_p90: 1, velocidad_cond_m_s: 1 }
    }
  ],
  EXT: [
    {
      id: "uno_vs_uno",
      name: "1v1 y conducción",
      description: "Extremos que encaran, eliminan rivales y progresan con balón.",
      metrics: { regates_p90: 1, pct_regates: 1, carries_prog_p90: 1 }
    },
    {
      id: "banda_centro",
      name: "Banda y centro",
      description: "Extremos que producen desde fuera con centros, pases clave y amenaza asistente.",
      metrics: { centros_p90: 1, ratio_centros_vs_pases_al_area: 1, pases_clave_p90: 1, xa_real_p90: 1 }
    },
    {
      id: "diagonal_finalizacion",
      name: "Diagonal y finalización",
      description: "Extremos que pisan área, atacan por dentro y convierten sus acciones en tiros de calidad.",
      metrics: { pct_toques_en_area: 1, tiros_p90: 1, xg_por_tiro: 1 }
    },
    {
      id: "asociacion",
      name: "Asociación y pase",
      description: "Extremos que participan en la circulación, conectan jugadas y sostienen posesiones largas.",
      metrics: { pct_pases: 1, pases_completados_p90: 1, pases_clave_p90: 1, xa_real_p90: 1 }
    }
  ],
  DEL: [
    {
      id: "finalizacion",
      name: "Finalización",
      description: "Delanteras orientadas a rematar, pisar área y convertir ocasiones de buena calidad.",
      metrics: { ratio_tiros_vs_pases: 1, xg_por_tiro: 1, distancia_media_tiros: 1, pct_toques_en_area: 1, tiros_puerta_p90: 1 }
    },
    {
      id: "asociacion_ultimo_pase",
      name: "Asociación y último pase",
      description: "Delanteras que bajan a combinar, progresan con pase y generan ventajas para compañeras.",
      metrics: { pases_completados_p90: 1, pct_pases: 1, pct_pases_prog: 1, pases_clave_p90: 1, xa_real_p90: 1, through_balls_p90: 1 }
    },
    {
      id: "referencia",
      name: "Referencia y juego de espaldas",
      description: "Delanteras que fijan centrales, reciben de espaldas y ofrecen una salida física o aérea.",
      metrics: { recibidos_de_espaldas_p90: 1, aereos_ganados_p90: 1 }
    },
    {
      id: "presion_alta",
      name: "Presión alta",
      description: "Delanteras que inician la presión y ayudan a recuperar cerca del área rival.",
      metrics: { presiones_p90: 1 }
    }
  ]
};

const METRIC_LABELS = {
  pct_pases: "% pases completados",
  pct_pases_largos: "% pases largos",
  pct_pases_prog: "% pases progresivos",
  pct_pases_bajo_presion: "% pases bajo presión",
  pases_ult_tercio_p90: "Pases al último tercio",
  carries_prog_p90: "Conducciones progresivas",
  ratio_intercepciones_vs_entradas: "Anticipación vs entradas",
  duelos_ter_ganados_p90: "Duelos defensivos ganados",
  despejes_p90: "Despejes",
  pct_aereos: "% duelos aéreos ganados",
  pct_duelos_total: "% duelos ganados",
  recuperaciones_p90: "Recuperaciones",
  acciones_defensivas_campo_rival_p90: "Defensas en campo rival",
  pct_toques_en_campo_rival: "% toques en campo rival",
  centros_p90: "Centros",
  pases_al_area_p90: "Pases al área",
  ratio_centros_vs_pases_al_area: "Centros vs pases al área",
  deep_progressions_p90: "Progresiones profundas",
  xa_real_p90: "Asistencias esperadas",
  pct_regates: "% regates completados",
  acciones_defensivas_p90: "Acciones defensivas",
  distancia_media_pases: "Distancia media de pase",
  pases_progresivos_p90: "Pases progresivos",
  pases_largos_p90: "Pases largos",
  intercepciones_p90: "Intercepciones",
  acciones_agresivas_p90: "Acciones agresivas",
  presiones_p90: "Presiones",
  velocidad_cond_m_s: "Velocidad conduciendo",
  pases_completados_p90: "Pases completados",
  pases_bajo_presion_p90: "Pases bajo presión",
  through_balls_p90: "Balones al hueco",
  pct_toques_en_area: "% toques en área",
  tiros_p90: "Tiros",
  regates_p90: "Regates",
  xg_por_tiro: "Calidad media del tiro",
  pases_clave_p90: "Pases clave",
  ratio_tiros_vs_pases: "Tiros vs pases",
  distancia_media_tiros: "Distancia media de tiro",
  tiros_puerta_p90: "Tiros a puerta",
  recibidos_de_espaldas_p90: "Recepciones de espaldas",
  aereos_ganados_p90: "Duelos aéreos ganados",
  asistencias_p90: "Asistencias",
  goles_p90: "Goles",
  xg_p90: "Goles esperados",
  np_xg_p90: "xG sin penaltis",
  bloqueos_p90: "Bloqueos",
  carries_p90: "Conducciones",
  crosses_p90: "Centros",
  duelos_aereos_p90: "Duelos aéreos",
  duelos_ter_p90: "Duelos defensivos",
  faltas_ganadas_p90: "Faltas recibidas",
  obv_defensive_p90: "Valor defensivo añadido",
  obv_dribble_carry_p90: "Valor añadido conduciendo",
  obv_pass_p90: "Valor añadido con pase",
  pases_hacia_adelante_p90: "Pases hacia delante",
  pases_p90: "Pases",
  pressure_regains_p90: "Recuperaciones tras presión",
  regates_comp_p90: "Regates completados",
  tackles_p90: "Entradas",
  toques_en_area_p90: "Toques en área",
  toques_en_campo_rival_p90: "Toques en campo rival",
  toques_totales_p90: "Toques totales",
  dribbled_past_p90: "Veces superada en regate",
  dispossessions_p90: "Pérdidas por robo",
  challenge_ratio: "Ratio de entradas",
  pct_duelos_ter: "% duelos defensivos ganados",
  pct_pases_al_area: "% pases al área",
  pct_pases_clave: "% pases clave",
  pct_pases_comp: "% pases completados",
  pct_pases_ult_tercio: "% pases al último tercio",
  penaltis_ganados_p90: "Penaltis provocados",
  rel_carries: "Peso de conducciones",
  rel_duelos: "Peso de duelos",
  rel_pases: "Peso de pases",
  rel_pases_comp: "Peso de pases completados",
  rel_presiones: "Peso de presiones",
  rel_tiros: "Peso de tiros",
  rel_xg: "Peso del xG",
  tiros_bloqueados_p90: "Tiros bloqueados",
  posicion_media_x: "Altura media",
  posicion_media_y: "Anchura media",
  std_posicion_x: "Variabilidad vertical",
  std_posicion_y: "Variabilidad lateral"
};

const METRIC_DESCRIPTIONS = {
  pct_pases: "Porcentaje de pases completados. Ayuda a medir seguridad y precisión en la circulación.",
  pct_pases_largos: "Porcentaje de pases largos completados. Resume la eficacia cuando la jugadora busca envíos de mayor distancia.",
  pct_pases_prog: "Porcentaje de pases que hacen progresar la jugada hacia zonas más avanzadas.",
  pct_pases_bajo_presion: "Porcentaje de pases completados cuando la jugadora está presionada.",
  pases_ult_tercio_p90: "Pases hacia el último tercio por 90 minutos. Mide cuánto acerca el juego a zona de ataque.",
  carries_prog_p90: "Conducciones progresivas por 90 minutos. Refleja capacidad para avanzar con balón.",
  ratio_intercepciones_vs_entradas: "Relación entre intercepciones y entradas. Valores altos suelen indicar más anticipación que defensa al choque.",
  duelos_ter_ganados_p90: "Duelos defensivos ganados por 90 minutos.",
  despejes_p90: "Despejes por 90 minutos. Suele aparecer en perfiles más protectores o de defensa de área.",
  pct_aereos: "Porcentaje de duelos aéreos ganados.",
  pct_duelos_total: "Porcentaje de duelos totales ganados.",
  recuperaciones_p90: "Recuperaciones de balón por 90 minutos.",
  acciones_defensivas_campo_rival_p90: "Acciones defensivas realizadas en campo rival por 90 minutos. Indica presión alta o defensa hacia delante.",
  pct_toques_en_campo_rival: "Proporción de toques realizados en campo rival. Puede depender también del estilo colectivo del equipo.",
  centros_p90: "Centros al área por 90 minutos.",
  pases_al_area_p90: "Pases que llegan al área rival por 90 minutos.",
  ratio_centros_vs_pases_al_area: "Compara si la jugadora genera peligro centrando o filtrando pases hacia el área.",
  deep_progressions_p90: "Acciones que acercan el balón a zonas profundas del ataque.",
  xa_real_p90: "Asistencias esperadas por 90 minutos: probabilidad acumulada de que sus pases acaben en gol.",
  pct_regates: "Porcentaje de regates completados.",
  acciones_defensivas_p90: "Acciones defensivas totales por 90 minutos.",
  distancia_media_pases: "Distancia media de sus pases. Ayuda a diferenciar juego corto de distribución más larga.",
  pases_progresivos_p90: "Pases progresivos por 90 minutos.",
  pases_largos_p90: "Pases largos por 90 minutos.",
  intercepciones_p90: "Intercepciones por 90 minutos. Mide capacidad para cortar líneas de pase.",
  acciones_agresivas_p90: "Acciones defensivas agresivas por 90 minutos, asociadas a presión o disputa inmediata.",
  presiones_p90: "Presiones realizadas por 90 minutos.",
  velocidad_cond_m_s: "Velocidad media cuando conduce el balón.",
  pases_completados_p90: "Volumen de pases completados por 90 minutos.",
  pases_bajo_presion_p90: "Pases completados bajo presión por 90 minutos.",
  through_balls_p90: "Balones al hueco por 90 minutos: pases que atacan un espacio libre a la espalda o entre líneas.",
  pct_toques_en_area: "Proporción de toques dentro del área rival.",
  tiros_p90: "Tiros por 90 minutos.",
  regates_p90: "Regates intentados o realizados por 90 minutos, según la definición de la fuente.",
  xg_por_tiro: "Calidad media del tiro: xG dividido entre tiros. Cuanto mayor, mejores suelen ser las posiciones de remate.",
  pases_clave_p90: "Pases que terminan en tiro por 90 minutos.",
  ratio_tiros_vs_pases: "Relación entre finalizar jugadas y participar mediante pase.",
  distancia_media_tiros: "Distancia media desde la que tira. Valores bajos suelen indicar remates más cercanos al área.",
  tiros_puerta_p90: "Tiros a puerta por 90 minutos.",
  recibidos_de_espaldas_p90: "Recepciones de espaldas por 90 minutos. Útil para detectar delanteras de apoyo o referencia.",
  aereos_ganados_p90: "Duelos aéreos ganados por 90 minutos.",
  posicion_media_x: "Altura media de sus acciones en el campo.",
  posicion_media_y: "Anchura media de sus acciones en el campo.",
  std_posicion_x: "Variabilidad vertical de su posición: cuánto cambia su altura durante el partido.",
  std_posicion_y: "Variabilidad lateral de su posición: cuánto se mueve hacia dentro o hacia fuera.",
  xg: "Expected Goals: calidad estimada de los tiros según probabilidad de gol.",
  xa: "Expected Assists: probabilidad de que un pase acabe generando una asistencia.",
  p90: "Métrica normalizada por 90 minutos.",
  pct: "Porcentaje de éxito o proporción sobre el total.",
  ratio: "Relación entre dos acciones para entender preferencias de juego.",
  carries: "Conducciones con balón.",
  presiones: "Acciones de presión defensiva.",
  recuperaciones: "Recuperaciones de balón.",
  intercepciones: "Cortes de pase o anticipaciones.",
  duelos: "Disputas directas con una rival.",
  aereos: "Acciones o duelos aéreos."
};

const state = {
  health: null,
  positions: [],
  teams: [],
  metricsByPosition: {},
  defaultMetricsByPosition: {},
  players: [],
  selectedPlayerId: "",
  currentPlayerData: null,
  profileSelectedMetrics: [],
  profileWeights: {},
  profilePosition: "",
  profileScores: [],
  profileRadarIds: [],
  profileActiveWeights: {},
  compareAvailablePlayers: [],
  compareSelectedPlayerIds: [],
  compareSelectedMetrics: [],
  comparePosition: "",
  hybridPlayers: [],
  selectedHybridPlayerId: "",
  currentHybridPlayer: null,
  hybridProfiles: [],
  selectedHybridId: "",
  currentHybridDetail: null,
  hybridBlockAId: "",
  hybridBlockBId: "",
  hybridPosition: "",
  currentView: "player-view"
};

const $ = (selector) => document.querySelector(selector);

const els = {
  loginScreen: $("#login-screen"),
  appShell: $("#app-shell"),
  loginForm: $("#login-form"),
  password: $("#password"),
  loginError: $("#login-error"),
  logout: $("#logout"),
  toast: $("#toast"),
  metricPopover: $("#metric-popover"),
  status: $("#data-status"),
  statPlayers: $("#stat-players"),
  statPositions: $("#stat-positions"),
  statTeams: $("#stat-teams"),
  playerSearch: $("#player-search"),
  clearPlayerFilters: $("#clear-player-filters"),
  playerResults: $("#player-results"),
  playerTeam: $("#player-team"),
  playerPosition: $("#player-position"),
  playerSelected: $("#player-selected"),
  playerCard: $("#player-card"),
  clusterStory: $("#cluster-story"),
  clusterStrengths: $("#cluster-strengths"),
  clusterWeaknesses: $("#cluster-weaknesses"),
  similarGrid: $("#similar-grid"),
  profilePosition: $("#profile-position"),
  metricSearch: $("#metric-search"),
  metricSearchResults: $("#metric-search-results"),
  metricWeights: $("#metric-weights"),
  profileSummary: $("#profile-summary"),
  runProfile: $("#run-profile"),
  clearWeights: $("#clear-weights"),
  scoreChart: $("#score-chart"),
  scoreTable: $("#score-table"),
  comparePosition: $("#compare-position"),
  comparePlayerSearch: $("#compare-player-search"),
  comparePlayerResults: $("#compare-player-results"),
  compareSelectedPlayers: $("#compare-selected-players"),
  compareMetricSearch: $("#compare-metric-search"),
  compareMetricResults: $("#compare-metric-results"),
  compareSelectedMetrics: $("#compare-selected-metrics"),
  comparisonCards: $("#comparison-cards"),
  hybridPosition: $("#hybrid-position"),
  hybridPlayerSearch: $("#hybrid-player-search"),
  clearHybridPlayerFilters: $("#clear-hybrid-player-filters"),
  hybridPlayerResults: $("#hybrid-player-results"),
  hybridSelectedPlayer: $("#hybrid-selected-player"),
  hybridTeam: $("#hybrid-team"),
  hybridMinutes: $("#hybrid-minutes"),
  hybridSearch: $("#hybrid-search"),
  hybridWeightA: $("#hybrid-weight-a"),
  hybridWeightB: $("#hybrid-weight-b"),
  hybridBlockSelectA: $("#hybrid-block-select-a"),
  hybridBlockSelectB: $("#hybrid-block-select-b"),
  hybridBlockA: $("#hybrid-block-a"),
  hybridBlockB: $("#hybrid-block-b"),
  runHybrid: $("#run-hybrid"),
  clearHybrid: $("#clear-hybrid"),
  hybridWeightSplit: $("#hybrid-weight-split"),
  hybridList: $("#hybrid-list"),
  hybridDetail: $("#hybrid-detail"),
  hybridMetrics: $("#hybrid-metrics")
};

init();
window.addEventListener("plotly-ready", refreshVisibleCharts);

function init() {
  bindEvents();
  showApp();
}

function refreshVisibleCharts() {
  if (state.currentPlayerData) renderPlayerRadar(state.currentPlayerData);
  if (state.profileScores.length) renderScoreChart();
  if (state.compareSelectedPlayerIds.length >= 2 && state.compareSelectedMetrics.length) runComparison();
  if (state.currentHybridDetail) renderHybridRadar(state.currentHybridDetail);
}

function bindEvents() {
  els.loginForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (els.password.value === PASSWORD) {
      sessionStorage.setItem("spl-auth", "true");
      showApp();
    } else {
      els.loginError.textContent = "Contraseña incorrecta.";
    }
  });

  els.logout?.addEventListener("click", () => showApp());

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      switchView(item.dataset.view);
    });
  });

  document.addEventListener("click", (event) => {
    const help = event.target.closest("[data-help-metric]");
    if (help) {
      event.preventDefault();
      event.stopPropagation();
      showMetricPopover(help, help.dataset.helpMetric);
      return;
    }
    const scoreHelp = event.target.closest("[data-help-score]");
    if (scoreHelp) {
      event.preventDefault();
      event.stopPropagation();
      showScorePopover(scoreHelp, scoreHelp.dataset.helpScore);
      return;
    }
    if (!event.target.closest("#metric-popover")) hideMetricPopover();
  });
  document.addEventListener("keydown", (event) => {
    const help = event.target.closest?.("[data-help-metric], [data-help-score]");
    if (!help || !["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    if (help.dataset.helpMetric) showMetricPopover(help, help.dataset.helpMetric);
    if (help.dataset.helpScore) showScorePopover(help, help.dataset.helpScore);
  });

  [els.playerSearch, els.playerTeam, els.playerPosition].forEach((el) => {
    el.addEventListener("input", debounce(refreshPlayers, 180));
    el.addEventListener("change", refreshPlayers);
  });
  els.clearPlayerFilters?.addEventListener("click", resetPlayerFilters);
  els.playerResults.addEventListener("click", (event) => {
    const item = event.target.closest("[data-player-id]");
    if (item) selectPlayer(item.dataset.playerId);
  });

  els.profilePosition.addEventListener("change", () => {
    resetProfileMetrics();
    renderMetricPicker();
    renderMetricWeights();
  });
  els.metricSearch.addEventListener("input", renderMetricPicker);
  els.metricSearchResults.addEventListener("click", (event) => {
    if (event.target.closest("[data-help-metric]")) return;
    const item = event.target.closest("[data-metric]");
    if (item) addProfileMetric(item.dataset.metric);
  });
  els.clearWeights.addEventListener("click", () => {
    document.querySelectorAll(".metric-row input").forEach((input) => {
      input.value = "5";
      input.dispatchEvent(new Event("input"));
    });
  });
  els.runProfile.addEventListener("click", runProfile);
  els.scoreTable.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-profile-radar-id]");
    if (toggle) {
      toggleProfileRadar(toggle.dataset.profileRadarId);
    }
  });

  els.comparePosition.addEventListener("change", async () => {
    await populateComparisonPlayers(true);
    resetCompareMetrics();
    renderComparisonPickers();
    await runComparison();
  });
  els.comparePlayerSearch.addEventListener("input", renderComparePlayerPicker);
  els.compareMetricSearch.addEventListener("input", renderCompareMetricPicker);
  els.comparePlayerResults.addEventListener("click", (event) => {
    const item = event.target.closest("[data-player-id]");
    if (item) addComparePlayer(item.dataset.playerId);
  });
  els.compareMetricResults.addEventListener("click", (event) => {
    if (event.target.closest("[data-help-metric]")) return;
    const item = event.target.closest("[data-metric]");
    if (item) addCompareMetric(item.dataset.metric);
  });
  els.compareSelectedPlayers.addEventListener("click", (event) => {
    const item = event.target.closest("[data-remove-player]");
    if (item) removeComparePlayer(item.dataset.removePlayer);
  });
  els.compareSelectedMetrics.addEventListener("click", (event) => {
    const item = event.target.closest("[data-remove-metric]");
    if (item) removeCompareMetric(item.dataset.removeMetric);
  });
  els.hybridPlayerSearch?.addEventListener("input", debounce(refreshHybridPlayers, 180));
  els.clearHybridPlayerFilters?.addEventListener("click", resetHybridPlayerSearch);
  els.hybridPlayerResults?.addEventListener("click", (event) => {
    const item = event.target.closest("[data-hybrid-player-id]");
    if (item) selectHybridPlayer(item.dataset.hybridPlayerId);
  });
  els.hybridPosition.addEventListener("change", () => {
    resetHybridBlocks();
    renderHybridBlocks();
    runHybridSearch();
  });
  [
    [els.hybridBlockSelectA, "A"],
    [els.hybridBlockSelectB, "B"]
  ].forEach(([el, block]) => {
    el.addEventListener("change", () => {
      state.selectedHybridId = "";
      syncHybridBlockSelects(block);
      renderHybridBlocks();
      runHybridSearch();
    });
  });
  [els.hybridTeam, els.hybridMinutes, els.hybridSearch, els.hybridWeightA, els.hybridWeightB].filter(Boolean).forEach((el) => {
    el.addEventListener("input", debounce(() => {
      renderHybridWeightSplit();
      runHybridSearch();
    }, 180));
    el.addEventListener("change", () => {
      renderHybridWeightSplit();
      runHybridSearch();
    });
  });
  els.runHybrid?.addEventListener("click", () => {
    runHybridSearch();
  });
  els.clearHybrid.addEventListener("click", () => {
    els.hybridWeightA.value = "3";
    els.hybridWeightB.value = "3";
    resetHybridBlocks();
    renderHybridBlocks();
    renderHybridWeightSplit();
    runHybridSearch();
  });
  els.hybridList.addEventListener("click", (event) => {
    const item = event.target.closest("[data-hybrid-id]");
    if (item) selectHybridProfile(item.dataset.hybridId);
  });
  els.metricWeights.addEventListener("click", (event) => {
    const item = event.target.closest("[data-remove-profile-metric]");
    if (item) removeProfileMetric(item.dataset.removeProfileMetric);
  });
}

async function showApp() {
  els.loginScreen.classList.add("hidden");
  els.appShell.classList.remove("hidden");
  window.scrollTo(0, 0);
  if (!state.health) {
    await loadInitialData();
  }
}

async function loadInitialData() {
  try {
    const health = await fetchJson("/api/health");
    state.health = health;
    els.status.textContent = health.dataLoaded ? `${health.players} jugadoras cargadas` : "Sin CSV cargado";
    els.statPlayers.textContent = health.players || 0;
    if (els.statTeams) els.statTeams.textContent = health.teams || 0;
    await refreshPlayers();
  } catch (error) {
    showToast("No se pudo conectar con el backend Java.");
  }
}

function switchView(viewId) {
  state.currentView = viewId;
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === viewId));
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === viewId));
  if (viewId === "profile-view") {
    if (!state.profileSelectedMetrics.length) resetProfileMetrics();
    renderMetricPicker();
    renderMetricWeights();
    renderProfileSummary();
  }
  if (viewId === "comparison-view") {
    populateComparisonPlayers().then(() => {
      if (!state.compareSelectedMetrics.length) resetCompareMetrics();
      renderComparisonPickers();
      runComparison();
    });
  }
  if (viewId === "hybrid-view") {
    prepareHybridView();
  }
}

async function prepareHybridView() {
  if (!state.positions.length) {
    clearHybridResults("Cargando métricas...");
    setTimeout(() => {
      if (state.currentView === "hybrid-view") prepareHybridView();
    }, 250);
    return;
  }
  await refreshHybridPlayers();
  if (!state.selectedHybridPlayerId) {
    const starter = state.currentPlayerData?.player || state.players[0] || state.hybridPlayers[0];
    if (starter?.id) {
      await selectHybridPlayer(starter.id, { updateSearch: false });
      return;
    }
    renderHybridSelectedPlayer();
    clearHybridResults("Elige una jugadora para calcular su hibridez.");
    return;
  }
  if (!state.hybridBlockAId || !state.hybridBlockBId) resetHybridBlocks();
  renderHybridPickers();
  renderHybridBlocks();
  renderHybridWeightSplit();
  runHybridSearch();
}

async function refreshPlayers() {
  const params = new URLSearchParams();
  if (els.playerPosition.value) params.set("position", els.playerPosition.value);
  if (els.playerTeam.value) params.set("team", els.playerTeam.value);
  if (els.playerSearch.value) params.set("search", els.playerSearch.value);
  const query = params.toString();
  const data = await fetchJson(query ? `/api/players?${query}` : "/api/players");
  state.players = data.players || [];
  state.positions = data.positions || [];
  state.teams = data.teams || [];
  state.metricsByPosition = data.metricsByPosition || {};
  state.defaultMetricsByPosition = data.defaultMetricsByPosition || {};
  els.statPositions.textContent = state.positions.length;
  if (els.statTeams && !Number(els.statTeams.textContent)) els.statTeams.textContent = state.teams.length;
  populateStaticSelects();
  if (!state.profileSelectedMetrics.length) resetProfileMetrics();
  if (state.currentView === "hybrid-view") {
    prepareHybridView();
  }
  renderMetricPicker();
  renderPlayerResults();
  if (state.players.length) {
    const stillAvailable = state.players.some((player) => player.id === state.selectedPlayerId);
    await selectPlayer(stillAvailable ? state.selectedPlayerId : state.players[0].id, false);
  } else {
    clearPlayerView();
  }
}

function resetPlayerFilters() {
  els.playerSearch.value = "";
  els.playerTeam.value = "";
  els.playerPosition.value = "";
  refreshPlayers();
  els.playerSearch.focus();
}

function populateStaticSelects() {
  fillSelect(els.playerPosition, [{ value: "", label: "Todas" }, ...state.positions.map((pos) => ({ value: pos, label: positionName(pos) }))], els.playerPosition.value);
  fillSelect(els.playerTeam, [{ value: "", label: "Todos" }, ...state.teams.map((team) => ({ value: team, label: team }))], els.playerTeam.value);
  fillSelect(els.profilePosition, state.positions.map((pos) => ({ value: pos, label: positionName(pos) })), els.profilePosition.value || state.positions[0]);
  fillSelect(els.comparePosition, state.positions.map((pos) => ({ value: pos, label: positionName(pos) })), els.comparePosition.value || state.positions[0]);
  fillSelect(els.hybridPosition, state.positions.map((pos) => ({ value: pos, label: positionName(pos) })), els.hybridPosition.value || state.positions[0]);
  if (els.hybridTeam) {
    fillSelect(els.hybridTeam, [{ value: "", label: "Todos" }, ...state.teams.map((team) => ({ value: team, label: team }))], els.hybridTeam.value);
  }
}

function renderPlayerResults() {
  const selectedId = state.selectedPlayerId;
  els.playerResults.innerHTML = state.players.slice(0, 9).map((player) => {
    const active = player.id === selectedId ? " active" : "";
    return `
      <button type="button" class="search-result${active}" data-player-id="${escapeHtml(player.id)}">
        <span>
          <strong>${escapeHtml(player.name)}</strong>
          <small>${flagHtml(player)} ${escapeHtml(player.team || "Sin equipo")} · ${escapeHtml(positionName(player.position))}</small>
        </span>
        <span class="cluster-chip" style="background:${colorForCluster(player.cluster)}">${escapeHtml(clusterBadgeText(player))}</span>
      </button>
    `;
  }).join("") || `<div class="search-empty">Sin resultados</div>`;
}

async function selectPlayer(id, syncFilters = false) {
  if (!id) return;
  state.selectedPlayerId = id;
  renderPlayerResults();
  const player = await loadPlayer(id);
  if (syncFilters) syncSelectedPlayerFilters(player);
}

async function loadPlayer(id) {
  if (!id) return;
  const data = await fetchJson(`/api/player?id=${encodeURIComponent(id)}`);
  state.currentPlayerData = data;
  state.selectedPlayerId = data.player.id;
  renderPlayerCard(data.player);
  renderSelectedPlayer(data.player);
  renderPlayerResults();
  renderPlayerRadar(data);
  renderClusterStory(data);
  renderSimilar(data.similarPlayers || []);
  return data.player;
}

function syncSelectedPlayerFilters(player) {
  if (!player) return;
  if (player.team && [...els.playerTeam.options].some((option) => option.value === player.team)) {
    els.playerTeam.value = player.team;
  }
  if (player.position && [...els.playerPosition.options].some((option) => option.value === player.position)) {
    els.playerPosition.value = player.position;
  }
}

function renderSelectedPlayer(player) {
  if (!els.playerSelected) return;
  els.playerSelected.innerHTML = `
      <div class="selected-summary">
        <strong>${escapeHtml(player.name)}</strong>
        <small>${flagHtml(player)} ${escapeHtml(player.team || "Sin equipo")} · ${escapeHtml(positionName(player.position))}</small>
      </div>
  `;
}

function renderPlayerCard(player) {
  const color = colorForCluster(player.cluster);
  els.playerCard.innerHTML = `
    <div class="avatar" style="border-color:${color}">${avatarHtml(player)}</div>
    <div class="player-main">
      <h3>${escapeHtml(player.name)}</h3>
      <div class="player-meta">
        <span class="badge">${escapeHtml(positionName(player.position))}</span>
        <span class="badge">${flagHtml(player)}${escapeHtml(player.team || "Sin equipo")}</span>
      </div>
    </div>
    <div class="player-cluster-title" style="--cluster-color:${color}">
      <span>Perfil de la jugadora</span>
      <strong>${escapeHtml(clusterBadgeText(player))}</strong>
    </div>
  `;
}

function renderPlayerRadar(data) {
  const metrics = data.metrics || [];
  const labels = metrics.map(formatMetric);
  const angles = radarAngles(metrics.length);
  const playerValues = metrics.map((metric) => Number(data.playerRadarValues?.[metric] ?? (data.playerPercentiles?.[metric] || 0)));
  const clusterValues = metrics.map((metric) => Number(data.clusterRadarValues?.[metric] ?? (data.clusterPercentiles?.[metric] || 0)));
  const playerPercentiles = metrics.map((metric) => Number(data.playerPercentiles?.[metric] || 0) * 100);
  const clusterPercentiles = metrics.map((metric) => Number(data.clusterPercentiles?.[metric] || 0) * 100);
  const profileName = clusterName(data.player);
  const clusterTraceName = data.representativeName ? `${profileName}: ${data.representativeName}` : profileName;
  const playerColor = colorForCluster(data.player.cluster);
  renderPlotly("player-radar", [
    radarFillTrace(clusterValues, angles, "#95A5A6", clusterTraceName, 0.12),
    radarFillTrace(playerValues, angles, playerColor, data.player.name, 0.12),
    radarLineTrace({
      values: clusterValues,
      angles,
      labels,
      customdata: clusterPercentiles,
      name: clusterTraceName,
      color: "#95A5A6",
      width: 2.5,
      markerSize: 5,
      hovertemplate: "%{text}<br>Percentil: %{customdata:.0f}<extra></extra>"
    }),
    radarLineTrace({
      values: playerValues,
      angles,
      labels,
      customdata: playerPercentiles,
      name: data.player.name,
      color: playerColor,
      width: 3,
      hovertemplate: "%{text}<br>Percentil: %{customdata:.0f}<extra></extra>"
    })
  ], p05PolarLayout(labels, angles, 680), plotConfig());
}

function renderClusterStory(data) {
  const strengths = data.clusterSummary?.topStrengths || [];
  const weaknesses = data.clusterSummary?.topWeaknesses || [];
  const player = data.player;
  const strengthText = strengths.slice(0, 3).map((item) => formatMetric(item.metric)).join(", ");
  const weakText = weaknesses.slice(0, 2).map((item) => formatMetric(item.metric)).join(", ");
  const profile = data.clusterProfile || data.clusterSummary || {};
  const profileName = profile.name || clusterName(player);
  const description = profile.description || player.clusterDescription || `Perfil de ${positionName(player.position).toLowerCase()} con rasgos diferenciales dentro de su demarcación.`;
  const referenceText = data.representativeName ? `La referencia gris es la medoide del grupo, ${data.representativeName}.` : "La referencia gris es la jugadora más representativa disponible del grupo.";
  const strengthSentence = strengthText ? `En su caso, los rasgos que más sostienen esta lectura son ${strengthText}.` : "";
  const weakSentence = weakText ? `Conviene contextualizar especialmente ${weakText}.` : "";
  els.clusterStory.textContent = `${player.name} encaja en el perfil ${profileName}. ${description} ${strengthSentence} ${referenceText} ${weakSentence}`;
  els.clusterStrengths.innerHTML = strengths.map((item) => metricPill(item, "↑")).join("");
  els.clusterWeaknesses.innerHTML = weaknesses.map((item) => metricPill(item, "↓")).join("");
}

function renderSimilar(players) {
  els.similarGrid.innerHTML = players.map((player) => `
    <article class="mini-player" data-id="${escapeHtml(player.id)}">
      <div class="avatar" style="width:58px;height:58px;border-color:${colorForCluster(player.cluster)}">${avatarHtml(player)}</div>
      <strong>${escapeHtml(player.name)}</strong>
      <small>${flagHtml(player)} ${escapeHtml(player.team || "Sin equipo")} · ${escapeHtml(player.position)}</small>
      <span class="cluster-badge" style="background:${colorForCluster(player.cluster)}">${escapeHtml(clusterBadgeText(player))}</span>
    </article>
  `).join("");
  els.similarGrid.querySelectorAll(".mini-player").forEach((card) => {
    card.addEventListener("click", async () => {
      await selectPlayer(card.dataset.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function renderMetricWeights() {
  const position = els.profilePosition.value || state.positions[0];
  if (state.profilePosition !== position) resetProfileMetrics();
  const metrics = state.profileSelectedMetrics.filter((metric) => profileMetrics(position).includes(metric));
  state.profileSelectedMetrics = metrics;
  els.metricWeights.innerHTML = metrics.map((metric) => {
    const defaultValue = Number(state.profileWeights[metric] ?? 5);
    return `
      <label class="metric-row" title="${escapeHtml(metricDescription(metric))}">
        <strong>${formatMetric(metric)} ${helpIcon(metric)}</strong>
        <input type="range" min="0" max="10" step="1" value="${defaultValue}" data-metric="${escapeHtml(metric)}">
        <span class="weight-value">${defaultValue}</span>
        <button type="button" class="icon-button" data-remove-profile-metric="${escapeHtml(metric)}" title="Quitar ${escapeHtml(formatMetric(metric))}">×</button>
      </label>
    `;
  }).join("") || `<div class="search-empty">Sin métricas seleccionadas</div>`;
  els.metricWeights.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => {
      state.profileWeights[input.dataset.metric] = Number(input.value);
      input.nextElementSibling.textContent = input.value;
      renderProfileSummary();
    });
  });
  renderProfileSummary();
}

function renderProfileSummary() {
  if (!els.profileSummary) return;
  const values = state.profileSelectedMetrics.map((metric) => Number(state.profileWeights[metric] ?? 5));
  if (!values.length) {
    els.profileSummary.innerHTML = `<div class="search-empty">Añade métricas para construir el perfil objetivo.</div>`;
    return;
  }
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  els.profileSummary.innerHTML = `
    <article>
      <span>Métricas</span>
      <strong>${values.length}</strong>
    </article>
    <article>
      <span>Intensidad media</span>
      <strong>${average.toFixed(1)}</strong>
    </article>
  `;
}

function renderMetricPicker() {
  const position = els.profilePosition.value || state.positions[0];
  const search = normalize(els.metricSearch.value);
  const selected = new Set(state.profileSelectedMetrics);
  const candidates = profileMetrics(position)
    .filter((metric) => !selected.has(metric))
    .filter((metric) => metricMatches(metric, search))
    .slice(0, 12);

  els.metricSearchResults.innerHTML = candidates.map((metric) => `
    <button type="button" class="search-result metric-search-result" data-metric="${escapeHtml(metric)}">
      <span>
        <strong>${formatMetric(metric)} ${helpIcon(metric)}</strong>
        <small>${escapeHtml(metric)}</small>
      </span>
      <span class="add-pill">Añadir</span>
    </button>
  `).join("") || `<div class="search-empty">Sin métricas disponibles</div>`;
}

function resetProfileMetrics() {
  const position = els.profilePosition.value || state.positions[0];
  const defaults = defaultMetrics(position);
  state.profilePosition = position;
  state.profileSelectedMetrics = defaults.length ? defaults : profileMetrics(position).slice(0, 10);
  state.profileWeights = Object.fromEntries(state.profileSelectedMetrics.map((metric) => [metric, 5]));
}

function addProfileMetric(metric) {
  if (!metric || state.profileSelectedMetrics.includes(metric)) return;
  state.profileSelectedMetrics.push(metric);
  state.profileWeights[metric] = state.profileWeights[metric] ?? 5;
  els.metricSearch.value = "";
  renderMetricPicker();
  renderMetricWeights();
}

function removeProfileMetric(metric) {
  state.profileSelectedMetrics = state.profileSelectedMetrics.filter((item) => item !== metric);
  delete state.profileWeights[metric];
  renderMetricPicker();
  renderMetricWeights();
}

async function runProfile() {
  const targets = {};
  els.metricWeights.querySelectorAll("input").forEach((input) => {
    targets[input.dataset.metric] = Number(input.value);
  });
  if (!Object.keys(targets).length) {
    showToast("Selecciona al menos una métrica para construir el perfil.");
    return;
  }
  const data = await fetchJson("/api/profile-score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ position: els.profilePosition.value, targets, weights: targets, limit: 6 })
  });
  state.profileScores = (data.scores || []).slice(0, 6);
  state.profileActiveWeights = targets;
  state.profileRadarIds = state.profileScores[0]?.id ? [state.profileScores[0].id] : [];
  renderScoreTable(state.profileScores, targets);
  renderScoreChart();
}

function renderScoreChart() {
  const metrics = Object.keys(state.profileActiveWeights || {});
  if (!metrics.length || !state.profileScores.length) {
    purgePlotly("score-chart");
    return;
  }
  const labels = metrics.map(formatMetric);
  const angles = radarAngles(metrics.length);
  const targetLevels = metrics.map((metric) => clamp(Number(state.profileActiveWeights[metric] ?? 5), 0, 10));
  const targetPercentiles = targetLevels.map((value) => value * 10);
  const targetValues = targetPercentiles.map(percentileToRadarValue);
  const selectedRows = state.profileScores.filter((row) => state.profileRadarIds.includes(row.id));
  const fillTraces = [
    radarFillTrace(targetValues, angles, "#111827", "Perfil objetivo", 0.08)
  ];
  const lineTraces = [
    radarLineTrace({
      values: targetValues,
      angles,
      labels,
      customdata: targetPercentiles,
      name: "Perfil objetivo",
      color: "#111827",
      width: 3,
      dash: "dot",
      hovertemplate: "%{text}<br>Objetivo: P%{customdata:.0f}<extra></extra>"
    })
  ];
  selectedRows.forEach((row, index) => {
    const color = colorForPlayer(index);
    const percentiles = metrics.map((metric) => Number(row.percentiles?.[metric] ?? row.contribution?.[metric] ?? 0));
    const values = metrics.map((metric, metricIndex) => (
      Number(row.playerRadarValues?.[metric] ?? percentileToRadarValue(percentiles[metricIndex]))
    ));
    fillTraces.push(radarFillTrace(values, angles, color, row.name, 0.10));
    lineTraces.push(radarLineTrace({
      values,
      angles,
      labels,
      customdata: percentiles,
      name: row.name,
      color,
      width: 2.8,
      hovertemplate: "%{text}<br>Percentil: %{customdata:.0f}<extra></extra>"
    }));
  });
  const traces = [...fillTraces, ...lineTraces];
  renderPlotly("score-chart", traces, p05PolarLayout(labels, angles, 520), plotConfig());
}

function renderScoreTable(scores, weights) {
  els.scoreTable.innerHTML = scores.slice(0, 6).map((row, index) => {
    const active = state.profileRadarIds.includes(row.id);
    const text = profileFitText(row, weights, index);
    const playerColor = profileRadarColor(row, index);
    return `
      <article class="ranking-row profile-row${active ? " active" : ""}" style="--player-color:${playerColor}">
        <span class="rank-number">${index + 1}</span>
        <div class="avatar" style="width:52px;height:52px;border-color:${playerColor}">${avatarHtml(row)}</div>
        <div>
          <strong>${escapeHtml(row.name)}</strong>
          <small>${flagHtml(row)} ${escapeHtml(row.team || "Sin equipo")} · ${escapeHtml(row.position)} · ${escapeHtml(clusterName(row))}</small>
          <small>${escapeHtml(text)}</small>
        </div>
        <div class="profile-row-actions">
          <span class="score-value">${Number(row.score).toFixed(1)}</span>
          <button type="button" class="secondary-action compact-action" data-profile-radar-id="${escapeHtml(row.id)}">${active ? "Quitar radar" : "Añadir radar"}</button>
        </div>
      </article>
    `;
  }).join("") || `<div class="search-empty">Calcula un perfil para ver candidatas.</div>`;
}

function profileRadarColor(row, fallbackIndex = 0) {
  const selectedRows = state.profileScores.filter((item) => state.profileRadarIds.includes(item.id));
  const selectedIndex = selectedRows.findIndex((item) => item.id === row.id);
  return colorForPlayer(selectedIndex >= 0 ? selectedIndex : fallbackIndex);
}

function toggleProfileRadar(id) {
  if (!id) return;
  if (state.profileRadarIds.includes(id)) {
    if (state.profileRadarIds.length === 1) return;
    state.profileRadarIds = state.profileRadarIds.filter((item) => item !== id);
  } else {
    if (state.profileRadarIds.length >= 5) {
      showToast("Puedes comparar hasta 5 jugadoras en el radar.");
      return;
    }
    state.profileRadarIds.push(id);
  }
  renderScoreTable(state.profileScores, state.profileActiveWeights);
  renderScoreChart();
}

async function populateComparisonPlayers(reset = false) {
  const position = els.comparePosition.value || state.positions[0];
  const params = new URLSearchParams({ position });
  const data = await fetchJson(`/api/players?${params}`);
  state.compareAvailablePlayers = data.players || [];
  const availableIds = new Set(state.compareAvailablePlayers.map((player) => player.id));
  const hasInvalidSelection = state.compareSelectedPlayerIds.some((id) => !availableIds.has(id));
  if (reset || state.comparePosition !== position || !state.compareSelectedPlayerIds.length || hasInvalidSelection) {
    state.compareSelectedPlayerIds = state.compareAvailablePlayers.slice(0, 3).map((player) => player.id);
  }
  state.comparePosition = position;
}

function resetCompareMetrics() {
  const position = els.comparePosition.value || state.positions[0];
  state.compareSelectedMetrics = defaultMetrics(position).slice(0, 10);
  if (!state.compareSelectedMetrics.length) {
    state.compareSelectedMetrics = profileMetrics(position).slice(0, 10);
  }
}

function renderComparisonPickers() {
  renderComparePlayerPicker();
  renderCompareMetricPicker();
  renderCompareSelectedPlayers();
  renderCompareSelectedMetrics();
}

function renderComparePlayerPicker() {
  const search = normalize(els.comparePlayerSearch.value);
  const selected = new Set(state.compareSelectedPlayerIds);
  const candidates = state.compareAvailablePlayers
    .filter((player) => !selected.has(player.id))
    .filter((player) => playerMatches(player, search))
    .slice(0, 10);

  els.comparePlayerResults.innerHTML = candidates.map((player) => `
    <button type="button" class="search-result" data-player-id="${escapeHtml(player.id)}">
      <span>
        <strong>${escapeHtml(player.name)}</strong>
        <small>${flagHtml(player)} ${escapeHtml(player.team || "Sin equipo")} · ${escapeHtml(clusterName(player))}</small>
      </span>
      <span class="add-pill">Añadir</span>
    </button>
  `).join("") || `<div class="search-empty">Sin jugadoras disponibles</div>`;
}

function renderCompareMetricPicker() {
  const position = els.comparePosition.value || state.positions[0];
  const search = normalize(els.compareMetricSearch.value);
  const selected = new Set(state.compareSelectedMetrics);
  const candidates = profileMetrics(position)
    .filter((metric) => !selected.has(metric))
    .filter((metric) => metricMatches(metric, search))
    .slice(0, 12);

  els.compareMetricResults.innerHTML = candidates.map((metric) => `
    <button type="button" class="search-result metric-search-result" data-metric="${escapeHtml(metric)}">
      <span>
        <strong>${formatMetric(metric)} ${helpIcon(metric)}</strong>
        <small>${escapeHtml(metric)}</small>
      </span>
      <span class="add-pill">Añadir</span>
    </button>
  `).join("") || `<div class="search-empty">Sin métricas disponibles</div>`;
}

function renderCompareSelectedPlayers() {
  const players = state.compareSelectedPlayerIds.map(comparePlayerById).filter(Boolean);
  els.compareSelectedPlayers.innerHTML = players.map((player, index) => {
    const playerColor = colorForPlayer(index);
    return `
      <span class="selected-chip selected-player-chip" style="--player-color:${playerColor};border-color:${playerColor}">
        <span class="color-dot" style="background:${playerColor}"></span>
        <strong>${escapeHtml(player.name)}</strong>
        <span class="cluster-chip" style="background:${colorForCluster(player.cluster)}">${escapeHtml(clusterBadgeText(player))}</span>
        <button type="button" data-remove-player="${escapeHtml(player.id)}" title="Quitar ${escapeHtml(player.name)}">×</button>
      </span>
    `;
  }).join("") || `<span class="selected-placeholder">Sin jugadoras</span>`;
}

function renderCompareSelectedMetrics() {
  els.compareSelectedMetrics.innerHTML = state.compareSelectedMetrics.map((metric) => `
    <span class="selected-chip metric-chip">
      <strong>${formatMetric(metric)} ${helpIcon(metric)}</strong>
      <button type="button" data-remove-metric="${escapeHtml(metric)}" title="Quitar ${escapeHtml(formatMetric(metric))}">×</button>
    </span>
  `).join("") || `<span class="selected-placeholder">Sin métricas</span>`;
}

function addComparePlayer(id) {
  if (!id || state.compareSelectedPlayerIds.includes(id)) return;
  if (state.compareSelectedPlayerIds.length >= 5) {
    showToast("Puedes comparar hasta 5 jugadoras.");
    return;
  }
  state.compareSelectedPlayerIds.push(id);
  els.comparePlayerSearch.value = "";
  renderComparisonPickers();
  runComparison();
}

function removeComparePlayer(id) {
  state.compareSelectedPlayerIds = state.compareSelectedPlayerIds.filter((item) => item !== id);
  renderComparisonPickers();
  runComparison();
}

function addCompareMetric(metric) {
  if (!metric || state.compareSelectedMetrics.includes(metric)) return;
  if (state.compareSelectedMetrics.length >= 12) {
    showToast("Puedes comparar hasta 12 métricas en el radar.");
    return;
  }
  state.compareSelectedMetrics.push(metric);
  els.compareMetricSearch.value = "";
  renderComparisonPickers();
  runComparison();
}

function removeCompareMetric(metric) {
  state.compareSelectedMetrics = state.compareSelectedMetrics.filter((item) => item !== metric);
  renderComparisonPickers();
  runComparison();
}

async function runComparison() {
  const ids = state.compareSelectedPlayerIds.slice(0, 5);
  const metrics = state.compareSelectedMetrics.slice(0, 12);
  if (ids.length < 2 || metrics.length < 1) {
    els.comparisonCards.innerHTML = "";
    purgePlotly("compare-radar");
    purgePlotly("compare-bars");
    return;
  }
  const params = new URLSearchParams({ ids: ids.join(","), metrics: metrics.join(",") });
  const data = await fetchJson(`/api/compare?${params}`);
  renderComparisonCards(data.players || []);
  renderComparisonRadar(data);
  renderComparisonBars(data);
}

function renderComparisonCards(players) {
  els.comparisonCards.innerHTML = players.map((player, index) => {
    const playerColor = colorForPlayer(index);
    return `
    <article class="comparison-card" style="--player-color:${playerColor};border-color:${hexToRgba(playerColor, .55)}">
      <div class="avatar" style="width:54px;height:54px;border-color:${playerColor}">${avatarHtml(player)}</div>
      <div>
        <strong>${escapeHtml(player.name)}</strong>
        <small>${flagHtml(player)} ${escapeHtml(player.team || "Sin equipo")}</small>
      </div>
      <span class="cluster-chip" style="background:${colorForCluster(player.cluster)}">${escapeHtml(clusterBadgeText(player))}</span>
    </article>
  `;
  }).join("");
}

function renderComparisonRadar(data) {
  const labels = data.metrics.map(formatMetric);
  const angles = radarAngles(data.metrics.length);
  const fillTraces = [];
  const lineTraces = [];
  data.players.forEach((player, index) => {
    const color = colorForPlayer(index);
    const values = data.metrics.map((metric) => Number(player.radarValues?.[metric] ?? 0));
    const percentiles = data.metrics.map((metric) => Number(player.percentiles?.[metric] ?? 0));
    fillTraces.push(radarFillTrace(values, angles, color, player.name, 0.08));
    lineTraces.push(radarLineTrace({
      values,
      angles,
      labels,
      customdata: percentiles,
      name: player.name,
      color,
      width: 3,
      hovertemplate: "%{text}<br>Percentil: %{customdata:.0f}<extra></extra>"
    }));
  });
  const traces = [...fillTraces, ...lineTraces];
  renderPlotly("compare-radar", traces, p05PolarLayout(labels, angles, 560), plotConfig());
}

function renderComparisonBars(data) {
  const labels = data.metrics.map(formatMetric);
  const traces = data.players.map((player, index) => ({
    type: "bar",
    orientation: "h",
    y: labels,
    x: data.metrics.map((metric) => Number(player.percentiles[metric] || 0)),
    name: player.name,
    marker: { color: colorForPlayer(index) },
    hovertemplate: "%{y}<br>Percentil %{x:.0f}%<extra></extra>"
  }));
  renderPlotly("compare-bars", traces, {
    barmode: "group",
    margin: { l: 190, r: 24, t: 10, b: 42 },
    xaxis: { range: [0, 100], ticksuffix: "%", gridcolor: "#d8e2df" },
    yaxis: { autorange: "reversed", automargin: true },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    legend: { orientation: "h" }
  }, plotConfig());
}

async function refreshHybridPlayers() {
  if (!els.hybridPlayerResults) return;
  const params = new URLSearchParams();
  const search = els.hybridPlayerSearch?.value || "";
  if (search) params.set("search", search);
  const data = await fetchJson(params.toString() ? `/api/players?${params}` : "/api/players");
  state.hybridPlayers = data.players || [];
  renderHybridPlayerResults();
}

function renderHybridPlayerResults() {
  if (!els.hybridPlayerResults) return;
  const selectedId = state.selectedHybridPlayerId;
  els.hybridPlayerResults.innerHTML = state.hybridPlayers.slice(0, 9).map((player) => {
    const active = player.id === selectedId ? " active" : "";
    return `
      <button type="button" class="search-result${active}" data-hybrid-player-id="${escapeHtml(player.id)}">
        <span>
          <strong>${escapeHtml(player.name)}</strong>
          <small>${flagHtml(player)} ${escapeHtml(player.team || "Sin equipo")} · ${escapeHtml(positionName(player.position))}</small>
        </span>
        <span class="cluster-chip" style="background:${colorForCluster(player.cluster)}">${escapeHtml(clusterBadgeText(player))}</span>
      </button>
    `;
  }).join("") || `<div class="search-empty">Sin resultados</div>`;
}

async function selectHybridPlayer(id, options = {}) {
  if (!id) return;
  const data = await fetchJson(`/api/player?id=${encodeURIComponent(id)}`);
  const player = data.player;
  const previousPosition = state.currentHybridPlayer?.position || "";
  state.selectedHybridPlayerId = player.id;
  state.selectedHybridId = player.id;
  state.currentHybridPlayer = player;
  if (options.updateSearch !== false && els.hybridPlayerSearch) {
    els.hybridPlayerSearch.value = player.name;
  }
  if (els.hybridPosition && player.position) {
    els.hybridPosition.value = player.position;
  }
  renderHybridSelectedPlayer();
  renderHybridPlayerResults();
  if (player.position !== previousPosition) resetHybridBlocks();
  renderHybridPickers();
  renderHybridBlocks();
  renderHybridWeightSplit();
  await runHybridSearch();
}

function renderHybridSelectedPlayer() {
  if (!els.hybridSelectedPlayer) return;
  const player = state.currentHybridPlayer;
  if (!player) {
    els.hybridSelectedPlayer.innerHTML = `<span class="selected-placeholder">Elige una jugadora</span>`;
    return;
  }
  const color = colorForCluster(player.cluster);
  els.hybridSelectedPlayer.innerHTML = `
    <div class="avatar" style="width:52px;height:52px;border-color:${color}">${avatarHtml(player)}</div>
    <div>
      <strong>${escapeHtml(player.name)}</strong>
      <small>${flagHtml(player)} ${escapeHtml(player.team || "Sin equipo")} · ${escapeHtml(positionName(player.position))}</small>
      <span class="cluster-chip" style="background:${color}">${escapeHtml(clusterBadgeText(player))}</span>
    </div>
  `;
}

function resetHybridPlayerSearch() {
  if (!els.hybridPlayerSearch) return;
  els.hybridPlayerSearch.value = "";
  refreshHybridPlayers();
  els.hybridPlayerSearch.focus();
}

function resetHybridBlocks() {
  const position = state.currentHybridPlayer?.position || els.hybridPosition.value || state.positions[0];
  state.hybridPosition = position;
  const blocks = hybridBlocks(position);
  state.hybridBlockAId = blocks[0]?.id || "";
  state.hybridBlockBId = blocks[1]?.id || blocks[0]?.id || "";
  renderHybridPickers();
}

function renderHybridPickers() {
  const position = state.currentHybridPlayer?.position || els.hybridPosition.value || state.positions[0];
  if (els.hybridPosition && position) els.hybridPosition.value = position;
  const blocks = hybridBlocks(position);
  const options = blocks.map((block) => ({ value: block.id, label: block.name }));
  fillSelect(els.hybridBlockSelectA, options, state.hybridBlockAId || blocks[0]?.id || "");
  fillSelect(els.hybridBlockSelectB, options, state.hybridBlockBId || blocks[1]?.id || blocks[0]?.id || "");
  syncHybridBlockSelects();
  renderHybridWeightSplit();
}

function renderHybridBlocks() {
  renderHybridBlock("A");
  renderHybridBlock("B");
  renderHybridWeightSplit();
}

function renderHybridBlock(block) {
  const selected = selectedHybridBlock(block);
  const container = block === "A" ? els.hybridBlockA : els.hybridBlockB;
  if (!selected) {
    container.innerHTML = `<div class="search-empty">No hay bloques disponibles para esta posición</div>`;
    return;
  }
  const metrics = Object.keys(selected.metrics || {});
  container.innerHTML = `
    <article class="hybrid-block-card">
      <strong>${escapeHtml(selected.name)}</strong>
      <p>${escapeHtml(selected.description)}</p>
      <div class="hybrid-tags">
        ${metrics.map((metric) => `<span title="${escapeHtml(metricDescription(metric))}">${escapeHtml(formatMetric(metric))} ${helpIcon(metric)}</span>`).join("")}
      </div>
    </article>
  `;
}

async function runHybridSearch() {
  if (!els.hybridList) return;
  const player = state.currentHybridPlayer;
  if (!player) {
    clearHybridResults("Elige una jugadora para calcular su hibridez.");
    return;
  }
  const blockA = activeHybridWeights("A");
  const blockB = activeHybridWeights("B");
  if (!Object.keys(blockA).length || !Object.keys(blockB).length) {
    clearHybridResults("Necesitas elegir dos bloques con métricas disponibles.");
    return;
  }
  const data = await fetchJson("/api/hybrid-score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      position: player.position,
      blockWeightA: Number(els.hybridWeightA.value || 1),
      blockWeightB: Number(els.hybridWeightB.value || 1),
      blockA,
      blockB,
      id: player.id,
      limit: 5
    })
  });
  state.hybridProfiles = data.profiles || [];
  state.currentHybridDetail = data.detail || null;
  state.selectedHybridId = player.id;
  renderHybridList();
  renderHybridDetail(data.detail);
  renderHybridRadar(data.detail);
  renderHybridMetrics(data.detail);
}

function renderHybridWeightSplit() {
  if (!els.hybridWeightSplit) return;
  const shares = hybridWeightShares();
  els.hybridWeightSplit.innerHTML = `
    <div class="weight-split-line">
      <span>Bloque A ${shares.aPercent}%</span>
      <span>Bloque B ${shares.bPercent}%</span>
    </div>
    <div class="weight-split-bar" style="--share-a:${shares.aPercent}%">
      <span></span>
    </div>
  `;
}

function hybridWeightShares() {
  const rawA = Math.max(1, Number(els.hybridWeightA?.value || 1));
  const rawB = Math.max(1, Number(els.hybridWeightB?.value || 1));
  const total = rawA + rawB;
  const aPercent = Math.round(rawA / total * 100);
  return {
    a: rawA / total,
    b: rawB / total,
    aPercent,
    bPercent: 100 - aPercent
  };
}

function selectHybridProfile(id) {
  if (!id) return;
  state.selectedHybridId = id;
  runHybridSearch();
}

function activeHybridWeights(block) {
  return { ...(selectedHybridBlock(block)?.metrics || {}) };
}

function hybridBlocks(position) {
  const available = new Set(profileMetrics(position));
  const configured = HYBRID_BLOCK_LIBRARY[position] || [];
  const blocks = configured.map((block) => {
    const metrics = Object.fromEntries(
      Object.entries(block.metrics || {}).filter(([metric]) => available.has(metric))
    );
    return { ...block, metrics };
  }).filter((block) => Object.keys(block.metrics).length);
  if (blocks.length) return blocks;

  const fallbackMetrics = defaultMetrics(position);
  return [
    {
      id: "rasgo_principal",
      name: "Rasgo principal",
      description: "Bloque automático construido con las primeras métricas disponibles de esta posición.",
      metrics: Object.fromEntries(fallbackMetrics.slice(0, 4).map((metric) => [metric, 1]))
    },
    {
      id: "rasgo_complementario",
      name: "Rasgo complementario",
      description: "Bloque automático construido con métricas complementarias de esta posición.",
      metrics: Object.fromEntries(fallbackMetrics.slice(4, 8).map((metric) => [metric, 1]))
    }
  ].filter((block) => Object.keys(block.metrics).length);
}

function syncHybridBlockSelects(changedBlock = "") {
  const position = state.currentHybridPlayer?.position || els.hybridPosition.value || state.positions[0];
  const blocks = hybridBlocks(position);
  const values = blocks.map((block) => block.id);
  if (!values.length) {
    state.hybridBlockAId = "";
    state.hybridBlockBId = "";
    return;
  }
  if (!values.includes(els.hybridBlockSelectA.value)) els.hybridBlockSelectA.value = values[0];
  if (!values.includes(els.hybridBlockSelectB.value)) els.hybridBlockSelectB.value = values[1] || values[0];
  if (blocks.length > 1 && els.hybridBlockSelectA.value === els.hybridBlockSelectB.value) {
    const replacement = values.find((value) => value !== (changedBlock === "B" ? els.hybridBlockSelectB.value : els.hybridBlockSelectA.value));
    if (changedBlock === "B") {
      els.hybridBlockSelectA.value = replacement;
    } else {
      els.hybridBlockSelectB.value = replacement;
    }
  }
  state.hybridBlockAId = els.hybridBlockSelectA.value;
  state.hybridBlockBId = els.hybridBlockSelectB.value;
}

function selectedHybridBlock(block) {
  const position = state.currentHybridPlayer?.position || els.hybridPosition.value || state.positions[0];
  const blocks = hybridBlocks(position);
  const id = block === "A" ? state.hybridBlockAId : state.hybridBlockBId;
  return blocks.find((item) => item.id === id) || blocks[0] || null;
}

function hybridBlockName(block) {
  return selectedHybridBlock(block)?.name || `Bloque ${block}`;
}

function hybridMixLabel() {
  return `${hybridBlockName("A")} + ${hybridBlockName("B")}`;
}

function clearHybridResults(message = "Sin resultados") {
  els.hybridList.innerHTML = `<div class="search-empty">${escapeHtml(message)}</div>`;
  els.hybridDetail.innerHTML = "";
  els.hybridMetrics.innerHTML = "";
  purgePlotly("hybrid-radar");
}

function renderHybridList() {
  const player = state.currentHybridPlayer;
  if (!player) {
    els.hybridList.innerHTML = `<div class="search-empty">Elige una jugadora en el buscador.</div>`;
    return;
  }
  const mixLabel = hybridMixLabel();
  const detail = state.currentHybridDetail;
  const color = colorForCluster(player.cluster);
  const topRefs = state.hybridProfiles
    .filter((row) => row.id !== player.id)
    .slice(0, 3);
  els.hybridList.innerHTML = `
    <article class="hybrid-selected-summary">
      <div class="avatar" style="width:64px;height:64px;border-color:${color}">${avatarHtml(player)}</div>
      <div>
        <strong>${escapeHtml(player.name)}</strong>
        <small>${flagHtml(player)} ${escapeHtml(player.team || "Sin equipo")} · ${escapeHtml(positionName(player.position))}</small>
        <span class="cluster-chip" style="background:${color}">${escapeHtml(clusterBadgeText(player))}</span>
      </div>
    </article>
    <div class="hybrid-mix-summary">
      <span>Mezcla evaluada</span>
      <strong>${escapeHtml(mixLabel)}</strong>
      ${detail?.hybridRank ? `<small>Ranking orientativo en su posición: ${Number(detail.hybridRank).toFixed(0)} de ${Number(detail.positionCount || 0).toFixed(0)}</small>` : ""}
    </div>
    ${topRefs.length ? `
      <div class="hybrid-reference-list">
        <span class="eyebrow">Referencias de la mezcla</span>
        ${topRefs.map((row) => `
          <div>
            <strong>${escapeHtml(row.name)}</strong>
            <small>${Number(row.hybridScore || 0).toFixed(1)} · ${escapeHtml(clusterName(row))}</small>
          </div>
        `).join("")}
      </div>
    ` : ""}
  `;
}

function renderHybridDetail(detail) {
  if (!detail) {
    els.hybridDetail.innerHTML = `<div class="search-empty">Elige una jugadora y dos rasgos para calcular su hibridez.</div>`;
    return;
  }
  const mixLabel = hybridMixLabel();
  const level = hybridLevel(detail.hybridScore, detail.scoreA, detail.scoreB, detail.balanceScore);
  els.hybridDetail.innerHTML = `
    <div class="hybrid-card">
      <div class="avatar" style="border-color:${colorForCluster(detail.cluster)}">${avatarHtml(detail)}</div>
      <div>
        <span class="eyebrow">Perfil híbrido</span>
        <h3>${escapeHtml(detail.name)}</h3>
        <div class="player-meta">
          <span class="badge">${flagHtml(detail)}${escapeHtml(detail.team || "Sin equipo")}</span>
          <span class="badge">${escapeHtml(positionName(detail.position))}</span>
          <span class="cluster-badge" style="background:${colorForCluster(detail.cluster)}">${escapeHtml(clusterBadgeText(detail))}</span>
        </div>
      </div>
    </div>
    <p class="story">${escapeHtml(`${detail.name} muestra una hibridez ${level.toLowerCase()} para la mezcla ${mixLabel}. ${detail.diagnosis || "El score premia que tenga buen nivel en ambos bloques y que no dependa solo de uno de ellos."}`)}</p>
    <div class="hybrid-score-grid">
      ${hybridScoreCard("Score híbrido", detail.hybridScore)}
      ${hybridScoreCard(hybridBlockName("A"), detail.scoreA)}
      ${hybridScoreCard(hybridBlockName("B"), detail.scoreB)}
      ${hybridScoreCard("Equilibrio", detail.balanceScore)}
    </div>
  `;
}

function renderHybridRadar(detail) {
  if (!detail || !detail.metrics?.length) {
    purgePlotly("hybrid-radar");
    return;
  }
  const labels = detail.metrics.map(formatMetric);
  const angles = radarAngles(detail.metrics.length);
  const playerValues = detail.metrics.map((metric) => Number(detail.playerRadarValues?.[metric] || 0));
  const targetValues = detail.metrics.map((metric) => Number(detail.targetRadarValues?.[metric] || 0.85));
  const percentiles = detail.metrics.map((metric) => Number(detail.percentiles?.[metric] || 0));
  const targetPercentiles = detail.metrics.map((metric, index) => Number(detail.targetPercentiles?.[metric] ?? radarValueToPercentile(targetValues[index])));
  renderPlotly("hybrid-radar", [
    radarFillTrace(targetValues, angles, "#2563eb", "Perfil híbrido buscado", 0.08),
    radarFillTrace(playerValues, angles, "#E74C3C", detail.name, 0.10),
    radarLineTrace({
      values: targetValues,
      angles,
      labels,
      customdata: targetPercentiles,
      name: "Perfil híbrido buscado",
      color: "#2563eb",
      width: 2.5,
      dash: "dot",
      hovertemplate: "%{text}<br>Objetivo: P%{customdata:.0f}<extra></extra>"
    }),
    radarLineTrace({
      values: playerValues,
      angles,
      labels,
      customdata: percentiles,
      name: detail.name,
      color: "#E74C3C",
      width: 3,
      hovertemplate: "%{text}<br>Percentil: %{customdata:.0f}<extra></extra>"
    })
  ], p05PolarLayout(labels, angles, 560), plotConfig());
}

function renderHybridMetrics(detail) {
  if (!detail) {
    els.hybridMetrics.innerHTML = "";
    return;
  }
  els.hybridMetrics.innerHTML = `
    <div class="hybrid-detail-block">
      <h5>${escapeHtml(hybridBlockName("A"))}</h5>
      ${(detail.blockA || []).map(hybridMetricRow).join("") || `<div class="search-empty">Sin métricas</div>`}
    </div>
    <div class="hybrid-detail-block">
      <h5>${escapeHtml(hybridBlockName("B"))}</h5>
      ${(detail.blockB || []).map(hybridMetricRow).join("") || `<div class="search-empty">Sin métricas</div>`}
    </div>
  `;
}

function hybridMetricRow(item) {
  return `
    <article class="hybrid-metric-card">
      <div>
        <strong>${formatMetric(item.metric)} ${helpIcon(item.metric)}</strong>
        <small>valor ${Number(item.value || 0).toFixed(2)} · peso interno ${Number(item.weight || 1).toFixed(0)}</small>
      </div>
      <span>${Number(item.percentile || 0).toFixed(0)}%</span>
    </article>
  `;
}

function hybridScoreCard(label, value) {
  const number = Math.max(0, Math.min(100, Number(value || 0)));
  const normalized = normalize(label);
  const helpKey = normalized.includes("equilibrio") ? "balance" : normalized.includes("score") ? "hybrid" : "block";
  return `
    <article>
      <span>${escapeHtml(label)} ${scoreHelpIcon(helpKey, label)}</span>
      <strong>${number.toFixed(0)}</strong>
      <div class="score-bar"><span style="width:${number}%"></span></div>
    </article>
  `;
}

function hybridLevel(score, scoreA, scoreB, balance) {
  const minimumBlock = Math.min(Number(scoreA || 0), Number(scoreB || 0));
  if (score >= 78 && minimumBlock >= 70 && Number(balance || 0) >= 72) return "Alta";
  if (score >= 60 && minimumBlock >= 52) return "Media";
  if (score >= 42) return "Baja";
  return "Muy baja";
}

function hybridLevelLabel(level) {
  const normalized = String(level || "").toLowerCase();
  if (normalized === "alta") return "alto";
  if (normalized === "media") return "medio";
  if (normalized === "baja") return "bajo";
  return "muy bajo";
}

function renderHybridList() {
  const player = state.currentHybridPlayer;
  if (!player) {
    els.hybridList.innerHTML = `<div class="search-empty">Elige una jugadora en el buscador.</div>`;
    return;
  }
  const mixLabel = hybridMixLabel();
  const detail = state.currentHybridDetail;
  const color = colorForCluster(player.cluster);
  const topRefs = state.hybridProfiles
    .filter((row) => row.id !== player.id)
    .slice(0, 3);
  els.hybridList.innerHTML = `
    <article class="hybrid-selected-summary">
      <div class="avatar" style="width:64px;height:64px;border-color:${color}">${avatarHtml(player)}</div>
      <div>
        <strong>${escapeHtml(player.name)}</strong>
        <small>${flagHtml(player)} ${escapeHtml(player.team || "Sin equipo")} · ${escapeHtml(positionName(player.position))}</small>
        <span class="cluster-chip" style="background:${color}">${escapeHtml(clusterBadgeText(player))}</span>
      </div>
    </article>
    <div class="hybrid-mix-summary">
      <span>Mezcla evaluada</span>
      <strong>${escapeHtml(mixLabel)}</strong>
      ${detail?.hybridRank ? `<small>En esta mezcla queda en el puesto ${Number(detail.hybridRank).toFixed(0)} de ${Number(detail.positionCount || 0).toFixed(0)} jugadoras de su posición.</small>` : ""}
    </div>
    ${topRefs.length ? `
      <div class="hybrid-reference-list">
        <span class="eyebrow">Referencias de la mezcla</span>
        ${topRefs.map((row) => `
          <article class="hybrid-reference-card">
            <div class="avatar" style="width:44px;height:44px;border-color:${colorForCluster(row.cluster)}">${avatarHtml(row)}</div>
            <div>
              <strong>${escapeHtml(row.name)}</strong>
              <small>${flagHtml(row)} ${escapeHtml(positionName(row.position))} · ${escapeHtml(clusterName(row))}</small>
            </div>
            <span>${Number(row.hybridScore || 0).toFixed(0)}</span>
          </article>
        `).join("")}
      </div>
    ` : ""}
  `;
}

function renderHybridDetail(detail) {
  if (!detail) {
    els.hybridDetail.innerHTML = `<div class="search-empty">Elige una jugadora y dos rasgos para calcular su hibridez.</div>`;
    return;
  }
  const mixLabel = hybridMixLabel();
  const level = hybridLevel(detail.hybridScore, detail.scoreA, detail.scoreB, detail.balanceScore);
  els.hybridDetail.innerHTML = `
    <div class="hybrid-card">
      <div class="avatar" style="border-color:${colorForCluster(detail.cluster)}">${avatarHtml(detail)}</div>
      <div>
        <span class="eyebrow">Encaje mixto</span>
        <h3>${escapeHtml(detail.name)}</h3>
        <div class="player-meta">
          <span class="badge">${flagHtml(detail)}${escapeHtml(detail.team || "Sin equipo")}</span>
          <span class="badge">${escapeHtml(positionName(detail.position))}</span>
          <span class="cluster-badge" style="background:${colorForCluster(detail.cluster)}">${escapeHtml(clusterBadgeText(detail))}</span>
        </div>
      </div>
    </div>
    <div class="hybrid-score-grid">
      ${hybridScoreCard("Score híbrido", detail.hybridScore)}
      ${hybridScoreCard(hybridBlockName("A"), detail.scoreA)}
      ${hybridScoreCard(hybridBlockName("B"), detail.scoreB)}
      ${hybridScoreCard("Equilibrio", detail.balanceScore)}
    </div>
    <p class="story">${escapeHtml(`${detail.name} muestra un encaje mixto de nivel ${hybridLevelLabel(level)} para la mezcla ${mixLabel}. ${detail.diagnosis || "El score premia que tenga buen nivel en ambos bloques y que no dependa solo de uno de ellos."}`)}</p>
  `;
}

async function refreshSingularProfiles() {
  if (!els.singularList) return;
  const params = new URLSearchParams({
    type: els.singularType.value || "todas",
    sensitivity: els.singularSensitivity.value || "media",
    limit: "50"
  });
  if (els.singularPosition.value) params.set("position", els.singularPosition.value);
  if (els.singularTeam.value) params.set("team", els.singularTeam.value);
  if (els.singularSearch.value) params.set("search", els.singularSearch.value);
  if (Number(els.singularMinutes.value) > 0) params.set("minMinutes", els.singularMinutes.value);
  if (state.selectedSingularId) params.set("id", state.selectedSingularId);

  const data = await fetchJson(`/api/singular-profiles?${params}`);
  state.singularProfiles = data.profiles || [];
  state.currentSingularDetail = data.detail || null;
  state.selectedSingularId = data.detail?.id || state.singularProfiles[0]?.id || "";
  renderSingularCounts(data.counts || {});
  renderSingularList();
  renderSingularDetail(data.detail);
  renderSingularRadar(data.detail);
  renderSingularMetrics(data.detail);
}

function selectSingularProfile(id) {
  if (!id) return;
  state.selectedSingularId = id;
  refreshSingularProfiles();
}

function renderSingularCounts(counts) {
  const items = [
    ["diferencial", "Diferenciales"],
    ["hibrida", "Híbridas"],
    ["polivalente", "Polivalentes"],
    ["atipica", "Atípicas"]
  ];
  els.singularCounts.innerHTML = items.map(([key, label]) => `
    <article>
      <span>${label}</span>
      <strong>${Number(counts[key] || 0)}</strong>
    </article>
  `).join("");
}

function renderSingularList() {
  const selectedId = state.selectedSingularId;
  els.singularList.innerHTML = state.singularProfiles.map((row, index) => {
    const active = row.id === selectedId ? " active" : "";
    return `
      <article class="ranking-row singular-row${active}" data-singular-id="${escapeHtml(row.id)}">
        <span class="rank-number">${index + 1}</span>
        <div class="avatar" style="width:52px;height:52px;border-color:${colorForCluster(row.cluster)}">${avatarHtml(row)}</div>
        <div>
          <strong>${escapeHtml(row.name)}</strong>
          <small>${flagHtml(row)} ${escapeHtml(row.team || "Sin equipo")} · ${escapeHtml(positionName(row.position))} · ${escapeHtml(clusterName(row))}</small>
          <small>${escapeHtml(row.reason || "")}</small>
          <div class="singular-tags">${singularTags(row)}</div>
        </div>
        <span class="score-value">${Number(row.profileScore || 0).toFixed(1)}</span>
      </article>
    `;
  }).join("") || `<div class="search-empty">Sin perfiles para estos filtros</div>`;
}

function renderSingularDetail(detail) {
  if (!detail) {
    els.singularDetail.innerHTML = `<div class="search-empty">Sin jugadora seleccionada</div>`;
    return;
  }
  const altCluster = detail.alternativeCluster === null || detail.alternativeCluster === undefined
    ? "Sin alternativa"
    : (detail.alternativeClusterName || `Cluster ${detail.alternativeCluster}`);
  els.singularDetail.innerHTML = `
    <div class="singular-card">
      <div class="avatar" style="border-color:${colorForCluster(detail.cluster)}">${avatarHtml(detail)}</div>
      <div>
        <span class="eyebrow">${escapeHtml(detail.type)}</span>
        <h3>${escapeHtml(detail.name)}</h3>
        <div class="player-meta">
          <span class="badge">${flagHtml(detail)}${escapeHtml(detail.team || "Sin equipo")}</span>
          <span class="badge">${escapeHtml(positionName(detail.position))}</span>
          <span class="cluster-badge" style="background:${colorForCluster(detail.cluster)}">${escapeHtml(clusterBadgeText(detail))}</span>
        </div>
      </div>
    </div>
    <p class="story">${escapeHtml(detail.diagnosis || "")}</p>
    <div class="singular-score-grid">
      ${singularScore("Singularidad", detail.singularityScore)}
      ${singularScore("Híbrido", detail.hybridScore)}
      ${singularScore("Polivalencia", detail.versatilityScore)}
      ${singularScore("Diferencial", detail.starScore)}
    </div>
    <div class="cluster-affinity">
      ${(detail.topClusters || []).map((item) => `
        <span>
          <strong>${escapeHtml(item.name || `C${item.cluster}`)}</strong>
          <small>${Number(item.affinity || 0).toFixed(0)}% · d ${Number(item.distance || 0).toFixed(2)}</small>
        </span>
      `).join("")}
    </div>
    <p class="method-note">${escapeHtml(detail.methodNote || "")}</p>
    <div class="singular-alt">
      <span>Alternativa cercana</span>
      <strong>${escapeHtml(altCluster)}</strong>
    </div>
  `;
}

function renderSingularRadar(detail) {
  if (!detail || !detail.metrics?.length) {
    purgePlotly("singular-radar");
    return;
  }
  const labels = detail.metrics.map(formatMetric);
  const angles = radarAngles(detail.metrics.length);
  const playerValues = detail.metrics.map((metric) => Number(detail.playerRadarValues?.[metric] || 0));
  const clusterValues = detail.metrics.map((metric) => Number(detail.clusterRadarValues?.[metric] || 0));
  const altValues = detail.metrics.map((metric) => Number(detail.alternativeRadarValues?.[metric] || 0));
  const traces = [
    {
      type: "scatterpolar",
      r: [...playerValues, playerValues[0]],
      theta: [...angles, 360],
      text: [...labels, labels[0]],
      mode: "lines+markers",
      fill: "none",
      name: detail.name,
      line: { color: "#E74C3C", width: 3 },
      marker: { size: 6 },
      hovertemplate: "%{text}<br>Escala p05-p95: %{r:.2f}<extra></extra>"
    },
    {
      type: "scatterpolar",
      r: [...clusterValues, clusterValues[0]],
      theta: [...angles, 360],
      text: [...labels, labels[0]],
      mode: "lines+markers",
      fill: "none",
      name: clusterName(detail),
      line: { color: "#95A5A6", width: 2.5 },
      marker: { size: 5 },
      hovertemplate: "%{text}<br>Escala p05-p95: %{r:.2f}<extra></extra>"
    }
  ];
  if (detail.alternativeCluster !== null && detail.alternativeCluster !== undefined) {
    traces.push({
      type: "scatterpolar",
      r: [...altValues, altValues[0]],
      theta: [...angles, 360],
      text: [...labels, labels[0]],
      mode: "lines+markers",
      fill: "none",
      name: detail.alternativeClusterName || `Cluster alternativo ${detail.alternativeCluster}`,
      line: { color: "#2563eb", width: 2.5, dash: "dot" },
      marker: { size: 5 },
      hovertemplate: "%{text}<br>Escala p05-p95: %{r:.2f}<extra></extra>"
    });
  }
  renderPlotly("singular-radar", traces, p05PolarLayout(labels, angles, 560), plotConfig());
}

function renderSingularMetrics(detail) {
  if (!detail) {
    els.singularMetrics.innerHTML = "";
    return;
  }
  els.singularMetrics.innerHTML = (detail.deviationMetrics || []).map((item) => `
    <article class="singular-metric-row">
      <div>
        <strong>${formatMetric(item.metric)} ${helpIcon(item.metric)}</strong>
        <small>${escapeHtml(item.direction)} · valor ${Number(item.value || 0).toFixed(2)} · percentil ${Number(item.percentile || 0).toFixed(0)}%</small>
      </div>
      <span class="${Number(item.z || 0) >= 0 ? "positive" : "negative"}">${signed(item.z)}</span>
    </article>
  `).join("") || `<div class="search-empty">Sin métricas destacadas</div>`;
}

function singularScore(label, value) {
  const number = Math.max(0, Math.min(100, Number(value || 0)));
  return `
    <article>
      <span>${escapeHtml(label)}</span>
      <strong>${number.toFixed(0)}</strong>
      <div class="score-bar"><span style="width:${number}%"></span></div>
    </article>
  `;
}

function singularTags(row) {
  const tags = row.tags?.length ? row.tags : [row.type];
  return tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
}

function profileMetrics(position) {
  const metrics = state.metricsByPosition[position] || [];
  return unique([...defaultMetrics(position), ...metrics]);
}

function defaultMetrics(position) {
  const fromServer = state.defaultMetricsByPosition[position] || [];
  const fallback = PROFILE_DEFAULT_METRICS[position] || [];
  const available = state.metricsByPosition[position] || [];
  const allowed = new Set([...available, ...fallback]);
  return (fromServer.length ? fromServer : fallback).filter((metric) => allowed.has(metric));
}

function metricMatches(metric, search) {
  if (!search) return true;
  return normalize(formatMetric(metric)).includes(search) || normalize(metric).includes(search);
}

function playerMatches(player, search) {
  if (!search) return true;
  return normalize(`${player.name} ${player.team} ${player.position} ${player.cluster} ${clusterName(player)}`).includes(search);
}

function comparePlayerById(id) {
  return state.compareAvailablePlayers.find((player) => player.id === id);
}

function colorForPlayer(index) {
  return PLAYER_COLORS[index % PLAYER_COLORS.length];
}

function radarAngles(count) {
  if (!count) return [];
  return Array.from({ length: count }, (_, index) => index * 360 / count);
}

function closePolarValues(values) {
  return values.length ? [...values, values[0]] : [];
}

function closePolarAngles(angles) {
  return angles.length ? [...angles, 360] : [];
}

function radarFillTrace(values, angles, color, name, opacity = 0.10) {
  return {
    type: "scatterpolar",
    r: closePolarValues(values),
    theta: closePolarAngles(angles),
    mode: "lines",
    fill: "toself",
    fillcolor: hexToRgba(color, opacity),
    hoverinfo: "skip",
    showlegend: false,
    name,
    line: { color: hexToRgba(color, 0), width: 0 }
  };
}

function radarLineTrace({ values, angles, labels, customdata, name, color, width = 3, dash = "solid", markerSize = 6, hovertemplate }) {
  const trace = {
    type: "scatterpolar",
    r: closePolarValues(values),
    theta: closePolarAngles(angles),
    text: closePolarValues(labels),
    mode: "lines+markers",
    fill: "none",
    name,
    line: { color, width, dash },
    marker: { size: markerSize, color, line: { color: "#fff", width: 1 } },
    hovertemplate
  };
  if (customdata) trace.customdata = closePolarValues(customdata);
  return trace;
}

function percentileToRadarValue(percentile) {
  return 0.15 + 0.70 * (clamp(Number(percentile || 0), 0, 100) / 100);
}

function radarValueToPercentile(value) {
  return clamp((Number(value || 0.15) - 0.15) / 0.70 * 100, 0, 100);
}

function wrapPolarLabel(label) {
  const words = String(label || "").split(/\s+/);
  const lines = [];
  let current = "";
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > 16 && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current);
  return lines.slice(0, 3).join("<br>");
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function clearPlayerView() {
  state.selectedPlayerId = "";
  els.playerCard.innerHTML = "";
  if (els.playerSelected) els.playerSelected.innerHTML = `<span class="selected-placeholder">Sin jugadora</span>`;
  els.playerResults.innerHTML = "";
  els.clusterStory.textContent = "No hay jugadoras para los filtros elegidos.";
  els.clusterStrengths.innerHTML = "";
  els.clusterWeaknesses.innerHTML = "";
  els.similarGrid.innerHTML = "";
  purgePlotly("player-radar");
}

function p05PolarLayout(labels, angles, height = 560) {
  const wideMargin = labels.some((label) => String(label).length > 18) ? 118 : 86;
  return {
    height,
    margin: { l: wideMargin, r: wideMargin, t: 42, b: 62 },
    polar: {
      radialaxis: {
        visible: true,
        range: [0, 1],
        tickvals: [0.15, 0.5, 0.85],
        ticktext: ["P05", "P50", "P95"],
        gridcolor: "#d8e2df",
        tickfont: { size: 10, color: "#667085" }
      },
      angularaxis: {
        tickmode: "array",
        tickvals: angles,
        ticktext: labels.map(wrapPolarLabel),
        rotation: 90,
        direction: "clockwise",
        gridcolor: "#d8e2df",
        tickfont: { size: 10, color: "#4b5563" }
      }
    },
    legend: { orientation: "h" },
    hovermode: "closest",
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)"
  };
}

function renderPlotly(elementId, traces, layout, config) {
  if (!window.Plotly?.react) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `<div class="search-empty">Gráfico no disponible hasta que cargue la librería de visualización.</div>`;
    }
    return;
  }
  window.Plotly.react(elementId, traces, layout, config);
}

function purgePlotly(elementId) {
  if (window.Plotly?.purge) {
    window.Plotly.purge(elementId);
    return;
  }
  const element = document.getElementById(elementId);
  if (element) element.innerHTML = "";
}

function plotConfig() {
  return { responsive: true, displaylogo: false };
}

function metricPill(item, prefix) {
  return `<span class="metric-pill">${prefix} ${formatMetric(item.metric)} ${helpIcon(item.metric)} <small>z ${signed(item.z)}</small></span>`;
}

function helpIcon(metric) {
  return `<span role="button" tabindex="0" class="metric-help" data-help-metric="${escapeHtml(metric)}" aria-label="Explicar ${escapeHtml(formatMetric(metric))}">?</span>`;
}

function scoreHelpIcon(key, label) {
  return `<span role="button" tabindex="0" class="metric-help score-help" data-help-score="${escapeHtml(key)}" aria-label="Explicar ${escapeHtml(label)}">?</span>`;
}

function metricDescription(metric) {
  if (METRIC_DESCRIPTIONS[metric]) return METRIC_DESCRIPTIONS[metric];
  const normalized = normalize(metric);
  const key = Object.keys(METRIC_DESCRIPTIONS).find((item) => normalized.includes(item));
  return key ? METRIC_DESCRIPTIONS[key] : "Métrica estadística del perfil. Interprétala dentro de la posición seleccionada.";
}

function showMetricPopover(anchor, metric) {
  if (!els.metricPopover || !metric) return;
  showInfoPopover(anchor, formatMetric(metric), metricDescription(metric), `Variable original: ${metric}`);
}

function showScorePopover(anchor, key) {
  const info = {
    hybrid: {
      title: "Score híbrido",
      body: "Resume la mezcla completa. Sube cuando la jugadora puntúa bien en los dos rasgos elegidos, no cuando solo destaca mucho en uno.",
      foot: "Cuanto más cerca de 100, mejor encaje mixto."
    },
    block: {
      title: "Score del bloque",
      body: "Indica el nivel de la jugadora en ese rasgo concreto, siempre comparada con futbolistas de su misma posición.",
      foot: "Sirve para ver qué parte de la mezcla sostiene mejor."
    },
    balance: {
      title: "Equilibrio",
      body: "Mide si los dos bloques están compensados. Un valor alto significa que la jugadora no depende solo de uno de los dos perfiles.",
      foot: "Puede ser alto aunque el score global sea medio."
    }
  }[key] || {
    title: "Score",
    body: "Indicador de encaje dentro de la posición seleccionada.",
    foot: ""
  };
  showInfoPopover(anchor, info.title, info.body, info.foot);
}

function showInfoPopover(anchor, title, body, foot = "") {
  if (!els.metricPopover || !anchor) return;
  const rect = anchor.getBoundingClientRect();
  els.metricPopover.innerHTML = `
    <button type="button" class="metric-popover-close" aria-label="Cerrar">×</button>
    <strong>${escapeHtml(title)}</strong>
    <p>${escapeHtml(body)}</p>
    ${foot ? `<small>${escapeHtml(foot)}</small>` : ""}
  `;
  els.metricPopover.classList.remove("hidden");
  const width = Math.min(330, window.innerWidth - 24);
  const left = Math.min(window.innerWidth - width - 12, Math.max(12, rect.left - width / 2 + rect.width / 2));
  const top = Math.min(window.innerHeight - 160, rect.bottom + 10);
  els.metricPopover.style.width = `${width}px`;
  els.metricPopover.style.left = `${left}px`;
  els.metricPopover.style.top = `${Math.max(12, top)}px`;
  const close = els.metricPopover.querySelector(".metric-popover-close");
  close?.addEventListener("click", hideMetricPopover);
}

function hideMetricPopover() {
  els.metricPopover?.classList.add("hidden");
}

function metricFamily(metrics) {
  const joined = metrics.join(" ").toLowerCase();
  if (/(xg|tiro|area|gol)/.test(joined)) return "finalización y presencia en área";
  if (/(pase|through|xa|centro)/.test(joined)) return "pase y creación";
  if (/(carry|carries|regate|progression|velocidad)/.test(joined)) return "conducción y progresión";
  if (/(presion|recuperacion|intercepcion|duelo|aereo|defensiva)/.test(joined)) return "defensa y recuperación";
  return "perfil mixto";
}

function profileFitText(row, weights, index = 0) {
  const metrics = Object.keys(weights)
    .sort((a, b) => Number(row.contribution?.[b] || 0) - Number(row.contribution?.[a] || 0))
    .slice(0, 3)
    .map(formatMetric)
    .join(", ");
  const prefix = index === 0 ? "Mejor encaje" : "Buen encaje";
  return `${prefix}: su patrón se acerca al perfil objetivo, especialmente en ${metrics}. Pertenece al perfil ${clusterName(row)}, útil para contextualizar su rol.`;
}

function avatarHtml(player) {
  if (player.photo) {
    return `<img src="${escapeHtml(player.photo)}" alt="${escapeHtml(player.name)}">`;
  }
  return `
    <svg viewBox="0 0 128 128" role="img" aria-label="Avatar de jugadora">
      <rect width="128" height="128" rx="64" fill="#ffffff"></rect>
      <path d="M26 116c5-20 17-33 34-38 3-1 5-3 5-6V58h14v14c0 3 2 5 5 6 17 5 29 18 34 38H26z" fill="#050505"></path>
      <path d="M37 67c0-31 15-51 37-51 21 0 37 20 37 51 0 12-3 24-8 34H45c-5-10-8-22-8-34z" fill="#050505"></path>
      <path d="M31 88c5-10 9-24 9-40 4 20 12 35 27 42H31z" fill="#050505"></path>
      <path d="M97 48c0 16 4 30 9 40H70c15-7 23-22 27-40z" fill="#050505"></path>
    </svg>
  `;
}

function flagHtml(player) {
  if (player.flag) {
    return `<img class="flag" src="${escapeHtml(player.flag)}" alt="">`;
  }
  return `
    <svg class="flag" viewBox="0 0 72 48" aria-hidden="true">
      <rect width="72" height="48" rx="7" fill="#eef2f7"></rect>
      <path d="M19 10v30" stroke="#64748b" stroke-width="4" stroke-linecap="round"></path>
      <path d="M21 12h31l-5 9 5 9H21z" fill="#cfd8e3" stroke="#94a3b8" stroke-width="2"></path>
    </svg>
  `;
}

function fillSelect(select, options, current) {
  const previous = current ?? select.value;
  select.innerHTML = options.map((option) => (
    `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`
  )).join("");
  if ([...select.options].some((option) => option.value === previous)) {
    select.value = previous;
  }
}

function selectedValues(select) {
  return [...select.selectedOptions].map((option) => option.value);
}

function positionName(pos) {
  return POSITION_LABELS[pos] ? `${POSITION_LABELS[pos]} (${pos})` : pos;
}

function clusterName(item) {
  if (!item) return "Perfil no disponible";
  return item.clusterName || item.clusterLabel || `Cluster ${item.cluster}`;
}

function clusterBadgeText(item) {
  return clusterName(item);
}

function competitionText(player) {
  const competitions = Array.isArray(player.competitions)
    ? player.competitions.filter(Boolean)
    : [];
  if (competitions.length) return competitions.join(", ");
  return player.competition || "Competicion no disponible";
}

function colorForCluster(cluster) {
  return CLUSTER_COLORS[Math.abs(Number(cluster) || 0) % CLUSTER_COLORS.length];
}

function hexToRgba(hex, alpha) {
  const value = String(hex || "#000000").replace("#", "");
  const normalized = value.length === 3 ? value.split("").map((char) => char + char).join("") : value;
  const number = Number.parseInt(normalized, 16);
  const r = (number >> 16) & 255;
  const g = (number >> 8) & 255;
  const b = number & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function formatMetric(metric) {
  if (METRIC_LABELS[metric]) return METRIC_LABELS[metric];
  return String(metric)
    .replaceAll("_p90", "")
    .replaceAll("pct_", "% ")
    .replaceAll("xa", "asistencias esperadas")
    .replaceAll("xg", "goles esperados")
    .replaceAll("through_balls", "balones al hueco")
    .replaceAll("carries", "conducciones")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function signed(value) {
  const number = Number(value);
  return number >= 0 ? `+${number.toFixed(2)}` : number.toFixed(2);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalize(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
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

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove("hidden");
  setTimeout(() => els.toast.classList.add("hidden"), 3600);
}
