// One test per scenario of openspec/changes/doi-resolution/specs/doi-normalization/spec.md.
import { afterEach, describe, expect, test, vi } from "vitest";
import { normalizeDoi } from "@/lib/doi/normalize-doi";

const accepted = (doi: string) => ({ ok: true, doi });
const rejected = { ok: false };

describe("Accepted DOI input forms", () => {
  test("Bare DOI", () => {
    expect(normalizeDoi("10.1038/nature12373")).toEqual(accepted("10.1038/nature12373"));
  });

  test("DOI with prefix", () => {
    expect(normalizeDoi("doi:10.1038/nature12373")).toEqual(accepted("10.1038/nature12373"));
  });

  test("DOI as resolver URL", () => {
    expect(normalizeDoi("https://doi.org/10.1038/nature12373")).toEqual(accepted("10.1038/nature12373"));
  });
});

describe("Surrounding whitespace and prefix letter case", () => {
  test("Surrounding whitespace", () => {
    expect(normalizeDoi("  10.1038/nature12373  ")).toEqual(accepted("10.1038/nature12373"));
  });

  test("Space after the prefix", () => {
    expect(normalizeDoi("doi: 10.1038/nature12373")).toEqual(accepted("10.1038/nature12373"));
  });

  test("Upper-case prefix", () => {
    expect(normalizeDoi("DOI:10.1038/nature12373")).toEqual(accepted("10.1038/nature12373"));
  });

  test("Upper-case resolver URL", () => {
    expect(normalizeDoi("HTTPS://DOI.ORG/10.1038/nature12373")).toEqual(accepted("10.1038/nature12373"));
  });
});

describe("Canonical DOI is the identity", () => {
  test("Mixed-case input", () => {
    expect(normalizeDoi("10.1038/NATURE12373")).toEqual(accepted("10.1038/nature12373"));
  });

  test("Same DOI in two forms", () => {
    const fromUrl = normalizeDoi("https://doi.org/10.1038/Nature12373");
    const fromPrefix = normalizeDoi("doi:10.1038/nature12373");

    expect(fromUrl).toEqual(accepted("10.1038/nature12373"));
    expect(fromPrefix).toEqual(fromUrl);
  });

  test("Letters outside Basic Latin", () => {
    expect(normalizeDoi("10.1000/ÄBC")).toEqual(accepted("10.1000/Äbc"));
  });
});

describe("Rejection of input that is not a DOI", () => {
  test("Empty input", () => {
    expect(normalizeDoi("")).toEqual(rejected);
    expect(normalizeDoi("   \t\n ")).toEqual(rejected);
  });

  test("Text that is not a DOI", () => {
    expect(normalizeDoi("nature thermometry 2013")).toEqual(rejected);
  });

  test("Missing suffix", () => {
    expect(normalizeDoi("10.1038/")).toEqual(rejected);
  });

  test("Whitespace inside the DOI", () => {
    expect(normalizeDoi("10.1038/nature 12373")).toEqual(rejected);
  });

  test("URL of another site", () => {
    expect(normalizeDoi("https://www.nature.com/articles/nature12373")).toEqual(rejected);
  });

  test("Unusual but structurally valid suffix", () => {
    const doi = "10.1002/(sici)1097-4571(199205)43:4<284::aid-asi3>3.0.co;2-0";

    expect(normalizeDoi(doi)).toEqual(accepted(doi));
  });
});

// Checker finding F2: these three parts of the DOI shape had no test.
describe("Rejection of input that is not a DOI: shape of the registrant code and suffix", () => {
  test("Registrant code too short", () => {
    expect(normalizeDoi("10.123/abc")).toEqual(rejected);
  });

  test("Registrant code too long", () => {
    expect(normalizeDoi("10.1234567890/abc")).toEqual(rejected);
  });

  test("Control character in the suffix", () => {
    expect(normalizeDoi("10.1000/ab\u0007c")).toEqual(rejected);
  });

  test("Registrant code with a further digit group", () => {
    expect(normalizeDoi("10.1000.10/abc")).toEqual(accepted("10.1000.10/abc"));
  });
});

describe("Other input forms are rejected", () => {
  test("Insecure scheme", () => {
    expect(normalizeDoi("http://doi.org/10.1038/nature12373")).toEqual(rejected);
  });

  test("Legacy resolver host", () => {
    expect(normalizeDoi("https://dx.doi.org/10.1038/nature12373")).toEqual(rejected);
  });

  test("Resolver URL without a scheme", () => {
    expect(normalizeDoi("doi.org/10.1038/nature12373")).toEqual(rejected);
  });
});

describe("No repair of the DOI", () => {
  test("Trailing full stop is kept", () => {
    expect(normalizeDoi("10.1000/abc.")).toEqual(accepted("10.1000/abc."));
  });

  test("Percent-encoding is kept as written", () => {
    expect(normalizeDoi("https://doi.org/10.1002/%28sici%291097-4571")).toEqual(
      accepted("10.1002/%28sici%291097-4571"),
    );
  });
});

describe("Normalization is deterministic and offline", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("No network use", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const results = ["10.1038/nature12373", "https://doi.org/10.1038/NATURE12373", "not a doi"].map((input) =>
      normalizeDoi(input),
    );

    expect(results).toEqual([accepted("10.1038/nature12373"), accepted("10.1038/nature12373"), rejected]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("Canonical DOI is stable", () => {
    const canonical = "10.1038/nature12373";

    expect(normalizeDoi(canonical)).toEqual(accepted(canonical));
    expect(normalizeDoi(canonical)).toEqual(normalizeDoi(canonical));
  });
});
