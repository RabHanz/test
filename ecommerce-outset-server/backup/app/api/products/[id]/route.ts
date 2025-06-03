import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { UpdateProductData } from '@/types/product';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { error: 'Error fetching product' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 401 }
      );
    }

    const body: UpdateProductData = await req.json();
    const { name, description, price, image, stock, category } = body;

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price,
        image,
        stock,
        category,
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { error: 'Error updating product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 401 }
      );
    }

    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json(
      { error: 'Error deleting product' },
      { status: 500 }
    );
  }
} 