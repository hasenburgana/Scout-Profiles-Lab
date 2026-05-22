from __future__ import annotations

from pathlib import Path
import json
import math
import sys

import numpy as np
from fastapi import FastAPI, Request
from fastapi.responses import Response

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from server import CLUSTER_COL, DATA_FILE, PLAYER_COL, POSITION_COL, repo, safe_number  # noqa: E402


app = FastAPI(title="Scout Profiles Lab API")


def json_default(value):
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        number = float(value)
        return None if math.isnan(number) or math.isinf(number) else number
    if isinstance(value, (np.ndarray,)):
        return value.tolist()
    return str(value)


def json_response(payload: object, status_code: int = 200) -> Response:
    body = json.dumps(payload, ensure_ascii=False, allow_nan=False, default=json_default)
    return Response(content=body, status_code=status_code, media_type="application/json; charset=utf-8")


@app.get("/api/health")
def health() -> Response:
    return json_response({
        "ok": True,
        "dataLoaded": not repo.df.empty,
        "players": int(len(repo.df)),
        "dataFile": str(DATA_FILE),
        "assetCount": len(repo.assets),
    })


@app.get("/api/assets")
def assets() -> Response:
    return json_response(repo.assets)


@app.get("/api/players")
def players(position: str = "", team: str = "", search: str = "") -> Response:
    initial_limit = 160 if not position and not team and not search else 1000
    return json_response({
        "players": repo.players(position, team, search, initial_limit),
        "positions": repo.positions(),
        "teams": repo.teams(),
        "metricsByPosition": repo.metrics_by_position,
        "defaultMetricsByPosition": repo.default_metrics_by_position,
    })


@app.get("/api/player")
def player(id: str = "") -> Response:
    row = repo.player_row(id)
    if row is None:
        return json_response({"error": "player_not_found"}, status_code=404)

    position = str(row[POSITION_COL])
    cluster = int(row[CLUSTER_COL])
    df_pos = repo.position_df(position)
    metrics = repo.top_metrics(position, 20)
    representative = repo.cluster_representative(df_pos, cluster, metrics)
    cluster_reference = representative if representative is not None else repo.cluster_mean_row(df_pos, cluster, metrics)

    return json_response({
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


@app.get("/api/compare")
def compare(ids: str = "", metrics: str = "") -> Response:
    player_ids = [item for item in ids.split(",") if item]
    metric_names = [item for item in metrics.split(",") if item]
    status, body = repo.compare(player_ids, metric_names)
    return json_response(body, status_code=status)


@app.get("/api/singular-profiles")
def singular_profiles(
    position: str = "",
    team: str = "",
    search: str = "",
    type: str = "",
    sensitivity: str = "media",
    minMinutes: float = 0,
    limit: int = 40,
    id: str = "",
) -> Response:
    return json_response(repo.singular_profiles(
        position=position,
        team=team,
        search=search,
        profile_type=type,
        sensitivity=sensitivity or "media",
        min_minutes=safe_number(minMinutes),
        limit=int(safe_number(limit) or 40),
        player_id=id,
    ))


@app.post("/api/profile-score")
async def profile_score(request: Request) -> Response:
    try:
        payload = await request.json()
    except Exception:
        payload = {}

    position = str(payload.get("position", ""))
    raw_targets = payload.get("targets", payload.get("weights", {}))
    targets = {str(k): safe_number(v) for k, v in dict(raw_targets).items()}
    limit = int(safe_number(payload.get("limit", 10)) or 10)

    return json_response({
        "scores": repo.score_profile(position, targets, limit),
        "metrics": list(targets.keys()),
    })


@app.post("/api/hybrid-score")
async def hybrid_score(request: Request) -> Response:
    try:
        payload = await request.json()
    except Exception:
        payload = {}

    block_a = {str(k): safe_number(v) for k, v in dict(payload.get("blockA", {})).items()}
    block_b = {str(k): safe_number(v) for k, v in dict(payload.get("blockB", {})).items()}

    return json_response(repo.hybrid_profile_search(
        position=str(payload.get("position", "")),
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
