import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import lightTheme from "../../../../themes/light";
import { ChannelWizardModal } from "./ChannelWizardModal";
import { useSessionStore } from "../../../../stores/sessionStore";
import {
  updateSocialMediaLinks,
  getBusinessAccountInfo,
  SocialLink,
} from "../../../../services/businessService";
import { mapSocialLinksToChannels } from "../../../../mappers/channelMapper";

// businessService transitively imports axiosConfig -> axios, whose installed
// version ships ESM-only and breaks CRA's default Jest transform, same
// reasoning as productGrid.test.tsx mocking productService/businessService.
// Jest hoists this above the imports above at runtime regardless of source
// order, so the mock is in place before ChannelWizardModal.tsx ever imports it.
jest.mock("../../../../services/businessService", () => ({
  updateSocialMediaLinks: jest.fn(),
  getBusinessAccountInfo: jest.fn(),
}));

const mockedGetBusinessAccountInfo = getBusinessAccountInfo as jest.Mock;
const mockedUpdateSocialMediaLinks = updateSocialMediaLinks as jest.Mock;

const renderModal = (
  props: Partial<React.ComponentProps<typeof ChannelWizardModal>> = {},
) => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={lightTheme}>
        <ChannelWizardModal open onClose={() => {}} {...props} />
      </ThemeProvider>
    </QueryClientProvider>,
  );
};

describe("ChannelWizardModal", () => {
  beforeEach(() => {
    mockedUpdateSocialMediaLinks.mockResolvedValue({ social_links: [] });
    useSessionStore.setState({
      user: {
        id: 1,
        username: "biz",
        email: "biz@test.com",
        has_configuration: true,
        phone_number: "595911111111", // stale value set at login
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    useSessionStore.setState({ user: null });
  });

  it("prefills WhatsApp with the current phone number from the account info query, not the stale session value", async () => {
    mockedGetBusinessAccountInfo.mockResolvedValue({
      phone_number: "595922222222", // updated later in Account settings
    });

    renderModal();

    await waitFor(() => {
      expect(mockedGetBusinessAccountInfo).toHaveBeenCalled();
    });

    // Walk the wizard: welcome -> select "WhatsApp" -> hub -> detail.
    fireEvent.click(screen.getByText("Configurar canales"));
    fireEvent.click(screen.getByText("WhatsApp"));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(await screen.findByText("WhatsApp"));

    const whatsappInput = (await screen.findByPlaceholderText(
      "Ingrese su número",
    )) as HTMLInputElement;

    await waitFor(() => {
      expect(whatsappInput.value.replace(/\D/g, "")).toContain("922222222");
    });
    expect(whatsappInput.value.replace(/\D/g, "")).not.toContain("911111111");
  });

  it("redisplays a saved enlace URL without the https:// prefix, matching the placeholder format", async () => {
    mockedGetBusinessAccountInfo.mockResolvedValue({ phone_number: "" });

    const links: SocialLink[] = [
      {
        id: 1,
        platform: "link",
        platform_display: "Enlaces",
        label: "Mi sitio",
        url: "https://www.sitio.com",
        order: 0,
      },
    ];

    renderModal({ initialData: mapSocialLinksToChannels(links) });

    // Jumps straight to the hub since there's already configured data.
    // Enlaces is multi-entry, so the hub shows a count, not the raw URL.
    expect(await screen.findByText("1/3 añadidos")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Enlaces"));

    const linkInput = (await screen.findByPlaceholderText(
      "www.sitio.com",
    )) as HTMLInputElement;
    expect(linkInput.value).toBe("www.sitio.com");
  });

  it("caps channel selection at 3 and shows the running count", async () => {
    mockedGetBusinessAccountInfo.mockResolvedValue({ phone_number: "" });
    renderModal();

    fireEvent.click(screen.getByText("Configurar canales"));
    expect(screen.getByText("0/3 seleccionados")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Instagram"));
    fireEvent.click(screen.getByText("Facebook"));
    fireEvent.click(screen.getByText("TikTok"));
    expect(screen.getByText("3/3 seleccionados")).toBeInTheDocument();

    // WhatsApp button is now disabled at the cap.
    expect(screen.getByRole("button", { name: /WhatsApp/ })).toBeDisabled();
  });

  it("caps WhatsApp entries at 3, disables adding more, and allows removing one", async () => {
    mockedGetBusinessAccountInfo.mockResolvedValue({ phone_number: "" });
    renderModal();

    fireEvent.click(screen.getByText("Configurar canales"));
    fireEvent.click(screen.getByText("WhatsApp"));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(await screen.findByText("WhatsApp"));

    expect(await screen.findByText("1/3 añadidos")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Añadir otro número"));
    fireEvent.click(screen.getByText("Añadir otro número"));
    expect(screen.getByText("3/3 añadidos")).toBeInTheDocument();
    expect(screen.getByText("Añadir otro número")).toBeDisabled();
    expect(
      screen.getByText("Has alcanzado el máximo de 3 números"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Eliminar número 2"));
    expect(screen.getByText("2/3 añadidos")).toBeInTheDocument();
    expect(screen.getByText("Añadir otro número")).not.toBeDisabled();
  });

  it("shows an inline error and blocks navigation when two WhatsApp entries share the same number", async () => {
    mockedGetBusinessAccountInfo.mockResolvedValue({ phone_number: "" });
    renderModal();

    fireEvent.click(screen.getByText("Configurar canales"));
    fireEvent.click(screen.getByText("WhatsApp"));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(await screen.findByText("WhatsApp"));

    fireEvent.click(screen.getByText("Añadir otro número"));

    const nameInputs = (await screen.findAllByPlaceholderText(
      /Nombre para número/,
    )) as HTMLInputElement[];
    fireEvent.change(nameInputs[0], { target: { value: "Pedidos" } });
    fireEvent.change(nameInputs[1], { target: { value: "Atención" } });

    const phoneInputs = screen.getAllByPlaceholderText("Ingrese su número");
    fireEvent.change(phoneInputs[0], { target: { value: "595911111111" } });
    fireEvent.change(phoneInputs[1], { target: { value: "595911111111" } });

    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(
      await screen.findByText(/Hay una entrada duplicada/),
    ).toBeInTheDocument();
    // Still stuck on the detail step: the hub's "Finalizar" isn't rendered.
    expect(
      screen.queryByRole("button", { name: "Finalizar" }),
    ).not.toBeInTheDocument();
  });

  it("warns before discarding unsaved changes, and only closes once the user confirms", async () => {
    mockedGetBusinessAccountInfo.mockResolvedValue({ phone_number: "" });
    const onClose = jest.fn();
    renderModal({ onClose });

    fireEvent.click(screen.getByText("Configurar canales"));
    fireEvent.click(screen.getByText("Enlaces"));

    // Closing with an unsaved selection prompts instead of closing outright.
    fireEvent.click(screen.getByLabelText("Cerrar"));
    expect(
      await screen.findByText("¿Salir sin guardar los cambios?"),
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();

    // "Seguir editando" dismisses the prompt and keeps the wizard open.
    fireEvent.click(screen.getByRole("button", { name: "Seguir editando" }));
    await waitFor(() => {
      expect(
        screen.queryByText("¿Salir sin guardar los cambios?"),
      ).not.toBeInTheDocument();
    });
    expect(onClose).not.toHaveBeenCalled();

    // Confirming discards the changes and actually closes the modal.
    fireEvent.click(screen.getByLabelText("Cerrar"));
    fireEvent.click(
      await screen.findByRole("button", { name: "Salir sin guardar" }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes immediately, with no warning, when there are no unsaved changes", async () => {
    mockedGetBusinessAccountInfo.mockResolvedValue({ phone_number: "" });
    const onClose = jest.fn();
    renderModal({ onClose });

    fireEvent.click(screen.getByLabelText("Cerrar"));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByText("¿Salir sin guardar los cambios?"),
    ).not.toBeInTheDocument();
  });

  it("navigates hub -> detail -> hub, and sends the mapped payload on Finalizar", async () => {
    mockedGetBusinessAccountInfo.mockResolvedValue({
      phone_number: "595922222222",
    });
    renderModal();

    await waitFor(() => {
      expect(mockedGetBusinessAccountInfo).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText("Configurar canales"));
    fireEvent.click(screen.getByText("Instagram"));
    fireEvent.click(screen.getByText("WhatsApp"));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    // Hub: configure Instagram.
    fireEvent.click(await screen.findByText("Instagram"));
    const instagramInput = (await screen.findByPlaceholderText(
      "usuario",
    )) as HTMLInputElement;
    fireEvent.change(instagramInput, { target: { value: "dulce_momento" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    // Back at the hub, the row now shows the username.
    expect(await screen.findByText("@dulce_momento")).toBeInTheDocument();

    // Configure WhatsApp's name (the number is already prefilled).
    fireEvent.click(screen.getByText("WhatsApp"));
    const nameInput = (await screen.findByPlaceholderText(
      "Nombre para número 1",
    )) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Pedidos" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    // "Guardar" validates asynchronously before navigating back to the hub.
    fireEvent.click(await screen.findByRole("button", { name: "Finalizar" }));

    await waitFor(() => {
      expect(mockedUpdateSocialMediaLinks).toHaveBeenCalled();
    });
    expect(mockedUpdateSocialMediaLinks.mock.calls[0][0]).toEqual({
      channels: [
        {
          platform: "instagram",
          label: "",
          url: "https://www.instagram.com/dulce_momento",
        },
        { platform: "whatsapp", label: "Pedidos", url: "595922222222" },
      ],
    });
  });
});
