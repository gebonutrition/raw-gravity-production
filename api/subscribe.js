export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    const { email, landing, source } = req.body || {};

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        error: "Valid email is required"
      });
    }

    const cleanEmail = email.trim();
    const cleanLanding = String(landing || "raw-gravity").trim();
    const cleanSource = String(source || "unknown").trim();

    const headers = {
      Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_API_KEY}`,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Revision: "2026-07-15"
    };

    /*
     * STEP 1
     * Create or update the Klaviyo profile with custom properties.
     */
    const profileResponse = await fetch(
      "https://a.klaviyo.com/api/profile-import",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          data: {
            type: "profile",
            attributes: {
              email: cleanEmail,
              properties: {
                landing: cleanLanding,
                source: cleanSource
              }
            }
          }
        })
      }
    );

    const profileText = await profileResponse.text();

    if (!profileResponse.ok) {
      console.error(
        "Klaviyo profile error:",
        profileResponse.status,
        profileText
      );

      return res.status(502).json({
        success: false,
        error: "Klaviyo profile update failed"
      });
    }

    /*
     * STEP 2
     * Subscribe the profile to the RAW GRAVITY list.
     */
    const subscribeResponse = await fetch(
      "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          data: {
            type: "profile-subscription-bulk-create-job",
            attributes: {
              profiles: {
                data: [
                  {
                    type: "profile",
                    attributes: {
                      email: cleanEmail,
                      subscriptions: {
                        email: {
                          marketing: {
                            consent: "SUBSCRIBED"
                          }
                        }
                      }
                    }
                  }
                ]
              }
            },
            relationships: {
              list: {
                data: {
                  type: "list",
                  id: "XFy4S3"
                }
              }
            }
          }
        })
      }
    );

    const subscribeText = await subscribeResponse.text();

    if (!subscribeResponse.ok) {
      console.error(
        "Klaviyo subscription error:",
        subscribeResponse.status,
        subscribeText
      );

      return res.status(502).json({
        success: false,
        error: "Klaviyo subscription failed"
      });
    }

    console.log("Klaviyo profile updated:", profileResponse.status);
    console.log("Klaviyo subscription accepted:", subscribeResponse.status);

    return res.status(200).json({
      success: true
    });

  } catch (error) {
    console.error("Vercel API error:", error);

    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
}