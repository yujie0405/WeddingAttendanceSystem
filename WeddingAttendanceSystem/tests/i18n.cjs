const fs = require("fs"),
  path = require("path"),
  assert = require("assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
process.chdir(path.resolve(__dirname, "../.."));
fs.mkdirSync("WeddingAttendanceSystem/verification/i18n-artifacts", {
  recursive: true,
});
const base = "http://127.0.0.1:5173",
  checks = [],
  errors = [];
const source = JSON.parse(
  fs
    .readFileSync("WeddingAttendanceSystem/template/wedding.js", "utf8")
    .match(/const INITIAL_DATA = ([\s\S]*?);\s*\/\*/)[1],
);
const CN = JSON.parse(
  fs.readFileSync("WeddingAttendanceSystem/src/locales/CN.json"),
);
const EN = JSON.parse(
  fs.readFileSync("WeddingAttendanceSystem/src/locales/EN.json"),
);
function flatten(obj, prefix = "") {
  return Object.fromEntries(
    Object.entries(obj).flatMap(([k, v]) =>
      typeof v === "string"
        ? [[prefix + k, v]]
        : Object.entries(flatten(v, prefix + k + ".")),
    ),
  );
}
const cn = flatten(CN),
  en = flatten(EN);
assert.deepEqual(Object.keys(cn).sort(), Object.keys(en).sort());
for (const k of Object.keys(cn)) {
  const variables = (s) =>
    [...s.matchAll(/{{\s*(\w+)\s*}}/g)].map((m) => m[1]).sort();
  assert.deepEqual(variables(cn[k]), variables(en[k]), k);
}
checks.push(
  Object.keys(cn).length + " matching JSON keys and interpolation parameters",
);
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 960 },
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.on("pageerror", (e) => errors.push(e.message));
    const go = async (route = "/", p = page) => {
      await p.goto(base + route, { waitUntil: "domcontentloaded" });
      await p.locator("header").waitFor();
    };
    const lang = async (value, p = page) => {
      await p
        .getByRole("button", {
          name: value === "en" ? "English" : "中文",
          exact: true,
        })
        .last()
        .click();
      await p.waitForFunction(
        (value) => document.documentElement.lang === value,
        value === "en" ? "en" : "zh-CN",
      );
    };
    const b = (name, p = page) => {
      const l = p.getByRole("button", { name, exact: true }),
        click = l.click.bind(l);
      l.click = async (...a) => {
        await click(...a);
        await p.evaluate(async () => {
          await navigator.locks.request("wedding-react-v2", () => {});
          await new Promise(requestAnimationFrame);
        });
      };
      return l;
    };
    const field = (name, p = page) =>
      p.getByLabel(name, { exact: false }).last();
    const stored = () =>
      page.evaluate(() => ({
        data: localStorage.getItem("wedding-react-v2"),
        auth: localStorage.getItem("wedding-react-auth-v2"),
      }));
    await go();
    assert.equal(await page.locator("html").getAttribute("lang"), "zh-CN");
    await page.getByRole("heading", { name: CN.Nav.AppTitle }).waitFor();
    const initial = await stored();
    await page.getByPlaceholder(CN.Main.SearchPlaceholder).fill("陈美玲");
    await lang("en");
    assert.deepEqual(await stored(), initial);
    assert.equal(
      await page.locator("input[type=search]").inputValue(),
      "陈美玲",
    );
    assert.equal(await page.locator("[data-guest-id]").count(), 2);
    assert.equal(await page.title(), EN.Nav.AppTitle);
    assert.equal(
      await page.evaluate(() => localStorage.getItem("wedding-language")),
      "en",
    );
    checks.push(
      "Chinese default, English switch, HTML/title/preference and unchanged domain/auth storage",
    );
    await page.getByTitle(EN.Main.EditGuest).first().click();
    await field(EN.Modal.EditGuest.Name).fill("Unsubmitted name");
    await lang("zh-CN");
    assert.equal(
      await field(CN.Modal.EditGuest.Name).inputValue(),
      "Unsubmitted name",
    );
    await page.keyboard.press("Escape");
    assert.deepEqual(await stored(), initial);
    checks.push(
      "Language switches preserve filters and open edit drafts without saving",
    );
    await lang("en");
    await page.locator("input[type=search]").fill("黄志明");
    await b(EN.Main.RegisterGift).click();
    await field(EN.Modal.Gift.Amount).fill("0");
    await b(EN.Common.ConfirmSave).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "at least 0.01" })
      .waitFor();
    await lang("zh-CN");
    await page.getByRole("alert").filter({ hasText: "不小于 0.01" }).waitFor();
    assert.equal(await field(CN.Modal.Gift.Amount).inputValue(), "0");
    await lang("en");
    await field(EN.Modal.Gift.Amount).fill("123.45");
    await field(EN.Modal.Gift.Notes).fill("祝福不改变");
    await b(EN.Common.ConfirmSave).click();
    await page
      .getByRole("status")
      .filter({ hasText: EN.Notifications.GiftRegistered })
      .waitFor();
    await lang("zh-CN");
    await page
      .getByRole("status")
      .filter({ hasText: CN.Notifications.GiftRegistered })
      .waitFor();
    assert.equal(
      JSON.parse((await stored()).data).angpaoRecords[0].notes,
      "祝福不改变",
    );
    checks.push(
      "Live bilingual validation/notifications, decimal gifts and unchanged user notes",
    );
    await lang("en");
    await page
      .getByRole("button", { name: "Recorded (1 gift)", exact: true })
      .click();
    assert.equal(await page.locator("[role=dialog] .admin-money").count(), 0);
    await page.keyboard.press("Escape");
    await go("/admin/dashboard");
    assert.equal(
      await page.locator(".gift-stat strong").textContent(),
      "RM 1,223.45",
    );
    const ch = page
      .getByRole("row")
      .filter({ has: page.getByText("陈美玲", { exact: true }) });
    await ch
      .getByRole("button", { name: EN.Common.FamilyGift, exact: true })
      .click();
    assert.equal(
      await page.locator("[role=dialog] .admin-money").textContent(),
      "RM 800.00",
    );
    await page.keyboard.press("Escape");
    await ch
      .getByRole("button", { name: EN.Admin.Dashboard.Details, exact: true })
      .click();
    await b(EN.Modal.History.Void).click();
    await field(EN.Modal.Void.Reason).fill("重复录入");
    await lang("zh-CN");
    assert.equal(await field(CN.Modal.Void.Reason).inputValue(), "重复录入");
    await b(CN.Modal.Void.Confirm).click();
    assert.equal(
      await page.locator(".gift-stat strong").textContent(),
      "RM 923.45",
    );
    await page.keyboard.press("Escape");
    checks.push(
      "English gift history, family access, bilingual voiding, totals and privacy",
    );
    await lang("en");
    await go("/admin/add-guest");
    await field(EN.Common.Name).fill("English Guest");
    await field(EN.Common.Relationship).selectOption("VIP");
    await b(EN.Admin.Guests.Add).click();
    await page.getByPlaceholder(EN.Admin.Guests.Search).fill("English Guest");
    await b(EN.Common.Edit).click();
    await field(EN.Modal.EditGuest.Name).fill("English Edited");
    await b("素食者").click();
    await b(EN.Common.SaveChanges).click();
    assert(
      JSON.parse((await stored()).data).guests.some(
        (g) => g.name === "English Edited" && g.tagIds.length,
      ),
    );
    checks.push("English guest creation/editing with original tag names");
    await go("/admin/table-setting");
    assert.equal(
      await field(EN.Admin.Tables.NextNumber).inputValue(),
      "07 (automatic)",
    );
    await field(EN.Admin.Tables.Capacity).fill("1.5");
    await b(EN.Admin.Tables.Add).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "increments of 1" })
      .waitFor();
    await field(EN.Admin.Tables.Capacity).fill("12");
    await b(EN.Admin.Tables.Add).click();
    assert.equal(
      await field(EN.Admin.Tables.NextNumber).inputValue(),
      "08 (automatic)",
    );
    assert(await b("Delete table 01").isDisabled());
    let confirmation = "";
    page.once("dialog", (d) => {
      confirmation = d.message();
      return d.accept();
    });
    await b("Delete table 07").click();
    assert(confirmation.includes("Delete table 07"));
    assert.equal(
      await field(EN.Admin.Tables.NextNumber).inputValue(),
      "08 (automatic)",
    );
    checks.push(
      "English capacity validation, deletion confirmation and non-reused table numbers",
    );
    await page.getByTitle(EN.Nav.Logout).click();
    await page.getByRole("heading", { name: EN.Login.Title }).waitFor();
    await field(EN.Login.Username).fill("staff viewer");
    await lang("zh-CN");
    assert.equal(await field(CN.Login.Username).inputValue(), "staff viewer");
    await lang("en");
    await b(EN.Login.Submit).click();
    await go("/admin/dashboard");
    assert.equal(new URL(page.url()).pathname, "/");
    await page.getByTitle(EN.Nav.Logout).click();
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: EN.Login.Title }).waitFor();
    checks.push(
      "Login draft, persisted preference across logout/refresh, and staff route guards",
    );
    await field(EN.Login.Username).fill("admin viewer");
    await b(EN.Login.Submit).click();
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: EN.Nav.AppTitle }).waitFor();
    checks.push("Saved English survives refresh and login");
    const plurals = await page.evaluate(async () => {
      const { default: i } = await import("/src/i18n/index.ts");
      return [0, 1, 2].map((count) => i.t("Main.RecordedGifts", { count }));
    });
    assert.deepEqual(plurals, [
      "Recorded (0 gifts)",
      "Recorded (1 gift)",
      "Recorded (2 gifts)",
    ]);
    checks.push("English zero/one/many plural forms");
    const many = structuredClone(source);
    many.guests = Array.from({ length: 41 }, (_, i) => ({
      id: "qa-" + i,
      name: "Guest " + String(i + 1).padStart(2, "0"),
      relationship: "Legacy relationship",
      side: "GROOM",
      tableNumber: "01",
      tags: [],
      status: "PENDING",
      isActive: true,
    }));
    many.groups = [];
    many.angpaoRecords = [];
    many.tables = Array.from({ length: 21 }, (_, i) => ({
      id: "table-" + i,
      number: String(i + 1).padStart(2, "0"),
      capacity: 10,
      tags: [],
    }));
    many.nextTableNumber = 22;
    const bulk = await browser.newContext();
    await bulk.addInitScript((data) => {
      if (sessionStorage.getItem("seed")) return;
      sessionStorage.setItem("seed", "1");
      localStorage.setItem("wedding-language", "en");
      for (const [k, v] of Object.entries(data))
        localStorage.setItem("wedding-template-v1:" + k, JSON.stringify(v));
    }, many);
    const q = await bulk.newPage();
    q.setDefaultTimeout(10000);
    q.on("pageerror", (e) => errors.push(e.message));
    await go("/admin/add-guest", q);
    assert.equal(await q.locator("tbody tr").count(), 20);
    await b("Next", q).click();
    assert.equal(await q.locator("tbody tr").count(), 20);
    await b("Next", q).click();
    assert.equal(await q.locator("tbody tr").count(), 1);
    const beforeLanguage = await q.evaluate(() =>
      localStorage.getItem("wedding-react-v2"),
    );
    await lang("zh-CN", q);
    assert(await b("下一页", q).isDisabled());
    assert.equal(await q.locator("tbody tr").count(), 1);
    assert.equal(
      await q.evaluate(() => localStorage.getItem("wedding-react-v2")),
      beforeLanguage,
    );
    await lang("en", q);
    await q.getByPlaceholder(EN.Admin.Guests.Search).fill("Guest 01");
    assert.equal(await q.locator("tbody tr").count(), 1);
    await b("Edit", q).click();
    assert.equal(
      await field(EN.Common.Relationship, q).inputValue(),
      "Legacy relationship",
    );
    await q.keyboard.press("Escape");
    await go("/admin/table-setting", q);
    assert.equal(await q.locator("[data-table]").count(), 10);
    await b("Next", q).click();
    await b("Next", q).click();
    assert.equal(await q.locator("[data-table]").count(), 1);
    await lang("zh-CN", q);
    assert(await b("下一页", q).isDisabled());
    q.once("dialog", (d) => d.accept());
    await b("删除 21 桌", q).click();
    assert.equal(await q.locator("[data-table]").count(), 10);
    checks.push(
      "20/10 pagination, boundaries, search reset and page preservation while switching",
    );
    const recovery = await browser.newContext();
    await recovery.addInitScript((data) => {
      localStorage.setItem("wedding-language", "en");
      localStorage.setItem("wedding_guests", "[]");
      localStorage.setItem("wedding_angpao", "[]");
      for (const [k, v] of Object.entries(data))
        localStorage.setItem("wedding-template-v1:" + k, JSON.stringify(v));
    }, source);
    const r = await recovery.newPage();
    r.on("pageerror", (e) => errors.push(e.message));
    await r.goto(base);
    await r
      .getByRole("heading", { name: EN.DataTransfer.RecoveryTitle })
      .waitFor();
    await r
      .getByRole("alert")
      .filter({ hasText: "Both existing React data" })
      .waitFor();
    await lang("zh-CN", r);
    await r
      .getByRole("alert")
      .filter({ hasText: "检测到现有 React 数据" })
      .waitFor();
    assert.equal(
      await r.evaluate(() => localStorage.getItem("wedding-react-v2")),
      null,
    );
    await b(CN.DataTransfer.UseTemplate, r).click();
    await r.locator("header").waitFor();
    checks.push(
      "Recovery/source conflicts translate live without writing or losing source data",
    );
    await go("/admin/tag");
    const importPath = path.resolve(
      "WeddingAttendanceSystem/verification/i18n-artifacts/invalid.json",
    );
    fs.writeFileSync(importPath, JSON.stringify({ version: 99 }));
    const unchanged = await stored();
    await page
      .getByLabel(EN.DataTransfer.ImportLabel, { exact: true })
      .setInputFiles(importPath);
    await page
      .getByRole("status")
      .filter({ hasText: "This data version is not supported" })
      .waitFor();
    await lang("zh-CN");
    await page
      .getByRole("status")
      .filter({ hasText: "此数据版本暂不支持" })
      .waitFor();
    assert.deepEqual(await stored(), unchanged);
    checks.push(
      "Typed import errors switch language and invalid imports do not mutate records",
    );
    const invalid = await browser.newContext();
    await invalid.addInitScript(() =>
      localStorage.setItem("wedding-language", "xx"),
    );
    const f = await invalid.newPage();
    f.on("pageerror", (e) => errors.push(e.message));
    await go("/", f);
    assert.equal(await f.locator("html").getAttribute("lang"), "zh-CN");
    checks.push("Invalid saved language safely falls back to Chinese");
    const blocked = await browser.newContext();
    await blocked.addInitScript(() => {
      const read = Storage.prototype.getItem,
        write = Storage.prototype.setItem;
      Storage.prototype.getItem = function (k) {
        if (k === "wedding-language")
          throw new DOMException("blocked", "SecurityError");
        return read.call(this, k);
      };
      Storage.prototype.setItem = function (k, v) {
        if (k === "wedding-language")
          throw new DOMException("blocked", "SecurityError");
        return write.call(this, k, v);
      };
    });
    const s = await blocked.newPage();
    s.on("pageerror", (e) => errors.push(e.message));
    await go("/", s);
    await lang("en", s);
    await s.getByRole("heading", { name: EN.Nav.AppTitle }).waitFor();
    checks.push(
      "Blocked preference storage does not prevent language switching",
    );
    const visual = await browser.newContext();
    const v = await visual.newPage();
    v.on("pageerror", (e) => errors.push(e.message));
    for (const width of [1280, 390])
      for (const language of ["zh-CN", "en"])
        for (const route of [
          "/",
          "/admin/dashboard",
          "/admin/tag",
          "/admin/add-guest",
          "/admin/table-setting",
        ]) {
          await v.setViewportSize({ width, height: 960 });
          await go(route, v);
          await lang(language, v);
          await v.waitForFunction(
            () =>
              getComputedStyle(document.querySelector("header")).position ===
              "sticky",
          );
          assert(
            !(await v.evaluate(
              () => document.documentElement.scrollWidth > innerWidth,
            )),
            route + " " + language + " " + width + " overflow",
          );
          const text = await v.locator("body").innerText();
          assert(
            !/\b(?:Main|Common|Nav|Admin|Modal|Errors|Notifications)\.[A-Z][A-Za-z.]+/.test(
              text,
            ),
            "raw resource key",
          );
          await v.screenshot({
            path:
              "WeddingAttendanceSystem/verification/i18n-artifacts/" +
              (route === "/" ? "main" : route.split("/").at(-1)) +
              "-" +
              language +
              "-" +
              width +
              ".png",
            fullPage: true,
          });
        }
    checks.push(
      "Both languages: every route fits desktop/mobile with no raw resource keys",
    );
    assert.deepEqual(errors, []);
    fs.writeFileSync(
      "WeddingAttendanceSystem/verification/i18n-artifacts/results.json",
      JSON.stringify({ keys: Object.keys(cn).length, checks, errors }, null, 2),
    );
    console.log(
      "PASS " +
        checks.length +
        " checks:\n" +
        checks.map((c) => " - " + c).join("\n"),
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error("Completed:", checks);
  console.error(e);
  process.exitCode = 1;
});
