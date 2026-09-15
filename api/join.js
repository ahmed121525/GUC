export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed.',
    });
  }

  try {
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body || '{}')
        : req.body || {};

    if (body.website) {
      return res.status(200).json({ ok: true });
    }

    const required = [
      'name',
      'email',
      'phone',
      'dob',
      'city',
      'occupation',
      'interest',
      'availability',
      'experience',
      'why',
      'consent',
    ];

    const missing = required.find((key) => !body[key]);

    if (missing) {
      return res.status(400).json({
        error: `Please complete the ${missing} field.`,
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(body.email)) {
      return res.status(400).json({
        error: 'Please enter a valid email address.',
      });
    }

    const destination = process.env.CONTACT_EMAIL;
    const apiKey = process.env.RESEND_API_KEY;
    const from =
      process.env.EMAIL_FROM ||
      'GUC Website <onboarding@resend.dev>';

    if (!destination || !apiKey) {
      return res.status(503).json({
        error:
          'Email delivery is not configured. Add CONTACT_EMAIL and RESEND_API_KEY in Vercel.',
      });
    }

    const text = [
      'New GUC Join Us application',
      '',
      `Name: ${body.name}`,
      `Email: ${body.email}`,
      `Phone: ${body.phone}`,
      `Age / DOB: ${body.dob}`,
      `City: ${body.city}`,
      `Occupation: ${body.occupation}`,
      `Interest: ${body.interest}`,
      `Availability: ${body.availability}`,
      '',
      'Experience:',
      body.experience,
      '',
      'Why GUC:',
      body.why,
    ].join('\n');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [destination],
        reply_to: body.email,
        subject: `GUC Join Us — ${body.name}`,
        text,
      }),
    });

    const resendData = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('Resend API error:', resendData);

      return res.status(response.status).json({
        error:
          resendData?.message ||
          resendData?.error ||
          'Resend rejected the email request.',
        resend: resendData,
      });
    }

    return res.status(200).json({
      ok: true,
      id: resendData?.id,
    });
  } catch (err) {
    console.error('Join API error:', err);

    return res.status(500).json({
      error:
        err instanceof Error
          ? err.message
          : 'Unexpected server error.',
    });
  }
}