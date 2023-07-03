import * as Papa from 'papaparse'
import { createTextFile } from '@/utils/html-element'

export function convertJsonToCsvFile(json: any[], name: string | null = 'csv_file'): File {
    const csvContent = Papa.unparse(json);

    return createTextFile({
        text: csvContent,
        type: 'text/csv',
        name,
    });
}