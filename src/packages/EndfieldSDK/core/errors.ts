/** Error thrown when a Gryphline AS (`as.gryphline.com`) request fails. */
export class GryphlineError extends Error {
  readonly status: number;
  readonly type: string;

  constructor({ msg, status, type }: { msg: string; status: number; type: string }) {
    super(msg);
    this.name = "GryphlineError";
    this.status = status;
    this.type = type;
  }
}

/** Error thrown when a Skport Zonai (`zonai.skport.com`) request fails. */
export class SkportError extends Error {
  readonly code: number;
  readonly timestamp: number;

  constructor({ message, code, timestamp }: { message: string; code: number; timestamp: number }) {
    super(message);
    this.name = "SkportError";
    this.code = code;
    this.timestamp = timestamp;
  }
}
