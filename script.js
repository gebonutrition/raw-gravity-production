const LANDING_NAME = "wellness1";

const AMAZON_URLS = {
  tiktok:
    "https://www.amazon.com/dp/B0GTWB11LW?maas=maas_adg_9EAB36473ED1EB5F2AC4DBD00BF649CE_afap_abs&ref_=aa_maas&tag=maas",

  meta:
    "https://www.amazon.com/dp/B0GTWB11LW?maas=maas_adg_B05D582BAB7E5BC8F40DEBA1EBC61AEE_afap_abs&ref_=aa_maas&tag=maas",

  klaviyo:
    "https://www.amazon.com/dp/B0GTWB11LW?maas=maas_adg_25B95FF8BD805EF1A9DF6465C32333F9_afap_abs&ref_=aa_maas&tag=maas",

  instagram:
    "https://www.amazon.com/dp/B0GTWB11LW?maas=maas_adg_DA3922AD16009007A17A120E9C2F3E79_afap_abs&ref_=aa_maas&tag=maas"
};

const DEFAULT_AMAZON_URL = AMAZON_URLS.meta;

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

    const params = new URLSearchParams(window.location.search);

	const source = params.get("source") || "unknown";
	const creative = params.get("creative") || "unknown";

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
          source: source,
		  creative: creative
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Subscription failed");
      }

      form.style.display = "none";
      successState.style.display = "block";
	  if (typeof window.rawGravityTrackTikTokLead === "function") {
	  window.rawGravityTrackTikTokLead();
	}

	if (typeof window.rawGravityTrackMetaLead === "function") {
	  window.rawGravityTrackMetaLead();
	}

	const amazonUrl =
	  AMAZON_URLS[source.toLowerCase()] || DEFAULT_AMAZON_URL;

	setTimeout(() => {
	  window.location.href = amazonUrl;
	}, 2000);

    } catch (error) {
      console.error("Klaviyo submission error:", error);

      submitButton.disabled = false;
      submitButton.textContent = "I want the 25% code →";

      alert("Something went wrong. Please try again.");
    }
  });
}