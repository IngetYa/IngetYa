import { type IStackHierarchy } from "@/core/hierarchy"
import { STATENUM } from "@/types/LibTypes"

export function getState(older: IStackHierarchy, newer: IStackHierarchy): STATENUM {
  const oldRoot = older.root
  const oldSection = older.section
  const _oldSub = older.sub

  const newRoot = newer.root
  const newSection = newer.section
  const _newSub = newer.sub

  if (oldRoot === "overview") {
    if (newRoot !== "overview") return STATENUM.FORWARD

    if (oldSection === "buy") {
      if (newSection === "buy") return STATENUM.REPLACE
    }

    if (newSection === "buy") return STATENUM.FORWARD
  }

  if (oldRoot === "balance") {
    if (newRoot === "overview") return STATENUM.BACK
  }

  if (oldRoot === "products") {
    if (newRoot === "overview") return STATENUM.BACK
  }

  if (oldRoot === "chats") {
    if (newRoot === "overview") return STATENUM.BACK
  }

  if (oldRoot === "orders") {
    if (newRoot === "overview") return STATENUM.BACK
  }

  if (oldRoot === "bills") {
    if (newRoot === "overview") return STATENUM.BACK
  }

  if (oldRoot === "users") {
    if (newRoot === "overview") return STATENUM.BACK
  }

  if (oldRoot === "me") {
    if (newRoot === "overview") return STATENUM.BACK
  }

  return STATENUM.REPLACE
}
