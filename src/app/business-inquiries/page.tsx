import { redirect } from "next/navigation";

export default function BusinessInquiriesRedirectPage() {
  redirect("/contact?topic=business");
}
