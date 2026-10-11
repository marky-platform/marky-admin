import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import lightTheme from "../themes/light";
import NotificationsMenu from "./NotificationsMenu";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/notificationService";

// notificationService transitively imports axiosConfig -> axios, whose
// installed version ships ESM-only and breaks CRA's default Jest transform.
// Mock it out fully (no jest.requireActual), same reasoning as
// productGrid.test.tsx mocking productService.
jest.mock("../services/notificationService", () => ({
  getNotifications: jest.fn(),
  markNotificationRead: jest.fn(),
  markAllNotificationsRead: jest.fn(),
}));

const mockedGetNotifications = getNotifications as jest.Mock;
const mockedMarkRead = markNotificationRead as jest.Mock;
const mockedMarkAllRead = markAllNotificationsRead as jest.Mock;

const renderMenu = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter>
          <NotificationsMenu />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
};

describe("NotificationsMenu", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows the unread count badge without opening the menu", async () => {
    mockedGetNotifications.mockResolvedValue({
      count: 2,
      next: null,
      previous: null,
      unread_count: 2,
      results: [],
    });

    renderMenu();

    await screen.findByText("2");
  });

  it("renders the trigger in a 34x34 container", async () => {
    mockedGetNotifications.mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      unread_count: 0,
      results: [],
    });

    renderMenu();

    expect(screen.getByLabelText("notifications")).toHaveStyle({
      width: "34px",
      height: "34px",
    });
    await waitFor(() => expect(mockedGetNotifications).toHaveBeenCalled());
  });

  it("lists notifications when opened and marks one read on click", async () => {
    mockedGetNotifications.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      unread_count: 1,
      results: [
        {
          id: 10,
          title: "Promoción por finalizar",
          message: "Tu promoción termina hoy",
          link: "",
          createdAt: new Date().toISOString(),
          isRead: false,
          readAt: null,
        },
      ],
    });
    mockedMarkRead.mockResolvedValue({});

    renderMenu();

    fireEvent.click(screen.getByLabelText("notifications"));

    await screen.findByText("Promoción por finalizar");

    fireEvent.click(screen.getByText("Promoción por finalizar"));

    await waitFor(() => expect(mockedMarkRead).toHaveBeenCalled());
    expect(mockedMarkRead.mock.calls[0][0]).toBe(10);
  });

  it("shows an empty state when there are no notifications", async () => {
    mockedGetNotifications.mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      unread_count: 0,
      results: [],
    });

    renderMenu();

    fireEvent.click(screen.getByLabelText("notifications"));

    await screen.findByText("No tienes notificaciones.");
  });

  it("marks all as read when the action is clicked", async () => {
    mockedGetNotifications.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      unread_count: 1,
      results: [
        {
          id: 10,
          title: "Título",
          message: "Mensaje",
          link: "",
          createdAt: new Date().toISOString(),
          isRead: false,
          readAt: null,
        },
      ],
    });
    mockedMarkAllRead.mockResolvedValue({ updated: 1 });

    renderMenu();

    fireEvent.click(screen.getByLabelText("notifications"));

    await screen.findByText("Marcar todas como leídas");
    fireEvent.click(screen.getByText("Marcar todas como leídas"));

    await waitFor(() => expect(mockedMarkAllRead).toHaveBeenCalled());
  });
});
