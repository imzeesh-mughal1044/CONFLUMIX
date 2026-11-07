import type { DonationCondition, DonationResource } from "@/types/donations";
import { donationCategories } from "@/types/donations";

export const donationImportHeaders=["title","category","description","condition","quantity","unit","locality","handover_method","availability_information","item_type","safety_information"] as const;
export const requiredDonationImportHeaders=["title","category","description","condition","quantity","unit","locality","handover_method"] as const;
export type DonationImportRecord=Record<(typeof donationImportHeaders)[number],string>;
export type DonationImportRow={row:number;original:Partial<DonationImportRecord>;normalized:DonationImportRecord;errors:string[];warnings:string[];eligible:boolean;initialStatus:"unavailable"};
export type DonationImportValidation={fileName:string;rows:DonationImportRow[];errors:string[];fingerprint:string};
const conditions:DonationCondition[]=["Brand New / Surplus","Like New","Good / Fully Functional","Minor Repair Needed"];

export async function parseDonationFile(file:File):Promise<DonationImportValidation>{
  const extension=file.name.toLowerCase().split(".").pop(),table=extension==="csv"?parseCsv(await file.text()):extension==="xlsx"?await parseWorkbook(await file.arrayBuffer()):null;
  if(!table)throw new Error("Choose a .csv or .xlsx file.");
  if(!table.length||table.every(row=>row.every(cell=>!cell.trim())))throw new Error("The selected file is empty.");
  const headers=table[0].map(value=>value.trim().toLowerCase()),duplicate=headers.find((value,index)=>value&&headers.indexOf(value)!==index);
  if(duplicate)throw new Error(`Duplicate header: ${duplicate}.`);
  const missing=requiredDonationImportHeaders.filter(header=>!headers.includes(header));
  if(missing.length)throw new Error(`Missing required columns: ${missing.join(", ")}.`);
  const unsupported=headers.filter(header=>header&&!donationImportHeaders.includes(header as typeof donationImportHeaders[number]));
  const rows=table.slice(1).filter(row=>row.some(cell=>cell.trim())).map((values,index)=>validateRow(index+2,Object.fromEntries(headers.map((header,column)=>[header,values[column]?.trim()??""]))));
  if(!rows.length)throw new Error("The file contains headers but no resource rows.");
  return {fileName:file.name,rows,errors:unsupported.length?[`Unsupported columns are ignored: ${unsupported.join(", ")}.`]:[],fingerprint:`${file.name}:${file.size}:${file.lastModified}:${rows.length}`};
}

function validateRow(row:number,original:Record<string,string>):DonationImportRow{
  const normalized=Object.fromEntries(donationImportHeaders.map(header=>[header,original[header]?.trim()??""])) as DonationImportRecord,errors:string[]=[],warnings:string[]=[];
  for(const header of requiredDonationImportHeaders)if(!normalized[header])errors.push(`${header} is required.`);
  for(const header of donationImportHeaders)if(/^[=+@\t\r]/.test(normalized[header])||/^-[A-Za-z(]/.test(normalized[header]))errors.push(`${header} contains a spreadsheet formula-like value and is not accepted.`);
  const category=donationCategories.find(item=>item.id===normalized.category);
  if(normalized.category&&!category)errors.push(`category must use a supported identifier: ${donationCategories.map(item=>item.id).join(", ")}.`);
  if(normalized.condition&&!conditions.includes(normalized.condition as DonationCondition))errors.push(`condition must be one of: ${conditions.join("; ")}.`);
  const quantity=Number(normalized.quantity);
  if(normalized.quantity&&(!Number.isInteger(quantity)||quantity<1))errors.push("quantity must be a whole number of at least 1.");
  if(normalized.unit&&!/^[\p{L}\p{N}][\p{L}\p{N} ./'-]{0,39}$/u.test(normalized.unit))errors.push("unit contains unsupported characters or is longer than 40 characters.");
  if(category&&["food-essentials","electronics-laptops","medical-mobility"].includes(category.id)&&!normalized.safety_information)errors.push("safety_information is required for this category.");
  if(category&&["clothing-bedding","education-books","furniture-home","electronics-laptops","medical-mobility"].includes(category.id)&&!normalized.item_type)errors.push("item_type is required for this category.");
  warnings.push("Initial status is unavailable pending organization authorization and approval.");
  return {row,original,normalized,errors,warnings,eligible:errors.length===0,initialStatus:"unavailable"};
}

export function parseCsv(text:string){const rows:string[][]=[],row:string[]=[],pushRow=()=>{rows.push([...row]);row.length=0};let cell="",quoted=false;for(let index=0;index<text.length;index++){const char=text[index],next=text[index+1];if(quoted){if(char==='"'&&next==='"'){cell+='"';index++}else if(char==='"')quoted=false;else cell+=char}else if(char==='"')quoted=true;else if(char===","){row.push(cell);cell=""}else if(char==="\n"){row.push(cell.replace(/\r$/, ""));cell="";pushRow()}else cell+=char}if(quoted)throw new Error("CSV contains an unclosed quoted field.");if(cell||row.length){row.push(cell.replace(/\r$/, ""));pushRow()}if(rows[0]?.[0]?.charCodeAt(0)===0xfeff)rows[0][0]=rows[0][0].slice(1);return rows}
async function parseWorkbook(buffer:ArrayBuffer){const {default:ExcelJS}=await import("exceljs");const workbook=new ExcelJS.Workbook();await workbook.xlsx.load(buffer);if(workbook.worksheets.length!==1)throw new Error(`Excel files must contain exactly one worksheet; found ${workbook.worksheets.length}.`);const sheet=workbook.worksheets[0],rows:string[][]=[];sheet.eachRow({includeEmpty:true},row=>{const values=Array.isArray(row.values)?row.values.slice(1):[];rows.push(values.map(value=>cellText(value)))});return rows}
function cellText(value:unknown):string{if(value===null||value===undefined)return "";if(typeof value==="object"&&value&&"formula" in value)return `=${String((value as {formula:unknown}).formula)}`;if(typeof value==="object"&&value&&"text" in value)return String((value as {text:unknown}).text);return String(value)}
export function safeSpreadsheetValue(value:unknown){const text=String(value??"");return /^[=+\-@\t\r]/.test(text)?`'${text}`:text}
export function resourcesForExport(resources:DonationResource[]){return resources.map(resource=>({title:safeSpreadsheetValue(resource.title),category:resource.category,description:safeSpreadsheetValue(resource.description),condition:resource.condition,quantity:resource.totalQuantity,unit:safeSpreadsheetValue(resource.unit),locality:safeSpreadsheetValue(resource.locality),handover_method:safeSpreadsheetValue(resource.handoverMethod??""),availability_information:safeSpreadsheetValue(resource.availabilityWindow??""),item_type:safeSpreadsheetValue(resource.categoryAttributes[0]?.value??""),safety_information:safeSpreadsheetValue(resource.categoryAttributes.filter(item=>item.safety).map(item=>item.value).join("; ")),current_status:resource.availability,reference:resource.id}))}
export function serializeCsv(records:Record<string,unknown>[]){if(!records.length)return "";const headers=Object.keys(records[0]),quote=(value:unknown)=>`"${safeSpreadsheetValue(value).replaceAll('"','""')}"`;return `\uFEFF${headers.map(quote).join(",")}\r\n${records.map(record=>headers.map(header=>quote(record[header])).join(",")).join("\r\n")}`}
export async function downloadDonationExport(records:Record<string,unknown>[],format:"csv"|"xlsx"){const date=new Date().toISOString().slice(0,10),name=`conflumix-donation-resources-${date}.${format}`;let blob:Blob;if(format==="csv")blob=new Blob([serializeCsv(records)],{type:"text/csv;charset=utf-8"});else{const {default:ExcelJS}=await import("exceljs");const workbook=new ExcelJS.Workbook(),sheet=workbook.addWorksheet("Donation Resources"),headers=Object.keys(records[0]);sheet.columns=headers.map(header=>({header,key:header,width:24}));records.forEach(record=>sheet.addRow(record));const buffer=await workbook.xlsx.writeBuffer();blob=new Blob([buffer as BlobPart],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"})}const url=URL.createObjectURL(blob),anchor=document.createElement("a");anchor.href=url;anchor.download=name;anchor.click();URL.revokeObjectURL(url)}
