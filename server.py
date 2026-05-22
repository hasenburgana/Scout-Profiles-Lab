from __future__ import annotations

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse
import json
import math
import os
import re
import unicodedata

import numpy as np
import pandas as pd


ROOT = Path(__file__).resolve().parent
WEB_DIR = ROOT / "web"
DATA_FILE = ROOT / "data" / "perfiles_finales.csv"
HYBRID_FILE = ROOT / "data" / "jugadoras_hibridas_fa_pam.csv"
ASSET_CANDIDATES = [
    ROOT / "jugadoras_fotos.json",
    WEB_DIR / "jugadoras_fotos.json",
    Path.home() / "Downloads" / "jugadoras_fotos.json",
]

POSITION_COL = "grupo_pos_clustering"
CLUSTER_COL = "cluster_final"
PLAYER_COL = "player_name"
TEAM_COL = "team_name"
ID_COL = "_uid"

METADATA_COLS = {
    ID_COL,
    "player_id",
    PLAYER_COL,
    TEAM_COL,
    "competicion",
    "posicion_principal",
    "grupo_pos",
    POSITION_COL,
    CLUSTER_COL,
    "cluster",
    "cluster_fa",
    "cluster_pca",
    "cluster_hier",
    "es_medoide",
    "nombre_medoide_cluster",
    "cluster_alternativo_fa_pam",
    "cluster_mas_cercano_fa_pam",
    "distancia_cluster_asignado_fa_pam",
    "distancia_cluster_alternativo_fa_pam",
    "margen_frontera_fa_pam",
    "score_hibrida_fa_pam",
    "score_anomalia_fa_pam",
    "es_hibrida_fa_pam",
    "es_anomala_fa_pam",
    "tipo_singular_fa_pam",
}

POS_METRICS = {
    "CB": [
        "pct_pases",
        "pct_pases_largos",
        "pct_pases_prog",
        "pct_pases_bajo_presion",
        "pases_ult_tercio_p90",
        "carries_prog_p90",
        "ratio_intercepciones_vs_entradas",
        "duelos_ter_ganados_p90",
        "despejes_p90",
        "pct_aereos",
        "pct_duelos_total",
        "recuperaciones_p90",
        "acciones_defensivas_campo_rival_p90",
    ],
    "LAT": [
        "pct_toques_en_campo_rival",
        "centros_p90",
        "pases_al_area_p90",
        "ratio_centros_vs_pases_al_area",
        "deep_progressions_p90",
        "xa_real_p90",
        "carries_prog_p90",
        "pct_regates",
        "ratio_intercepciones_vs_entradas",
        "acciones_defensivas_p90",
        "duelos_ter_ganados_p90",
        "despejes_p90",
        "pct_duelos_total",
        "recuperaciones_p90",
    ],
    "MCD": [
        "distancia_media_pases",
        "pct_pases_prog",
        "pct_pases_bajo_presion",
        "pases_progresivos_p90",
        "pases_largos_p90",
        "ratio_intercepciones_vs_entradas",
        "intercepciones_p90",
        "recuperaciones_p90",
        "acciones_agresivas_p90",
        "presiones_p90",
    ],
    "MC": [
        "carries_prog_p90",
        "velocidad_cond_m_s",
        "pct_pases",
        "pases_completados_p90",
        "pct_pases_prog",
        "distancia_media_pases",
        "pases_bajo_presion_p90",
        "xa_real_p90",
        "presiones_p90",
        "intercepciones_p90",
        "recuperaciones_p90",
        "pct_duelos_total",
        "pases_al_area_p90",
        "through_balls_p90",
        "pct_toques_en_area",
        "tiros_p90",
    ],
    "EXT": [
        "regates_p90",
        "pct_regates",
        "carries_prog_p90",
        "ratio_centros_vs_pases_al_area",
        "centros_p90",
        "pct_pases",
        "pases_completados_p90",
        "pct_toques_en_area",
        "tiros_p90",
        "xg_por_tiro",
        "xa_real_p90",
        "pases_clave_p90",
    ],
    "DEL": [
        "ratio_tiros_vs_pases",
        "xg_por_tiro",
        "distancia_media_tiros",
        "pct_toques_en_area",
        "tiros_puerta_p90",
        "pases_completados_p90",
        "pct_pases",
        "pct_pases_prog",
        "pases_clave_p90",
        "xa_real_p90",
        "through_balls_p90",
        "recibidos_de_espaldas_p90",
        "presiones_p90",
        "aereos_ganados_p90",
    ],
}

DERIVED_METRIC_PREFIXES = ("pct_", "ratio_", "rel_", "obv_")
DERIVED_METRIC_SUFFIXES = ("_p90",)
DERIVED_METRIC_NAMES = {
    "xg_por_tiro",
    "distancia_media_pases",
    "distancia_media_tiros",
    "posicion_media_x",
    "posicion_media_y",
    "std_posicion_x",
    "std_posicion_y",
    "velocidad_cond_m_s",
    "challenge_ratio",
}

SENSITIVITY_THRESHOLDS = {
    "conservadora": 70.0,
    "media": 55.0,
    "exploratoria": 40.0,
}

SINGULAR_TYPE_LABELS = {
    "atipica": "Atipica",
    "hibrida": "Hibrida",
    "polivalente": "Polivalente",
    "diferencial": "Diferencial",
    "contextual": "Contextual",
}

CLUSTER_PROFILES = {
    "CB": {
        0: {
            "name": "Central defensiva tradicional",
            "description": "Perfil fundamentalmente defensivo y directo. Prioriza despejes, seguridad y salida larga por encima de la construcción elaborada.",
        },
        1: {
            "name": "Central constructora",
            "description": "Central con más participación en salida de balón, buena tasa de pase y capacidad para progresar hacia zonas avanzadas.",
        },
    },
    "LAT": {
        0: {
            "name": "Lateral ofensiva",
            "description": "Lateral profunda y activa en campo rival, con impacto en centros, pases al área y progresiones por banda.",
        },
        1: {
            "name": "Lateral equilibrada",
            "description": "Perfil más compensado entre defensa y ataque, con aportación ofensiva menos directa y mayor peso en acciones defensivas.",
        },
    },
    "MCD": {
        0: {
            "name": "Pivote intenso",
            "description": "Mediocentro defensiva basada en presión, agresividad y recuperación, con menor peso creativo en la construcción ofensiva.",
        },
        1: {
            "name": "Pivote posicional",
            "description": "Perfil de impacto estadístico más discreto, condicionado por tareas de equilibrio, posicionamiento y contexto colectivo.",
        },
        2: {
            "name": "Pivote creadora",
            "description": "Pivote con mayor capacidad de creación y distribución, destacando en pases clave, xA y progresión con pase.",
        },
    },
    "MC": {
        0: {
            "name": "Centrocampista de control",
            "description": "Centrocampista que prioriza seguridad, circulación y control posicional por encima de llegada o finalización.",
        },
        1: {
            "name": "Interior de segunda línea",
            "description": "Interior con llegada al área y amenaza desde segunda línea, aunque con menor peso en la circulación del balón.",
        },
        2: {
            "name": "Centrocampista de recorrido horizontal",
            "description": "Interior móvil que ocupa distintas zonas y aporta desde el movimiento, la asociación y la gestión de espacios.",
        },
        3: {
            "name": "Interior desequilibrante",
            "description": "Perfil ofensivo de interior, con conducción, tiro, presencia en área y capacidad para generar ocasiones.",
        },
    },
    "EXT": {
        0: {
            "name": "Extrema asociativa",
            "description": "Extrema cuyo impacto principal llega mediante creación, centros, pases clave y asociación con compañeras.",
        },
        1: {
            "name": "Extrema finalizadora",
            "description": "Extrema más orientada al gol, al desborde individual y al peligro directo que a la generación de asistencias.",
        },
    },
    "DEL": {
        0: {
            "name": "Delantera complementaria",
            "description": "Delantera de rol ofensivo mixto o secundario, sin una identidad estadística tan marcada como los perfiles más especializados.",
        },
        1: {
            "name": "Delantera de disparo lejano",
            "description": "Delantera que finaliza con frecuencia desde posiciones alejadas, con mucho volumen de tiro pero menor calidad media de ocasión.",
        },
        2: {
            "name": "Nueve finalizadora",
            "description": "Delantera de área, orientada al remate, los tiros a puerta, los toques en área y la producción goleadora.",
        },
        3: {
            "name": "Delantera asociativa",
            "description": "Delantera de apoyo que combina, recibe de espaldas y participa activamente en la creación de ocasiones.",
        },
    },
}

LOWER_IS_BETTER_METRICS = {
    "dribbled_past",
    "dribbled_past_p90",
    "dispossessions",
    "dispossessions_p90",
    "distancia_media_tiros",
}

METRIC_LABELS = {
    "through_balls_p90": "Balones al hueco",
    "xa_real_p90": "Asistencias esperadas",
    "xg_por_tiro": "Calidad media del tiro",
    "carries_prog_p90": "Conducciones progresivas",
    "pct_toques_en_area": "% toques en area",
    "pct_toques_en_campo_rival": "% toques en campo rival",
    "pases_al_area_p90": "Pases al area",
    "pases_clave_p90": "Pases clave",
    "presiones_p90": "Presiones",
    "recuperaciones_p90": "Recuperaciones",
    "intercepciones_p90": "Intercepciones",
}


def normalize(text: object) -> str:
    value = "" if text is None else str(text)
    value = unicodedata.normalize("NFD", value)
    value = "".join(ch for ch in value if unicodedata.category(ch) != "Mn")
    return re.sub(r"\s+", " ", value).strip().lower()


def clean_asset_url(value: object) -> str:
    return str(value or "").replace("%22", "").replace('"', "").strip()


def truthy_value(value: object) -> bool:
    return normalize(value) in {"true", "1", "si", "sí", "yes", "y"}


def player_identity_key(row: pd.Series | dict) -> str:
    getter = row.get if hasattr(row, "get") else lambda key, default=None: default
    player_id = getter("player_id", "")
    if player_id is not None and not pd.isna(player_id) and str(player_id).strip():
        raw = str(player_id).strip()
        try:
            number = float(raw)
            if number.is_integer():
                raw = str(int(number))
        except Exception:
            pass
        return f"id:{raw}"
    return f"name:{normalize(getter(PLAYER_COL, ''))}|team:{normalize(getter(TEAM_COL, ''))}"


def load_assets() -> dict[str, str]:
    for path in ASSET_CANDIDATES:
        if path.exists():
            try:
                raw = json.loads(path.read_text(encoding="utf-8"))
                return {normalize(key): clean_asset_url(value) for key, value in raw.items()}
            except Exception:
                return {}
    return {}


class Repository:
    def __init__(self) -> None:
        self.assets = load_assets()
        self.df = self._load_data()
        self.competitions_by_player = self._competitions_by_player()
        self.exported_hybrid_keys = self._load_exported_hybrid_keys()
        self.metrics_by_position = self._discover_metrics()
        self.default_metrics_by_position = self._default_metrics_by_position()

    def _load_data(self) -> pd.DataFrame:
        if not DATA_FILE.exists():
            return pd.DataFrame()
        df = pd.read_csv(DATA_FILE)
        if POSITION_COL not in df.columns and "grupo_pos" in df.columns:
            df[POSITION_COL] = df["grupo_pos"]
        if CLUSTER_COL not in df.columns:
            for candidate in ["cluster", "cluster_fa", "cluster_pca", "cluster_hier"]:
                if candidate in df.columns:
                    df[CLUSTER_COL] = df[candidate]
                    break
        if TEAM_COL not in df.columns:
            df[TEAM_COL] = "Sin equipo"
        if "competicion" not in df.columns:
            df["competicion"] = ""
        if df.empty or PLAYER_COL not in df.columns or POSITION_COL not in df.columns or CLUSTER_COL not in df.columns:
            return pd.DataFrame()

        df = df.copy()
        df[ID_COL] = df.index.astype(str)
        df[PLAYER_COL] = df[PLAYER_COL].fillna("").astype(str)
        df[TEAM_COL] = df[TEAM_COL].fillna("Sin equipo").astype(str)
        df[POSITION_COL] = df[POSITION_COL].fillna("").astype(str)
        df[CLUSTER_COL] = pd.to_numeric(df[CLUSTER_COL], errors="coerce").fillna(-1).astype(int)
        return df

    def _competitions_by_player(self) -> dict[str, list[str]]:
        if self.df.empty or "competicion" not in self.df.columns:
            return {}
        result: dict[str, set[str]] = {}
        for _, row in self.df.iterrows():
            key = player_identity_key(row)
            competition = str(row.get("competicion", "")).strip()
            if competition:
                result.setdefault(key, set()).add(competition)
        return {key: sorted(values) for key, values in result.items()}

    def _load_exported_hybrid_keys(self) -> set[str]:
        if not HYBRID_FILE.exists():
            return set()
        try:
            hybrid_df = pd.read_csv(HYBRID_FILE)
        except Exception:
            return set()
        if hybrid_df.empty:
            return set()
        return {player_identity_key(row) for _, row in hybrid_df.iterrows()}

    def _discover_metrics(self) -> dict[str, list[str]]:
        if self.df.empty:
            return {}
        numeric_cols = self.df.select_dtypes(include=np.number).columns.tolist()
        metrics = [
            col
            for col in numeric_cols
            if col not in METADATA_COLS and not col.startswith("cluster")
            and self._is_derived_metric(col)
        ]
        return {
            position: sorted(metrics)
            for position in sorted(self.df[POSITION_COL].dropna().unique().tolist())
        }

    def _default_metrics_by_position(self) -> dict[str, list[str]]:
        if self.df.empty:
            return {}
        numeric_cols = set(self.df.select_dtypes(include=np.number).columns.tolist())
        return {
            position: [metric for metric in POS_METRICS.get(position, []) if metric in numeric_cols]
            for position in self.positions()
        }

    @staticmethod
    def _is_derived_metric(metric: str) -> bool:
        return (
            metric.endswith(DERIVED_METRIC_SUFFIXES)
            or metric.startswith(DERIVED_METRIC_PREFIXES)
            or metric in DERIVED_METRIC_NAMES
        )

    def position_metrics(self, position: str) -> list[str]:
        defaults = self.default_metrics_by_position.get(position, [])
        return defaults or self.metrics_by_position.get(position, [])

    def asset_for(self, name: object) -> str:
        return self.assets.get(normalize(name), "")

    def cluster_profile(self, position: str, cluster: int) -> dict[str, object]:
        profile = CLUSTER_PROFILES.get(str(position), {}).get(int(cluster), {})
        name = str(profile.get("name") or f"Cluster {cluster}")
        return {
            "cluster": int(cluster),
            "name": name,
            "label": name,
            "description": str(profile.get("description") or ""),
        }

    def competitions_for(self, row: pd.Series) -> list[str]:
        key = player_identity_key(row)
        return self.competitions_by_player.get(key, [str(row.get("competicion", "")).strip()]) or []

    def positions(self) -> list[str]:
        if self.df.empty:
            return []
        return sorted(self.df[POSITION_COL].dropna().unique().tolist())

    def teams(self) -> list[str]:
        if self.df.empty:
            return []
        return sorted(self.df[TEAM_COL].dropna().unique().tolist())

    def player_row(self, uid: str) -> pd.Series | None:
        if self.df.empty:
            return None
        match = self.df[self.df[ID_COL].astype(str) == str(uid)]
        return None if match.empty else match.iloc[0]

    def position_df(self, position: str) -> pd.DataFrame:
        return self.df[self.df[POSITION_COL] == position].copy()

    def summary(self, row: pd.Series) -> dict:
        name = str(row[PLAYER_COL])
        team = str(row[TEAM_COL])
        position = str(row[POSITION_COL])
        cluster = int(row[CLUSTER_COL])
        cluster_profile = self.cluster_profile(position, cluster)
        competitions = self.competitions_for(row)
        return {
            "id": str(row[ID_COL]),
            "name": name,
            "team": team,
            "competition": str(row.get("competicion", "")),
            "competitions": competitions,
            "position": position,
            "cluster": cluster,
            "clusterName": cluster_profile["name"],
            "clusterLabel": cluster_profile["label"],
            "clusterDescription": cluster_profile["description"],
            "isHybridFaPam": truthy_value(row.get("es_hibrida_fa_pam", False)),
            "hybridScoreFaPam": safe_number(row.get("score_hibrida_fa_pam", 0)),
            "anomalyScoreFaPam": safe_number(row.get("score_anomalia_fa_pam", 0)),
            "singularTypeFaPam": str(row.get("tipo_singular_fa_pam", "")),
            "photo": self.asset_for(name),
            "flag": self.asset_for(team),
        }

    def detail(self, row: pd.Series) -> dict:
        data = self.summary(row)
        metrics = self.metrics_by_position.get(str(row[POSITION_COL]), [])
        data["metrics"] = {
            metric: safe_number(row.get(metric, 0))
            for metric in metrics
        }
        return data

    def players(self, position: str = "", team: str = "", search: str = "", limit: int = 1000) -> list[dict]:
        if self.df.empty:
            return []
        filtered = self.df
        if position:
            filtered = filtered[filtered[POSITION_COL] == position]
        if team:
            filtered = filtered[filtered[TEAM_COL] == team]
        if search:
            term = normalize(search)
            mask = (
                filtered[PLAYER_COL].map(normalize).str.contains(term, regex=False)
                | filtered[TEAM_COL].map(normalize).str.contains(term, regex=False)
            )
            filtered = filtered[mask]
        filtered = filtered.sort_values([PLAYER_COL, TEAM_COL]).head(max(1, int(limit or 1000)))
        return [self.summary(row) for _, row in filtered.iterrows()]

    def top_metrics(self, position: str, limit: int = 12) -> list[str]:
        df_pos = self.position_df(position)
        metrics = self.position_metrics(position)
        scores: list[tuple[str, float]] = []
        for metric in metrics:
            means = df_pos.groupby(CLUSTER_COL)[metric].mean(numeric_only=True)
            if len(means) > 1:
                scores.append((metric, float(means.max() - means.min())))
        return [metric for metric, _ in sorted(scores, key=lambda item: item[1], reverse=True)[:limit]]

    def scaled_p05_p95_values(self, df_pos: pd.DataFrame, values: pd.Series, metrics: list[str]) -> dict[str, float]:
        if df_pos.empty or not metrics:
            return {}
        numeric = df_pos[metrics].apply(pd.to_numeric, errors="coerce")
        p05 = numeric.quantile(0.05)
        p95 = numeric.quantile(0.95)
        result = {}
        for metric in metrics:
            low = safe_number(p05.get(metric, 0))
            high = safe_number(p95.get(metric, 0))
            number = safe_number(values.get(metric, 0))
            if high == low:
                scaled = 0.5
            else:
                scaled = max(0.0, min(1.0, (number - low) / (high - low)))
            result[metric] = round(float(scaled * 0.70 + 0.15), 3)
        return result

    def cluster_mean_row(self, df_pos: pd.DataFrame, cluster: int, metrics: list[str]) -> pd.Series:
        return df_pos[df_pos[CLUSTER_COL] == cluster][metrics].mean(numeric_only=True)

    def cluster_representative(self, df_pos: pd.DataFrame, cluster: int, metrics: list[str]) -> pd.Series | None:
        df_cluster = df_pos[df_pos[CLUSTER_COL] == cluster]
        if df_cluster.empty:
            return None
        if "es_medoide" in df_cluster.columns:
            medoid_mask = df_cluster["es_medoide"].astype(str).str.lower().isin(["true", "1", "si", "sí"])
            if medoid_mask.any():
                return df_cluster[medoid_mask].iloc[0]
        if "nombre_medoide_cluster" in df_cluster.columns:
            medoid_name = str(df_cluster["nombre_medoide_cluster"].dropna().iloc[0]).strip()
            if medoid_name:
                same_name = df_pos[df_pos[PLAYER_COL].astype(str).str.strip() == medoid_name]
                same_cluster = same_name[same_name[CLUSTER_COL] == cluster]
                if not same_cluster.empty:
                    return same_cluster.iloc[0]
                if not same_name.empty:
                    return same_name.iloc[0]
        if metrics:
            values = df_cluster[metrics].apply(pd.to_numeric, errors="coerce")
            values = values.fillna(values.median(numeric_only=True))
            std = values.std(ddof=0).replace(0, 1)
            z_values = (values - values.mean()) / std
            centroid = z_values.mean()
            distances = np.sqrt(((z_values - centroid) ** 2).sum(axis=1))
            return df_cluster.loc[distances.idxmin()]
        return df_cluster.iloc[0]

    def percentile(self, df_pos: pd.DataFrame, metric: str, value: object) -> float:
        series = pd.to_numeric(df_pos[metric], errors="coerce").dropna()
        number = safe_number(value)
        if series.empty or not math.isfinite(number):
            return 0.0
        return float((series <= number).mean())

    def percentiles(self, row: pd.Series, metrics: list[str]) -> dict[str, float]:
        df_pos = self.position_df(str(row[POSITION_COL]))
        return {
            metric: self.percentile(df_pos, metric, row.get(metric, 0))
            for metric in metrics
        }

    def cluster_percentiles(self, position: str, cluster: int, metrics: list[str]) -> dict[str, float]:
        df_pos = self.position_df(position)
        df_cluster = df_pos[df_pos[CLUSTER_COL] == cluster]
        result = {}
        for metric in metrics:
            result[metric] = self.percentile(df_pos, metric, df_cluster[metric].mean())
        return result

    def row_percentiles(self, df_pos: pd.DataFrame, row: pd.Series, metrics: list[str]) -> dict[str, float]:
        return {
            metric: self.percentile(df_pos, metric, row.get(metric, 0))
            for metric in metrics
        }

    def cluster_summary(self, position: str, cluster: int, metrics: list[str]) -> dict:
        df_pos = self.position_df(position)
        df_cluster = df_pos[df_pos[CLUSTER_COL] == cluster]
        rows = []
        for metric in metrics:
            std = df_pos[metric].std(ddof=0)
            z = 0.0 if std == 0 or pd.isna(std) else (df_cluster[metric].mean() - df_pos[metric].mean()) / std
            rows.append({"metric": metric, "z": round(float(z), 2)})
        rows = sorted(rows, key=lambda item: item["z"], reverse=True)
        profile = self.cluster_profile(position, cluster)
        return {
            "cluster": int(cluster),
            "name": profile["name"],
            "label": profile["label"],
            "description": profile["description"],
            "size": int(len(df_cluster)),
            "topStrengths": rows[:4],
            "topWeaknesses": sorted(rows[-4:], key=lambda item: item["z"]),
        }

    def similar_players(self, row: pd.Series, metrics: list[str], limit: int = 10) -> list[dict]:
        df_pos = self.position_df(str(row[POSITION_COL]))
        if df_pos.empty or not metrics:
            return []
        values = df_pos[metrics].apply(pd.to_numeric, errors="coerce")
        values = values.fillna(values.median(numeric_only=True))
        std = values.std(ddof=0).replace(0, 1)
        z_values = (values - values.mean()) / std
        idx = row.name
        distances = np.sqrt(((z_values - z_values.loc[idx]) ** 2).sum(axis=1))
        result = df_pos.copy()
        result["distance"] = distances
        result = result[
            (result.index != idx)
            & result[PLAYER_COL].astype(str).str.strip().ne("")
        ].sort_values("distance").head(limit)
        return [self.summary(item) for _, item in result.iterrows()]

    def score_profile(self, position: str, weights: dict[str, float], limit: int = 30) -> list[dict]:
        df_pos = self.position_df(position)
        if df_pos.empty or not weights:
            return []
        scores = pd.Series(0.0, index=df_pos.index)
        total_metrics = 0
        contributions: dict[str, pd.Series] = {}
        percentiles_by_metric: dict[str, pd.Series] = {}
        target_percentiles: dict[str, float] = {}
        for metric, raw_target in weights.items():
            if metric not in df_pos.columns:
                continue
            target = max(0.0, min(100.0, safe_number(raw_target) * 10.0))
            ranks = pd.to_numeric(df_pos[metric], errors="coerce").rank(pct=True).fillna(0.0) * 100
            component = (100 - (ranks - target).abs()).clip(lower=0, upper=100)
            scores += component
            contributions[metric] = component.round(1)
            percentiles_by_metric[metric] = ranks.round(1)
            target_percentiles[metric] = round(target, 1)
            total_metrics += 1
        if total_metrics == 0:
            return []
        ranked = df_pos.copy()
        ranked["score"] = (scores / total_metrics).round(1)
        ranked = ranked.sort_values("score", ascending=False).head(limit)
        active_metrics = list(contributions.keys())
        rows = []
        for _, row in ranked.iterrows():
            item = self.summary(row)
            item["score"] = safe_number(row["score"])
            item["contribution"] = {
                metric: round(float(series.loc[row.name]), 1)
                for metric, series in contributions.items()
            }
            item["percentiles"] = {
                metric: round(float(series.loc[row.name]), 1)
                for metric, series in percentiles_by_metric.items()
            }
            item["targetPercentiles"] = target_percentiles
            item["playerRadarValues"] = self.scaled_p05_p95_values(df_pos, row, active_metrics)
            rows.append(item)
        return rows

    def _hybrid_source_mask(self, df_pos: pd.DataFrame) -> pd.Series:
        if "es_hibrida_fa_pam" in df_pos.columns:
            return df_pos["es_hibrida_fa_pam"].map(truthy_value)
        if "tipo_singular_fa_pam" in df_pos.columns:
            return df_pos["tipo_singular_fa_pam"].map(lambda value: "hibrida" in normalize(value))
        if self.exported_hybrid_keys:
            return df_pos.apply(lambda row: player_identity_key(row) in self.exported_hybrid_keys, axis=1)
        return pd.Series(True, index=df_pos.index)

    def hybrid_profile_search(
        self,
        position: str,
        block_a: dict[str, float],
        block_b: dict[str, float],
        team: str = "",
        search: str = "",
        min_minutes: float = 0.0,
        block_weight_a: float = 1.0,
        block_weight_b: float = 1.0,
        limit: int = 30,
        player_id: str = "",
    ) -> dict:
        if not position and player_id:
            player_match = self.df[self.df[ID_COL].astype(str) == str(player_id)]
            if not player_match.empty:
                position = str(player_match.iloc[0][POSITION_COL])
        df_pos = self.position_df(position)
        allowed = set(self.metrics_by_position.get(position, []))
        block_a = {metric: abs(safe_number(weight)) for metric, weight in block_a.items() if metric in allowed and safe_number(weight) > 0}
        block_b = {metric: abs(safe_number(weight)) for metric, weight in block_b.items() if metric in allowed and safe_number(weight) > 0}
        if df_pos.empty or not block_a or not block_b:
            return {"profiles": [], "detail": None, "metrics": [], "position": position}

        score_a, contributions_a = self._weighted_percentile_score(df_pos, block_a)
        score_b, contributions_b = self._weighted_percentile_score(df_pos, block_b)
        weight_a = max(0.1, block_weight_a)
        weight_b = max(0.1, block_weight_b)
        total_block_weight = weight_a + weight_b
        weighted_mean = ((score_a * weight_a) + (score_b * weight_b)) / total_block_weight
        floor_score = pd.concat([score_a, score_b], axis=1).min(axis=1)
        balance_score = (100 - (score_a - score_b).abs()).clip(lower=0, upper=100)
        hybrid_score = (floor_score * 0.46 + weighted_mean * 0.38 + balance_score * 0.16).round(1)

        ranked = df_pos.copy()
        ranked["hybridScore"] = hybrid_score
        ranked["scoreA"] = score_a.round(1)
        ranked["scoreB"] = score_b.round(1)
        ranked["balanceScore"] = balance_score.round(1)

        ranked_all = ranked.sort_values(["hybridScore", "scoreA", "scoreB"], ascending=False)
        rank_lookup = {idx: rank for rank, idx in enumerate(ranked_all.index, start=1)}

        filtered = ranked.copy()
        if team:
            filtered = filtered[filtered[TEAM_COL] == team]
        if min_minutes > 0 and "minutos_jugados" in filtered.columns:
            filtered = filtered[pd.to_numeric(filtered["minutos_jugados"], errors="coerce").fillna(0) >= min_minutes]
        if search:
            term = normalize(search)
            mask = (
                filtered[PLAYER_COL].map(normalize).str.contains(term, regex=False)
                | filtered[TEAM_COL].map(normalize).str.contains(term, regex=False)
            )
            filtered = filtered[mask]

        filtered = filtered.sort_values(["hybridScore", "scoreA", "scoreB"], ascending=False)
        selected_row = None
        if player_id:
            match = ranked[ranked[ID_COL].astype(str) == str(player_id)]
            if not match.empty:
                selected_row = match.iloc[0]
        if selected_row is None and not filtered.empty:
            selected_row = filtered.iloc[0]

        profiles = []
        for _, row in filtered.head(max(1, int(limit))).iterrows():
            profiles.append(self._hybrid_public_row(row, contributions_a, contributions_b))

        detail = self._hybrid_detail(selected_row, block_a, block_b, contributions_a, contributions_b, weight_a, weight_b) if selected_row is not None else None
        if detail is not None:
            detail["hybridRank"] = rank_lookup.get(selected_row.name)
            detail["positionCount"] = int(len(ranked_all))

        return {
            "profiles": profiles,
            "detail": detail,
            "metrics": unique_list(list(block_a.keys()) + list(block_b.keys())),
            "position": position,
        }

    def _weighted_percentile_score(
        self,
        df_pos: pd.DataFrame,
        weights: dict[str, float],
    ) -> tuple[pd.Series, dict[str, pd.Series]]:
        scores = pd.Series(0.0, index=df_pos.index)
        total_weight = 0.0
        contributions: dict[str, pd.Series] = {}
        for metric, weight in weights.items():
            ranks = pd.to_numeric(df_pos[metric], errors="coerce").rank(pct=True).fillna(0.0) * 100
            if metric in LOWER_IS_BETTER_METRICS:
                ranks = 100 - ranks
            scores += ranks * weight
            contributions[metric] = ranks.round(1)
            total_weight += weight
        if total_weight <= 0:
            return pd.Series(0.0, index=df_pos.index), {}
        return (scores / total_weight).fillna(0.0), contributions

    def _hybrid_public_row(
        self,
        row: pd.Series,
        contributions_a: dict[str, pd.Series],
        contributions_b: dict[str, pd.Series],
    ) -> dict:
        item = self.summary(row)
        item.update({
            "hybridScore": safe_number(row.get("hybridScore", 0)),
            "scoreA": safe_number(row.get("scoreA", 0)),
            "scoreB": safe_number(row.get("scoreB", 0)),
            "balanceScore": safe_number(row.get("balanceScore", 0)),
            "minutes": round(safe_number(row.get("minutos_jugados", 0)), 0),
            "reason": self._hybrid_reason(row, contributions_a, contributions_b),
        })
        return item

    def _hybrid_detail(
        self,
        row: pd.Series,
        block_a: dict[str, float],
        block_b: dict[str, float],
        contributions_a: dict[str, pd.Series],
        contributions_b: dict[str, pd.Series],
        block_weight_a: float,
        block_weight_b: float,
    ) -> dict:
        df_pos = self.position_df(str(row[POSITION_COL]))
        selected_metrics = unique_list(list(block_a.keys()) + list(block_b.keys()))
        context_metrics = [
            metric for metric in self.position_metrics(str(row[POSITION_COL]))
            if metric not in selected_metrics
        ]
        metrics = unique_list(selected_metrics + context_metrics[: max(0, 14 - len(selected_metrics))])[:14]
        target_radar_values = self._hybrid_target_radar_values(metrics, block_a, block_b, block_weight_a, block_weight_b)
        detail = self._hybrid_public_row(row, contributions_a, contributions_b)
        percentiles = {
            metric: round(self.percentile(df_pos, metric, row.get(metric, 0)) * 100, 1)
            for metric in metrics
        }
        detail.update({
            "metrics": metrics,
            "blockA": self._hybrid_block_detail(row, block_a, contributions_a),
            "blockB": self._hybrid_block_detail(row, block_b, contributions_b),
            "percentiles": percentiles,
            "playerRadarValues": self.scaled_p05_p95_values(df_pos, row, metrics),
            "targetRadarValues": target_radar_values,
            "targetPercentiles": {
                metric: round(max(0.0, min(100.0, (value - 0.15) / 0.70 * 100)), 1)
                for metric, value in target_radar_values.items()
            },
            "diagnosis": (
                f"{row[PLAYER_COL]} combina los dos bloques elegidos: puntúa {safe_number(row.get('scoreA', 0)):.1f} "
                f"en el bloque A y {safe_number(row.get('scoreB', 0)):.1f} en el bloque B. "
                "El score híbrido premia que ambas puntuaciones sean altas, no solo que destaque en una."
            ),
        })
        return detail

    @staticmethod
    def _hybrid_target_radar_values(
        metrics: list[str],
        block_a: dict[str, float],
        block_b: dict[str, float],
        block_weight_a: float,
        block_weight_b: float,
    ) -> dict[str, float]:
        weight_a = max(0.1, safe_number(block_weight_a))
        weight_b = max(0.1, safe_number(block_weight_b))
        total = weight_a + weight_b
        share_a = weight_a / total
        share_b = weight_b / total
        importance = {}
        for metric in metrics:
            importance[metric] = max(
                safe_number(block_a.get(metric, 0)) * share_a,
                safe_number(block_b.get(metric, 0)) * share_b,
            )
        max_importance = max([value for value in importance.values() if value > 0] or [1.0])
        result = {}
        for metric, value in importance.items():
            if value <= 0:
                result[metric] = 0.50
            else:
                result[metric] = round(0.56 + 0.29 * (value / max_importance), 3)
        return result

    def _hybrid_block_detail(
        self,
        row: pd.Series,
        weights: dict[str, float],
        contributions: dict[str, pd.Series],
    ) -> list[dict]:
        rows = []
        for metric, weight in weights.items():
            series = contributions.get(metric)
            percentile_value = safe_number(series.loc[row.name]) if series is not None and row.name in series.index else 0.0
            rows.append({
                "metric": metric,
                "weight": safe_number(weight),
                "percentile": round(percentile_value, 1),
                "value": round(safe_number(row.get(metric, 0)), 2),
            })
        return sorted(rows, key=lambda item: item["percentile"], reverse=True)

    def _hybrid_reason(
        self,
        row: pd.Series,
        contributions_a: dict[str, pd.Series],
        contributions_b: dict[str, pd.Series],
    ) -> str:
        top_a = self._top_contribution_name(row, contributions_a)
        top_b = self._top_contribution_name(row, contributions_b)
        return f"Combina {top_a} con {top_b}, manteniendo equilibrio entre ambos bloques."

    @staticmethod
    def _top_contribution_name(row: pd.Series, contributions: dict[str, pd.Series]) -> str:
        if not contributions:
            return "el bloque elegido"
        metric, _ = max(
            contributions.items(),
            key=lambda item: safe_number(item[1].loc[row.name]) if row.name in item[1].index else 0.0,
        )
        return pretty_metric(metric)

    def singular_profiles(
        self,
        position: str = "",
        team: str = "",
        search: str = "",
        profile_type: str = "",
        sensitivity: str = "media",
        min_minutes: float = 0.0,
        limit: int = 40,
        player_id: str = "",
    ) -> dict:
        if self.df.empty:
            return {"profiles": [], "detail": None, "positions": [], "teams": [], "counts": {}}

        analysed: list[dict] = []
        positions = [position] if position else self.positions()
        for pos in positions:
            analysed.extend(self._singular_rows_for_position(pos))

        selected_detail = None
        if player_id:
            selected_detail = next((row for row in analysed if row["id"] == str(player_id)), None)

        filtered = analysed
        if team:
            filtered = [row for row in filtered if row["team"] == team]
        if min_minutes > 0:
            filtered = [row for row in filtered if safe_number(row.get("minutes", 0)) >= min_minutes]
        if search:
            term = normalize(search)
            filtered = [
                row for row in filtered
                if term in normalize(f"{row['name']} {row['team']} {row['position']} {row['type']} {row['reason']}")
            ]

        requested_type = normalize(profile_type)
        if requested_type and requested_type != "todas":
            filtered = [
                row for row in filtered
                if row["typeKey"] == requested_type or requested_type in row.get("tagKeys", [])
            ]

        threshold = SENSITIVITY_THRESHOLDS.get(normalize(sensitivity), SENSITIVITY_THRESHOLDS["media"])
        if not search and not player_id:
            filtered = [
                row for row in filtered
                if row["profileScore"] >= threshold
                or row["singularityScore"] >= threshold
                or row["hybridScore"] >= threshold
                or row["versatilityScore"] >= threshold
                or row["starScore"] >= threshold
            ]

        filtered = sorted(
            filtered,
            key=lambda row: (row["profileScore"], row["singularityScore"], row["starScore"]),
            reverse=True,
        )

        if selected_detail is None and filtered:
            selected_detail = filtered[0]

        counts = {
            key: sum(1 for row in filtered if row["typeKey"] == key or key in row.get("tagKeys", []))
            for key in ("atipica", "hibrida", "polivalente", "diferencial")
        }

        return {
            "profiles": [self._public_singular_row(row) for row in filtered[:max(1, int(limit))]],
            "detail": self._singular_detail(selected_detail) if selected_detail else None,
            "positions": self.positions(),
            "teams": self.teams(),
            "counts": counts,
        }

    def _singular_rows_for_position(self, position: str) -> list[dict]:
        df_pos = self.position_df(position)
        metrics = self.top_metrics(position, 20) or self.position_metrics(position)[:20]
        if df_pos.empty or len(df_pos) < 3 or not metrics:
            return []

        values = df_pos[metrics].apply(pd.to_numeric, errors="coerce")
        values = values.fillna(values.median(numeric_only=True)).fillna(0)
        std = values.std(ddof=0).replace(0, 1).fillna(1)
        cluster_series = df_pos[CLUSTER_COL].astype(int)
        centroids = values.groupby(cluster_series).mean()
        if centroids.empty:
            return []

        inv_cov = self._regularized_inverse_cov(values)
        distance_df = self._distances_to_centroids(values, centroids, inv_cov)
        assigned_distance = pd.Series(index=df_pos.index, dtype=float)
        for idx, cluster in cluster_series.items():
            if cluster in distance_df.columns:
                assigned_distance.loc[idx] = safe_number(distance_df.loc[idx, cluster])
            else:
                assigned_distance.loc[idx] = safe_number(distance_df.loc[idx].min())

        distance_scale = safe_number(assigned_distance.replace([np.inf, -np.inf], np.nan).median())
        if distance_scale <= 0:
            distance_scale = 1.0
        singularity = assigned_distance.rank(pct=True).fillna(0.0) * 100

        positive_metrics = self._positive_value_metrics(metrics)
        if positive_metrics:
            pct_values = values[positive_metrics].rank(pct=True).fillna(0.0)
            star = pct_values.apply(
                lambda row: float(row.sort_values(ascending=False).head(min(6, len(row))).mean() * 100),
                axis=1,
            )
        else:
            star = pd.Series(0.0, index=df_pos.index)

        rows = []
        for idx, source_row in df_pos.iterrows():
            assigned_cluster = int(source_row[CLUSTER_COL])
            distances = distance_df.loc[idx].dropna().astype(float).sort_values()
            if distances.empty:
                continue

            closest_cluster = int(distances.index[0])
            closest_distance = safe_number(distances.iloc[0])
            alternatives = distances[distances.index != assigned_cluster]
            alternative_cluster = int(alternatives.index[0]) if not alternatives.empty else None
            alternative_distance = safe_number(alternatives.iloc[0]) if not alternatives.empty else 0.0

            hybrid_score = self._hybrid_score(
                safe_number(assigned_distance.loc[idx]),
                alternative_distance,
                assigned_cluster,
                closest_cluster,
            )
            versatility_score = self._versatility_score(distances, distance_scale)
            singularity_score = round(safe_number(singularity.loc[idx]), 1)
            star_score = round(safe_number(star.loc[idx]), 1)
            profile_score = round(
                0.34 * singularity_score
                + 0.24 * hybrid_score
                + 0.18 * versatility_score
                + 0.24 * star_score,
                1,
            )

            cluster_center = centroids.loc[assigned_cluster] if assigned_cluster in centroids.index else values.mean()
            cluster_z = (values.loc[idx] - cluster_center) / std
            deviation_metrics = self._deviation_metrics(df_pos, source_row, values.loc[idx], cluster_z, metrics)
            type_key, tag_keys = self._singular_type(
                singularity_score,
                hybrid_score,
                versatility_score,
                star_score,
                profile_score,
            )
            radar_metrics = unique_list(
                [item["metric"] for item in deviation_metrics]
                + metrics
            )[:12]

            item = self.summary(source_row)
            item.update({
                "typeKey": type_key,
                "type": SINGULAR_TYPE_LABELS.get(type_key, type_key.title()),
                "tagKeys": tag_keys,
                "tags": [SINGULAR_TYPE_LABELS.get(key, key.title()) for key in tag_keys],
                "profileScore": profile_score,
                "singularityScore": singularity_score,
                "hybridScore": round(hybrid_score, 1),
                "versatilityScore": round(versatility_score, 1),
                "starScore": star_score,
                "assignedDistance": round(safe_number(assigned_distance.loc[idx]), 2),
                "closestCluster": closest_cluster,
                "closestClusterName": self.cluster_profile(position, closest_cluster)["name"],
                "closestDistance": round(closest_distance, 2),
                "alternativeCluster": alternative_cluster,
                "alternativeClusterName": self.cluster_profile(position, alternative_cluster)["name"] if alternative_cluster is not None else "",
                "alternativeDistance": round(alternative_distance, 2),
                "minutes": round(safe_number(source_row.get("minutos_jugados", 0)), 0),
                "reason": self._singular_reason(position, type_key, assigned_cluster, alternative_cluster, deviation_metrics),
                "_metrics": metrics,
                "_radarMetrics": radar_metrics,
                "_deviationMetrics": deviation_metrics,
                "_playerValues": values.loc[idx],
                "_clusterValues": cluster_center,
                "_alternativeValues": centroids.loc[alternative_cluster] if alternative_cluster in centroids.index else None,
                "_topClusters": self._top_cluster_affinities(position, distances, distance_scale),
            })
            rows.append(item)
        return rows

    def _regularized_inverse_cov(self, values: pd.DataFrame) -> np.ndarray:
        matrix = values.to_numpy(dtype=float)
        if matrix.ndim == 1:
            matrix = matrix.reshape(-1, 1)
        cov = np.cov(matrix, rowvar=False, ddof=0)
        if np.ndim(cov) == 0:
            cov = np.array([[safe_number(cov)]], dtype=float)
        diag = np.diag(cov)
        ridge_value = safe_number(np.nanmedian(diag)) * 0.05
        if ridge_value <= 0:
            ridge_value = 1e-6
        regularized = cov + np.eye(cov.shape[0]) * ridge_value
        return np.linalg.pinv(regularized)

    def _distances_to_centroids(
        self,
        values: pd.DataFrame,
        centroids: pd.DataFrame,
        inv_cov: np.ndarray,
    ) -> pd.DataFrame:
        distances = pd.DataFrame(index=values.index, columns=centroids.index, dtype=float)
        matrix = values.to_numpy(dtype=float)
        for cluster, centroid in centroids.iterrows():
            diff = matrix - centroid.to_numpy(dtype=float)
            raw = np.einsum("ij,jk,ik->i", diff, inv_cov, diff)
            distances[cluster] = np.sqrt(np.maximum(raw, 0))
        return distances

    def _hybrid_score(
        self,
        assigned_distance: float,
        alternative_distance: float,
        assigned_cluster: int,
        closest_cluster: int,
    ) -> float:
        if alternative_distance <= 0:
            return 0.0
        margin = abs(alternative_distance - assigned_distance) / max(alternative_distance, assigned_distance, 1e-6)
        score = (1 - min(margin / 0.45, 1)) * 100
        if closest_cluster != assigned_cluster:
            score = max(score, 70.0)
        return max(0.0, min(100.0, score))

    def _versatility_score(self, distances: pd.Series, scale: float) -> float:
        if len(distances) <= 1:
            return 0.0
        ordered = distances.astype(float).sort_values().to_numpy()
        softness = np.exp(-(ordered[1:] - ordered[0]) / max(scale * 0.45, 1e-6))
        top = softness[:min(2, len(softness))]
        return max(0.0, min(100.0, float(top.mean() * 100)))

    def _positive_value_metrics(self, metrics: list[str]) -> list[str]:
        return [
            metric for metric in metrics
            if metric not in LOWER_IS_BETTER_METRICS
        ]

    def _deviation_metrics(
        self,
        df_pos: pd.DataFrame,
        source_row: pd.Series,
        player_values: pd.Series,
        cluster_z: pd.Series,
        metrics: list[str],
    ) -> list[dict]:
        ordered = sorted(metrics, key=lambda metric: abs(safe_number(cluster_z.get(metric, 0))), reverse=True)[:6]
        rows = []
        for metric in ordered:
            z_value = safe_number(cluster_z.get(metric, 0))
            rows.append({
                "metric": metric,
                "z": round(z_value, 2),
                "direction": "alto" if z_value >= 0 else "bajo",
                "percentile": round(self.percentile(df_pos, metric, source_row.get(metric, 0)) * 100, 1),
                "value": round(safe_number(player_values.get(metric, 0)), 2),
            })
        return rows

    def _singular_type(
        self,
        singularity: float,
        hybrid: float,
        versatility: float,
        star: float,
        profile_score: float,
    ) -> tuple[str, list[str]]:
        tag_keys: list[str] = []
        if singularity >= 85:
            tag_keys.append("atipica")
        if hybrid >= 88:
            tag_keys.append("hibrida")
        if versatility >= 88:
            tag_keys.append("polivalente")
        if star >= 88 and singularity >= 70:
            tag_keys.append("diferencial")

        if "diferencial" in tag_keys:
            primary = "diferencial"
        elif "hibrida" in tag_keys:
            primary = "hibrida"
        elif "polivalente" in tag_keys:
            primary = "polivalente"
        elif "atipica" in tag_keys:
            primary = "atipica"
        else:
            primary = "contextual"
        return primary, tag_keys

    def _singular_reason(
        self,
        position: str,
        type_key: str,
        assigned_cluster: int,
        alternative_cluster: int | None,
        deviations: list[dict],
    ) -> str:
        main_metrics = ", ".join(pretty_metric(item["metric"]) for item in deviations[:3])
        assigned_name = self.cluster_profile(position, assigned_cluster)["name"]
        alternative_name = self.cluster_profile(position, alternative_cluster)["name"] if alternative_cluster is not None else ""
        if type_key == "diferencial":
            return f"Rareza positiva por percentiles altos y desviacion fuerte en {main_metrics}."
        if type_key == "hibrida":
            alt = f" y a {alternative_name}" if alternative_name else ""
            return f"Perfil de frontera: conserva rasgos de {assigned_name}{alt}, con diferencias en {main_metrics}."
        if type_key == "polivalente":
            return f"Encaje repartido entre varios perfiles; las pistas principales estan en {main_metrics}."
        if type_key == "atipica":
            return f"Distancia alta respecto al centro de {assigned_name}, sobre todo por {main_metrics}."
        return f"Caso contextual: conviene revisar {main_metrics} antes de etiquetarla como singular."

    def _top_cluster_affinities(self, position: str, distances: pd.Series, scale: float) -> list[dict]:
        ordered = distances.astype(float).sort_values().head(3)
        if ordered.empty:
            return []
        base = safe_number(ordered.iloc[0])
        rows = []
        for cluster, distance in ordered.items():
            affinity = math.exp(-(safe_number(distance) - base) / max(scale, 1e-6)) * 100
            rows.append({
                "cluster": int(cluster),
                "name": self.cluster_profile(position, int(cluster))["name"],
                "distance": round(safe_number(distance), 2),
                "affinity": round(max(0.0, min(100.0, affinity)), 1),
            })
        return rows

    def _singular_detail(self, row: dict | None) -> dict | None:
        if not row:
            return None
        metrics = row.get("_radarMetrics", row.get("_metrics", []))[:12]
        df_pos = self.position_df(str(row["position"]))
        player_values = row.get("_playerValues")
        cluster_values = row.get("_clusterValues")
        alternative_values = row.get("_alternativeValues")
        detail = self._public_singular_row(row)
        detail.update({
            "metrics": metrics,
            "deviationMetrics": row.get("_deviationMetrics", []),
            "topClusters": row.get("_topClusters", []),
            "playerRadarValues": self.scaled_p05_p95_values(df_pos, player_values, metrics) if player_values is not None else {},
            "clusterRadarValues": self.scaled_p05_p95_values(df_pos, cluster_values, metrics) if cluster_values is not None else {},
            "alternativeRadarValues": self.scaled_p05_p95_values(df_pos, alternative_values, metrics) if alternative_values is not None else {},
            "diagnosis": self._singular_diagnosis(row),
            "methodNote": (
                "Mahalanobis mide distancia multivariante al centro del perfil; el detector la cruza "
                "con cercanía a otros perfiles y percentiles altos para separar rareza, hibridación y valor."
            ),
        })
        return detail

    def _singular_diagnosis(self, row: dict) -> str:
        type_key = row.get("typeKey", "contextual")
        profile_name = row.get("clusterName") or row.get("clusterLabel") or "su perfil asignado"
        alt = row.get("alternativeClusterName") or "un perfil cercano"
        if type_key == "diferencial":
            return (
                f"{row['name']} aparece como perfil diferencial: no solo se aleja del patron medio, "
                f"sino que lo hace con indicadores de alto valor competitivo."
            )
        if type_key == "hibrida":
            return (
                f"{row['name']} se comporta como perfil hibrido entre {profile_name} "
                f"y {alt}; es una jugadora interesante para roles mixtos."
            )
        if type_key == "polivalente":
            return (
                f"{row['name']} muestra una afinidad repartida entre varios perfiles, una senal util "
                "para detectar jugadoras adaptables a distintos planes de partido."
            )
        if type_key == "atipica":
            return (
                f"{row['name']} queda lejos del centro estadistico de {profile_name}. La etiqueta no dice "
                "si es mejor o peor por si sola: hay que leer las metricas que explican esa distancia."
            )
        return (
            f"{row['name']} no necesita una etiqueta extrema con los filtros actuales, pero sus metricas "
            "sirven para contextualizar si el perfil le queda corto o ancho."
        )

    @staticmethod
    def _public_singular_row(row: dict) -> dict:
        return {key: value for key, value in row.items() if not str(key).startswith("_")}

    def compare(self, ids: list[str], metrics: list[str]) -> tuple[int, dict]:
        rows = [self.player_row(uid) for uid in ids]
        selected = [row for row in rows if row is not None]
        if len(selected) < 2:
            return 400, {"error": "select_at_least_two_players"}
        position = str(selected[0][POSITION_COL])
        if any(str(row[POSITION_COL]) != position for row in selected):
            return 400, {"error": "players_must_share_position"}
        allowed = self.metrics_by_position.get(position, [])
        metrics = [metric for metric in metrics if metric in allowed][:18]
        if not metrics:
            metrics = self.top_metrics(position, 12)
        df_pos = self.position_df(position)
        players = []
        for row in selected:
            item = self.detail(row)
            item["values"] = {metric: round(safe_number(row.get(metric, 0)), 2) for metric in metrics}
            item["percentiles"] = {
                metric: round(self.percentile(df_pos, metric, row.get(metric, 0)) * 100, 1)
                for metric in metrics
            }
            item["radarValues"] = self.scaled_p05_p95_values(df_pos, row, metrics)
            players.append(item)
        return 200, {"position": position, "metrics": metrics, "players": players}


def safe_number(value: object) -> float:
    try:
        number = float(value)
        return number if math.isfinite(number) else 0.0
    except Exception:
        return 0.0


def unique_list(items: list[str]) -> list[str]:
    result = []
    seen = set()
    for item in items:
        if item and item not in seen:
            seen.add(item)
            result.append(item)
    return result


def pretty_metric(metric: str) -> str:
    if metric in METRIC_LABELS:
        return METRIC_LABELS[metric]
    return (
        str(metric)
        .replace("_p90", "")
        .replace("pct_", "% ")
        .replace("through_balls", "balones al hueco")
        .replace("carries", "conducciones")
        .replace("_", " ")
        .title()
    )


repo = Repository()


class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path: str) -> str:
        parsed = urlparse(path)
        request_path = unquote(parsed.path)
        if request_path == "/":
            request_path = "/index.html"
        return str((WEB_DIR / request_path.lstrip("/")).resolve())

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            self.handle_api_get(parsed.path, parse_qs(parsed.query))
            return
        super().do_GET()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/profile-score":
            self.handle_profile_score()
            return
        if parsed.path == "/api/hybrid-score":
            self.handle_hybrid_score()
            return
        self.send_json({"error": "not_found"}, status=404)

    def handle_api_get(self, path: str, query: dict[str, list[str]]) -> None:
        if path == "/api/health":
            self.send_json({
                "ok": True,
                "dataLoaded": not repo.df.empty,
                "players": int(len(repo.df)),
                "teams": int(len(repo.teams())),
                "dataFile": str(DATA_FILE),
                "assetCount": len(repo.assets),
            })
            return
        if path == "/api/assets":
            self.send_json(repo.assets)
            return
        if path == "/api/players":
            position = q(query, "position")
            team = q(query, "team")
            search = q(query, "search")
            initial_limit = 160 if not position and not team and not search else 1000
            self.send_json({
                "players": repo.players(position, team, search, initial_limit),
                "positions": repo.positions(),
                "teams": repo.teams(),
                "metricsByPosition": repo.metrics_by_position,
                "defaultMetricsByPosition": repo.default_metrics_by_position,
            })
            return
        if path == "/api/player":
            row = repo.player_row(q(query, "id"))
            if row is None:
                self.send_json({"error": "player_not_found"}, status=404)
                return
            position = str(row[POSITION_COL])
            cluster = int(row[CLUSTER_COL])
            df_pos = repo.position_df(position)
            metrics = repo.top_metrics(position, 20)
            representative = repo.cluster_representative(df_pos, cluster, metrics)
            cluster_reference = representative if representative is not None else repo.cluster_mean_row(df_pos, cluster, metrics)
            self.send_json({
                "player": repo.detail(row),
                "metrics": metrics,
                "playerPercentiles": repo.percentiles(row, metrics),
                "clusterPercentiles": (
                    repo.row_percentiles(df_pos, representative, metrics)
                    if representative is not None
                    else repo.cluster_percentiles(position, cluster, metrics)
                ),
                "playerRadarValues": repo.scaled_p05_p95_values(df_pos, row, metrics),
                "clusterRadarValues": repo.scaled_p05_p95_values(df_pos, cluster_reference, metrics),
                "representativeName": str(representative[PLAYER_COL]) if representative is not None else "",
                "clusterProfile": repo.cluster_profile(position, cluster),
                "clusterSummary": repo.cluster_summary(position, cluster, metrics),
                "similarPlayers": repo.similar_players(row, metrics, 10),
            })
            return
        if path == "/api/compare":
            ids = [item for item in q(query, "ids").split(",") if item]
            metrics = [item for item in q(query, "metrics").split(",") if item]
            status, body = repo.compare(ids, metrics)
            self.send_json(body, status=status)
            return
        if path == "/api/singular-profiles":
            limit = int(safe_number(q(query, "limit") or 40))
            self.send_json(repo.singular_profiles(
                position=q(query, "position"),
                team=q(query, "team"),
                search=q(query, "search"),
                profile_type=q(query, "type"),
                sensitivity=q(query, "sensitivity") or "media",
                min_minutes=safe_number(q(query, "minMinutes")),
                limit=limit,
                player_id=q(query, "id"),
            ))
            return
        self.send_json({"error": "not_found"}, status=404)

    def handle_profile_score(self) -> None:
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length).decode("utf-8")
        try:
            payload = json.loads(raw or "{}")
        except json.JSONDecodeError:
            payload = {}
        position = str(payload.get("position", ""))
        raw_targets = payload.get("targets", payload.get("weights", {}))
        targets = {str(k): safe_number(v) for k, v in dict(raw_targets).items()}
        active = {k: v for k, v in targets.items()}
        limit = int(safe_number(payload.get("limit", 10)) or 10)
        self.send_json({
            "scores": repo.score_profile(position, active, limit),
            "metrics": list(active.keys()),
        })

    def handle_hybrid_score(self) -> None:
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length).decode("utf-8")
        try:
            payload = json.loads(raw or "{}")
        except json.JSONDecodeError:
            payload = {}
        position = str(payload.get("position", ""))
        block_a = {str(k): safe_number(v) for k, v in dict(payload.get("blockA", {})).items()}
        block_b = {str(k): safe_number(v) for k, v in dict(payload.get("blockB", {})).items()}
        self.send_json(repo.hybrid_profile_search(
            position=position,
            block_a=block_a,
            block_b=block_b,
            team=str(payload.get("team", "")),
            search=str(payload.get("search", "")),
            min_minutes=safe_number(payload.get("minMinutes", 0)),
            block_weight_a=safe_number(payload.get("blockWeightA", 1)),
            block_weight_b=safe_number(payload.get("blockWeightB", 1)),
            limit=int(safe_number(payload.get("limit", 30)) or 30),
            player_id=str(payload.get("id", "")),
        ))

    def send_json(self, payload: object, status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def q(query: dict[str, list[str]], key: str) -> str:
    return query.get(key, [""])[0]


def main() -> None:
    port = int(os.getenv("PORT", "8081"))
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print(f"Scout Profiles Lab Python backend: http://localhost:{port}")
    print(f"Loaded {len(repo.df)} players from {DATA_FILE}")
    server.serve_forever()


if __name__ == "__main__":
    main()
