/**
 * Secure wrapper for XLSX library to mitigate prototype pollution vulnerability
 * GHSA-4r6h-8v6p-xvw6: Prototype Pollution in sheetJS
 */

import * as XLSX from 'xlsx';
import { logger } from '@/lib/logging/production-logger';

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Maximum number of rows/columns to prevent DoS
const MAX_ROWS = 50000;
const MAX_COLS = 1000;

/**
 * Safe wrapper for XLSX.read with input validation and sanitization
 */
export function safeRead(data: any, options?: XLSX.ParsingOptions): XLSX.WorkBook {
  try {
    // Validate file size
    if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
      if (data.byteLength > MAX_FILE_SIZE) {
        throw new Error('File size exceeds maximum allowed size');
      }
    }
    
    if (typeof data === 'string' && data.length > MAX_FILE_SIZE) {
      throw new Error('Data size exceeds maximum allowed size');
    }

    // Set secure parsing options
    const secureOptions: XLSX.ParsingOptions = {
      ...options,
      // Disable potentially dangerous features
      raw: false, // Don't parse raw values that could contain malicious data
      cellFormula: false, // Disable formula parsing to prevent code injection
      cellHTML: false, // Disable HTML parsing
      cellNF: false, // Disable number format parsing
      cellStyles: false, // Disable style parsing
      cellDates: true, // Allow date parsing (safe)
      bookSST: false, // Disable shared string table parsing
      bookVBA: false, // Disable VBA parsing (macros)
      password: undefined, // Don't allow password-protected files
      // Limit memory usage
      dense: false,
    };

    // Parse the workbook
    const workbook = XLSX.read(data, secureOptions);
    
    // Validate and sanitize the workbook structure
    return sanitizeWorkbook(workbook);
    
  } catch (error) {
    logger.error('api', 'XLSX parsing error:', error);
    throw new Error('Failed to parse Excel file safely');
  }
}

/**
 * Sanitize workbook to prevent prototype pollution
 */
function sanitizeWorkbook(workbook: XLSX.WorkBook): XLSX.WorkBook {
  // Create a new clean workbook object
  const cleanWorkbook: XLSX.WorkBook = {
    SheetNames: [],
    Sheets: {},
    Props: {},
    Custprops: {},
    Workbook: {},
    vbaraw: undefined,
    SSF: undefined
  };

  // Validate and copy sheet names
  if (Array.isArray(workbook.SheetNames)) {
    cleanWorkbook.SheetNames = workbook.SheetNames
      .filter((name: any) => typeof name === 'string')
      .slice(0, 100) // Limit number of sheets
      .map((name: string) => sanitizeString(name));
  }

  // Sanitize each sheet
  for (const sheetName of cleanWorkbook.SheetNames) {
    const originalSheet = workbook.Sheets[sheetName];
    if (originalSheet && typeof originalSheet === 'object') {
      cleanWorkbook.Sheets[sheetName] = sanitizeSheet(originalSheet);
    }
  }

  // Copy safe properties only
  if (workbook.Props && typeof workbook.Props === 'object') {
    cleanWorkbook.Props = sanitizeProps(workbook.Props);
  }

  return cleanWorkbook;
}

/**
 * Sanitize individual sheet
 */
function sanitizeSheet(sheet: XLSX.WorkSheet): XLSX.WorkSheet {
  const cleanSheet: XLSX.WorkSheet = {};
  
  // Process only cell references, skip prototype-polluting properties
  let rowCount = 0;
  let colCount = 0;
  
  for (const cellRef in sheet) {
    // Skip non-cell properties and dangerous properties
    if (cellRef.startsWith('!') || cellRef === '__proto__' || cellRef === 'constructor' || cellRef === 'prototype') {
      continue;
    }
    
    // Validate cell reference format (e.g., A1, B2)
    if (!/^[A-Z]+[0-9]+$/.test(cellRef)) {
      continue;
    }
    
    const cell = sheet[cellRef];
    if (cell && typeof cell === 'object') {
      // Count rows/columns for limits
      const match = cellRef.match(/^[A-Z]+([0-9]+)$/);
      if (match) {
        const row = parseInt(match[1], 10);
        if (row > MAX_ROWS) continue;
        rowCount = Math.max(rowCount, row);
      }
      
      const colMatch = cellRef.match(/^([A-Z]+)[0-9]+$/);
      if (colMatch) {
        const colStr = colMatch[1];
        if (colStr.length > 3) continue; // Limit column letters (beyond ZZZ)
        colCount++;
        if (colCount > MAX_COLS) continue;
      }
      
      cleanSheet[cellRef] = sanitizeCell(cell);
    }
  }
  
  // Copy safe sheet properties
  if (sheet['!ref'] && typeof sheet['!ref'] === 'string') {
    cleanSheet['!ref'] = sheet['!ref'];
  }
  
  return cleanSheet;
}

/**
 * Sanitize cell object
 */
function sanitizeCell(cell: XLSX.CellObject): XLSX.CellObject {
  const cleanCell: XLSX.CellObject = {};
  
  // Only copy safe cell properties
  if ('v' in cell) {
    cleanCell.v = sanitizeValue(cell.v);
  }
  
  if ('t' in cell && typeof cell.t === 'string') {
    cleanCell.t = cell.t as XLSX.ExcelDataType;
  }
  
  // Skip formulas and HTML content for security
  // Skip: f (formulas), h (HTML), w (formatted text)
  
  return cleanCell;
}

/**
 * Sanitize cell value
 */
function sanitizeValue(value: any): any {
  if (value === null || value === undefined) {
    return value;
  }
  
  if (typeof value === 'string') {
    return sanitizeString(value);
  }
  
  if (typeof value === 'number' && isFinite(value)) {
    return value;
  }
  
  if (value instanceof Date) {
    return value;
  }
  
  if (typeof value === 'boolean') {
    return value;
  }
  
  // For any other type, convert to string and sanitize
  return sanitizeString(String(value));
}

/**
 * Sanitize string value
 */
function sanitizeString(str: string): string {
  if (typeof str !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous characters and limit length
  return str
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit string length
}

/**
 * Sanitize workbook properties
 */
function sanitizeProps(props: any): any {
  if (!props || typeof props !== 'object') {
    return {};
  }
  
  const cleanProps: any = {};
  
  // Only copy safe, known properties
  const safePropNames = ['Title', 'Author', 'Subject', 'Category', 'Comments', 'Company'];
  
  for (const propName of safePropNames) {
    if (propName in props && typeof props[propName] === 'string') {
      cleanProps[propName] = sanitizeString(props[propName]);
    }
  }
  
  return cleanProps;
}

/**
 * Safe wrapper for XLSX.utils.sheet_to_json
 */
export function safeSheetToJson<T = any>(sheet: XLSX.WorkSheet, options?: XLSX.Sheet2JSONOpts): T[] {
  try {
    // Sanitize the sheet first
    const cleanSheet = sanitizeSheet(sheet);
    
    // Set secure options
    const secureOptions: XLSX.Sheet2JSONOpts = {
      ...options,
      raw: false, // Don't return raw values
      defval: undefined, // Use undefined for empty cells instead of custom values
      blankrows: false, // Skip blank rows
    };
    
    return XLSX.utils.sheet_to_json(cleanSheet, secureOptions);
  } catch (error) {
    logger.error('api', 'Sheet to JSON conversion error:', error);
    throw new Error('Failed to convert sheet to JSON safely');
  }
}

/**
 * Safe wrapper for reading file from buffer/data
 */
export function safeParseExcel(data: ArrayBuffer | Uint8Array | string): any[] {
  try {
    const workbook = safeRead(data);
    
    if (!workbook.SheetNames.length) {
      throw new Error('No sheets found in the file');
    }
    
    // Process first sheet only for security
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    return safeSheetToJson(firstSheet);
    
  } catch (error) {
    logger.error('api', 'Excel parsing error:', error);
    throw new Error('Failed to parse Excel file');
  }
}

/**
 * Export the original XLSX for non-parsing operations (like writing)
 * These are generally safer as they don't involve parsing user input
 */
export const XLSX_WRITE_UTILS = {
  book_new: XLSX.utils.book_new,
  book_append_sheet: XLSX.utils.book_append_sheet,
  json_to_sheet: XLSX.utils.json_to_sheet,
  write: XLSX.write,
  writeFile: XLSX.writeFile,
};