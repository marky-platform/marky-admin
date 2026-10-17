import { act, renderHook } from "@testing-library/react";
import QRCode from "qrcode";
import { ShowNotification } from "../utils/utils";
import useProfileShareActions from "./useProfileShareActions";

jest.mock("qrcode", () => ({
  __esModule: true,
  default: { toDataURL: jest.fn() },
}));
jest.mock("../utils/utils", () => ({ ShowNotification: jest.fn() }));

const url = `${window.location.origin}/dulce-momento`;
const mockedToDataURL = QRCode.toDataURL as unknown as jest.Mock;

const setup = () => {
  const { result } = renderHook(() =>
    useProfileShareActions({
      businessId: "dulce-momento",
      businessName: "Dulce Momento",
    }),
  );
  const find = (text: string) =>
    result.current.find((item) => item.text === text)!;
  return { find };
};

const setNavigator = (props: Record<string, unknown>) => {
  Object.defineProperty(navigator, "share", {
    value: props.share,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(navigator, "clipboard", {
    value: props.clipboard,
    configurable: true,
    writable: true,
  });
};

afterEach(() => {
  jest.clearAllMocks();
  setNavigator({ share: undefined, clipboard: undefined });
});

describe("useProfileShareActions", () => {
  it("exposes share, copy and QR items with the QR label renamed", () => {
    const { find } = setup();
    expect(find("Compartir perfil")).toBeDefined();
    expect(find("Copiar URL del perfil")).toBeDefined();
    expect(find("Descargar código QR")).toBeDefined();
  });

  it("shares through the Web Share API when available", async () => {
    const share = jest.fn().mockResolvedValue(undefined);
    setNavigator({ share });
    const { find } = setup();

    await act(async () => find("Compartir perfil").onClick());

    expect(share).toHaveBeenCalledWith({
      title: "Dulce Momento",
      text: "Dulce Momento",
      url,
    });
  });

  it("ignores a user-cancelled share", async () => {
    const share = jest
      .fn()
      .mockRejectedValue(new DOMException("cancel", "AbortError"));
    const writeText = jest.fn();
    setNavigator({ share, clipboard: { writeText } });
    const { find } = setup();

    await act(async () => find("Compartir perfil").onClick());

    expect(writeText).not.toHaveBeenCalled();
    expect(ShowNotification).not.toHaveBeenCalled();
  });

  it("falls back to copying the link when share is unsupported", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    setNavigator({ clipboard: { writeText } });
    const { find } = setup();

    await act(async () => find("Compartir perfil").onClick());

    expect(writeText).toHaveBeenCalledWith(url);
    expect(ShowNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success" }),
    );
  });

  it("falls back to copying the link when share fails", async () => {
    const share = jest.fn().mockRejectedValue(new Error("boom"));
    const writeText = jest.fn().mockResolvedValue(undefined);
    setNavigator({ share, clipboard: { writeText } });
    const { find } = setup();

    await act(async () => find("Compartir perfil").onClick());

    expect(writeText).toHaveBeenCalledWith(url);
  });

  it("copies the link and confirms with a toast", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    setNavigator({ clipboard: { writeText } });
    const { find } = setup();

    await act(async () => find("Copiar URL del perfil").onClick());

    expect(writeText).toHaveBeenCalledWith(url);
    expect(ShowNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success" }),
    );
  });

  it("shows an error toast when the clipboard fails or is missing", async () => {
    setNavigator({
      clipboard: { writeText: jest.fn().mockRejectedValue(new Error("no")) },
    });
    const { find } = setup();
    await act(async () => find("Copiar URL del perfil").onClick());
    expect(ShowNotification).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: "error" }),
    );

    setNavigator({ clipboard: undefined });
    const second = setup();
    await act(async () => second.find("Copiar URL del perfil").onClick());
    expect(ShowNotification).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: "error" }),
    );
  });

  it("generates the QR from the canonical URL and downloads a PNG", async () => {
    mockedToDataURL.mockResolvedValue("data:image/png;base64,AAA");
    const click = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    let downloadName = "";
    let href = "";
    click.mockImplementation(function (this: HTMLAnchorElement) {
      downloadName = this.download;
      href = this.href;
    });
    const { find } = setup();

    await act(async () => find("Descargar código QR").onClick());

    expect(mockedToDataURL).toHaveBeenCalledWith(
      url,
      expect.objectContaining({ width: expect.any(Number) }),
    );
    expect(click).toHaveBeenCalledTimes(1);
    expect(downloadName).toBe("qr-dulce-momento.png");
    expect(href).toBe("data:image/png;base64,AAA");
    click.mockRestore();
  });

  it("shows an error toast when the QR cannot be generated", async () => {
    mockedToDataURL.mockRejectedValue(new Error("fail"));
    const { find } = setup();

    await act(async () => find("Descargar código QR").onClick());

    expect(ShowNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: "error" }),
    );
  });

  it("reports an error instead of acting when the business id is missing", async () => {
    const writeText = jest.fn();
    setNavigator({ clipboard: { writeText } });
    const { result } = renderHook(() =>
      useProfileShareActions({ businessId: undefined, businessName: "X" }),
    );

    await act(async () => result.current[1].onClick());

    expect(writeText).not.toHaveBeenCalled();
    expect(ShowNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: "error" }),
    );
  });
});
