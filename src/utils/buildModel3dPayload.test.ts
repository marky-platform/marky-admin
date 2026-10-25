import { buildModel3dPayload } from "./buildModel3dPayload";
import { objectToFormData } from "./formData";

const glb = new File(["glTF"], "a.glb");
const usdz = new File(["PK"], "a.usdz");

describe("buildModel3dPayload", () => {
  it("omits the key when there is no model or it is unchanged", () => {
    expect(buildModel3dPayload(null)).toBeUndefined();
    expect(buildModel3dPayload(undefined)).toBeUndefined();
    expect(
      buildModel3dPayload({ id: 1, glbFile: "http://x/a.glb", usdzFile: "http://x/a.usdz" }),
    ).toBeUndefined();
  });

  it("sends new GLB and USDZ files for an added model", () => {
    expect(buildModel3dPayload({ glbFile: glb, usdzFile: usdz })).toEqual({
      glbFile: glb,
      usdzFile: usdz,
    });
  });

  it("sends only the replaced GLB and never URL strings", () => {
    const payload = buildModel3dPayload({
      id: 1,
      glbFile: glb,
      usdzFile: "http://x/a.usdz",
    });
    expect(payload).toEqual({ glbFile: glb });
  });

  it("sends removeUsdz for an existing model", () => {
    expect(
      buildModel3dPayload({ id: 1, glbFile: "http://x/a.glb", usdzFile: null, removeUsdz: true }),
    ).toEqual({ removeUsdz: true });
  });

  it("prefers a new USDZ over removeUsdz", () => {
    expect(
      buildModel3dPayload({ id: 1, glbFile: "u", usdzFile: usdz, removeUsdz: true }),
    ).toEqual({ usdzFile: usdz });
  });

  it("sends only _delete for an existing model being deleted", () => {
    expect(
      buildModel3dPayload({ id: 1, glbFile: glb, _delete: true }),
    ).toEqual({ _delete: true });
  });

  it("omits a deleted model that was never saved", () => {
    expect(buildModel3dPayload({ glbFile: glb, _delete: true })).toBeUndefined();
  });

  it("serializes to the backend's bracket keys", () => {
    const fd = objectToFormData({
      model_3d: { glbFile: glb, removeUsdz: true },
    });
    expect(fd.get("model_3d[glb_file]")).toBeInstanceOf(File);
    expect(fd.get("model_3d[remove_usdz]")).toBe("true");
    const del = objectToFormData({ model_3d: { _delete: true } });
    expect(del.get("model_3d[_delete]")).toBe("true");
  });
});
