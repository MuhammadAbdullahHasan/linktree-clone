import ProfilePage from "./ProfilePage";
import type { PageData } from "@/lib/types";

export default function PhonePreview({ data }: { data: PageData }) {
  return (
    <div className="sticky top-8 mx-auto w-[300px]">
      <div className="h-[610px] overflow-hidden rounded-[44px] border-[10px] border-neutral-900 bg-neutral-900 shadow-2xl">
        <div className="h-full overflow-y-auto rounded-[34px] [scrollbar-width:none]">
          <ProfilePage data={data} preview />
        </div>
      </div>
    </div>
  );
}
