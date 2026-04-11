import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import { prisma } from "@/lib/prisma";

const userId = "1";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    const text = await file.text();

    const parser = new XMLParser();
    const json = parser.parse(text);

    const detalles = json?.factura?.detalles?.detalle || [];

    const products = await prisma.product.findMany({
      where: { userId },
    });

    type XmlDetalle = {
      descripcion: string;
      cantidad: string;
    };

    const result = (Array.isArray(detalles) ? detalles : [detalles]).map(
      (d: XmlDetalle) => {
        const name = d.descripcion;
        const quantity = Number(d.cantidad);

        const match = products.find(
          (p) => p.name.toLowerCase() === name.toLowerCase(),
        );

        return {
          productName: name,
          quantity,
          matched: !!match,
          matchedProductId: match?.id || null,
        };
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al procesar XML" },
      { status: 500 },
    );
  }
}
