package com.studypilot.service;

import com.studypilot.dto.YoutubeRequest;
import com.studypilot.dto.YoutubeVideoDto;
import com.studypilot.entity.User;
import com.studypilot.entity.YoutubeVideo;
import com.studypilot.repository.YoutubeVideoRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class YoutubeService {

    private static final Logger logger = LoggerFactory.getLogger(YoutubeService.class);

    @Autowired private YoutubeVideoRepository youtubeVideoRepository;
    @Autowired private UserService userService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    // Public, widely-known WEB client Innertube key (embedded in every
    // youtube.com page's HTML — not a secret, not a paid API key).
    private static final String INNERTUBE_PLAYER_URL =
            "https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";

    private static final String BROWSER_USER_AGENT =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

    private static final int MIN_VALID_TRANSCRIPT_LENGTH = 200;

    public static final String NO_TRANSCRIPT_MARKER = "__NO_TRANSCRIPT_AVAILABLE__";

    // Each entry: [clientName, clientVersion]. Tried in this order — current
    // evidence (early/mid-2026) shows YouTube blocks different Innertube
    // clients inconsistently, so multiple fallbacks meaningfully improve
    // success odds versus relying on a single client.
    private static final String[][] CLIENT_CONTEXTS = {
            { "TVHTML5", "7.20250101.00.00" },
            { "WEB", "2.20250101.00.00" },
            { "ANDROID", "19.09.37" },
            { "MWEB", "2.20250101.00.00" }
    };

    // =========================================================================
    // NEW — tries automatic fetch first, falls back to user-pasted transcript
    public YoutubeVideoDto addVideo(YoutubeRequest request) {
        String videoUrl = request.getVideoUrl();
        String videoId = extractVideoId(videoUrl);

        logger.info("################ addVideo() START url={} ################", videoUrl);

        if (videoId == null) {
            logger.error("addVideo: FAILED to extract videoId from url={}", videoUrl);
            throw new RuntimeException(
                    "Invalid YouTube URL. Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        }
        logger.info("addVideo: videoId={}", videoId);

        // Step 1: try automatic Innertube fetch (best-effort, may fail — see logs)
        String transcript = fetchTranscript(videoId);
        int autoLen = transcript == null ? 0 : transcript.length();
        boolean autoFetchSucceeded = !NO_TRANSCRIPT_MARKER.equals(transcript) && autoLen >= MIN_VALID_TRANSCRIPT_LENGTH;

        logger.info("addVideo: automatic fetch result — length={}, succeeded={}", autoLen, autoFetchSucceeded);

        boolean transcriptFound;

        if (autoFetchSucceeded) {
            // Auto-fetch worked — use it, ignore any manualTranscript even if sent
            transcriptFound = true;
            logger.info("addVideo: using AUTOMATIC transcript (length={})", autoLen);
        } else {
            // Step 2: fall back to manually pasted transcript, if provided
            String manual = request.getManualTranscript();
            int manualLen = manual == null ? 0 : manual.trim().length();
            logger.info("addVideo: automatic fetch failed — checking manualTranscript, length={}", manualLen);

            if (manual != null && manualLen >= MIN_VALID_TRANSCRIPT_LENGTH) {
                transcript = manual.trim();
                transcriptFound = true;
                logger.info("addVideo: using MANUAL transcript (length={})", manualLen);
            } else {
                transcript = NO_TRANSCRIPT_MARKER;
                transcriptFound = false;
                logger.warn("addVideo: NO transcript available — automatic failed and no valid manualTranscript provided");
            }
        }

        logger.info("################ addVideo: FINAL transcript length={}, accepted={} ################",
                transcript.length(), transcriptFound);

        User currentUser = userService.getCurrentUser();

        YoutubeVideo video = new YoutubeVideo();
        video.setUser(currentUser);
        video.setVideoUrl(videoUrl);
        video.setVideoId(videoId);
        video.setTitle("YouTube Video: " + videoId);
        video.setTranscript(transcript);
        video.setHasTranscript(transcriptFound);

        video = youtubeVideoRepository.save(video);

        logger.info("################ addVideo: SAVED id={}, hasTranscript={}, length={} ################",
                video.getId(), transcriptFound, transcript.length());

        return mapToDto(video, true);
    }

    public List<YoutubeVideoDto> getMyVideos() {
        Long userId = userService.getCurrentUserId();
        return youtubeVideoRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(v -> mapToDto(v, false)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public YoutubeVideo getVideoById(Long videoId) {
        Long userId = userService.getCurrentUserId();
        YoutubeVideo video = youtubeVideoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Video not found"));
        if (!video.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        return video;
    }

    public void deleteVideo(Long videoId) {
        YoutubeVideo video = getVideoById(videoId);
        youtubeVideoRepository.delete(video);
    }

    // =========================================================================
    // TRANSCRIPT FETCHING — pure Java, no external processes.
    // Tries multiple Innertube client contexts in sequence until one works.
    // =========================================================================
    private String fetchTranscript(String videoId) {
        logger.info("---------- fetchTranscript() START videoId={} ----------", videoId);

        List<String> failureSummary = new ArrayList<>();

        for (String[] clientContext : CLIENT_CONTEXTS) {
            String clientName = clientContext[0];
            String clientVersion = clientContext[1];

            logger.info("=== Trying Innertube client: {} ===", clientName);

            JsonNode playerResponse = callInnertubePlayer(videoId, clientName, clientVersion);
            if (playerResponse == null) {
                failureSummary.add(clientName + ": HTTP call failed or returned no body");
                continue; // try next client
            }

            String playability = playerResponse.path("playabilityStatus").path("status").asText("UNKNOWN");
            String playabilityReason = playerResponse.path("playabilityStatus").path("reason").asText("none");
            logger.info("[{}] playabilityStatus.status={}, reason={}", clientName, playability, playabilityReason);

            JsonNode captionsNode = playerResponse.path("captions");
            boolean captionsExist = !captionsNode.isMissingNode() && !captionsNode.isNull();
            logger.info("[{}] captions object exists = {}", clientName, captionsExist);

            if (!captionsExist) {
                failureSummary.add(clientName + ": no 'captions' key (playability=" + playability + ")");
                continue;
            }

            JsonNode captionTracks = captionsNode
                    .path("playerCaptionsTracklistRenderer")
                    .path("captionTracks");

            boolean tracksIsArray = captionTracks.isArray();
            int tracksSize = tracksIsArray ? captionTracks.size() : -1;
            logger.info("[{}] captionTracks isArray={}, size={}", clientName, tracksIsArray, tracksSize);

            if (!tracksIsArray || tracksSize == 0) {
                failureSummary.add(clientName + ": captionTracks empty");
                continue;
            }

            StringBuilder langs = new StringBuilder();
            for (JsonNode track : captionTracks) {
                langs.append(track.path("languageCode").asText("?")).append(", ");
            }
            logger.info("[{}] Available languageCode values = [{}]", clientName, langs);

            JsonNode chosenTrack = null;
            for (JsonNode track : captionTracks) {
                String langCode = track.path("languageCode").asText("");
                if (langCode.startsWith("en")) {
                    chosenTrack = track;
                    break;
                }
            }
            if (chosenTrack == null) {
                chosenTrack = captionTracks.get(0);
            }

            String baseUrl = chosenTrack.path("baseUrl").asText(null);
            String chosenLang = chosenTrack.path("languageCode").asText("unknown");
            boolean baseUrlMissing = (baseUrl == null || baseUrl.isBlank());
            logger.info("[{}] chosen track language={}, baseUrl missing={}", clientName, chosenLang, baseUrlMissing);

            if (baseUrlMissing) {
                failureSummary.add(clientName + ": chosen track has no baseUrl");
                continue;
            }

            String transcriptUrl = baseUrl + "&fmt=json3";
            logger.info("[{}] transcript download URL = {}", clientName, transcriptUrl);

            String rawJson = fetchRaw(transcriptUrl, clientName);
            int rawLen = rawJson == null ? 0 : rawJson.length();
            logger.info("[{}] transcript download response length = {}", clientName, rawLen);

            if (rawJson != null && !rawJson.isBlank()) {
                logger.info("[{}] raw response (first 500 chars) = {}", clientName,
                        rawJson.substring(0, Math.min(500, rawJson.length())));
            }

            if (rawJson == null || rawJson.isBlank()) {
                failureSummary.add(clientName + ": transcript download returned empty body");
                continue;
            }

            String text = parseJson3Transcript(rawJson, clientName);
            int parsedLen = text == null ? 0 : text.length();
            logger.info("[{}] parsed transcript length = {}", clientName, parsedLen);

            if (text != null && !text.isBlank() && parsedLen >= MIN_VALID_TRANSCRIPT_LENGTH) {
                logger.info("---------- fetchTranscript() SUCCESS videoId={} client={} length={} ----------",
                        videoId, clientName, parsedLen);
                return text;
            }

            failureSummary.add(clientName + ": parsed length=" + parsedLen + " (below minimum or empty)");
        }

        logger.error("---------- fetchTranscript() FAILED for videoId={} after trying all clients ----------", videoId);
        logger.error("Failure summary: {}", String.join(" | ", failureSummary));
        return NO_TRANSCRIPT_MARKER;
    }

    // Step 1: Ask YouTube's internal player API for this video's metadata
    private JsonNode callInnertubePlayer(String videoId, String clientName, String clientVersion) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("User-Agent", BROWSER_USER_AGENT);
            headers.set("Origin", "https://www.youtube.com");
            headers.set("Referer", "https://www.youtube.com/watch?v=" + videoId);

            String requestBody = "{"
                    + "\"context\":{\"client\":{"
                    + "\"clientName\":\"" + clientName + "\","
                    + "\"clientVersion\":\"" + clientVersion + "\","
                    + "\"hl\":\"en\",\"gl\":\"US\""
                    + "}},"
                    + "\"videoId\":\"" + videoId + "\""
                    + "}";

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            logger.info("[{}] [STEP 1] POST {} | body={}", clientName, INNERTUBE_PLAYER_URL, requestBody);

            ResponseEntity<String> response = restTemplate.exchange(
                    INNERTUBE_PLAYER_URL, HttpMethod.POST, entity, String.class);

            HttpStatusCode status = response.getStatusCode();
            String body = response.getBody();
            int bodyLen = body == null ? 0 : body.length();

            logger.info("[{}] [STEP 1] HTTP status={}, response body length={}", clientName, status, bodyLen);

            if (body == null || body.isBlank()) {
                logger.error("[{}] [STEP 1] FAILED — empty response body", clientName);
                return null;
            }

            return objectMapper.readTree(body);

        } catch (RestClientException e) {
            logger.error("[{}] [STEP 1] HTTP EXCEPTION: {} : {}",
                    clientName, e.getClass().getName(), e.getMessage(), e);
            return null;
        } catch (Exception e) {
            logger.error("[{}] [STEP 1] PARSE EXCEPTION: {} : {}",
                    clientName, e.getClass().getName(), e.getMessage(), e);
            return null;
        }
    }

    // Step 2: Download the actual caption file from the signed baseUrl
    private String fetchRaw(String url, String clientName) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", BROWSER_USER_AGENT);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class);

            logger.info("[{}] [STEP 2] GET caption URL -> HTTP status={}", clientName, response.getStatusCode());

            return response.getBody();
        } catch (RestClientException e) {
            logger.error("[{}] [STEP 2] HTTP EXCEPTION downloading transcript: {} : {}",
                    clientName, e.getClass().getName(), e.getMessage(), e);
            return null;
        }
    }

    // Parses json3 format: {"events":[{"segs":[{"utf8":"..."}]}]}
    private String parseJson3Transcript(String rawJson, String clientName) {
        try {
            JsonNode root = objectMapper.readTree(rawJson);
            JsonNode events = root.path("events");
            if (!events.isArray()) {
                logger.error("[{}] [STEP 3] 'events' field missing or not an array", clientName);
                return null;
            }

            StringBuilder sb = new StringBuilder();
            for (JsonNode event : events) {
                JsonNode segs = event.path("segs");
                if (!segs.isArray()) continue;
                for (JsonNode seg : segs) {
                    String text = seg.path("utf8").asText("");
                    if (!text.isBlank()) {
                        sb.append(text);
                    }
                }
            }

            return sb.toString().replaceAll("\\n", " ").replaceAll("\\s+", " ").trim();

        } catch (Exception e) {
            logger.error("[{}] [STEP 3] EXCEPTION parsing json3: {} : {}",
                    clientName, e.getClass().getName(), e.getMessage(), e);
            return null;
        }
    }

    // -----------------------------------------------------------------------
    private String extractVideoId(String url) {
        if (url == null) return null;
        Pattern pattern = Pattern.compile(
                "(?:youtube\\.com/watch\\?v=|youtu\\.be/|youtube\\.com/embed/)([^&?\\s]{11})");
        Matcher matcher = pattern.matcher(url);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    public YoutubeVideoDto mapToDto(YoutubeVideo video, boolean includeTranscript) {
        YoutubeVideoDto dto = new YoutubeVideoDto();
        dto.setId(video.getId());
        dto.setVideoUrl(video.getVideoUrl());
        dto.setVideoId(video.getVideoId());
        dto.setTitle(video.getTitle());
        dto.setCreatedAt(video.getCreatedAt());
        dto.setHasTranscript(Boolean.TRUE.equals(video.getHasTranscript()));
        if (includeTranscript) {
            dto.setTranscript(NO_TRANSCRIPT_MARKER.equals(video.getTranscript())
                    ? null
                    : video.getTranscript());
        }
        return dto;
    }
}