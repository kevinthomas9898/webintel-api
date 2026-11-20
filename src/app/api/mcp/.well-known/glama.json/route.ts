import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    $schema: "https://glama.ai/mcp/schemas/connector.json",
    claim: "glama_claim_iPs8chDUEUMuXwN_s94CjH-LfeU7iJmG",
  });
}
