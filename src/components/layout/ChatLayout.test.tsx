import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";

// ── Next.js navigation ────────────────────────────────────────────────────────
const mockPathname = vi.fn(() => "/chat");
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => mockPathname(),
}));

// ── Redux store ───────────────────────────────────────────────────────────────
vi.mock("@/store", () => ({
  useAppDispatch: () => vi.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useAppSelector: (selector: (s: unknown) => unknown) =>
    selector({
      auth: { user: { name: "Alice", email: "alice@example.com" } },
      ui: { mode: "dark" },
      chat: {
        chatHistory: {},
        currentConversation: null,
        conversations: [],
        selectedTags: [],
      },
    }),
}));

// ── Heavyweight child components / utilities ───────────────────────────────────
vi.mock("@/components/chat/ConversationManager", () => ({
  ConversationManager: () => <div data-testid="conversation-manager" />,
}));
vi.mock("@/components/ui/ThemeToggle", () => ({
  ThemeToggle: () => <div />,
}));
vi.mock("@/components/ui/Button", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,  // eslint-disable-line @next/next/no-img-element
}));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/store/slices/authSlice", () => ({ logout: () => ({ type: "auth/logout" }) }));
vi.mock("@/store/slices/uiSlice", () => ({ toggleTheme: () => ({ type: "ui/toggleTheme" }) }));
vi.mock("@/store/slices/chatSlice", () => ({
  clearMessages: () => ({ type: "chat/clearMessages" }),
  startNewChat: () => ({ type: "chat/startNewChat" }),
  loadChatHistory: () => ({ type: "chat/loadChatHistory" }),
  deleteChatHistory: () => ({ type: "chat/deleteChatHistory" }),
  loadConversationsLocally: () => ({ type: "chat/loadConversationsLocally" }),
  deleteConversationLocally: () => ({ type: "chat/deleteConversationLocally" }),
  setCurrentConversation: () => ({ type: "chat/setCurrentConversation" }),
}));

import { ChatLayout } from "./ChatLayout";

function openProfileMenu() {
  // The profile button is the last button inside the sidebar profile section
  fireEvent.click(screen.getByRole("button", { name: /Alice/i }));
}

function renderLayout(pathname = "/chat") {
  mockPathname.mockReturnValue(pathname);
  return render(<ChatLayout><div>content</div></ChatLayout>);
}

describe("ChatLayout active navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks New Chat button with aria-current='page' when on /chat", () => {
    renderLayout("/chat");
    expect(screen.getByRole("button", { name: /New Chat/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marks New Chat button with aria-current='page' on a nested /chat/:id route", () => {
    renderLayout("/chat/abc-123");
    expect(screen.getByRole("button", { name: /New Chat/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("does not set aria-current on New Chat when on a non-chat route", () => {
    renderLayout("/settings");
    expect(
      screen.getByRole("button", { name: /New Chat/i }),
    ).not.toHaveAttribute("aria-current");
  });

  describe("profile menu items", () => {
    it("marks Settings as active when on /settings", () => {
      renderLayout("/settings");
      openProfileMenu();
      expect(screen.getByRole("button", { name: "Settings" })).toHaveAttribute(
        "aria-current",
        "page",
      );
      expect(screen.getByRole("button", { name: "Dashboard" })).not.toHaveAttribute(
        "aria-current",
      );
    });

    it("marks Settings as active on a nested /settings/profile route", () => {
      renderLayout("/settings/profile");
      openProfileMenu();
      expect(screen.getByRole("button", { name: "Settings" })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });

    it("marks Dashboard as active when on /dashboard", () => {
      renderLayout("/dashboard");
      openProfileMenu();
      expect(screen.getByRole("button", { name: "Dashboard" })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });

    it("marks no profile item when on /chat", () => {
      renderLayout("/chat");
      openProfileMenu();
      expect(screen.getByRole("button", { name: "Dashboard" })).not.toHaveAttribute(
        "aria-current",
      );
      expect(screen.getByRole("button", { name: "Settings" })).not.toHaveAttribute(
        "aria-current",
      );
      expect(screen.getByRole("button", { name: "Contacts" })).not.toHaveAttribute(
        "aria-current",
      );
    });
  });
});
