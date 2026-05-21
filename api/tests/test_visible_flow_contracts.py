import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


class VisibleFlowContractTest(unittest.TestCase):
    def read(self, relative_path: str) -> str:
        return (ROOT / relative_path).read_text(encoding="utf-8")

    def test_root_route_is_not_blank(self) -> None:
        page = self.read("app/page.tsx")

        self.assertIn("WarmiMIND v2", page)
        self.assertIn("/landing", page)
        self.assertNotIn("return <div></div>", page)

    def test_visible_upload_uses_v2_api_without_full_text_logging(self) -> None:
        upload = self.read("components/pdf-section.tsx")

        self.assertIn('createBackendApiUrl("/api/v1/documents")', upload)
        self.assertIn("/api/v1/learning-sessions", upload)
        self.assertNotIn("react-pdftotext", upload)
        self.assertNotIn('fetch("/api/process"', upload)
        self.assertNotIn("console.log", upload)

    def test_visible_chat_uses_v2_chat_endpoint(self) -> None:
        chat_panel = self.read("components/chat-panel.tsx")

        self.assertIn("/api/v1/learning-sessions/${learningSession.sessionId}/chat", chat_panel)
        self.assertIn("WarmiMIND will say so instead of guessing", chat_panel)
        self.assertNotIn('api: "/api/chat"', chat_panel)

    def test_legacy_chat_has_no_evidence_refusal_guard(self) -> None:
        legacy_chat = self.read("app/api/chat/route.ts")

        self.assertIn("relevantChunks.length === 0", legacy_chat)
        self.assertIn("could not find enough support", legacy_chat)
        self.assertNotIn("summarize the closest content", legacy_chat)

    def test_supabase_access_control_posture_exists(self) -> None:
        migration = self.read("migrations/0004_v2_access_control_posture.sql")
        deployment = self.read("docs/deployment.md")

        self.assertIn("enable row level security", migration)
        self.assertIn("service-role-only", migration)
        self.assertIn("SUPABASE_SERVICE_ROLE_KEY", deployment)


if __name__ == "__main__":
    unittest.main()
