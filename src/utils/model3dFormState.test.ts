import {
  removeGlb,
  removeUsdz,
  selectGlb,
  selectUsdz,
} from "./model3dFormState";

const glb = new File(["g"], "a.glb");
const usdz = new File(["u"], "a.usdz");
const saved = { id: 1, glbFile: "http://x/a.glb", usdzFile: "http://x/a.usdz" };

describe("model3dFormState", () => {
  it("selectGlb on empty creates a new model", () => {
    expect(selectGlb(null, glb)).toEqual({ glbFile: glb, usdzFile: null });
  });

  it("selectGlb replaces the GLB keeping id and USDZ", () => {
    expect(selectGlb(saved, glb)).toEqual({ ...saved, glbFile: glb, _delete: false });
  });

  it("selectGlb after pending delete reuses id and clears the old USDZ", () => {
    expect(selectGlb({ ...saved, _delete: true }, glb)).toEqual({
      id: 1,
      glbFile: glb,
      usdzFile: null,
      removeUsdz: true,
    });
    expect(
      selectGlb({ id: 1, glbFile: "x", usdzFile: null, _delete: true }, glb).removeUsdz,
    ).toBe(false);
  });

  it("selectUsdz sets the file and keeps id/GLB", () => {
    expect(selectUsdz(saved, usdz)).toEqual({
      id: 1,
      glbFile: saved.glbFile,
      usdzFile: usdz,
      removeUsdz: false,
    });
  });

  it("selectUsdz keeps a pending delete untouched", () => {
    const pending = { ...saved, _delete: true };
    expect(selectUsdz(pending, usdz)).toBe(pending);
  });

  it("removeGlb deletes saved models and clears new ones", () => {
    expect(removeGlb(saved)).toEqual({ ...saved, _delete: true });
    expect(removeGlb({ glbFile: glb })).toBeNull();
  });

  it("removeUsdz of a saved model sets removeUsdz", () => {
    expect(removeUsdz(saved)).toMatchObject({ id: 1, usdzFile: null, removeUsdz: true });
  });

  it("removeUsdz after replacing the stored USDZ still sets removeUsdz", () => {
    const replaced = selectUsdz(saved, usdz);
    expect(removeUsdz(replaced)).toMatchObject({ id: 1, usdzFile: null, removeUsdz: true });
  });

  it("removeUsdz of a new model does not set removeUsdz", () => {
    expect(removeUsdz({ glbFile: glb, usdzFile: usdz })).toMatchObject({
      usdzFile: null,
      removeUsdz: false,
    });
  });
});
