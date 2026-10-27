import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { nextStatuses, canTransition, isTerminal, isTaskStatus } from "../lib/workflow";
import { TASK_STATUSES } from "../lib/types";

describe("状态流转规则", () => {
  it("新任务只能被批准或取消", () => {
    assert.deepEqual([...nextStatuses("Pending")], ["Approve", "Cancelled"]);
  });

  it("主流程一路走到底", () => {
    assert.ok(canTransition("Pending", "Approve"));
    assert.ok(canTransition("Approve", "To Do"));
    assert.ok(canTransition("To Do", "Done"));
  });

  it("不能跳步", () => {
    assert.equal(canTransition("Pending", "Done"), false);
    assert.equal(canTransition("Pending", "To Do"), false);
    assert.equal(canTransition("Approve", "Done"), false);
  });

  it("不能倒退", () => {
    assert.equal(canTransition("Approve", "Pending"), false);
    assert.equal(canTransition("To Do", "Approve"), false);
    assert.equal(canTransition("Done", "To Do"), false);
  });

  it("Done 和 Cancelled 是终态", () => {
    assert.ok(isTerminal("Done"));
    assert.ok(isTerminal("Cancelled"));
    assert.equal(nextStatuses("Done").length, 0);
  });

  it("每个状态都在流转表里，没有漏掉的", () => {
    for (const status of TASK_STATUSES) {
      assert.ok(Array.isArray(nextStatuses(status)), `${status} 缺少流转定义`);
    }
  });

  it("流转目标里不会出现未知状态", () => {
    for (const status of TASK_STATUSES) {
      for (const target of nextStatuses(status)) {
        assert.ok(isTaskStatus(target), `${target} 不是合法状态`);
      }
    }
  });

  it("拒绝了来自表单的伪造状态", () => {
    assert.equal(isTaskStatus("Deleted"), false);
    assert.equal(isTaskStatus(""), false);
    assert.equal(isTaskStatus(null), false);
  });
});
