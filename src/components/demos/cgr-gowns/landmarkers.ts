import { getModelBytes, getPoseModelBytes, getWearFileset } from "./mediapipe-warm";

type Lm = { x: number; y: number; z: number; visibility?: number };
export type PoseTracker = {
  detectForVideo: (v: HTMLVideoElement, t: number) => { landmarks: Lm[][] };
  close: () => void;
};
export type FaceTracker = {
  detectForVideo: (v: HTMLVideoElement, t: number) => { faceLandmarks: Lm[][] };
  close: () => void;
};

/** Both trackers run on this device (GPU, else CPU) from the one self-hosted wasm download. */
const fileset = getWearFileset;

export async function createPoseTracker(): Promise<PoseTracker> {
  const [{ PoseLandmarker }, model, fs] = await Promise.all([
    import("@mediapipe/tasks-vision"),
    getPoseModelBytes(),
    fileset(),
  ]);
  const make = (delegate: "GPU" | "CPU") =>
    PoseLandmarker.createFromOptions(fs, {
      baseOptions: { modelAssetBuffer: model, delegate },
      runningMode: "VIDEO",
      numPoses: 1,
      // No segmentation mask: the arm-in-front test uses the landmarks only.
      outputSegmentationMasks: false,
    });
  try {
    return (await make("GPU")) as unknown as PoseTracker;
  } catch {
    return (await make("CPU")) as unknown as PoseTracker;
  }
}

export async function createFaceTracker(): Promise<FaceTracker> {
  const [{ FaceLandmarker }, model, fs] = await Promise.all([
    import("@mediapipe/tasks-vision"),
    getModelBytes(),
    fileset(),
  ]);
  const make = (delegate: "GPU" | "CPU") =>
    FaceLandmarker.createFromOptions(fs, {
      baseOptions: { modelAssetBuffer: model, delegate },
      runningMode: "VIDEO",
      numFaces: 1,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
    });
  try {
    return (await make("GPU")) as unknown as FaceTracker;
  } catch {
    return (await make("CPU")) as unknown as FaceTracker;
  }
}
