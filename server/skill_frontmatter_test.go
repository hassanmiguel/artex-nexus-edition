package server

import (
	"strings"
	"testing"
)

func strptr(s string) *string { return &s }

func TestRewriteSkillFrontmatterPreservesNestedYAMLAndBody(t *testing.T) {
	original := "---\n" +
		"name: demo\n" +
		"description: old text\n" +
		"metadata:\n" +
		"  model: inherit\n" +
		"  tags:\n" +
		"    - alpha\n" +
		"---\n\n" +
		"# Instructions\n\n" +
		"Keep this line.\n" +
		"And this one.\n"

	got, err := rewriteSkillFrontmatter([]byte(original), nil, strptr("new text"), nil, nil)
	if err != nil {
		t.Fatalf("rewriteSkillFrontmatter: %v", err)
	}
	out := string(got)

	for _, want := range []string{
		"description: new text",
		"metadata:\n  model: inherit\n  tags:\n    - alpha",
		"---\n\n# Instructions\n\nKeep this line.\nAnd this one.\n",
	} {
		if !strings.Contains(out, want) {
			t.Errorf("output missing %q\n--- output ---\n%s", want, out)
		}
	}
	if strings.Count(out, "---") != 2 {
		t.Errorf("expected exactly two frontmatter delimiters, got %d:\n%s", strings.Count(out, "---"), out)
	}
}

func TestRewriteSkillFrontmatterAppendingKeysDoesNotCorruptBody(t *testing.T) {
	// Regression: fm was a sub-slice of lines, so appending new keys overwrote
	// the closing delimiter and the first body lines in the shared backing array.
	original := "---\nname: demo\ndescription: old\n---\nBodyFirstLine\nBodySecondLine\n"

	mcps := []string{"alpha", "beta"}
	got, err := rewriteSkillFrontmatter([]byte(original), &mcps, strptr("desc"), strptr("MIT"), strptr("any"))
	if err != nil {
		t.Fatalf("rewriteSkillFrontmatter: %v", err)
	}
	out := string(got)

	for _, want := range []string{"description: desc", "license: MIT", "compatibility: any", "mcps: alpha, beta"} {
		if !strings.Contains(out, want) {
			t.Errorf("output missing %q\n--- output ---\n%s", want, out)
		}
	}
	if !strings.HasSuffix(out, "---\nBodyFirstLine\nBodySecondLine\n") {
		t.Errorf("body was corrupted:\n%s", out)
	}
}

func TestRewriteSkillFrontmatterReplacesMCPList(t *testing.T) {
	original := "---\nname: demo\ndescription: d\nmcps:\n  - old-one\n  - old-two\n---\nbody\n"

	mcps := []string{"new-one"}
	got, err := rewriteSkillFrontmatter([]byte(original), &mcps, nil, nil, nil)
	if err != nil {
		t.Fatalf("rewriteSkillFrontmatter: %v", err)
	}
	out := string(got)

	if !strings.Contains(out, "mcps: new-one") {
		t.Errorf("new mcps scalar missing:\n%s", out)
	}
	for _, stale := range []string{"old-one", "old-two", "  - "} {
		if strings.Contains(out, stale) {
			t.Errorf("stale mcps content %q still present:\n%s", stale, out)
		}
	}
	if !strings.HasSuffix(out, "---\nbody\n") {
		t.Errorf("body was corrupted:\n%s", out)
	}
}
