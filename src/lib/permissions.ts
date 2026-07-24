export type UserRole =
  | "admin"
  | "approver"
  | "instructor"
  | "viewer";



export function isAdmin(
  role?: UserRole | null
){

  return role === "admin";

}



export function canApprove(
  role?: UserRole | null
){

  return (
    role === "admin" ||
    role === "approver"
  );

}



export function canEditContent(
  role?: UserRole | null
){

  return (
    role === "admin" ||
    role === "approver" ||
    role === "instructor"
  );

}



export function canView(
  role?: UserRole | null
){

  return (
    role === "admin" ||
    role === "approver" ||
    role === "instructor" ||
    role === "viewer"
  );

}