import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

export function validateRequest(schema: z.ZodSchema) {
  return async (body: any) => {
    try {
      await schema.parseAsync(body);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: error.errors.map((err) => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }
  };
}

export function validateQuery(schema: z.ZodSchema) {
  return async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const query = Object.fromEntries(searchParams.entries());
      await schema.parseAsync(query);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: error.errors.map((err) => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }
  };
}

export function validateHeaders(schema: z.ZodSchema) {
  return async (request: NextRequest) => {
    try {
      const headers = Object.fromEntries(request.headers.entries());
      await schema.parseAsync(headers);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: error.errors.map((err) => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }
  };
}