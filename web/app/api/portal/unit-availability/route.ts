import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { auth } from "@/lib/auth";
import { getUnitAvailabilityMaps } from "@/lib/availability/unit-availability";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError("Unauthorized", 401);
    }

    const excludeApplicationId =
      request.nextUrl.searchParams.get("excludeApplicationId") ?? undefined;

    const availability = await getUnitAvailabilityMaps(excludeApplicationId);
    return jsonOk(availability);
  } catch (error) {
    return handleApiError(error);
  }
}
