const fs = require("fs");
const path = require("path");
const assert = require("assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
process.chdir(path.resolve(__dirname, "../.."));
fs.mkdirSync("WeddingAttendanceSystem/verification/artifacts", {
  recursive: true,
});
const base = "http://127.0.0.1:5173";
const template = JSON.parse(
  fs
    .readFileSync("WeddingAttendanceSystem/template/wedding.js", "utf8")
    .match(/const INITIAL_DATA = ([\s\S]*?);\s*\/\*/)[1],
);
const errors = [],
  checks = [];
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 960 },
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.on("pageerror", (e) => errors.push(e.message));
    const go = async (file = "/", target = page) => {
      await target.goto(base + file, { waitUntil: "domcontentloaded" });
      await target.locator("header").waitFor();
    };
    const state = () =>
      page.evaluate(() => JSON.parse(localStorage.getItem("wedding-react-v2")));
    const button = (name, root = page) => {
      const loc = root.getByRole("button", { name, exact: true });
      const native = loc.click.bind(loc);
      loc.click = async (...args) => {
        await native(...args);
        await root.evaluate(async () => {
          if (navigator.locks)
            await navigator.locks.request("wedding-react-v2", () => {});
          await new Promise(requestAnimationFrame);
        });
      };
      return loc;
    };
    const input = (name, root = page) =>
      root.getByLabel(name, { exact: false }).last();
    const close = async () => page.keyboard.press("Escape");
    await go();
    assert.equal(await page.locator("[data-guest-id]").count(), 8);
    assert((await state()).guests.every((g) => g.isActive));
    const before = await state();
    await page.reload({ waitUntil: "domcontentloaded" });
    assert.deepEqual(await state(), before);
    checks.push(
      "Fresh template graph migrates once; StrictMode/refresh preserves records",
    );
    await button("立即签到").first().click();
    await page.waitForFunction(
      () =>
        JSON.parse(localStorage.getItem("wedding-react-v2")).guests[0]
          .status === "arrived",
    );
    assert.equal((await state()).guests[0].status, "arrived");
    await button("全家签到").first().click();
    await button("确认一键签到").click();
    assert(
      (await state()).guests
        .filter((g) => g.groupId === "g1")
        .every((g) => g.status === "arrived"),
    );
    checks.push("Individual and family check-in");
    await page
      .getByPlaceholder("搜索宾客姓名 / 家庭名称 / 桌号 (如: 张伟, 03)")
      .fill("no-match");
    assert.equal(await page.locator("[data-guest-id]").count(), 0);
    await page
      .getByPlaceholder("搜索宾客姓名 / 家庭名称 / 桌号 (如: 张伟, 03)")
      .fill("");
    await button("女方").click();
    assert.equal(await page.locator("[data-guest-id]").count(), 3);
    await button("全部男/女").click();
    await input("筛选桌号").selectOption("05");
    assert.equal(await page.locator("[data-guest-id]").count(), 1);
    await input("筛选桌号").selectOption("all");
    await input("筛选标签").selectOption("tag-6");
    assert.equal(await page.locator("[data-guest-id]").count(), 1);
    await input("筛选标签").selectOption("all");
    checks.push("Search, side, table and tag filters");
    const standalone = page.locator('[data-guest-id="guest-107"]');
    await button("登记礼金", standalone).click();
    await button("+100").click();
    assert.equal(await input("礼金金额 (RM)").inputValue(), "100");
    await input("礼金金额 (RM)").fill("123.45");
    await button("确认保存").click();
    assert.equal((await state()).angpaoRecords[0].amount, 123.45);
    await page
      .locator('[data-guest-id="guest-107"]')
      .getByRole("button", { name: "已登记 (1 笔)" })
      .click();
    assert.equal(await page.locator("[role=dialog] .admin-money").count(), 0);
    await close();
    checks.push(
      "Gift registration, decimal amounts, history without public amount display",
    );
    await page.getByRole("link", { name: "后台标签/配置" }).click();
    await page.waitForURL("**/admin/dashboard");
    assert.equal(
      await page.locator(".gift-stat strong").textContent(),
      "RM 1,223.45",
    );
    const ch = page
      .getByRole("row")
      .filter({ has: page.getByText("陈美玲", { exact: true }) });
    assert.equal(await ch.locator(".admin-money").textContent(), "RM 300.00");
    await ch.getByRole("button", { name: "家庭礼金" }).click();
    assert.equal(
      await page.locator("[role=dialog] .admin-money").textContent(),
      "RM 800.00",
    );
    await close();
    await ch.getByRole("button", { name: "个人明细" }).click();
    await button("作废").click();
    await input("作废原因（必填）").fill("QA void");
    await button("确认作废").click();
    assert.equal(
      await page.locator(".gift-stat strong").textContent(),
      "RM 923.45",
    );
    assert.equal(
      (await state()).angpaoRecords.find((r) => r.id === "ap-1").isVoided,
      true,
    );
    await close();
    checks.push(
      "Dashboard totals, separate family access, voiding updates amounts",
    );
    await go("/admin/add-guest");
    await input("姓名").fill("QA Guest");
    await input("身份关系").selectOption("VIP");
    await button("录入宾客").click();
    assert.equal((await state()).guests[0].name, "QA Guest");
    await page.getByPlaceholder("搜索宾客 / 家庭 / 桌号").fill("QA Guest");
    await button("编辑").click();
    await input("宾客姓名").fill("QA Edited");
    await button("素食者").click();
    await button("保存修改").click();
    assert.equal((await state()).guests[0].name, "QA Edited");
    assert.equal((await state()).guests[0].tagIds.length, 1);
    checks.push("Guest creation, relationship tags, editing and tag selection");
    await go("/admin/tag");
    await input("新增标签名称").fill("QA Relation");
    await button("添加标签").click();
    await go("/admin/add-guest");
    assert.equal(
      await page
        .locator("form select option")
        .filter({ hasText: "QA Relation" })
        .count(),
      1,
    );
    checks.push("Shared tags update relationship options across routes");
    await go("/admin/table-setting");
    assert.equal(await input("下一桌号").inputValue(), "07（自动）");
    assert(await button("删除 01 桌").isDisabled());
    await input("容纳人数").fill("12");
    await button("添加桌位").click();
    assert.equal(
      (await state()).tables.find((t) => t.tableNo === "07").capacity,
      12,
    );
    page.once("dialog", (d) => d.accept());
    await button("删除 07 桌").click();
    assert.equal(await input("下一桌号").inputValue(), "08（自动）");
    await button("添加桌位").click();
    assert((await state()).tables.some((t) => t.tableNo === "08"));
    checks.push(
      "Capacity, protected deletion, confirmation and monotonically increasing table numbers",
    );
    const other = await context.newPage();
    await go("/admin/table-setting", other);
    await button("添加桌位").click();
    await other.waitForFunction(
      () => document.querySelector("input[readonly]").value === "10（自动）",
    );
    checks.push("Cross-tab canonical storage updates");
    await go("/admin/add-guest");
    await page.getByPlaceholder("搜索宾客 / 家庭 / 桌号").fill("QA Edited");
    await button("编辑").click();
    await go("/", other);
    await other
      .getByPlaceholder("搜索宾客姓名 / 家庭名称 / 桌号 (如: 张伟, 03)")
      .fill("QA Edited");
    await button("立即签到", other).click();
    await button("保存修改").click();
    assert.equal(
      (await state()).guests.find((g) => g.name === "QA Edited").status,
      "arrived",
    );
    await other.close();
    checks.push("Editing preserves a concurrent check-in from another tab");
    await page.getByTitle("退出登录").click();
    await page.waitForURL("**/login");
    await page.reload({ waitUntil: "domcontentloaded" });
    await input("账号 / 接待员姓名").fill("staff tester");
    await button("进入系统").click();
    await go("/admin/dashboard");
    assert.equal(new URL(page.url()).pathname, "/");
    assert.equal(await page.locator(".gift-stat").count(), 0);
    await page.getByTitle("退出登录").click();
    await input("账号 / 接待员姓名").fill("admin tester");
    await button("进入系统").click();
    await go("/admin/dashboard");
    checks.push("Logout persistence and staff/admin direct-route guards");
    for (const route of [
      "/",
      "/admin",
      "/admin/dashboard",
      "/admin/tag",
      "/admin/add-guest",
      "/admin/table-setting",
    ]) {
      await go(route);
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.locator("header").waitFor();
    }
    checks.push("Direct navigation and refresh for all routes");
    // Test realistic page boundaries and deletion clamping on a separate imported graph.
    const many = structuredClone(template);
    many.guests = Array.from({ length: 41 }, (_, i) => ({
      id: "many-" + i,
      name: "Guest " + String(i + 1).padStart(2, "0"),
      relationship: "Legacy relation",
      side: "GROOM",
      status: "PENDING",
      isActive: true,
      tableNumber: "01",
      tags: [],
    }));
    many.groups = [];
    many.angpaoRecords = [];
    many.tables = Array.from({ length: 21 }, (_, i) => ({
      id: "mt-" + i,
      number: String(i + 1).padStart(2, "0"),
      capacity: 10,
      tags: [],
    }));
    many.nextTableNumber = 22;
    const bulk = await browser.newContext();
    await bulk.addInitScript((data) => {
      if (!localStorage.getItem("seeded")) {
        for (const [k, v] of Object.entries(data))
          localStorage.setItem("wedding-template-v1:" + k, JSON.stringify(v));
        localStorage.setItem("seeded", "1");
      }
    }, many);
    const b = await bulk.newPage();
    b.setDefaultTimeout(10000);
    b.on("pageerror", (e) => errors.push(e.message));
    await go("/admin/add-guest", b);
    assert.equal(await b.locator("tbody tr").count(), 20);
    await button("下一页", b).click();
    assert.equal(await b.locator("tbody tr").count(), 20);
    await button("下一页", b).click();
    assert.equal(await b.locator("tbody tr").count(), 1);
    assert(await button("下一页", b).isDisabled());
    await b.getByPlaceholder("搜索宾客 / 家庭 / 桌号").fill("Guest 01");
    assert.equal(await b.locator("tbody tr").count(), 1);
    await button("编辑", b).click();
    assert.equal(await input("身份关系", b).inputValue(), "Legacy relation");
    await b.keyboard.press("Escape");
    await go("/admin/table-setting", b);
    assert.equal(await b.locator("[data-table]").count(), 10);
    await button("下一页", b).click();
    assert.equal(await b.locator("[data-table]").count(), 10);
    await button("下一页", b).click();
    assert.equal(await b.locator("[data-table]").count(), 1);
    b.once("dialog", (d) => d.accept());
    await button("删除 21 桌", b).click();
    assert.equal(await b.locator("[data-table]").count(), 10);
    checks.push(
      "41 guests/21 tables: 20/20/1 and 10/10/1, search reset, legacy edit, deletion clamp",
    );
    assert.equal(
      await b.evaluate(
        () =>
          JSON.parse(localStorage.getItem("wedding-template-v1:guests")).length,
      ),
      41,
    );
    checks.push("Template migration keeps original keys untouched");
    // Existing legacy React records take their own seed/reference graph.
    const legacy = await browser.newContext();
    await legacy.addInitScript(() => {
      localStorage.setItem(
        "wedding_guests",
        JSON.stringify([
          {
            id: "custom-old",
            name: "Legacy preserved",
            relationship: "Friend",
            side: "groom",
            tableNo: "01",
            status: "pending",
            tagIds: ["t1"],
          },
        ]),
      );
      localStorage.setItem("wedding_angpao", "[]");
    });
    const l = await legacy.newPage();
    l.on("pageerror", (e) => errors.push(e.message));
    await go("/", l);
    assert.equal(await l.locator('[data-guest-id="custom-old"]').count(), 1);
    assert.equal(
      await l.evaluate(
        () =>
          JSON.parse(localStorage.getItem("wedding-react-v2")).guests[0].name,
      ),
      "Legacy preserved",
    );
    checks.push(
      "Legacy React records migrate without substituting template IDs",
    );
    const conflict = await browser.newContext();
    await conflict.addInitScript((data) => {
      localStorage.setItem("wedding_guests", "[]");
      localStorage.setItem("wedding_angpao", "[]");
      for (const [k, v] of Object.entries(data))
        localStorage.setItem("wedding-template-v1:" + k, JSON.stringify(v));
    }, template);
    const c = await conflict.newPage();
    c.on("pageerror", (e) => errors.push(e.message));
    await c.goto(base);
    await c.getByRole("heading", { name: "选择或恢复婚礼数据" }).waitFor();
    assert.equal(
      await c.evaluate(() => localStorage.getItem("wedding-react-v2")),
      null,
    );
    await button("使用模板数据", c).click();
    await c.locator("header").waitFor();
    assert.equal(await c.locator("[data-guest-id]").count(), 8);
    checks.push(
      "Conflicting datasets require explicit selection before canonical write",
    );
    // Full JSON import is validated and preserves a pre-import backup.
    await go("/admin/tag");
    const file = path.resolve(
      "WeddingAttendanceSystem/verification/artifacts/import.json",
    );
    fs.writeFileSync(file, JSON.stringify({ data: many }));
    page.once("dialog", (d) => d.accept());
    await page
      .getByLabel("导入 JSON 数据", { exact: true })
      .setInputFiles(file);
    await page.waitForFunction(
      () =>
        JSON.parse(localStorage.getItem("wedding-react-v2")).guests.length ===
        41,
    );
    assert(
      await page.evaluate(() =>
        Object.keys(localStorage).some((k) =>
          k.startsWith("wedding-react-v2:backup:"),
        ),
      ),
    );
    checks.push("Validated JSON import and pre-import recovery backup");
    const imported = await state();
    fs.writeFileSync(
      file,
      JSON.stringify({ data: { ...imported, version: 99 } }),
    );
    await page
      .getByLabel("导入 JSON 数据", { exact: true })
      .setInputFiles(file);
    await page
      .getByRole("status")
      .filter({ hasText: "此数据版本暂不支持" })
      .waitFor();
    assert.deepEqual(await state(), imported);
    checks.push(
      "Unsupported imported schema is rejected without replacing data",
    );
    // Capture pristine desktop/mobile views for comparison to the existing template.
    const visual = await browser.newContext();
    const v = await visual.newPage();
    v.on("pageerror", (e) => errors.push(e.message));
    for (const width of [1280, 390])
      for (const route of [
        "/",
        "/admin/dashboard",
        "/admin/add-guest",
        "/admin/table-setting",
      ]) {
        await v.setViewportSize({ width, height: 960 });
        await go(route, v);
        await v.waitForFunction(
          () =>
            getComputedStyle(document.querySelector("header")).position ===
            "sticky",
        );
        assert(
          !(await v.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          )),
          route + " overflow",
        );
        await v.screenshot({
          path:
            "WeddingAttendanceSystem/verification/artifacts/" +
            (route === "/" ? "main" : route.split("/").at(-1)) +
            "-" +
            width +
            ".png",
          fullPage: true,
        });
      }
    checks.push(
      "Desktop/mobile routes render without horizontal document overflow",
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS " +
        checks.length +
        " checks:\n" +
        checks.map((c) => " - " + c).join("\n"),
    );
    fs.writeFileSync(
      "WeddingAttendanceSystem/verification/artifacts/results.json",
      JSON.stringify({ checks, errors }, null, 2),
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error("Completed:", checks);
  console.error(e);
  process.exitCode = 1;
});
