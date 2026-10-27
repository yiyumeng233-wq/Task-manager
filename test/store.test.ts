import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { before, describe, it } from "node:test";

// 必须在 import store 之前指到临时文件，否则会写坏真实的 data/db.json
process.env.DB_PATH = path.join(mkdtempSync(path.join(os.tmpdir(), "tm-store-")), "db.json");

type Store = typeof import("../lib/store");
type Password = typeof import("../lib/password");

let store: Store;
let password: Password;

before(async () => {
  store = await import("../lib/store");
  password = await import("../lib/password");
});

describe("JSON 存储层", () => {
  it("第一次读取会落一份种子数据", () => {
    const tasks = store.listTasks();
    assert.ok(tasks.length >= 5);
    assert.ok(tasks.every((t) => t.id.startsWith("T-")));
  });

  it("密码是散列存的，且能校验通过", () => {
    const admin = store.findUserByEmail("ADMIN@example.com");
    assert.ok(admin);
    assert.notEqual(admin.passwordHash, "admin123");
    assert.ok(password.verifyPassword("admin123", admin.passwordHash));
    assert.equal(password.verifyPassword("wrong-password", admin.passwordHash), false);
  });

  it("新建的任务固定从 Pending 开始", () => {
    const task = store.createTask({
      title: "Write the README",
      description: "Explain how to run it and why the pieces are where they are.",
      assignee: "Yuheng Yang",
      createdBy: "Yuheng Yang",
    });

    assert.equal(task.status, "Pending");
    assert.equal(task.history.length, 1);
    assert.equal(task.history[0].from, null);
    assert.equal(store.getTask(task.id)?.title, "Write the README");
  });

  it("流转会同时更新状态、时间戳和历史", () => {
    const created = store.createTask({
      title: "Move me forward",
      description: "Used by the test to check the transition side effects.",
      assignee: "",
      createdBy: "Yuheng Yang",
    });

    const updated = store.transitionTask(created.id, "Approve", "Yuheng Yang", "looks fine");
    assert.ok(updated);
    assert.equal(updated.status, "Approve");
    assert.equal(updated.assignee, "Unassigned");
    assert.equal(updated.history.length, 2);
    assert.equal(updated.history[1].from, "Pending");
    assert.equal(updated.history[1].to, "Approve");
    assert.ok(updated.updatedAt >= created.updatedAt);
  });

  it("删除后查不到", () => {
    const created = store.createTask({
      title: "Delete me",
      description: "Only exists to be removed in this test case.",
      assignee: "",
      createdBy: "Yuheng Yang",
    });

    assert.equal(store.deleteTask(created.id), true);
    assert.equal(store.getTask(created.id), null);
    assert.equal(store.deleteTask(created.id), false);
  });
});
