import { useState } from "react";
import PostbackGenerator from "@/components/admin/postback-generator";
import AdminSidebar from "@/components/admin/sidebar";

export default function PostbackGeneratorProfessional() {
  const [currentPage, setCurrentPage] = useState("gerador-de-postbacks");

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex h-screen bg-slate-950">
      <AdminSidebar currentPage={currentPage} onPageChange={handlePageChange} />
      <main className="flex-1 overflow-auto ml-64">
        <div className="p-4 md:p-6 lg:p-8">
          <PostbackGenerator onPageChange={handlePageChange} />
        </div>
      </main>
    </div>
  );
}