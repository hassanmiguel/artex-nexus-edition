package server

import (
	"io"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
	"time"

	"github.com/Autumn-27/artex/config"
)

// nexusPrefix is the ARTEX-side namespace for the NEXUS AI gateway. Requests
// arriving here have already passed cors + JWT (see Server.Handler), so the
// upstream service never needs its own auth surface exposed to the browser.
const nexusPrefix = "/api/nexus/"

// Only these NEXUS endpoints are reachable through ARTEX. An allowlist keeps
// the proxy from becoming a general-purpose tunnel into the loopback service.
var nexusAllowedPaths = map[string]bool{
	"health":             true,
	"api/status":         true,
	"api/stats":          true,
	"api/chat":           true,
	"api/chat/stream":    true,
	"api/search":         true,
	"api/dashboard":      true,
	"api/settings":       true,
	"api/tools/run":      true,
	"api/repos/ingest":   true,
	"api/review/analyze": true,
}

// nexusStatus reports whether the configured NEXUS gateway is reachable.
// GET /api/nexus/status (JWT required, like every other /api route).
func (s *Server) nexusStatus(w http.ResponseWriter, r *http.Request) {
	base := config.NexusURL()
	result := map[string]any{
		"enabled":   true,
		"url":       base,
		"reachable": false,
	}

	req, err := http.NewRequestWithContext(r.Context(), http.MethodGet, base+"/health", nil)
	if err != nil {
		result["detail"] = err.Error()
		writeJSON(w, 200, result)
		return
	}
	if tok := config.NexusToken(); tok != "" {
		req.Header.Set("Authorization", "Bearer "+tok)
	}

	client := &http.Client{Timeout: 3 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		result["detail"] = err.Error()
		writeJSON(w, 200, result)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
	result["status"] = resp.StatusCode
	result["reachable"] = resp.StatusCode >= 200 && resp.StatusCode < 300
	result["detail"] = strings.TrimSpace(string(body))
	writeJSON(w, 200, result)
}

// nexusProxy forwards /api/nexus/<allowed path> to the NEXUS gateway. It is
// server-side so the browser's origin (ARTEX on :8787) never trips NEXUS's
// CORS allow-list, which only permits :8000.
func (s *Server) nexusProxy(w http.ResponseWriter, r *http.Request) {
	rel := strings.Trim(strings.TrimPrefix(r.URL.Path, nexusPrefix), "/")
	if !nexusAllowedPaths[rel] {
		writeErr(w, 404, "unknown NEXUS endpoint: "+rel)
		return
	}

	target, err := url.Parse(config.NexusURL())
	if err != nil || target.Scheme == "" || target.Host == "" {
		writeErr(w, 503, "NEXUS URL is not configured correctly")
		return
	}

	proxy := httputil.NewSingleHostReverseProxy(target)
	// SSE chat streams must be flushed as they arrive, not buffered.
	proxy.FlushInterval = -1
	baseDirector := proxy.Director
	proxy.Director = func(req *http.Request) {
		baseDirector(req)
		req.URL.Path = "/" + rel
		req.URL.RawPath = ""
		req.Host = target.Host
		if tok := config.NexusToken(); tok != "" {
			req.Header.Set("Authorization", "Bearer "+tok)
		}
	}
	proxy.ErrorHandler = func(rw http.ResponseWriter, req *http.Request, proxyErr error) {
		writeErr(rw, 502, "NEXUS gateway unavailable: "+proxyErr.Error())
	}
	proxy.ServeHTTP(w, r)
}
