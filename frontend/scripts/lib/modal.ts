import { IResponse } from "../types/LibTypes"
import { iform } from "./iform"
import { eroot, futor, kel } from "@/core/kel"
import { lang } from "@/core/languages"
import waittime from "@/lib/waittime"

type STATUS_TITLE = "no-status" | undefined

interface IFormAlertConfig {
  header?: string
  msg?: string
  ok?(): void
  xok?: string
  status?: STATUS_TITLE
}

interface IFormConfirmConfig extends IFormAlertConfig {
  cancel?(): void
  xcancel?: string
}

interface IFormPromptConfig extends IFormConfirmConfig {
  max?: number
  textarea?: boolean
  value?: string
  placeholder?: string
  iregex?: RegExp
}

export interface ISelectionItem {
  id: string
  value?: string
  label: string
  checked?: boolean
}

interface IFormSelectConfig extends IFormConfirmConfig {
  items: ISelectionItem[]
}

let _onFormAbort: (() => void) | undefined

export async function formLoading(refunc: Promise<IResponse>, msg?: string | null, ts?: number): Promise<IResponse> {
  const loadingText = msg || lang("loading")

  const el = kel("div", "Loading")
  el.innerHTML = `<div class="box"><p><i class="fa-solid fa-circle-notch fa-spin"></i> ${loadingText}</p></div>`

  eroot().append(el)

  await waittime(ts)

  return await refunc
    .then((res) => {
      el.remove()
      return res
    })
    .catch((err) => {
      el.remove()
      return err
    })
}

export async function formAlert(message: string | IFormAlertConfig, status: STATUS_TITLE = undefined): Promise<void> {
  return await new Promise((resolve) => {
    const config: IFormAlertConfig = {
      header: "Oops",
      xok: lang("ok"),
      status
    }

    if (typeof message === "string") {
      config.msg = message
    } else {
      if (message.header) config.header = message.header
      if (message.msg) config.msg = message.msg
      if (message.ok) config.ok = message.ok
      if (message.xok) config.xok = message.xok
      if (message.status) config.status = message.status
    }

    const form = iform(`
    <div class="box">
      <div class="f status-title">
        <p class="title">${config.header}</p>
        <div class="btn btn-close"><i class="fa-jelly-fill fa-light fa-circle-xmark"></i></div>
      </div>

      <div class="f lg">
        <div class="i">
          <p class="tx center">${config.msg}</p>
        </div>
      </div>

      <div class="f">
        <div class="s">
          <button class="btn btn-ok">${config.xok}</button>
        </div>
      </div>
    </div>
    `)

    const btnClose = futor(".btn-close", form)
    btnClose.onclick = () => {
      form.remove()
      _onFormAbort = undefined
      resolve()
      if (config.ok) config.ok()
    }

    if (config.status === "no-status") {
      const statusField = futor(".status-title", form)
      statusField.remove()
    }

    form.onsubmit = (e) => {
      e.preventDefault()
      form.remove()
      _onFormAbort = undefined
      resolve()
      if (config.ok) config.ok()
    }

    const btnOk = futor(".btn-ok", form)

    _onFormAbort = () => {
      btnOk.click()
      _onFormAbort = undefined
    }

    eroot().append(form)
  })
}

export async function formConfirm(message: string | IFormConfirmConfig, status: STATUS_TITLE = undefined): Promise<boolean> {
  return await new Promise((resolve) => {
    const config: IFormConfirmConfig = {
      header: "",
      xok: lang("ok"),
      xcancel: lang("cancel"),
      status
    }

    if (typeof message === "string") {
      config.msg = message
    } else {
      if (message.header) config.header = message.header
      if (message.msg) config.msg = message.msg
      if (message.ok) config.ok = message.ok
      if (message.xok) config.xok = message.xok
      if (message.cancel) config.cancel = message.cancel
      if (message.xcancel) config.xcancel = message.xcancel
      if (message.status) config.status = message.status
    }

    if (status) config.status = status

    const form = iform(`
    <div class="box">
      <div class="f status-title">
        <p class="title">${config.header}</p>
        <div class="btn btn-close"><i class="fa-jelly-fill fa-light fa-circle-xmark"></i></div>
      </div>

      <div class="f lg">
        <div class="i">
          <p class="tx center">${config.msg}</p>
        </div>
      </div>

      <div class="f">
        <div class="s">
          <div class="btn btn-cancel">${config.xcancel}</div>
        </div>
        <div class="s">
          <button class="btn btn-ok">${config.xok}</button>
        </div>
      </div>
    </div>
    `)

    const btnClose = futor(".btn-close", form)
    btnClose.onclick = () => {
      form.remove()
      _onFormAbort = undefined
      resolve(false)
      if (config.cancel) config.cancel()
    }

    const btnCancel = futor(".btn-cancel", form)
    btnCancel.onclick = () => {
      form.remove()
      _onFormAbort = undefined
      resolve(false)
      if (config.cancel) config.cancel()
    }

    _onFormAbort = () => {
      btnCancel.click()
      _onFormAbort = undefined
    }

    if (config.status === "no-status") {
      const statusField = futor(".status-title", form)
      statusField.remove()
    }

    form.onsubmit = (e) => {
      e.preventDefault()
      form.remove()
      _onFormAbort = undefined
      resolve(true)
      if (config.ok) config.ok()
    }

    eroot().append(form)
  })
}

export async function formPrompt(message: string | IFormPromptConfig, status: STATUS_TITLE = undefined): Promise<string | null> {
  return await new Promise((resolve) => {
    const config: IFormPromptConfig = {
      header: "",
      xok: lang("ok"),
      xcancel: lang("cancel"),
      max: 0,
      textarea: false,
      placeholder: lang("type_here"),
      value: "",
      status
    }

    if (typeof message === "string") {
      config.msg = message
    } else {
      if (message.header) config.header = message.header
      if (message.msg) config.msg = message.msg
      if (message.ok) config.ok = message.ok
      if (message.xok) config.xok = message.xok
      if (message.cancel) config.cancel = message.cancel
      if (message.xcancel) config.xcancel = message.xcancel
      if (message.status) config.status = message.status
      if ((message.max || 0) >= 1) config.max = message.max
      if (message.textarea) config.textarea = message.textarea
      if (message.placeholder) config.placeholder = message.placeholder
      if (message.value) config.value = message.value
      if (message.iregex) config.iregex = message.iregex
    }

    if (status) config.status = status

    const formId = `form-${Date.now()}`

    const form = iform(`
    <div class="box">
      <div class="f status-title">
        <p class="title">${config.header}</p>
        <div class="btn btn-close"><i class="fa-jelly-fill fa-light fa-circle-xmark"></i></div>
      </div>

      <div class="f">
        <div class="i">
          <br />
          <div class="inp">
            <label for="${formId}" class="tx center">${config.msg}</label>
          </div>
          <br />
        </div>
      </div>

      <div class="f">
        <div class="s">
          <div class="btn btn-cancel">${config.xcancel}</div>
        </div>
        <div class="s">
          <button class="btn btn-ok">${config.xok}</button>
        </div>
      </div>
    </div>
    `)

    const field = futor(".inp", form)

    const inp = kel(config.textarea ? "textarea" : "input")

    if (inp instanceof HTMLInputElement) inp.type = "text"

    inp.className = "center"
    inp.name = formId
    inp.id = formId
    inp.readOnly = true
    inp.placeholder = config.placeholder!
    inp.value = config.value!
    if (config.max && config.max >= 1) inp.maxLength = config.max

    if (config.iregex) {
      const tpRegex = config.iregex!
      inp.oninput = () => (inp.value = inp.value.replace(tpRegex, ""))
    }

    field.append(inp)
    eroot().append(form)

    inp.focus()

    setTimeout(() => (inp.readOnly = false), 100)

    const btnClose = futor(".btn-close", form)
    btnClose.onclick = () => {
      form.remove()
      _onFormAbort = undefined
      resolve(null)
      if (config.cancel) config.cancel()
    }

    const btnCancel = futor(".btn-cancel", form)
    btnCancel.onclick = () => {
      form.remove()
      _onFormAbort = undefined
      resolve(null)
      if (config.cancel) config.cancel()
    }

    _onFormAbort = () => {
      btnCancel.click()
      _onFormAbort = undefined
    }

    if (config.status === "no-status") {
      const statusField = futor(".status-title", form)
      statusField.remove()
    }

    form.onsubmit = (e) => {
      e.preventDefault()
      _onFormAbort = undefined
      resolve(inp.value)
      form.remove()
      if (config.ok) config.ok()
    }
  })
}

export async function formSelect(message: string | IFormSelectConfig, status: STATUS_TITLE = undefined): Promise<string | null> {
  return await new Promise((resolve) => {
    const config: IFormSelectConfig = {
      header: "",
      xok: lang("ok"),
      xcancel: lang("cancel"),
      items: [],
      status
    }

    if (typeof message === "string") {
      config.msg = message
    } else {
      if (message.header) config.header = message.header
      if (message.msg) config.msg = message.msg
      if (message.ok) config.ok = message.ok
      if (message.xok) config.xok = message.xok
      if (message.cancel) config.cancel = message.cancel
      if (message.xcancel) config.xcancel = message.xcancel
      if (message.status) config.status = message.status
      if (message.items) config.items = message.items
    }

    if (status) config.status = status

    const formId = `form-${Date.now()}`

    const form = iform(`
    <div class="box">
      <div class="f status-title">
        <p class="title">${config.header}</p>
        <div class="btn btn-close"><i class="fa-jelly-fill fa-light fa-circle-xmark"></i></div>
      </div>

      <div class="f">
        <div class="i">
          <br />
          <p class="tx center">${config.msg}</p>
          <div class="groups group-radio">
          </div>
          <br />
        </div>
      </div>

      <div class="f">
        <div class="s">
          <div class="btn btn-cancel">${config.xcancel}</div>
        </div>
        <div class="s">
          <button class="btn btn-ok">${config.xok}</button>
        </div>
      </div>
    </div>
    `)

    const group = futor(".group-radio", form)

    config.items.forEach((itm) => {
      const field = kel("div", "f p")

      const radioOuter = kel("div", "radio")

      const radioLabel = kel("label")
      radioLabel.setAttribute("for", itm.id)

      radioOuter.append(radioLabel)

      const radioInput = kel("input")
      radioInput.type = "radio"
      radioInput.name = formId
      radioInput.id = itm.id
      radioInput.value = itm.value ?? itm.id
      radioInput.checked = !!itm.checked

      const radioSpan = kel("span")
      radioSpan.innerText = itm.value ?? itm.id

      radioLabel.append(radioInput, radioSpan)

      field.append(radioOuter)

      group.append(field)
    })

    eroot().append(form)

    const btnClose = futor(".btn-close", form)
    btnClose.onclick = () => {
      form.remove()
      _onFormAbort = undefined
      resolve(null)
      if (config.cancel) config.cancel()
    }

    const btnCancel = futor(".btn-cancel", form)
    btnCancel.onclick = () => {
      form.remove()
      _onFormAbort = undefined
      resolve(null)
      if (config.cancel) config.cancel()
    }

    _onFormAbort = () => {
      btnCancel.click()
      _onFormAbort = undefined
    }

    if (config.status === "no-status") {
      const statusField = futor(".status-title", form)
      statusField.remove()
    }

    form.onsubmit = (e) => {
      e.preventDefault()
      const formData = new FormData(form)
      form.remove()
      _onFormAbort = undefined
      resolve(formData.get(formId)?.toString() || null)
      if (config.ok) config.ok()
    }
  })
}

export function formAbort(): void {
  if (_onFormAbort) {
    _onFormAbort()
    _onFormAbort = undefined
  }
}
