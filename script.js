const LANDING_NAME = "raw-gravity";
const AMAZON_URL = "https://amazon.com";

const form = document.getElementById("lead-form");
const emailInput = document.getElementById("email-input");
const submitButton = document.getElementById("email-submit");
const successState = document.getElementById("success-state");

if (!form || !emailInput || !submitButton || !successState) {
  console.error("Email form elements not found.");
} else {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();

    if (!email) {
      return;
    }

    const source =
      new URLSearchParams(window.location.search).get("source") || "unknown";

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          landing: LANDING_NAME,
          source: source
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Subscription failed");
      }

      form.style.display = "none";
      successState.style.display = "block";

      setTimeout(() => {
        window.location.href = AMAZON_URL;
      }, 2000);

    } catch (error) {
      console.error("Klaviyo submission error:", error);

      submitButton.disabled = false;
      submitButton.textContent = "I want the 40% code →";

      alert("Something went wrong. Please try again.");
    }
  });
}