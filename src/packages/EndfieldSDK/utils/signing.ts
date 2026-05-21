import crypto from "node:crypto";

type ComputeSignParams = {
  token: string;
  path: string;
  body: string;
  timestamp: number;
};

export function computeSign({ token, path, body, timestamp }: ComputeSignParams) {
  const headers = JSON.stringify({
    platform: "3",
    timestamp: timestamp,
    dId: "",
    vName: "1.0.0",
  });

  const signString = `${path}${body}${timestamp}${headers}`;
  const hmac = crypto.createHmac("sha256", token).update(signString).digest("hex");
  return crypto.createHash("md5").update(hmac).digest("hex");
}
