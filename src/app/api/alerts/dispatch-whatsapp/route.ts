import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const accountSid = (
      process.env.TWILIO_ACCOUNT_SID ||
      body.account_sid ||
      ""
    ).trim();

    const authToken = (
      process.env.TWILIO_AUTH_TOKEN ||
      body.auth_token ||
      ""
    ).trim();

    const fromNumber = (
      process.env.TWILIO_WHATSAPP_FROM ||
      body.from_phone ||
      ""
    ).trim();

    const rawTo = (
      process.env.TWILIO_WHATSAPP_TO ||
      body.recipient_phone ||
      ""
    ).trim();

    if (!rawTo) {
      return NextResponse.json({
        success: false,
        warning: "TWILIO_WHATSAPP_TO environment variable is not configured. Outbound notification cancelled.",
      });
    }

    const formattedTo = rawTo.startsWith("whatsapp:")
      ? rawTo
      : `whatsapp:${rawTo.startsWith("+") ? rawTo : "+" + rawTo}`;

    const camName = body.camera_name || "Camera A - Junction North";
    const camId = body.camera_id || "CAM-001";
    const node = body.road_graph_node_id || "RN-101";
    const eventType = (body.event_type || "VERIFIED INCIDENT").replace(/_/g, " ").toUpperCase();
    const severity = (body.severity || "HIGH").toUpperCase();
    const conf = Math.round((Number(body.confidence) || 0.94) * 100);
    const vehicleClass = body.vehicle_details?.objectClass || body.vehicle_class || "Car";
    const plate = body.vehicle_details?.licensePlate || body.plate || "MH31CB8061";
    const trustScore = body.trust_score || "0.94";
    const operator = body.operator_name || "Operator Desk";
    const timeStr = new Date().toLocaleTimeString("en-IN", { hour12: false });

    const messageText = `🚨 *TRACKSURE VERIFIED ALERT NOTIFICATION* 🚨
━━━━━━━━━━━━━━━━━━━━━
📍 *Camera Node:* ${camName} (${node} · ${camId})
⚠️ *Alert Type:* ${eventType}
🔴 *Severity:* ${severity} (Link Trust: ${trustScore})
🚗 *Target Vehicle:* ${vehicleClass}
🔢 *Consensus Plate:* *${plate}* (${conf}% AI Consensus)
⏱️ *Detection Time:* ${timeStr} IST
👤 *Authorized By:* ${operator} (Human Confirmation)
━━━━━━━━━━━━━━━━━━━━━
📡 *TrackSure Multi-Camera Intelligence | PS 26127*`;

    if (!accountSid || !authToken || !fromNumber) {
      return NextResponse.json({
        success: false,
        warning: "Twilio credentials are not configured in server environment variables.",
        formatted_message: messageText,
      });
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const params = new URLSearchParams();
    params.append("From", fromNumber);
    params.append("To", formattedTo);
    params.append("Body", messageText);

    const twilioRes = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const twilioData = await twilioRes.json();

    if (!twilioRes.ok) {
      return NextResponse.json({
        success: false,
        error: twilioData.message || "Failed to dispatch via Twilio API",
      });
    }

    return NextResponse.json({
      success: true,
      sid: twilioData.sid,
      status: twilioData.status,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
