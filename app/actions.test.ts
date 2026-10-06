// Tests for the Server Function that the page resolves a DOI with (design TD-6 of the change bibliography-workspace;
// requirements "Adding an entry by DOI" of bibliography-workspace and "Identification to Crossref" of doi-resolution).
// The global fetch and the environment are stubbed; no test reaches the network.
import { afterEach, describe, expect, test, vi } from "vitest";
import { resolveDoiAction } from "@/app/actions";

type FetchArgs = [input: RequestInfo | URL, init?: RequestInit];

const answering = (status: number, body = "") => {
  const fake = vi.fn(async (...args: FetchArgs) => {
    void args;
    return new Response(body, { status });
  });
  vi.stubGlobal("fetch", fake);
  return fake;
};

const requestsTo = (fake: ReturnType<typeof answering>) => fake.mock.calls.map(([input, init]) => new Request(input, init));

// A journal-article record with nothing but what resolution needs, written by hand.
const MINIMAL_RECORD = JSON.stringify({
  status: "ok",
  "message-type": "work",
  message: { DOI: "10.1038/nature12373", type: "journal-article", title: ["A title"] },
});

const CONTACT = "librarian@example.org";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("an argument that is not a DOI", () => {
  test("a string that is not a DOI is invalid input, and nothing is requested", async () => {
    const fetchFake = answering(200, MINIMAL_RECORD);

    expect(await resolveDoiAction("not a doi")).toEqual({ ok: false, failure: { kind: "invalid-input" } });
    expect(fetchFake).not.toHaveBeenCalled();
  });

  test.each([
    ["a number", 42],
    ["nothing", undefined],
    ["null", null],
    ["an object", { doi: "10.1038/nature12373" }],
    ["a list", ["10.1038/nature12373"]],
  ])("%s is invalid input, and nothing is requested", async (_name, argument) => {
    const fetchFake = answering(200, MINIMAL_RECORD);

    // The function is reachable by a direct POST, so its argument is not trusted to be a string.
    expect(await resolveDoiAction(argument as unknown as string)).toEqual({
      ok: false,
      failure: { kind: "invalid-input" },
    });
    expect(fetchFake).not.toHaveBeenCalled();
  });
});

describe("a DOI", () => {
  test("is looked up with one request for the canonical DOI as one path segment", async () => {
    const fetchFake = answering(404);
    vi.stubEnv("CROSSREF_CONTACT_EMAIL", undefined);

    await resolveDoiAction("https://doi.org/10.1038/NATURE12373");

    const requests = requestsTo(fetchFake);
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe("https://api.crossref.org/works/10.1038%2Fnature12373");
    expect(requests[0].method).toBe("GET");
  });

  test("the outcome of DOI resolution is returned as it is: a failure", async () => {
    answering(404);

    expect(await resolveDoiAction("10.1038/nature12373")).toEqual({ ok: false, failure: { kind: "not-found" } });
  });

  test("the outcome of DOI resolution is returned as it is: a publication", async () => {
    answering(200, MINIMAL_RECORD);

    expect(await resolveDoiAction("10.1038/NATURE12373")).toMatchObject({
      ok: true,
      publication: { doi: "10.1038/nature12373", title: "A title", journalTitle: null, authors: [] },
    });
  });
});

describe("identification to Crossref", () => {
  test("the request names the application and no contact address when none is configured", async () => {
    const fetchFake = answering(404);
    vi.stubEnv("CROSSREF_CONTACT_EMAIL", undefined);

    await resolveDoiAction("10.1038/nature12373");

    expect(requestsTo(fetchFake)[0].headers.get("user-agent")).toBe("reference-formatter");
  });

  test("the configured contact address is sent with the application name", async () => {
    const fetchFake = answering(404);
    vi.stubEnv("CROSSREF_CONTACT_EMAIL", CONTACT);

    await resolveDoiAction("10.1038/nature12373");

    expect(requestsTo(fetchFake)[0].headers.get("user-agent")).toBe(`reference-formatter (mailto:${CONTACT})`);
  });

  test("the contact address is not part of what is returned", async () => {
    answering(200, MINIMAL_RECORD);
    vi.stubEnv("CROSSREF_CONTACT_EMAIL", CONTACT);

    expect(JSON.stringify(await resolveDoiAction("10.1038/nature12373"))).not.toContain(CONTACT);
  });

  test("the contact address is not part of a failure either", async () => {
    answering(503);
    vi.stubEnv("CROSSREF_CONTACT_EMAIL", CONTACT);

    const outcome = await resolveDoiAction("10.1038/nature12373");

    expect(outcome).toEqual({ ok: false, failure: { kind: "provider-unavailable" } });
    expect(JSON.stringify(outcome)).not.toContain(CONTACT);
  });
});
