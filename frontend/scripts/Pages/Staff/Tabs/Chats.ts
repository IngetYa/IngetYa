import type { IPrimary, IPrimaryConfig } from "@/Pages/Staff/types/StackTypes"
import { StackPrimary } from "../main/StackPrimary"
import { StateManager } from "../core/StateManager"
import { kel } from "@/core/kel"
import { type IStackHierarchy } from "@/core/hierarchy"
import waittime from "@/lib/waittime"
import { lang } from "@/core/languages"
import { type IRippleReturn } from "@/lib/Ripple"

export class Chats implements IPrimary {
  private el!: HTMLDivElement
  locked: boolean = false
  private anim?: string
  private king: StackPrimary
  manager: StateManager
  private _rippleCaches: IRippleReturn[] = []

  constructor(config: IPrimaryConfig) {
    this.king = config.king
    this.manager = config.manager
    this.anim = config.anim

    this.createElement()
  }

  private createElement(): void {
    this.el = kel("div", "AppMain StaffPage StaffChats")
    if (this.anim) {
      this.el.classList.add(this.anim)
      setTimeout(() => this.el.classList.remove(this.anim!), 300)
    }

    this.el.innerHTML = `
    <div class="ChatSideBar">
      <div class="Header">
        <div class="HeaderMain">
          <div class="Title">
            <h1><i class="fadr fa-comment-dots"></i> Chats</h1>
          </div>
        </div>
        <div class="Search">
          <div class="inp">
            <div class="icon"><i class="fajdr fa-magnifying-glass"></i></div>
            <input type="text" class="input-search-orders" placeholder="Cari nama user atau ID" />
            <div class="btn btn-search-orders">Cari</div>
          </div>
        </div>
      </div>

      <div class="FlatList">
        <div class="List">
          <div class="UserCard">
            <div class="UserProfile">
              <div class="avatar">
                <div class="initial-name">SF</div>
                <div class="dot"></div>
              </div>
              <div class="info">
                <div class="name">Stephanie Floriska</div>
                <div class="snippet">Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem, nesciunt?</div>
              </div>
            </div>
            <div class="UserStatus">
              <div class="time">11 Des 2017</div>
              <div class="unread">99</div>
            </div>
          </div>
          <div class="UserCard">
            <div class="UserProfile">
              <div class="avatar">
                <div class="initial-name">SF</div>
                <div class="dot"></div>
              </div>
              <div class="info">
                <div class="name">Stephanie Floriska</div>
                <div class="snippet">Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem, nesciunt?</div>
              </div>
            </div>
            <div class="UserStatus">
              <div class="time">11 Des 2017</div>
              <div class="unread">99</div>
            </div>
          </div>
          <div class="UserCard">
            <div class="UserProfile">
              <div class="avatar">
                <div class="initial-name">SF</div>
                <div class="dot"></div>
              </div>
              <div class="info">
                <div class="name">Stephanie Floriska</div>
                <div class="snippet">Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem, nesciunt?</div>
              </div>
            </div>
            <div class="UserStatus">
              <div class="time">11 Des 2017</div>
              <div class="unread">99</div>
            </div>
          </div>
          <div class="UserCard">
            <div class="UserProfile">
              <div class="avatar">
                <div class="initial-name">SF</div>
                <div class="dot"></div>
              </div>
              <div class="info">
                <div class="name">Stephanie Floriska</div>
                <div class="snippet">Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem, nesciunt?</div>
              </div>
            </div>
            <div class="UserStatus">
              <div class="time">11 Des 2017</div>
              <div class="unread">99</div>
            </div>
          </div>
        </div>
      </div>

    </div>
    <div class="ChatPanel">

      <div class="Header">
        <div class="HeaderMain">
          <div class="HistoryBack">
            <i class="fas fa-arrow-left"></i>
          </div>
          <div class="Title">
            <h1>Stephanie Floriska</h1>
          </div>
          <div class="Actions">
            <div class="btn btn-close-ticket">
              <i class="fadr fa-door-open"></i>
            </div>
          </div>
        </div>
      </div>


      <div class="ChatMessages">



        <div class="card">

          <div class="card-name">Staff IngetYa</div>
          <div class="card-media">
            <img src="/assets/example/olive.png" alt="Image Attachment">
            <div class="ofile">
              <div class="ofile-meta">
                <div class="ofile-title">Send File</div>
                <div class="ofile-name">hahaha.jpg</div>
              </div>
            </div>
          </div>

          <div class="card-text">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis nesciunt unde ab ad minima harum, amet repellat cumque, ullam ea quae. Labore unde repudiandae recusandae ut odit, nesciunt vero officiis!
          </div>

          <div class="card-meta">
            <span>11 Des 2017, 09:00</span>
          </div>

        </div>


        <div class="card me">

          <div class="card-name">Rachel Amabel</div>
          <div class="card-media">
            <div class="ofile">
              <div class="ofile-meta">
                <div class="ofile-title">Send File</div>
                <div class="ofile-name">hahaha.jpg</div>
              </div>
            </div>
          </div>

          <div class="card-text">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis nesciunt unde ab ad minima harum, amet repellat cumque, ullam ea quae. Labore unde repudiandae recusandae ut odit, nesciunt vero officiis!
          </div>

          <div class="card-meta">
            <span>11 Des 2017, 09:00</span>
          </div>

        </div>



      </div>

      <div class="ChatActions">
        <div class="ChatEmbed">
          <div class="attach">
            <div class="attach-file">
              <div class="icon">
                <i class="fas fa-file"></i>
              </div>
              <div class="file-meta">
                <div class="file-title">File</div>
                <div class="file-name">HahahaLOLXD.docx</div>
              </div>
            </div>
            <div class="btn btn-attach-cancel">
              <i class="fadr fa-circle-xmark"></i>
            </div>
          </div>
        </div>

        <div class="ChatForm">
          <div class="btn btn-attach">
            <i class="fajdr fa-paperclip"></i>
          </div>

          <textarea name="chat-text" id="chat-text" placeholder="Type Something" maxlength="300"></textarea>

          <div class="btn btn-send">
            <i class="fajdr fa-paper-plane"></i>
          </div>

        </div>
      </div>

    </div>`
  }

  async handleHistory(_hierarchy: IStackHierarchy): Promise<void> {}

  async destroy(anim?: string): Promise<void> {
    this._rippleCaches.forEach((r) => r.stopListener())
    this._rippleCaches.length = 0

    if (anim) {
      this.el.classList.add(anim)
      await waittime()
    }
    this.el.remove()
  }

  get html(): HTMLDivElement {
    return this.el
  }
}
