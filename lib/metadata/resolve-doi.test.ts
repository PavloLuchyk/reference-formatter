// Tests for the lookup and outcome requirements of openspec/changes/doi-resolution/specs/doi-resolution/spec.md.
// Crossref is replaced by a fake fetch that answers with recorded fixtures; no test touches the network.
import { afterEach, describe, expect, test, vi } from "vitest";
import { fixtureBody, fixtureText } from "@/lib/metadata/crossref/__fixtures__/load";
import type { ResolutionOutcome } from "@/lib/metadata/resolution";
import { resolveDoi } from "@/lib/metadata/resolve-doi";

const APP_NAME = "ReferenceFormatter";
const NATURE = "10.1038/nature12373";

type FetchArgs = [input: RequestInfo | URL, init?: RequestInit];

const answering = (status: number, body: string, contentType = "application/json") =>
  vi.fn(async (...args: FetchArgs) => {
    void args;
    return new Response(body, { status, headers: { "content-type": contentType } });
  });

const answeringFixture = (file: string) => answering(200, fixtureText(file));
const answeringNotFound = (file: string) => answering(404, fixtureText(file), "text/plain");
const failingToConnect = () =>
  vi.fn(async (...args: FetchArgs): Promise<Response> => {
    void args;
    throw new TypeError("fetch failed");
  });

const withMessage = (file: string, change: (message: Record<string, unknown>) => void) => {
  const body = fixtureBody(file);
  change(body.message);
  return answering(200, JSON.stringify(body));
};

type FakeFetch = ReturnType<typeof answering>;

const resolve = (input: string, fetchFake: FakeFetch, contactEmail?: string) =>
  resolveDoi(input, { fetch: fetchFake as unknown as typeof fetch, appName: APP_NAME, contactEmail });

const requestsTo = (fetchFake: FakeFetch) => fetchFake.mock.calls.map(([input, init]) => new Request(input, init));

// Everything a request can carry an address in: the URL and every header.
const visibleText = (request: Request) =>
  decodeURIComponent([request.url, ...[...request.headers].map(([name, value]) => `${name}: ${value}`)].join("\n"));

const failure = (kind: string) => ({ ok: false, failure: { kind } });

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// Simulates the passage of time without prescribing how the implementation measures it:
// fake timers cover a hand-rolled timer, and AbortSignal.timeout is replaced by a stand-in driven by the same clock.
const simulateTime = () => {
  vi.useFakeTimers();
  vi.spyOn(AbortSignal, "timeout").mockImplementation((milliseconds: number) => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(new DOMException("The operation timed out.", "TimeoutError")), milliseconds);
    return controller.signal;
  });
};

describe("Resolution has exactly one outcome", () => {
  test("Journal article is resolved", async () => {
    const outcome = await resolve(NATURE, answeringFixture("nature12373.json"));

    expect(outcome.ok).toBe(true);
    expect(outcome).toHaveProperty("publication.doi", "10.1038/nature12373");
    expect(outcome).not.toHaveProperty("failure");
  });

  test("Failure carries no publication", async () => {
    const outcomes = [
      await resolve("not a doi", answeringFixture("nature12373.json")),
      await resolve(NATURE, answeringNotFound("not-found-unknown.txt")),
      await resolve("10.1007/978-3-319-24277-4", answeringFixture("book.json")),
      await resolve(NATURE, failingToConnect()),
      await resolve(NATURE, answering(200, "<html>not json</html>", "text/html")),
    ];

    expect(outcomes.map((outcome) => (outcome.ok ? "publication" : outcome.failure.kind))).toEqual([
      "invalid-input",
      "not-found",
      "unsupported-type",
      "provider-unavailable",
      "invalid-response",
    ]);
    for (const outcome of outcomes) {
      expect(Object.keys(outcome).sort()).toEqual(["failure", "ok"]);
    }
  });
});

describe("Invalid input is rejected before lookup", () => {
  test("Input is not a DOI", async () => {
    const fetchFake = answeringFixture("nature12373.json");

    expect(await resolve("not a doi", fetchFake)).toEqual(failure("invalid-input"));
    expect(fetchFake).not.toHaveBeenCalled();
  });

  test("Input form that is not accepted", async () => {
    const fetchFake = answeringFixture("nature12373.json");

    expect(await resolve("http://dx.doi.org/10.1038/nature12373", fetchFake)).toEqual(failure("invalid-input"));
    expect(fetchFake).not.toHaveBeenCalled();
  });
});

describe("Crossref is the only metadata source", () => {
  test("Lookup uses the canonical DOI", async () => {
    const fetchFake = answeringFixture("nature12373.json");

    await resolve("https://doi.org/10.1038/NATURE12373", fetchFake);

    const [request, ...others] = requestsTo(fetchFake);
    const url = new URL(request.url);
    expect(others).toEqual([]);
    expect(request.method).toBe("GET");
    expect(url.origin).toBe("https://api.crossref.org");
    expect(decodeURIComponent(url.pathname)).toBe("/works/10.1038/nature12373");
  });

  test("No fallback", async () => {
    for (const fetchFake of [answeringNotFound("not-found-unknown.txt"), failingToConnect()]) {
      await resolve(NATURE, fetchFake);

      const hosts = requestsTo(fetchFake).map((request) => new URL(request.url).host);
      expect(hosts).toEqual(["api.crossref.org"]);
    }
  });
});

describe("Unknown DOI", () => {
  test("DOI that does not exist", async () => {
    const outcome = await resolve("10.1234/this-doi-does-not-exist-xyz", answeringNotFound("not-found-unknown.txt"));

    expect(outcome).toEqual(failure("not-found"));
  });

  test("DOI registered with another agency", async () => {
    const outcome = await resolve("10.5281/zenodo.3233118", answeringNotFound("not-found-datacite.txt"));

    expect(outcome).toEqual(failure("not-found"));
  });
});

describe("Only journal articles are resolved", () => {
  test("Book", async () => {
    const outcome = await resolve("10.1007/978-3-319-24277-4", answeringFixture("book.json"));

    expect(outcome).toEqual({ ok: false, failure: { kind: "unsupported-type", type: "book" } });
  });

  test("Record without a type", async () => {
    const fetchFake = withMessage("nature12373.json", (message) => {
      delete message.type;
    });

    const outcome = await resolve(NATURE, fetchFake);

    expect(outcome).toMatchObject(failure("unsupported-type"));
    expect(outcome).not.toHaveProperty("publication");
  });
});

describe("Provider unavailability", () => {
  test("Network error", async () => {
    const fetchFake = failingToConnect();

    expect(await resolve(NATURE, fetchFake)).toEqual(failure("provider-unavailable"));
    expect(fetchFake).toHaveBeenCalledTimes(1);
  });

  test("Timeout", async () => {
    simulateTime();
    // Crossref never answers; the request ends only if the caller abandons it, as a real fetch does on abort.
    const fetchFake = vi.fn(
      (...[, init]: FetchArgs) =>
        new Promise<Response>((_resolve, reject) => {
          const signal = init?.signal;
          signal?.addEventListener("abort", () => reject(signal.reason));
        }),
    );
    let outcome: ResolutionOutcome | undefined;
    let thrown: unknown;
    const settled = resolve(NATURE, fetchFake).then(
      (value) => {
        outcome = value;
      },
      (error: unknown) => {
        thrown = error;
      },
    );

    await vi.advanceTimersByTimeAsync(9_999);
    if (thrown) throw thrown;
    expect(outcome).toBeUndefined();

    await vi.advanceTimersByTimeAsync(1);
    await settled;
    if (thrown) throw thrown;

    expect(outcome).toEqual(failure("provider-unavailable"));
    expect(fetchFake).toHaveBeenCalledTimes(1);
    expect(fetchFake.mock.calls[0][1]?.signal?.aborted).toBe(true);
  });

  test("Rate limited", async () => {
    const fetchFake = answering(429, "Too many requests", "text/plain");

    expect(await resolve(NATURE, fetchFake)).toEqual(failure("provider-unavailable"));
    expect(fetchFake).toHaveBeenCalledTimes(1);
  });

  test("Server error", async () => {
    const fetchFake = answering(503, "Service unavailable", "text/plain");

    expect(await resolve(NATURE, fetchFake)).toEqual(failure("provider-unavailable"));
    expect(fetchFake).toHaveBeenCalledTimes(1);
  });

  // Checker finding F2: only 503 was tested, so narrowing "any 5xx" went unnoticed.
  test.each([500, 502, 504])("Other server errors: HTTP %i", async (status) => {
    const fetchFake = answering(status, "Server error", "text/plain");

    expect(await resolve(NATURE, fetchFake)).toEqual(failure("provider-unavailable"));
    expect(fetchFake).toHaveBeenCalledTimes(1);
  });
});

describe("Unusable response", () => {
  test("Body is not JSON", async () => {
    const outcome = await resolve(NATURE, answering(200, "<html>not json</html>", "text/html"));

    expect(outcome).toEqual(failure("invalid-response"));
  });

  test("Body is not a work record", async () => {
    const bodies = [
      JSON.stringify({ status: "ok", "message-type": "work-list", message: { items: [] } }),
      JSON.stringify({ status: "ok" }),
      JSON.stringify([]),
      "null",
    ];

    for (const body of bodies) {
      expect(await resolve(NATURE, answering(200, body))).toEqual(failure("invalid-response"));
    }
  });

  test("Unexpected status", async () => {
    const outcome = await resolve(NATURE, answering(400, "Bad request", "text/plain"));

    expect(outcome).toEqual(failure("invalid-response"));
  });
});

describe("Publication DOI is the normalized requested DOI", () => {
  test("Record states the same DOI", async () => {
    const outcome = await resolve("10.1038/NATURE12373", answeringFixture("nature12373.json"));

    expect(outcome).toHaveProperty("publication.doi", "10.1038/nature12373");
  });

  test("The typed text is not kept in the Publication", async () => {
    const outcome = await resolve(" DOI:10.1038/NATURE12373 ", answeringFixture("nature12373.json"));

    expect(outcome).toHaveProperty("publication.doi", "10.1038/nature12373");
    expect(JSON.stringify(outcome)).not.toContain("NATURE12373");
    expect(JSON.stringify(outcome)).not.toContain("DOI:");
  });
});

// Checker finding F1. The scenario "Record states a different DOI" used to expect the requested DOI to be kept;
// the human reversed that on 2026-10-05: a record for another DOI is never used.
describe("Record must be for the requested DOI", () => {
  test("Record states the DOI in another letter case", async () => {
    const fetchFake = withMessage("nature12373.json", (message) => {
      message.DOI = "10.1038/NATURE12373";
    });

    const outcome = await resolve(NATURE, fetchFake);

    expect(outcome).toHaveProperty("publication.doi", "10.1038/nature12373");
    expect(outcome).toHaveProperty("publication.title", "Nanometre-scale thermometry in a living cell");
  });

  test("Record states a different DOI", async () => {
    const fetchFake = withMessage("nature12373.json", (message) => {
      message.DOI = "10.9999/another-doi";
    });

    const outcome = await resolve(NATURE, fetchFake);

    expect(outcome).toEqual(failure("invalid-response"));
    expect(JSON.stringify(outcome)).not.toContain("Nanometre");
    expect(JSON.stringify(outcome)).not.toContain("10.9999/another-doi");
  });

  test("Record of another work answered for a trailing slash", async () => {
    // What Crossref was observed to do: the record of 10.1038/nature12373 for a request with a trailing slash.
    const outcome = await resolve("10.1038/nature12373/", answeringFixture("nature12373.json"));

    expect(outcome).toEqual(failure("invalid-response"));
  });

  test("Record states no DOI", async () => {
    const fetchFake = withMessage("nature12373.json", (message) => {
      delete message.DOI;
    });

    expect(await resolve(NATURE, fetchFake)).toEqual(failure("invalid-response"));
  });
});

// Checker finding F1, second half: nothing inside a DOI may reshape the request.
describe("DOI cannot alter the request URL", () => {
  // Answers like Crossref and, like a real fetch, only ever sees the URL after it has been normalized.
  const crossrefHoldingOnlyNature = () =>
    vi.fn(async (...[input, init]: FetchArgs) => {
      const asked = decodeURIComponent(new URL(new Request(input, init).url).pathname);
      return asked === "/works/10.1038/nature12373"
        ? new Response(fixtureText("nature12373.json"), { status: 200 })
        : new Response("Resource not found.", { status: 404 });
    });

  const urlOfOnlyRequest = (fetchFake: FakeFetch) => {
    const requests = requestsTo(fetchFake);
    expect(requests).toHaveLength(1);
    return new URL(requests[0].url);
  };

  test("Slash in the DOI", async () => {
    const fetchFake = crossrefHoldingOnlyNature();

    const outcome = await resolve(NATURE, fetchFake);

    const url = urlOfOnlyRequest(fetchFake);
    expect(url.host).toBe("api.crossref.org");
    expect(url.pathname).toBe("/works/10.1038%2Fnature12373");
    expect(outcome).toHaveProperty("publication.doi", "10.1038/nature12373");
  });

  test("Dot segments in the DOI", async () => {
    const fetchFake = crossrefHoldingOnlyNature();

    const outcome = await resolve("10.1234/../10.1038/nature12373", fetchFake);

    const url = urlOfOnlyRequest(fetchFake);
    expect(url.host).toBe("api.crossref.org");
    expect(url.pathname).toBe("/works/10.1234%2F..%2F10.1038%2Fnature12373");
    expect(outcome).toEqual(failure("not-found"));
    expect(JSON.stringify(outcome)).not.toContain("Nanometre");
  });

  test("Query and fragment characters in the DOI", async () => {
    const fetchFake = crossrefHoldingOnlyNature();

    await resolve("10.1000/a?b#c", fetchFake);

    const url = urlOfOnlyRequest(fetchFake);
    expect(url.host).toBe("api.crossref.org");
    expect(url.pathname).toBe("/works/10.1000%2Fa%3Fb%23c");
    expect(url.search).toBe("");
    expect(url.hash).toBe("");
  });

  test("Percent sign in the DOI", async () => {
    const fetchFake = crossrefHoldingOnlyNature();

    await resolve("10.1002/%28sici%29x", fetchFake);

    expect(urlOfOnlyRequest(fetchFake).pathname).toBe("/works/10.1002%2F%2528sici%2529x");
  });
});

describe("Absent metadata does not fail resolution", () => {
  test("Article not yet assigned to an issue", async () => {
    const outcome = await resolve("10.5705/ss.202024.0145", answeringFixture("no-volume-issue.json"));

    expect(outcome).toMatchObject({ ok: true, publication: { volume: null, issue: null, pages: null } });
  });

  test("No title", async () => {
    const fetchFake = withMessage("nature12373.json", (message) => {
      delete message.title;
    });

    const outcome = await resolve(NATURE, fetchFake);

    expect(outcome).toMatchObject({ ok: true, publication: { doi: "10.1038/nature12373", title: null } });
  });
});

describe("Identification to Crossref", () => {
  test("No contact address configured", async () => {
    const fetchFake = answeringFixture("nature12373.json");

    const outcome = await resolve(NATURE, fetchFake);

    const [request] = requestsTo(fetchFake);
    expect(outcome.ok).toBe(true);
    expect(request.headers.get("user-agent")).toContain(APP_NAME);
    expect(visibleText(request)).not.toContain("@");
    expect(visibleText(request).toLowerCase()).not.toContain("mailto");
  });

  test("Contact address configured", async () => {
    const fetchFake = answeringFixture("nature12373.json");

    const outcome = await resolve(NATURE, fetchFake, "librarian@example.org");

    const [request] = requestsTo(fetchFake);
    expect(outcome.ok).toBe(true);
    expect(request.headers.get("user-agent")).toContain(APP_NAME);
    expect(visibleText(request)).toContain("librarian@example.org");
  });
});
