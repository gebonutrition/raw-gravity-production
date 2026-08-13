const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyDVcre5NgN8XKPA8IZYqXH_fvyyM8-XjCCUClpQbDzJOKMFOBTed2MoOa1bcAwPPdb/exec";

const LANDING_NAME = "raw-gravity";

const form = document.getElementById("lead-form");
const emailInput = document.getElementById("email-input");
const submitButton = document.getElementById("email-submit");
const successState = document.getElementById("success-state");

if (!form || !emailInput || !submitButton || !successState) {
  console.error("Email form elements not found.");
} else {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();

    if (!email) {
      return;
    }

    const source =
      new URLSearchParams(window.location.search).get("source") || "unknown";

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    const iframeName = "google-sheets-submit";

    let iframe = document.getElementById(iframeName);

    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = iframeName;
      iframe.name = iframeName;

      iframe.style.display = "none";

      document.body.appendChild(iframe);
    }

    const submitForm = document.createElement("form");

    submitForm.method = "POST";
    submitForm.action = GOOGLE_SCRIPT_URL;
    submitForm.target = iframeName;
    submitForm.style.display = "none";

    const emailField = document.createElement("input");
    emailField.type = "hidden";
    emailField.name = "email";
    emailField.value = email;

    const landingField = document.createElement("input");
    landingField.type = "hidden";
    landingField.name = "landing";
    landingField.value = LANDING_NAME;

    const sourceField = document.createElement("input");
    sourceField.type = "hidden";
    sourceField.name = "source";
    sourceField.value = source;

    submitForm.appendChild(emailField);
    submitForm.appendChild(landingField);
    submitForm.appendChild(sourceField);

    document.body.appendChild(submitForm);

    submitForm.submit();

    setTimeout(() => {
      submitForm.remove();

      form.style.display = "none";
      successState.style.display = "block";
    }, 1000);
  });
}