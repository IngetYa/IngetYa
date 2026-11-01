import { type IStackHierarchy } from "@/core/hierarchy"
import { STATENUM } from "@/types/LibTypes"

export function getState(older: IStackHierarchy, newer: IStackHierarchy): STATENUM {
  const oldRoot = older.root
  const oldSection = older.section
  const _oldSub = older.sub

  const newRoot = newer.root
  const newSection = newer.section
  const _newSub = newer.sub

  if (oldRoot === "explore") {
    if (newRoot !== "explore") return STATENUM.FORWARD
    if (oldSection === "peek") {
      if (newSection === "peek") return STATENUM.REPLACE
    }

    if (newSection === "peek") return STATENUM.FORWARD
  }

  if (oldRoot === "orders") {
    if (newRoot === "explore") return STATENUM.BACK

    // if (oldSection === "edit") {
    //   if (newSection === "edit") return STATENUM.REPLACE
    // }

    // if (newSection === "edit") return STATENUM.FORWARD
  }

  if (oldRoot === "invoices") {
    if (newRoot === "explore") return STATENUM.BACK
  }

  if (oldRoot === "account") {
    if (newRoot === "explore") return STATENUM.BACK
  }

  return 1
}
