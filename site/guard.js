// Subscribe forms soft-fail while the Buttondown account is pending review.
// Becomes a no-op once the real username replaces the placeholder.
(function () {
  "use strict";
  document.querySelectorAll("form[action*='REPLACE_WITH_BUTTONDOWN_USERNAME']").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      let hint = form.querySelector(".prompt-hint");
      if (!hint) {
        hint = document.createElement("p");
        hint.className = "prompt-hint";
        form.append(hint);
      }
      hint.textContent = "// subscriptions open shortly — the altar is still warming up.";
    });
  });
})();
