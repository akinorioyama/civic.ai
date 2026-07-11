import assert from "node:assert/strict";
import test from "node:test";
import app from "../src/index";

void test("GET /au/:question streams text/plain stub", async () => {
    const res = await app.request("http://localhost/au/hello%20world?lang=zh", {
        headers: { Origin: "http://localhost:8080" },
    });
    assert.equal(res.status, 200);
    assert.match(res.headers.get("Content-Type") ?? "", /text\/plain/);
    assert.equal(
        res.headers.get("Access-Control-Allow-Origin"),
        "http://localhost:8080"
    );
    const text = await res.text();
    assert.match(text, /仁工智慧|hello/i);
});

void test("GET /au maps ?lang=zh-Hant to zh stub", async () => {
    const res = await app.request("http://localhost/au/test?lang=zh-Hant", {
        headers: { Origin: "https://civic.ai" },
    });
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.match(text, /lang=zh/);
    assert.match(text, /仁工智慧網站索引/);
});

void test("GET /au maps ?lang=zh-tw to zh stub", async () => {
    const res = await app.request("http://localhost/au/test?lang=zh-tw", {
        headers: { Origin: "https://www.civic.ai" },
    });
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.match(text, /lang=zh/);
    assert.match(text, /仁工智慧網站索引/);
});

void test("GET /capacity returns available status JSON", async () => {
    const res = await app.request("http://localhost/capacity", {
        headers: { Origin: "https://civic.ai" },
    });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { status: "available" });
    assert.equal(
        res.headers.get("Access-Control-Allow-Origin"),
        "https://civic.ai"
    );
});

void test("GET /au rejects question over 100 scalars", async () => {
    const long = "a".repeat(101);
    const res = await app.request(
        `http://localhost/au/${encodeURIComponent(long)}`
    );
    assert.equal(res.status, 400);
    const text = await res.text();
    assert.match(text, /Question too long \(max 100 characters\)/);
});

void test("OPTIONS /au returns CORS preflight for civic.ai", async () => {
    const res = await app.request("http://localhost/au/x", {
        method: "OPTIONS",
        headers: {
            Origin: "https://civic.ai",
            "Access-Control-Request-Method": "GET",
        },
    });
    assert.equal(res.status, 204);
    assert.equal(
        res.headers.get("Access-Control-Allow-Origin"),
        "https://civic.ai"
    );
});

void test("GET /capacity allows http://localhost:4321", async () => {
    const res = await app.request("http://localhost/capacity", {
        headers: { Origin: "http://localhost:4321" },
    });
    assert.equal(res.status, 200);
    assert.equal(
        res.headers.get("Access-Control-Allow-Origin"),
        "http://localhost:4321"
    );
});
