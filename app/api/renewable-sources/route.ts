import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const { data, error } = await supabase.from('renewable_sources').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { data, error } = await supabase.from('renewable_sources').insert([body]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, ...updateData } = body;
  const { data, error } = await supabase
    .from('renewable_sources')
    .update(updateData)
    .eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('renewable_sources')
    .delete()
    .eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
