import { IAny } from "#types/LibTypes"

class ConsoleLogger {
  // tadinya buat expose path, tapi ga jadi dah
  private origin: string

  constructor() {
    console.log(" ")
    console.log("Log Rules")
    console.log("🟢 >> Ok/Success")
    console.log("🟡 >> Warn/Info")
    console.log(" ")
    this.origin = this._getLogOrigin().split(/[\\/]/).pop()
  }

  private _getLogOrigin() {
    let filename: IAny

    const _pst = Error.prepareStackTrace

    Error.prepareStackTrace = function (err, stack) {
      return stack
    }

    try {
      const err: IAny = new Error()
      let callerfile: string

      const currentfile = err.stack?.shift?.().getFileName()

      while (err.stack.length) {
        callerfile = err.stack.shift().getFileName()

        if (currentfile !== callerfile) {
          filename = callerfile
          break
        }
      }
    } catch (_err) {
      filename = ""
      //
    }

    Error.prepareStackTrace = _pst

    return filename
  }

  info(content: string): void {
    console.log(`${new Date().toLocaleTimeString()} 🟡 ${content}`)
  }

  success(content: string): void {
    console.log(`${new Date().toLocaleTimeString()} 🟢 ${content}`)
  }

  error(content: unknown): void {
    console.log(`${new Date().toLocaleTimeString()} 🔴 ERROR ${this.origin}`)
    console.error(content)
  }
}

export default new ConsoleLogger()
