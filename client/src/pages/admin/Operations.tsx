import React, { useState } from "react";
import api from "../../services/api";

const AdminOperations: React.FC = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const query = new URLSearchParams();
      if (startDate) query.append("startDate", startDate);
      if (endDate) query.append("endDate", endDate);

      const response = await api.get(`/admin/export/transactions?${query.toString()}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `stark_audit_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to export CSV. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <header>
        <h2 className="text-3xl font-black">System Operations</h2>
        <p className="text-on-surface-variant text-sm font-medium">
          Compliance, auditing, and platform maintenance.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Export Card */}
        <section className="bg-surface-container-low p-8 rounded-[2.5rem] border border-outline-variant shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl">
                📄
              </div>
              <h3 className="text-xl font-black">Transaction Audit Export</h3>
            </div>
            <p className="text-on-surface-variant text-sm mb-8">
              Generate a comprehensive CSV report of all platform transactions for offline auditing
              and compliance reviews.
            </p>

            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-surface-container p-4 rounded-2xl border border-outline-variant font-bold text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-surface-container p-4 rounded-2xl border border-outline-variant font-bold text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${isExporting ? "bg-surface-container-highest text-on-surface-variant cursor-not-allowed" : "bg-primary text-white shadow-lg hover:shadow-xl hover:-translate-y-1"}`}
          >
            {isExporting ? "Generating Report..." : "Download CSV Report"}
          </button>
        </section>

        {/* System Health Card (Placeholder) */}
        <section className="bg-surface-container-highest/20 p-8 rounded-[2.5rem] border border-outline-variant border-dashed flex flex-col items-center justify-center text-center opacity-60">
          <div className="text-4xl mb-4">🛠️</div>
          <h4 className="text-lg font-black italic">Platform Maintenance</h4>
          <p className="text-xs font-medium max-w-[240px] mt-2">
            Automated backup and database optimization tools are scheduled for the next release.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AdminOperations;
