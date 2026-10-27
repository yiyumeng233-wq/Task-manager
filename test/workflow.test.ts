import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { nextStatuses, canTransition, isTerminal, isTaskStatus } from "../lib/workflow";
import { TASK_STATUSES } from "../lib/types";

describe("Status transition rules", () => {
  it("allows a pending task to be approved or cancelled", () => {
    assert.deepEqual([...nextStatuses("Pending")], ["Approve", "Cancelled"]);
  });

  it("supports the complete main workflow", () => {
    assert.ok(canTransition("Pending", "Approve"));
    assert.ok(canTransition("Approve", "To Do"));
    assert.ok(canTransition("To Do", "Done"));
  });

  it("rejects skipped workflow steps", () => {
    assert.equal(canTransition("Pending", "Done"), false);
    assert.equal(canTransition("Pending", "To Do"), false);
    assert.equal(canTransition("Approve", "Done"), false);
  });

  it("rejects backward transitions", () => {
    assert.equal(canTransition("Approve", "Pending"), false);
    assert.equal(canTransition("To Do", "Approve"), false);
    assert.equal(canTransition("Done", "To Do"), false);
  });

  it("treats Done and Cancelled as terminal states", () => {
    assert.ok(isTerminal("Done"));
    assert.ok(isTerminal("Cancelled"));
    assert.equal(nextStatuses("Done").length, 0);
  });

  it("defines transitions for every status", () => {
    for (const status of TASK_STATUSES) {
      assert.ok(Array.isArray(nextStatuses(status)), `${status} has no transition definition`);
    }
  });

  it("uses only known statuses as transition targets", () => {
    for (const status of TASK_STATUSES) {
      for (const target of nextStatuses(status)) {
        assert.ok(isTaskStatus(target), `${target} is not a valid status`);
      }
    }
  });

  it("rejects forged status values from forms", () => {
    assert.equal(isTaskStatus("Deleted"), false);
    assert.equal(isTaskStatus(""), false);
    assert.equal(isTaskStatus(null), false);
  });
});
