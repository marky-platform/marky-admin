import {
  isModel3dValid,
  MAX_MODEL_3D_SIZE_BYTES,
  validateModel3dFile,
} from "./model3dValidation";

const file = (name: string, size = 10) => {
  const f = new File(["x"], name);
  Object.defineProperty(f, "size", { value: size });
  return f;
};

describe("validateModel3dFile", () => {
  it("accepts valid GLB and USDZ files", () => {
    expect(validateModel3dFile(file("a.glb"), "glb")).toBeNull();
    expect(validateModel3dFile(file("A.USDZ"), "usdz")).toBeNull();
  });

  it("rejects a wrong extension", () => {
    expect(validateModel3dFile(file("a.obj"), "glb")).toMatch(/Formato no permitido/);
    expect(validateModel3dFile(file("a.glb"), "usdz")).toMatch(/USDZ/);
  });

  it("rejects files over 25MB", () => {
    const big = file("a.glb", MAX_MODEL_3D_SIZE_BYTES + 1);
    expect(validateModel3dFile(big, "glb")).toMatch(/Máximo permitido: 25MB/);
    expect(
      validateModel3dFile(file("a.glb", MAX_MODEL_3D_SIZE_BYTES), "glb"),
    ).toBeNull();
  });
});

describe("isModel3dValid", () => {
  it("requires a GLB unless there is no model or it is deleted", () => {
    expect(isModel3dValid(null)).toBe(true);
    expect(isModel3dValid({ glbFile: null, usdzFile: file("a.usdz") })).toBe(false);
    expect(isModel3dValid({ id: 1, glbFile: null, _delete: true })).toBe(true);
    expect(isModel3dValid({ glbFile: "http://x/a.glb" })).toBe(true);
  });
});
