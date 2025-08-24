import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/programs/flexible - Get all programs with flexible pricing
export async function GET() {
  try {
    const programs = await prisma.program.findMany({
      include: {
        pricingOptions: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
        programType: true,
        year: true,
        registrations: {
          include: {
            entries: {
              include: {
                pricingOption: true,
              },
            },
            season: true,
          },
        },
      },
      orderBy: [{ year: { year: "desc" } }, { createdAt: "desc" }],
    });

    return NextResponse.json(programs);
  } catch (error) {
    console.error("Error fetching flexible programs:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/programs/flexible - Create new program with custom pricing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      yearId,
      programTypeId, // Optional for categorization
      name,
      sessionDuration,
      isMonthly,
      venueSplitPercent,
      pricingOptions,
    } = body;

    // Validate required fields
    if (
      !yearId ||
      !name ||
      sessionDuration === undefined ||
      venueSplitPercent === undefined
    ) {
      return NextResponse.json(
        {
          message:
            "Missing required fields: yearId, name, sessionDuration, venueSplitPercent",
        },
        { status: 400 }
      );
    }

    if (
      !pricingOptions ||
      !Array.isArray(pricingOptions) ||
      pricingOptions.length === 0
    ) {
      return NextResponse.json(
        { message: "At least one pricing option is required" },
        { status: 400 }
      );
    }

    // Validate pricing options
    for (const option of pricingOptions) {
      if (!option.name || !option.price || option.price <= 0) {
        return NextResponse.json(
          {
            message: "Each pricing option must have a name and positive price",
          },
          { status: 400 }
        );
      }
    }

    // Create program with pricing options in a transaction
    const newProgram = await prisma.$transaction(async (tx) => {
      // Create the program
      const program = await tx.program.create({
        data: {
          yearId,
          programTypeId: programTypeId || null,
          name,
          sessionDuration,
          isMonthly: isMonthly || false,
          venueSplitPercentNew: venueSplitPercent,
          // Legacy fields - set defaults to maintain compatibility
          fullPrice: pricingOptions[0]?.price || 0,
          halfPrice: pricingOptions[1]?.price || null,
          subscriptionPrice:
            pricingOptions.find((p) =>
              p.name.toLowerCase().includes("subscription")
            )?.price || null,
          venueSplitPercent: venueSplitPercent,
        },
      });

      // Create pricing options
      const pricingOptionData = pricingOptions.map(
        (option: any, index: number) => ({
          programId: program.id,
          name: option.name,
          price: parseInt(option.price),
          order: option.order !== undefined ? option.order : index,
          isActive: option.isActive !== undefined ? option.isActive : true,
        })
      );

      await tx.pricingOption.createMany({
        data: pricingOptionData,
      });

      return program;
    });

    // Fetch the complete program data to return
    const completeProgram = await prisma.program.findUnique({
      where: { id: newProgram.id },
      include: {
        pricingOptions: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
        programType: true,
        year: true,
      },
    });

    return NextResponse.json(completeProgram, { status: 201 });
  } catch (error) {
    console.error("Error creating flexible program:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
