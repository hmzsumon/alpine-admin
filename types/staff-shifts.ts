import type { AuthUser } from "@/types/auth";
import type { Order } from "@/types";
export interface StaffShift { id:string;name:string;start:string;end:string;active:boolean;version:number; }
export interface ShiftAssignment { id:string;shiftId?:string;name:string;start?:string;end?:string;from:string;to?:string;supersededAt?:string;assignedAt:string;assignedBy:string; }
export interface StaffDetails { user:AuthUser;shifts:StaffShift[];schedule:{revision:number;entries:ShiftAssignment[]};from:string;to:string;legacyUnattributedOrders:number;
  totals:{orders:number;cancelled:number;sales:number;items:number;paidOwnSales:number;collected:number;paymentCount:number;readyUnits:number;servedUnits:number};
  shiftRows:{name:string;orders:number;sales:number;outside:number}[];
  orders:Order[];payments:Order[];activity:{id:string;action:string;at:string;table:string;station:string;units:number}[];
}
