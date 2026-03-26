import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

function v(val: any): string | null {
  if (val === undefined || val === null || String(val).trim() === '') return null;
  return String(val).trim();
}
function vNum(val: any): number | null {
  const n = parseFloat(String(val).replace(/,/g, ''));
  return isNaN(n) ? null : n;
}
function vInt(val: any): number | null {
  const n = parseInt(String(val));
  return isNaN(n) ? null : n;
}
function vDate(val: any): string | null {
  if (!val || String(val).trim() === '') return null;
  const s = String(val).trim();
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  return null;
}

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Request body is too large or not valid JSON. Try a smaller file or split the CSV.' },
        { status: 413 }
      );
    }

    const { rows, fileName, fileSize, fileId: existingFileId, init } = body;

    // ── INIT MODE ─────────────────────────────────────────────────────────────
    // Frontend calls this first with init:true to create the upload record and
    // get back a stable fileId before sending any row chunks.
    if (init) {
      const { data: uploadRecord, error: uploadError } = await supabase
        .from('csv_uploads')
        .insert({
          file_name: fileName ?? 'unknown.csv',
          file_size: fileSize ?? null,
          status: 'processing',
        })
        .select('id')
        .single();

      if (uploadError || !uploadRecord) {
        return NextResponse.json({ error: 'Failed to create upload record' }, { status: 500 });
      }

      return NextResponse.json({ fileId: uploadRecord.id });
    }

    // ── CHUNK MODE ────────────────────────────────────────────────────────────
    // Each subsequent call sends a slice of rows with the fileId already known.
    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    if (!existingFileId) {
      return NextResponse.json({ error: 'Missing fileId' }, { status: 400 });
    }

    const fileId = existingFileId;

    // Check duplicates only against the BINs present in this chunk —
    // avoids loading the entire table on every request.
    const chunkBINs = rows
      .map((row: any) => v(row['Business Identification Number']))
      .filter(Boolean) as string[];

    const { data: existing } = await supabase
      .from('business_records')
      .select('"Business Identification Number"')
      .in('"Business Identification Number"', chunkBINs);

    const existingBINs = new Set(
      (existing ?? []).map((r: any) => r['Business Identification Number'])
    );

    const newRows = rows.filter((row: any) => {
      const bin = v(row['Business Identification Number']);
      return bin && !existingBINs.has(bin);
    });

    const skippedCount = rows.length - newRows.length;
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    const BATCH_SIZE = 100;

    for (let i = 0; i < newRows.length; i += BATCH_SIZE) {
      const batch = newRows.slice(i, i + BATCH_SIZE);

      const records = batch.map((row: any) => ({
        "Business Identification Number": v(row['Business Identification Number']),
        "Business Name":                  v(row['Business Name']),
        "Trade Name":                     v(row['Trade Name']),
        "Business Nature":                v(row['Business Nature']),
        "Business Line":                  v(row['Business Line']),
        "Business Type":                  v(row['Business Type']),
        "Transmittal No.":                v(row['Transmittal No.']),
        "Incharge First Name":            v(row['Incharge First Name']),
        "Incharge Middle Name":           v(row['Incharge Middle Name']),
        "Incharge Last Name":             v(row['Incharge Last Name']),
        "Incharge Extension Name":        v(row['Incharge Extension Name']),
        "Incharge Sex":                   v(row['Incharge Sex']),
        "Citizenship":                    v(row['Citizenship']),
        "Office Street":                  v(row['Office Street']),
        "Office Region":                  v(row['Office Region']),
        "Office Province":                v(row['Office Province']),
        "Office Municipality":            v(row['Office Municipality']),
        "Office Barangay":                v(row['Office Barangay']),
        "Office Zipcode":                 v(row['Office Zipcode']),
        "Year":                           vInt(row['Year']),
        "Capital":                        vNum(row['Capital']),
        "Gross Amount":                   vNum(row['Gross Amount']),
        "Gross Amount Essential":         vNum(row['Gross Amount Essential']),
        "Gross Amount Non-Essential":     vNum(row['Gross Amount Non-Essential']),
        "Reject Remarks":                 v(row['Reject Remarks']),
        "Module Type":                    v(row['Module Type']),
        "Transaction Type":               v(row['Transaction Type']),
        "Requestor First Name":           v(row['Requestor First Name']),
        "Requestor Middle Name":          v(row['Requestor Middle Name']),
        "Requestor Last Name":            v(row['Requestor Last Name']),
        "Requestor Extension Name":       v(row['Requestor Extension Name']),
        "Requestor Email":                v(row['Requestor Email']),
        "Requestor Mobile No.":           v(row['Requestor Mobile No.']),
        "Birth Date":                     vDate(row['Birth Date']),
        "Requestor Sex":                  v(row['Requestor Sex']),
        "Civil Status":                   v(row['Civil Status']),
        "Requestor Street":               v(row['Requestor Street']),
        "Requestor Province":             v(row['Requestor Province']),
        "Requestor Municipality":         v(row['Requestor Municipality']),
        "Requestor Barangay":             v(row['Requestor Barangay']),
        "Requestor Zipcode":              v(row['Requestor Zipcode']),
        "Transaction ID":                 v(row['Transaction ID']),
        "Reference No.":                  v(row['Reference No.']),
        "Brgy. Clearance Status":         v(row['Brgy. Clearance Status']),
        "SITE Transaction Status":        v(row['SITE Transaction Status']),
        "CORE Transaction Status":        v(row['CORE Transaction Status']),
        "Transaction Date":               vDate(row['Transaction Date']),
        "SOA No.":                        v(row['SOA No.']),
        "Annual Amount":                  vNum(row['Annual Amount']),
        "Term":                           v(row['Term']),
        "Amount Paid":                    vNum(row['Amount Paid']),
        "Balance":                        vNum(row['Balance']),
        "Payment Type":                   v(row['Payment Type']),
        "Payment Date":                   vDate(row['Payment Date']),
        "O.R. No.":                       v(row['O.R. No.']),
        "Brgy. Clearance No.":            v(row['Brgy. Clearance No.']),
        "O.R. Date":                      vDate(row['O.R. Date']),
        "Permit No.":                     v(row['Permit No.']),
        "Business Plate No.":             v(row['Business Plate No.']),
        "Actual Closure Date":            vDate(row['Actual Closure Date']),
        "Retirement Reason":              v(row['Retirement Reason']),
        "Source Type":                    v(row['Source Type']),
        // Any extra columns in the Supabase table that are NOT listed here
        // will simply be omitted — Supabase uses their default value (null).
        "status":  'not reviewed',
        "file_id": fileId,
      }));

      const { error } = await supabase.from('business_records').insert(records);

      if (error) {
        errorCount += batch.length;
        if (errors.length < 10) errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
      } else {
        successCount += batch.length;
      }
    }

    // Update the upload record after every chunk so the final state is correct
    await supabase
      .from('csv_uploads')
      .update({ row_count: successCount, status: 'completed' })
      .eq('id', fileId);

    return NextResponse.json({ fileId, successCount, skippedCount, errorCount, errors });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}