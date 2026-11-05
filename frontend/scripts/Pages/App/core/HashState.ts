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

    if (oldSection === "buy") {
      if (newSection === "buy") return STATENUM.REPLACE
    }

    if (newSection === "buy") return STATENUM.FORWARD
  }

  if (oldRoot === "orders") {
    if (newRoot === "explore") return STATENUM.BACK

    if (oldSection === "pay") {
      if (newSection === "pay") return STATENUM.REPLACE
    }

    if (newSection === "pay") return STATENUM.FORWARD
    // if (oldSection === "edit") {
    //   if (newSection === "edit") return STATENUM.REPLACE
    // }

    // if (newSection === "edit") return STATENUM.FORWARD
  }

  if (oldRoot === "bills") {
    if (newRoot === "explore") return STATENUM.BACK

    if (oldSection === "peek") {
      if (newSection === "peek") return STATENUM.REPLACE
    }

    if (newSection === "peek") return STATENUM.FORWARD
  }

  if (oldRoot === "me") {
    if (newRoot === "explore") return STATENUM.BACK
  }

  return 1
}
