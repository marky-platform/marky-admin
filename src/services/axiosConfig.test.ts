import axios from "axios";
import { useSessionStore } from "../stores/sessionStore";

type Handler = (error: any) => Promise<any>;
// `var` (no let/const): el import de axiosConfig se ejecuta antes de estas
// líneas y necesita que ya existan (hoisting).
// eslint-disable-next-line no-var
var responseErrorHandler: Handler;
// eslint-disable-next-line no-var
var mockApiCall: jest.Mock;
// eslint-disable-next-line no-var
var requestHandler: (config: any) => any;

jest.mock("axios", () => {
  mockApiCall = jest.fn();
  const api: any = (...args: any[]) => mockApiCall(...args);
  api.interceptors = {
    request: {
      use: jest.fn((ok: (config: any) => any) => {
        requestHandler = ok;
      }),
    },
    response: {
      use: jest.fn((_ok: unknown, err: Handler) => {
        responseErrorHandler = err;
      }),
    },
  };
  return {
    __esModule: true,
    default: { create: jest.fn(() => api), post: jest.fn() },
  };
});
jest.mock("../utils/utils", () => ({ ShowNotification: jest.fn() }));

// Importar DESPUÉS de los mocks para que el interceptor quede registrado.
// eslint-disable-next-line import/first
import "./axiosConfig";

const mockedPost = axios.post as jest.Mock;

const http = (status: number) => ({ response: { status, data: {} } });
const request401 = () => ({
  config: { url: "/products/", headers: {} as Record<string, string> },
  response: { status: 401, data: {} },
});

// Simula que OTRA pestaña escribió tokens nuevos en localStorage sin que
// el store en memoria de esta pestaña se entere.
function persistFromOtherTab(refreshToken: string) {
  localStorage.setItem(
    "session-storage",
    JSON.stringify({
      state: { accessToken: "a-other", refreshToken, user: null },
      version: 0,
    }),
  );
}

describe("response interceptor: refresh", () => {
  beforeEach(() => {
    mockedPost.mockReset();
    mockApiCall.mockReset();
    mockApiCall.mockResolvedValue({ data: "ok" });
    useSessionStore.getState().setSession({
      accessToken: "old-access",
      refreshToken: "refresh-mem",
      user: null,
    });
  });

  it("sends the refresh token persisted by another tab, not the stale in-memory one", async () => {
    persistFromOtherTab("refresh-from-tab-A");
    mockedPost.mockResolvedValueOnce({
      data: { access: "new-access", refresh: "refresh-new" },
    });
    await responseErrorHandler(request401());
    expect(mockedPost).toHaveBeenCalledWith(
      expect.stringMatching(/\/users\/token\/refresh\/$/),
      { refresh: "refresh-from-tab-A" },
    );
  });

  it("retries once with the persisted token when refresh 401s and another tab rotated meanwhile", async () => {
    mockedPost.mockImplementationOnce(async () => {
      // Mientras el request vuela, otra pestaña rota el token.
      persistFromOtherTab("refresh-rotated-by-A");
      throw http(401);
    });
    mockedPost.mockResolvedValueOnce({
      data: { access: "new-access", refresh: "refresh-next" },
    });
    await responseErrorHandler(request401());
    expect(mockedPost).toHaveBeenCalledTimes(2);
    expect(mockedPost.mock.calls[1][1]).toEqual({
      refresh: "refresh-rotated-by-A",
    });
    expect(useSessionStore.getState().accessToken).toBe("new-access");
  });

  it("clears the session on a definitive 401 (persisted token unchanged)", async () => {
    mockedPost.mockRejectedValue(http(401));
    await expect(responseErrorHandler(request401())).rejects.toBeDefined();
    expect(mockedPost).toHaveBeenCalledTimes(1);
    expect(useSessionStore.getState().accessToken).toBeNull();
  });

  it("clears the session on a 400 from refresh", async () => {
    mockedPost.mockRejectedValue(http(400));
    await expect(responseErrorHandler(request401())).rejects.toBeDefined();
    expect(useSessionStore.getState().accessToken).toBeNull();
  });

  it.each([
    ["429", http(429), 429],
    ["5xx", http(503), 503],
    ["network error", { message: "Network Error" }, 401],
  ])(
    "keeps the session when refresh fails with %s",
    async (_label, refreshError, _status) => {
      mockedPost.mockRejectedValue(refreshError);
      await expect(responseErrorHandler(request401())).rejects.toMatchObject({
        status: 401,
      });
      expect(useSessionStore.getState().accessToken).toBe("old-access");
      expect(useSessionStore.getState().refreshToken).toBe("refresh-mem");
    },
  );
});

describe("request interceptor (contrato con el backend)", () => {
  beforeEach(() => {
    useSessionStore.getState().clearSession();
  });

  it("envía Accept-Language: es y el Bearer del store", () => {
    useSessionStore.getState().setSession({
      accessToken: "tok",
      refreshToken: "ref",
      user: null,
    });
    const config = requestHandler({ headers: {} });
    expect(config.headers.Authorization).toBe("Bearer tok");
    expect(config.headers["Accept-Language"]).toBe("es");
  });

  it("no envía Authorization sin sesión", () => {
    const config = requestHandler({ headers: {} });
    expect(config.headers.Authorization).toBeUndefined();
    expect(config.headers["Accept-Language"]).toBe("es");
  });
});

describe("response interceptor: login", () => {
  it("un 401 de /users/login/ no dispara refresh ni cierra la sesión", async () => {
    mockedPost.mockReset();
    useSessionStore.getState().setSession({
      accessToken: "a",
      refreshToken: "r",
      user: null,
    });
    await expect(
      responseErrorHandler({
        config: { url: "/users/login/", headers: {} },
        response: { status: 401, data: {} },
      }),
    ).rejects.toBeDefined();
    expect(mockedPost).not.toHaveBeenCalled();
    expect(useSessionStore.getState().accessToken).toBe("a");
  });
});
