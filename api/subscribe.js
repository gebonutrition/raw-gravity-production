export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    const { email } = req.body || {};

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        error: "Valid email is required"
      });
    }

    const response = await fetch(
      "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs",
      {
        method: "POST",

        headers: {
          Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_API_KEY}`,
          Accept: "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          Revision: "2026-07-15"
        },

        body: JSON.stringify({
          data: {
            type: "profile-subscription-bulk-create-job",

            attributes: {
              profiles: {
                data: [
                  {
                    type: "profile",

                    attributes: {
                      email: email,

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

    const responseText = await response.text();

    if (!response.ok) {
      console.error(
        "Klaviyo API error:",
        response.status,
        responseText
      );

      return res.status(502).json({
        success: false,
        error: "Klaviyo request failed"
      });
    }

    console.log(
      "Klaviyo subscription accepted:",
      response.status,
      responseText
    );

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