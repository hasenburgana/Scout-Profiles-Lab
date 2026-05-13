package tfg;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

public class App {
    private static final Path DATA_FILE = Path.of("data", "perfiles_finales.csv");
    private static final Path WEB_DIR = Path.of("web");
    private static final int PORT = 8081;
    private static PlayerRepository repository;

    public static void main(String[] args) throws Exception {
        repository = PlayerRepository.load(DATA_FILE);

        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/api/health", App::health);
        server.createContext("/api/players", App::players);
        server.createContext("/api/player", App::player);
        server.createContext("/api/profile-score", App::profileScore);
        server.createContext("/", App::staticFile);
        server.setExecutor(null);
        server.start();

        System.out.println("TFG Perfiladoras running at http://localhost:" + PORT);
        if (repository.isEmpty()) {
            System.out.println("No data loaded. Put your CSV at " + DATA_FILE.toAbsolutePath());
        } else {
            System.out.println("Loaded " + repository.players.size() + " players.");
        }
    }

    private static void health(HttpExchange exchange) throws IOException {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("ok", true);
        body.put("dataLoaded", !repository.isEmpty());
        body.put("players", repository.players.size());
        body.put("dataFile", DATA_FILE.toAbsolutePath().toString());
        json(exchange, 200, Json.stringify(body));
    }

    private static void players(HttpExchange exchange) throws IOException {
        Map<String, String> query = parseQuery(exchange.getRequestURI().getRawQuery());
        String position = query.getOrDefault("position", "");
        String search = normalize(query.getOrDefault("search", ""));

        List<Map<String, Object>> rows = repository.players.stream()
                .filter(p -> position.isBlank() || position.equals(p.position))
                .filter(p -> search.isBlank() || normalize(p.name).contains(search) || normalize(p.team).contains(search))
                .sorted(Comparator.comparing((Player p) -> p.name))
                .limit(300)
                .map(Player::summary)
                .collect(Collectors.toList());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("players", rows);
        body.put("positions", repository.positions());
        body.put("metricsByPosition", repository.metricsByPosition());
        json(exchange, 200, Json.stringify(body));
    }

    private static void player(HttpExchange exchange) throws IOException {
        Map<String, String> query = parseQuery(exchange.getRequestURI().getRawQuery());
        String id = query.getOrDefault("id", "");
        Optional<Player> found = repository.find(id);
        if (found.isEmpty()) {
            json(exchange, 404, "{\"error\":\"player_not_found\"}");
            return;
        }

        Player player = found.get();
        List<String> metrics = repository.topDiscriminantMetrics(player.position, 12);
        Map<String, Double> playerPercentiles = repository.percentiles(player, metrics);
        Map<String, Double> clusterAverage = repository.clusterPercentiles(player.position, player.cluster, metrics);
        List<Map<String, Object>> similar = repository.similarPlayers(player, metrics, 10).stream()
                .map(Player::summary)
                .collect(Collectors.toList());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("player", player.detail());
        body.put("metrics", metrics);
        body.put("playerPercentiles", playerPercentiles);
        body.put("clusterPercentiles", clusterAverage);
        body.put("clusterSummary", repository.clusterSummary(player.position, player.cluster, metrics));
        body.put("similarPlayers", similar);
        json(exchange, 200, Json.stringify(body));
    }

    private static void profileScore(HttpExchange exchange) throws IOException {
        if (!"POST".equals(exchange.getRequestMethod())) {
            json(exchange, 405, "{\"error\":\"method_not_allowed\"}");
            return;
        }

        String raw = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
        Map<String, Object> request = Json.parseObject(raw);
        String position = String.valueOf(request.getOrDefault("position", ""));
        @SuppressWarnings("unchecked")
        Map<String, Object> weightsRaw = (Map<String, Object>) request.getOrDefault("weights", Map.of());
        Map<String, Double> weights = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : weightsRaw.entrySet()) {
            double value = toDouble(entry.getValue());
            if (value != 0) {
                weights.put(entry.getKey(), value);
            }
        }

        List<Map<String, Object>> scores = repository.scoreProfile(position, weights, 30).stream()
                .map(ScoredPlayer::toMap)
                .collect(Collectors.toList());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("scores", scores);
        body.put("metrics", new ArrayList<>(weights.keySet()));
        json(exchange, 200, Json.stringify(body));
    }

    private static void staticFile(HttpExchange exchange) throws IOException {
        String requestPath = exchange.getRequestURI().getPath();
        if (requestPath.equals("/")) {
            requestPath = "/index.html";
        }
        Path path = WEB_DIR.resolve(requestPath.substring(1)).normalize();
        if (!path.startsWith(WEB_DIR) || !Files.exists(path) || Files.isDirectory(path)) {
            text(exchange, 404, "Not found", "text/plain; charset=utf-8");
            return;
        }
        String type = contentType(path);
        byte[] bytes = Files.readAllBytes(path);
        exchange.getResponseHeaders().add("Content-Type", type);
        exchange.sendResponseHeaders(200, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static void json(HttpExchange exchange, int status, String body) throws IOException {
        text(exchange, status, body, "application/json; charset=utf-8");
    }

    private static void text(HttpExchange exchange, int status, String body, String type) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", type);
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static String contentType(Path path) {
        String name = path.getFileName().toString().toLowerCase(Locale.ROOT);
        if (name.endsWith(".html")) return "text/html; charset=utf-8";
        if (name.endsWith(".css")) return "text/css; charset=utf-8";
        if (name.endsWith(".js")) return "application/javascript; charset=utf-8";
        if (name.endsWith(".svg")) return "image/svg+xml";
        return "application/octet-stream";
    }

    private static Map<String, String> parseQuery(String raw) {
        Map<String, String> query = new HashMap<>();
        if (raw == null || raw.isBlank()) return query;
        for (String part : raw.split("&")) {
            String[] pair = part.split("=", 2);
            String key = decode(pair[0]);
            String value = pair.length > 1 ? decode(pair[1]) : "";
            query.put(key, value);
        }
        return query;
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private static String normalize(String value) {
        String noAccents = Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return noAccents.toLowerCase(Locale.ROOT).trim();
    }

    private static double toDouble(Object value) {
        if (value instanceof Number number) return number.doubleValue();
        try {
            return Double.parseDouble(String.valueOf(value));
        } catch (Exception ignored) {
            return 0.0;
        }
    }

    static class PlayerRepository {
        private final List<Player> players;
        private final Map<String, List<Player>> byPosition;
        private final Map<String, List<String>> metricsByPosition;

        private PlayerRepository(List<Player> players) {
            this.players = players;
            this.byPosition = players.stream().collect(Collectors.groupingBy(p -> p.position));
            this.metricsByPosition = discoverMetrics(players);
        }

        static PlayerRepository load(Path file) throws IOException {
            if (!Files.exists(file)) {
                return new PlayerRepository(List.of());
            }
            List<Map<String, String>> rows = Csv.read(file);
            List<Player> players = new ArrayList<>();
            for (Map<String, String> row : rows) {
                players.add(Player.from(row));
            }
            return new PlayerRepository(players);
        }

        boolean isEmpty() {
            return players.isEmpty();
        }

        List<String> positions() {
            return byPosition.keySet().stream().sorted().collect(Collectors.toList());
        }

        Map<String, List<String>> metricsByPosition() {
            return metricsByPosition;
        }

        Optional<Player> find(String id) {
            return players.stream().filter(p -> p.id.equals(id)).findFirst();
        }

        List<String> topDiscriminantMetrics(String position, int limit) {
            List<Player> group = byPosition.getOrDefault(position, List.of());
            List<String> metrics = metricsByPosition.getOrDefault(position, List.of());
            return metrics.stream()
                    .map(metric -> Map.entry(metric, clusterRange(group, metric)))
                    .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                    .limit(limit)
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toList());
        }

        Map<String, Double> percentiles(Player player, List<String> metrics) {
            Map<String, Double> result = new LinkedHashMap<>();
            List<Player> group = byPosition.getOrDefault(player.position, List.of());
            for (String metric : metrics) {
                result.put(metric, percentile(group, metric, player.metric(metric)));
            }
            return result;
        }

        Map<String, Double> clusterPercentiles(String position, int cluster, List<String> metrics) {
            List<Player> clusterPlayers = byPosition.getOrDefault(position, List.of()).stream()
                    .filter(p -> p.cluster == cluster)
                    .collect(Collectors.toList());
            List<Player> positionPlayers = byPosition.getOrDefault(position, List.of());
            Map<String, Double> result = new LinkedHashMap<>();
            for (String metric : metrics) {
                double mean = clusterPlayers.stream().mapToDouble(p -> p.metric(metric)).average().orElse(0);
                result.put(metric, percentile(positionPlayers, metric, mean));
            }
            return result;
        }

        Map<String, Object> clusterSummary(String position, int cluster, List<String> metrics) {
            List<Player> group = byPosition.getOrDefault(position, List.of());
            List<Player> clusterPlayers = group.stream().filter(p -> p.cluster == cluster).collect(Collectors.toList());
            Map<String, Object> summary = new LinkedHashMap<>();
            summary.put("size", clusterPlayers.size());
            summary.put("cluster", cluster);
            summary.put("topStrengths", clusterStrengths(group, clusterPlayers, metrics, true));
            summary.put("topWeaknesses", clusterStrengths(group, clusterPlayers, metrics, false));
            return summary;
        }

        List<Player> similarPlayers(Player target, List<String> metrics, int limit) {
            return byPosition.getOrDefault(target.position, List.of()).stream()
                    .filter(p -> !p.id.equals(target.id))
                    .map(p -> Map.entry(p, distance(target, p, metrics)))
                    .sorted(Map.Entry.comparingByValue())
                    .limit(limit)
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toList());
        }

        List<ScoredPlayer> scoreProfile(String position, Map<String, Double> weights, int limit) {
            if (weights.isEmpty()) return List.of();
            List<Player> group = byPosition.getOrDefault(position, List.of());
            return group.stream()
                    .map(player -> {
                        double weighted = 0;
                        double totalWeight = 0;
                        Map<String, Double> contribution = new LinkedHashMap<>();
                        for (Map.Entry<String, Double> entry : weights.entrySet()) {
                            String metric = entry.getKey();
                            double weight = Math.abs(entry.getValue());
                            double direction = Math.signum(entry.getValue());
                            double pct = percentile(group, metric, player.metric(metric));
                            double component = direction >= 0 ? pct : 1 - pct;
                            weighted += component * weight;
                            totalWeight += weight;
                            contribution.put(metric, round(component * 100));
                        }
                        double score = totalWeight == 0 ? 0 : (weighted / totalWeight) * 100;
                        return new ScoredPlayer(player, round(score), contribution);
                    })
                    .sorted(Comparator.comparingDouble((ScoredPlayer s) -> s.score).reversed())
                    .limit(limit)
                    .collect(Collectors.toList());
        }

        private List<Map<String, Object>> clusterStrengths(List<Player> positionPlayers, List<Player> clusterPlayers, List<String> metrics, boolean desc) {
            return metrics.stream()
                    .map(metric -> {
                        double clusterMean = clusterPlayers.stream().mapToDouble(p -> p.metric(metric)).average().orElse(0);
                        double positionMean = positionPlayers.stream().mapToDouble(p -> p.metric(metric)).average().orElse(0);
                        double std = std(positionPlayers, metric);
                        double z = std == 0 ? 0 : (clusterMean - positionMean) / std;
                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("metric", metric);
                        row.put("z", round(z));
                        return row;
                    })
                    .sorted((a, b) -> {
                        double za = (double) a.get("z");
                        double zb = (double) b.get("z");
                        return desc ? Double.compare(zb, za) : Double.compare(za, zb);
                    })
                    .limit(4)
                    .collect(Collectors.toList());
        }

        private static Map<String, List<String>> discoverMetrics(List<Player> players) {
            Map<String, Set<String>> tmp = new HashMap<>();
            for (Player player : players) {
                tmp.computeIfAbsent(player.position, k -> new HashSet<>()).addAll(player.metrics.keySet());
            }
            Map<String, List<String>> result = new LinkedHashMap<>();
            tmp.keySet().stream().sorted().forEach(position -> {
                List<String> metrics = tmp.get(position).stream()
                        .filter(metric -> !metric.equals("cluster_final"))
                        .sorted()
                        .collect(Collectors.toList());
                result.put(position, metrics);
            });
            return result;
        }

        private static double clusterRange(List<Player> players, String metric) {
            Map<Integer, Double> means = players.stream().collect(Collectors.groupingBy(
                    p -> p.cluster,
                    Collectors.averagingDouble(p -> p.metric(metric))
            ));
            if (means.isEmpty()) return 0;
            double min = means.values().stream().mapToDouble(Double::doubleValue).min().orElse(0);
            double max = means.values().stream().mapToDouble(Double::doubleValue).max().orElse(0);
            return max - min;
        }

        private static double percentile(List<Player> players, String metric, double value) {
            List<Double> values = players.stream()
                    .map(p -> p.metric(metric))
                    .filter(Double::isFinite)
                    .sorted()
                    .collect(Collectors.toList());
            if (values.isEmpty()) return 0;
            long belowOrEqual = values.stream().filter(v -> v <= value).count();
            return Math.max(0, Math.min(1, belowOrEqual / (double) values.size()));
        }

        private static double distance(Player a, Player b, List<String> metrics) {
            double sum = 0;
            for (String metric : metrics) {
                double d = a.metric(metric) - b.metric(metric);
                sum += d * d;
            }
            return Math.sqrt(sum);
        }

        private static double std(List<Player> players, String metric) {
            double mean = players.stream().mapToDouble(p -> p.metric(metric)).average().orElse(0);
            double variance = players.stream()
                    .mapToDouble(p -> Math.pow(p.metric(metric) - mean, 2))
                    .average()
                    .orElse(0);
            return Math.sqrt(variance);
        }
    }

    static class Player {
        final String id;
        final String name;
        final String team;
        final String position;
        final int cluster;
        final Map<String, Double> metrics;

        Player(String id, String name, String team, String position, int cluster, Map<String, Double> metrics) {
            this.id = id;
            this.name = name;
            this.team = team;
            this.position = position;
            this.cluster = cluster;
            this.metrics = metrics;
        }

        static Player from(Map<String, String> row) {
            String id = first(row, "player_id", "id", "jugadora_id");
            String name = first(row, "player_name", "name", "jugadora");
            String team = first(row, "team_name", "team", "equipo");
            String position = first(row, "grupo_pos_clustering", "grupo_pos", "position", "posicion");
            int cluster = (int) toDouble(first(row, "cluster_final", "cluster", "cluster_fa", "cluster_hier", "cluster_pca"));

            Map<String, Double> metrics = new LinkedHashMap<>();
            Set<String> ignored = Set.of(
                    "player_id", "id", "jugadora_id", "player_name", "name", "jugadora",
                    "team_name", "team", "equipo", "grupo_pos_clustering", "grupo_pos",
                    "position", "posicion", "cluster_final", "cluster", "cluster_fa",
                    "cluster_hier", "cluster_pca", "posicion_principal"
            );
            for (Map.Entry<String, String> entry : row.entrySet()) {
                if (!ignored.contains(entry.getKey())) {
                    try {
                        double value = Double.parseDouble(entry.getValue().replace(",", "."));
                        if (Double.isFinite(value)) {
                            metrics.put(entry.getKey(), value);
                        }
                    } catch (Exception ignoredParse) {
                        // Non numeric columns are metadata, not profile metrics.
                    }
                }
            }

            return new Player(id.isBlank() ? name : id, name, team, position, cluster, metrics);
        }

        double metric(String name) {
            return metrics.getOrDefault(name, 0.0);
        }

        Map<String, Object> summary() {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", id);
            row.put("name", name);
            row.put("team", team);
            row.put("position", position);
            row.put("cluster", cluster);
            return row;
        }

        Map<String, Object> detail() {
            Map<String, Object> row = summary();
            row.put("metrics", metrics);
            return row;
        }

        private static String first(Map<String, String> row, String... keys) {
            for (String key : keys) {
                String value = row.getOrDefault(key, "");
                if (!value.isBlank()) return value;
            }
            return "";
        }
    }

    static class ScoredPlayer {
        final Player player;
        final double score;
        final Map<String, Double> contribution;

        ScoredPlayer(Player player, double score, Map<String, Double> contribution) {
            this.player = player;
            this.score = score;
            this.contribution = contribution;
        }

        Map<String, Object> toMap() {
            Map<String, Object> row = player.summary();
            row.put("score", score);
            row.put("contribution", contribution);
            return row;
        }
    }

    static class Csv {
        static List<Map<String, String>> read(Path file) throws IOException {
            try (BufferedReader reader = Files.newBufferedReader(file, StandardCharsets.UTF_8)) {
                String headerLine = reader.readLine();
                if (headerLine == null) return List.of();
                List<String> headers = parseLine(removeBom(headerLine));
                List<Map<String, String>> rows = new ArrayList<>();
                String line;
                while ((line = reader.readLine()) != null) {
                    List<String> values = parseLine(line);
                    Map<String, String> row = new LinkedHashMap<>();
                    for (int i = 0; i < headers.size(); i++) {
                        row.put(headers.get(i), i < values.size() ? values.get(i) : "");
                    }
                    rows.add(row);
                }
                return rows;
            }
        }

        private static String removeBom(String value) {
            return value.startsWith("\uFEFF") ? value.substring(1) : value;
        }

        private static List<String> parseLine(String line) {
            List<String> values = new ArrayList<>();
            StringBuilder current = new StringBuilder();
            boolean inQuotes = false;
            for (int i = 0; i < line.length(); i++) {
                char c = line.charAt(i);
                if (c == '"') {
                    if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                        current.append('"');
                        i++;
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (c == ',' && !inQuotes) {
                    values.add(current.toString());
                    current.setLength(0);
                } else {
                    current.append(c);
                }
            }
            values.add(current.toString());
            return values;
        }
    }

    static class Json {
        static String stringify(Object value) {
            if (value == null) return "null";
            if (value instanceof String str) return "\"" + escape(str) + "\"";
            if (value instanceof Number || value instanceof Boolean) return value.toString();
            if (value instanceof Map<?, ?> map) {
                return map.entrySet().stream()
                        .map(e -> stringify(String.valueOf(e.getKey())) + ":" + stringify(e.getValue()))
                        .collect(Collectors.joining(",", "{", "}"));
            }
            if (value instanceof Iterable<?> iterable) {
                List<String> parts = new ArrayList<>();
                for (Object item : iterable) parts.add(stringify(item));
                return "[" + String.join(",", parts) + "]";
            }
            return stringify(String.valueOf(value));
        }

        static Map<String, Object> parseObject(String raw) {
            return new Parser(raw).parseObject();
        }

        private static String escape(String str) {
            return str.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
        }

        static class Parser {
            private final String raw;
            private int pos = 0;

            Parser(String raw) {
                this.raw = raw == null ? "" : raw.trim();
            }

            Map<String, Object> parseObject() {
                Map<String, Object> map = new LinkedHashMap<>();
                skipWhitespace();
                if (peek() != '{') return map;
                pos++;
                while (pos < raw.length()) {
                    skipWhitespace();
                    if (peek() == '}') {
                        pos++;
                        break;
                    }
                    String key = parseString();
                    skipWhitespace();
                    if (peek() == ':') pos++;
                    Object value = parseValue();
                    map.put(key, value);
                    skipWhitespace();
                    if (peek() == ',') pos++;
                }
                return map;
            }

            private Object parseValue() {
                skipWhitespace();
                char c = peek();
                if (c == '"') return parseString();
                if (c == '{') return parseObject();
                return parseNumber();
            }

            private String parseString() {
                StringBuilder sb = new StringBuilder();
                if (peek() == '"') pos++;
                while (pos < raw.length()) {
                    char c = raw.charAt(pos++);
                    if (c == '"') break;
                    if (c == '\\' && pos < raw.length()) {
                        sb.append(raw.charAt(pos++));
                    } else {
                        sb.append(c);
                    }
                }
                return sb.toString();
            }

            private Double parseNumber() {
                int start = pos;
                while (pos < raw.length() && "-0123456789.eE+".indexOf(raw.charAt(pos)) >= 0) {
                    pos++;
                }
                return toDouble(raw.substring(start, pos));
            }

            private char peek() {
                return pos < raw.length() ? raw.charAt(pos) : '\0';
            }

            private void skipWhitespace() {
                while (pos < raw.length() && Character.isWhitespace(raw.charAt(pos))) pos++;
            }
        }
    }

    private static double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
