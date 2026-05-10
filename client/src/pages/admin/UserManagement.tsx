import React, { useState, useEffect, useCallback } from "react";
import api, { ApiError } from "../../services/api";
import { User, Account } from "../../types";

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetail, setUserDetail] = useState<{ accounts: Account[] } | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "credit" | "debit">("details");

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get(`/admin/users?search=${search}`);
      setUsers(res.data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as ApiError).response?.data?.message 
        : "Failed to load users.";
      setError(errorMessage || "Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  const fetchUserDetail = async (id: string) => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      setUserDetail({ accounts: res.data.accounts || [] });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleUpdateKyc = async (id: string, status: "VERIFIED" | "REJECTED") => {
    try {
      await api.patch(`/admin/users/${id}/kyc`, { status, tier: 1 });
      await fetchUsers();
      setSelectedUser(null);
      setUserDetail(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as ApiError).response?.data?.message 
        : "Failed to update KYC";
      alert(errorMessage || "Failed to update KYC");
    }
  };

  const handleToggleAccount = async (id: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === "ACTIVE" ? "FROZEN" : "ACTIVE";
      await api.patch(`/admin/accounts/${id}/status`, { status: nextStatus });
      if (selectedUser) await fetchUserDetail(selectedUser._id);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as ApiError).response?.data?.message 
        : "Failed to update account status";
      alert(errorMessage || "Failed to update account status");
    }
  };

  const handleSuspendUser = async (id: string, currentStatus: string) => {
    try {
      let newStatus: string;
      let action: string;

      // Handle all possible user statuses
      if (currentStatus === "ACTIVE") {
        newStatus = "SUSPENDED";
        action = "suspend";
      } else if (currentStatus === "SUSPENDED") {
        newStatus = "ACTIVE";
        action = "reactivate";
      } else if (currentStatus === "PENDING_KYC") {
        newStatus = "SUSPENDED";
        action = "suspend";
      } else {
        // Default to ACTIVE for any other status
        newStatus = "ACTIVE";
        action = "activate";
      }

      if (confirm(`Are you sure you want to ${action} this user?`)) {
        await api.patch(`/admin/users/${id}/status`, { status: newStatus });

        await fetchUsers();
        setSelectedUser(null);
        setUserDetail(null);

        alert(`User ${action}d successfully!`);
      }
    } catch (err: unknown) {
      console.error("Error updating user status:", err);
      const errorData = err instanceof Error && 'response' in err ? (err as ApiError).response?.data : null;
      console.error("Error response:", errorData);

      const errorMessage =
        errorData?.error?.message ||
        errorData?.message ||
        (err instanceof Error ? err.message : "Failed to update user status");

      alert(`Error: ${errorMessage}`);
    }
  };

  const handleCreditAccount = async (accountId: string) => {
    const amount = prompt("Enter amount to credit (in major units):");
    if (!amount || isNaN(parseFloat(amount))) return;

    try {
      await api.post("/admin/accounts/credit", {
        accountId,
        amount: Math.round(parseFloat(amount) * 100),
        reason: "Admin credit",
      });
      alert("Account credited successfully!");
      if (selectedUser) await fetchUserDetail(selectedUser._id);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as ApiError).response?.data?.message 
        : "Failed to credit account";
      alert(errorMessage || "Failed to credit account");
    }
  };

  const handleDebitAccount = async (accountId: string) => {
    const amount = prompt("Enter amount to debit (in major units):");
    if (!amount || isNaN(parseFloat(amount))) return;

    try {
      await api.post("/admin/accounts/debit", {
        accountId,
        amount: Math.round(parseFloat(amount) * 100),
        reason: "Admin debit",
      });
      alert("Account debited successfully!");
      if (selectedUser) await fetchUserDetail(selectedUser._id);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as ApiError).response?.data?.message 
        : "Failed to debit account";
      alert(errorMessage || "Failed to debit account");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black">User Oversight</h2>
          <p className="text-on-surface-variant text-sm font-medium">
            Monitoring and compliance management.
          </p>
        </div>
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-low p-4 rounded-2xl border border-outline-variant font-bold text-sm outline-none focus:border-primary"
          />
        </div>
      </header>

      <div className="bg-surface-container-low rounded-[2.5rem] border border-outline-variant overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-surface-container-highest border-b border-outline-variant">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                Name
              </th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                Email
              </th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                KYC Status
              </th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {users.map((user) => (
              <tr
                key={user._id}
                className="hover:bg-surface-container-highest/50 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedUser(user);
                  fetchUserDetail(user._id);
                  setActiveTab("details");
                }}
              >
                <td className="px-8 py-5 font-bold text-sm">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-8 py-5 text-sm text-on-surface-variant">{user.email}</td>
                <td className="px-8 py-5">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.kycStatus === "VERIFIED" ? "bg-success/10 text-success" : user.kycStatus === "PENDING" ? "bg-primary/10 text-primary" : "bg-surface-container-highest text-on-surface-variant"}`}
                  >
                    {user.kycStatus}
                  </span>
                </td>
                <td className="px-8 py-5 text-sm font-black text-primary hover:underline">
                  Manage
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading && (
          <div className="p-8 text-center text-on-surface-variant font-medium">
            Loading user directory...
          </div>
        )}
        {!isLoading && error && <div className="p-8 text-center text-error font-bold">{error}</div>}
        {!isLoading && !error && users.length === 0 && (
          <div className="p-8 text-center text-on-surface-variant font-medium">
            No users found matching your search.
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          />
          <div className="relative bg-surface w-full max-w-3xl rounded-[3rem] p-10 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <header className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <p className="text-on-surface-variant font-medium">{selectedUser.email}</p>
                <p className="text-xs font-bold mt-1">
                  Status:{" "}
                  <span
                    className={
                      selectedUser.status === "ACTIVE"
                        ? "text-success"
                        : selectedUser.status === "SUSPENDED"
                          ? "text-error"
                          : "text-warning"
                    }
                  >
                    {selectedUser.status}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </header>

            {/* Action Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab("details")}
                className={`px-4 py-2 rounded-xl font-black text-xs ${activeTab === "details" ? "bg-primary text-white" : "bg-surface-container-high"}`}
              >
                Account Details
              </button>
              <button
                onClick={() => setActiveTab("credit")}
                className={`px-4 py-2 rounded-xl font-black text-xs ${activeTab === "credit" ? "bg-success text-white" : "bg-surface-container-high"}`}
              >
                Add Funds
              </button>
              <button
                onClick={() => setActiveTab("debit")}
                className={`px-4 py-2 rounded-xl font-black text-xs ${activeTab === "debit" ? "bg-error text-white" : "bg-surface-container-high"}`}
              >
                Remove Funds
              </button>
            </div>

            {/* KYC Actions */}
            {selectedUser.kycStatus === "PENDING" && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => handleUpdateKyc(selectedUser._id, "VERIFIED")}
                  className="px-4 py-2 bg-success text-white rounded-full font-black text-xs hover:bg-success/90"
                >
                  Verify KYC
                </button>
                <button
                  onClick={() => handleUpdateKyc(selectedUser._id, "REJECTED")}
                  className="px-4 py-2 bg-error text-white rounded-full font-black text-xs hover:bg-error/90"
                >
                  Reject
                </button>
              </div>
            )}

            {/* User Status Action */}
            <div className="mb-4">
              <button
                onClick={() => handleSuspendUser(selectedUser._id, selectedUser.status)}
                className={`px-4 py-2 rounded-full font-black text-xs ${
                  selectedUser.status === "ACTIVE"
                    ? "bg-error/20 text-error"
                    : selectedUser.status === "SUSPENDED"
                      ? "bg-success/20 text-success"
                      : "bg-warning/20 text-warning"
                }`}
              >
                {selectedUser.status === "ACTIVE"
                  ? "Suspend User"
                  : selectedUser.status === "SUSPENDED"
                    ? "Reactivate User"
                    : "Manage User Status"}
              </button>
            </div>

            {activeTab === "details" && (
              <section className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4">
                    Account Portfolio
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userDetail?.accounts.map((acc) => (
                      <div
                        key={acc._id}
                        className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-xs font-black">{acc.type}</p>
                            <p className="text-[10px] text-on-surface-variant font-bold">
                              {acc.accountNumber}
                            </p>
                          </div>
                          <span
                            className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${acc.status === "ACTIVE" ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}
                          >
                            {acc.status}
                          </span>
                        </div>
                        <p className="text-sm font-black">
                          {(acc.balance / 100).toLocaleString()} {acc.currency}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleToggleAccount(acc._id, acc.status)}
                            className="flex-1 px-2 py-1.5 rounded-lg bg-surface-container-highest text-[10px] font-black uppercase hover:bg-on-surface hover:text-white transition-all"
                          >
                            {acc.status === "ACTIVE" ? "Freeze" : "Unfreeze"}
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab("credit");
                            }}
                            className="flex-1 px-2 py-1.5 rounded-lg bg-success/20 text-success text-[10px] font-black uppercase hover:bg-success hover:text-white transition-all"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab("debit");
                            }}
                            className="flex-1 px-2 py-1.5 rounded-lg bg-error/20 text-error text-[10px] font-black uppercase hover:bg-error hover:text-white transition-all"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    {userDetail?.accounts.length === 0 && (
                      <p className="text-xs text-on-surface-variant italic">No accounts linked.</p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {activeTab === "credit" && (
              <section className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                  Add Funds to Account
                </h4>
                <p className="text-xs text-on-surface-variant">Select an account to add funds:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userDetail?.accounts
                    .filter((acc) => acc.status === "ACTIVE")
                    .map((acc) => (
                      <button
                        key={acc._id}
                        onClick={() => handleCreditAccount(acc._id)}
                        className="p-4 rounded-xl bg-success/10 border border-success/30 hover:bg-success/20 transition-all text-left"
                      >
                        <p className="text-xs font-black">{acc.type}</p>
                        <p className="text-[10px] text-on-surface-variant">{acc.accountNumber}</p>
                        <p className="text-sm font-black mt-1">
                          {(acc.balance / 100).toLocaleString()} {acc.currency}
                        </p>
                      </button>
                    ))}
                </div>
              </section>
            )}

            {activeTab === "debit" && (
              <section className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                  Remove Funds from Account
                </h4>
                <p className="text-xs text-on-surface-variant">
                  Select an account to remove funds:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userDetail?.accounts
                    .filter((acc) => acc.status === "ACTIVE" && acc.balance > 0)
                    .map((acc) => (
                      <button
                        key={acc._id}
                        onClick={() => handleDebitAccount(acc._id)}
                        className="p-4 rounded-xl bg-error/10 border border-error/30 hover:bg-error/20 transition-all text-left"
                      >
                        <p className="text-xs font-black">{acc.type}</p>
                        <p className="text-[10px] text-on-surface-variant">{acc.accountNumber}</p>
                        <p className="text-sm font-black mt-1">
                          {(acc.balance / 100).toLocaleString()} {acc.currency}
                        </p>
                      </button>
                    ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
