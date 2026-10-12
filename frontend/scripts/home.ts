import "webfont-awesome-pro/css/fontawesome.css"
import "webfont-awesome-pro/css/jelly-duo-regular.css"

import {} from "@/scss/home.scss"

window.addEventListener("DOMContentLoaded", () => {
  console.log("dom content loaded")
  setTimeout(() => {
    document.body.innerHTML = '<i class="fajdr fa-user"></i> Lorem ipsum'
  }, 2000)
})
