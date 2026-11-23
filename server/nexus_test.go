package server

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestNexusProxyAllowlistAndToken(t *testing.T) {
	var gotPath, gotAuth string
	calls := 0
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls++
		gotPath = r.URL.Path
		gotAuth = r.Header.Get("Authorization")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"ok":true}`))
	}))
	defer upstream.Close()

	t.Setenv("ARTEX_NEXUS_URL", upstream.URL)
	t.Setenv("ARTEX_NEXUS_TOKEN", "topsecret")

	s := &Server{}

	// Allowed path: forwarded with the configured bearer token.
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/nexus/api/status", nil)
	s.nexusProxy(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("allowed path status = %d, want 200 (body %q)", rec.Code, rec.Body.String())
	}
	if gotPath != "/api/status" {
		t.Errorf("upstream path = %q, want /api/status", gotPath)
	}
	if gotAuth != "Bearer topsecret" {
		t.Errorf("upstream Authorization = %q, want Bearer topsecret", gotAuth)
	}
	if calls != 1 {
		t.Errorf("upstream calls = %d, want 1", calls)
	}

	// Unknown path: blocked before touching the upstream.
	rec = httptest.NewRecorder()
	req = httptest.NewRequest(http.MethodGet, "/api/nexus/api/settings/secret", nil)
	s.nexusProxy(rec, req)
	if rec.Code != http.StatusNotFound {
		t.Errorf("disallowed path status = %d, want 404", rec.Code)
	}
	if calls != 1 {
		t.Errorf("disallowed path reached upstream (calls = %d)", calls)
	}
}

func TestNexusStatus(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/health" {
			t.Errorf("health path = %q, want /health", r.URL.Path)
		}
		_, _ = w.Write([]byte("nexus ok"))
	}))
	defer upstream.Close()

	t.Setenv("ARTEX_NEXUS_URL", upstream.URL+"/")
	t.Setenv("ARTEX_NEXUS_TOKEN", "")

	s := &Server{}
	rec := httptest.NewRecorder()
	s.nexusStatus(rec, httptest.NewRequest(http.MethodGet, "/api/nexus/status", nil))

	if rec.Code != http.StatusOK {
		t.Fatalf("status code = %d, want 200", rec.Code)
	}
	for _, want := range []string{`"reachable":true`, `"status":200`, "nexus ok"} {
		if !strings.Contains(rec.Body.String(), want) {
			t.Errorf("response missing %q: %s", want, rec.Body.String())
		}
	}
}
