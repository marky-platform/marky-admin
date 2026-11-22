import { categoryPromotionValidationSchema as schema } from "./categoryPromotionSchema";
import { toIsoDateTime, splitIsoDateTime } from "./promotionForm";

const base = {
  isPromotionActive: true,
  promotionOption: "descuento",
  discountPercentage: 10,
  multibuyOption: "",
  countdownActive: true,
  promotionDateStart: "2026-08-15",
  promotionTimeStart: "10:00",
  promotionDateEnd: "2026-08-16",
  promotionTimeEnd: "10:00",
};

describe("categoryPromotionValidationSchema fecha-valida", () => {
  it("acepta un rango válido", async () => {
    await expect(schema.isValid(base)).resolves.toBe(true);
  });

  it("rechaza fin anterior al inicio", async () => {
    await expect(
      schema.isValid({ ...base, promotionDateEnd: "2026-08-14" }),
    ).resolves.toBe(false);
  });

  it.each([
    ["fecha de inicio inválida", { promotionDateStart: "2026-13-45" }],
    ["hora de fin inválida", { promotionTimeEnd: "25:99" }],
    ["fecha de fin inválida", { promotionDateEnd: "not-a-date" }],
  ])("rechaza %s", async (_label, override) => {
    await expect(schema.isValid({ ...base, ...override })).resolves.toBe(
      false,
    );
  });

  it("no valida fechas si la cuenta regresiva está apagada", async () => {
    await expect(
      schema.isValid({
        ...base,
        countdownActive: false,
        promotionDateStart: "2026-13-45",
      }),
    ).resolves.toBe(true);
  });
});

describe("toIsoDateTime con fecha inválida", () => {
  it("devuelve null en lugar de lanzar RangeError", () => {
    expect(() => toIsoDateTime("2026-13-45", "10:00")).not.toThrow();
    expect(toIsoDateTime("2026-13-45", "10:00")).toBeNull();
    expect(toIsoDateTime("2026-08-15", "25:99")).toBeNull();
  });
});

describe("splitIsoDateTime con offset del servidor (America/Asuncion, -03:00)", () => {
  // La zona se fija al arrancar el proceso (`TZ=America/Asuncion` en el script "test" de
  // package.json): cambiar process.env.TZ dentro de Jest no afecta al reloj del runner.
  it("lee el offset -03:00 sin desplazar el día cuando el navegador está en Asunción", () => {
    // Sanity: el runner realmente adoptó la zona (UTC-3 en enero 2026, DST de Paraguay).
    expect(new Date("2026-01-10T12:00:00Z").getHours()).toBe(9);
    expect(splitIsoDateTime("2026-01-10T00:30:00-03:00")).toEqual({
      date: "2026-01-10",
      time: "00:30",
    });
    expect(splitIsoDateTime("2026-01-09T23:30:00-03:00")).toEqual({
      date: "2026-01-09",
      time: "23:30",
    });
  });

  it("es la misma conversión local que el instante (determinista, cualquier zona)", () => {
    const iso = "2026-01-10T00:30:00-03:00";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    expect(splitIsoDateTime(iso)).toEqual({
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    });
  });
});
