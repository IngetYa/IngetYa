import { kel } from "@/core/kel"
import { Stack } from "@/Pages/Staff/Stack"
import waittime from "@/lib/waittime"
import { type IStackHierarchy } from "@/core/hierarchy"
import { Content } from "../Sections/Content"
import { Tabs } from "../Sections/Tabs"

export interface StackPrimaryConfig {
  stack: Stack
  anim?: string
}

export class StackPrimary {
  private el!: HTMLDivElement

  // 2 komponen utama, tabs (nav) & content
  tabs!: Tabs
  content!: Content

  private anim?: string

  stack: Stack

  constructor(config: StackPrimaryConfig) {
    this.stack = config?.stack
    this.anim = config?.anim
    this.createElement()
  }

  // bikin elemen utama
  private createElement(): void {
    this.el = kel("div", "Stack Stack-Primary")

    if (this.anim) {
      this.el.classList.add(this.anim)
      setTimeout(() => this.el.classList.remove(this.anim!), 300)
    }

    this.tabs = new Tabs({ king: this, manager: this.stack.manager })
    this.content = new Content({ king: this, manager: this.stack.manager })

    this.el.append(this.content.html, this.tabs.html)
  }

  // jalanin children-nya
  async setContent(id: string, hierarchy: IStackHierarchy): Promise<void> {
    await this.content.update(id, hierarchy)
  }

  async hide(status: boolean = true): Promise<void> {
    if (status) {
      this.el.classList.add("stackOut2")
      await waittime()
      this.el.classList.add("hide")
      this.el.classList.remove("stackOut2")
      return
    }

    this.el.classList.add("stackIn2")
    this.el.classList.remove("hide")
    await waittime()
    this.el.classList.remove("stackIn2")
  }

  // hapus stack saat ini only
  async destroy(): Promise<void> {
    this.el.classList.add("out")
    await waittime()
    this.el.remove()
  }

  get html(): HTMLDivElement {
    return this.el
  }

  async init(): Promise<void> {}
}
