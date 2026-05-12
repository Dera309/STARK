import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useSocket } from "../../hooks/useSocket";

// Define AppNotification interface locally to avoid shadowing the global Notification API
interface AppNotification {
  _id: string;
  userId: string;
  type:
    | "TRANSACTION"
    | "LOW_BALANCE"
    | "LOAN_REMINDER"
    | "FD_MATURITY"
    | "SECURITY_ALERT"
    | "KYC_UPDATE"
    | "SYSTEM";
  title: string;
  body: string;
  read: boolean;
  channel: "IN_APP" | "EMAIL" | "BOTH";
  createdAt: Date;
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { socket } = useSocket();

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch {
      // silently ignore
    }
  };

  const showBrowserNotification = (title: string, body: string) => {
    try {
      if (typeof window !== "undefined" && "Notification" in window && window.Notification.permission === "granted") {
        new window.Notification(title, { body, icon: "/favicon.ico" });
      }
    } catch {
      // Notification API not supported on this device
    }
  };

  useEffect(() => {
    fetchNotifications();

    try {
      if (typeof window !== "undefined" && "Notification" in window && window.Notification.permission === "default") {
        window.Notification.requestPermission();
      }
    } catch {
      // ignore
    }

    if (socket) {
      socket.on("notification:new", (newNotif: AppNotification) => {
        setNotifications((prev) => [newNotif, ...prev]);
        showBrowserNotification(newNotif.title, newNotif.body);
      });

      socket.on("transaction:completed", (transaction) => {
        const notif: AppNotification = {
          _id: "tx-" + transaction._id,
          userId: transaction.userId,
          type: "TRANSACTION",
          title: `Transaction ${transaction.type === "CREDIT" ? "Received" : "Sent"}`,
          body: `${transaction.amount / 100} ${transaction.currency} - ${transaction.description || "Transaction completed"}`,
          read: false,
          channel: "IN_APP",
          createdAt: new Date(),
        };
        setNotifications((prev) => [notif, ...prev]);
      });

      socket.on("loan:approved", (loan) => {
        const notif: AppNotification = {
          _id: "loan-" + loan._id,
          userId: loan.userId,
          type: "SYSTEM",
          title: "Loan Approved",
          body: `Your ${loan.productType} loan of ${loan.amount / 100} ${loan.currency} has been approved`,
          read: false,
          channel: "IN_APP",
          createdAt: new Date(),
        };
        setNotifications((prev) => [notif, ...prev]);
      });

      socket.on("investment:created", (deposit) => {
        const notif: AppNotification = {
          _id: "fd-" + deposit._id,
          userId: deposit.userId,
          type: "FD_MATURITY",
          title: "Investment Created",
          body: `Fixed deposit of ${deposit.principalAmount / 100} ${deposit.currency} created successfully`,
          read: false,
          channel: "IN_APP",
          createdAt: new Date(),
        };
        setNotifications((prev) => [notif, ...prev]);
      });

    }

    return () => {
      if (socket) {
        socket.off("notification:new");
        socket.off("transaction:completed");
        socket.off("loan:approved");
        socket.off("investment:created");
      }
    };
  }, [socket]);

  const markAsRead = async () => {
    try {
      await api.patch("/notifications/read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark notifications as read");
    }
  };

  const createTestNotification = async () => {
    try {
      // Create a test notification by calling a test endpoint
      // For now, we'll simulate it by adding a local notification
      const testNotif: AppNotification = {
        _id: "test-" + Date.now(),
        userId: "current-user",
        type: "SYSTEM",
        title: "Test Notification",
        body: "This is a test notification to verify the mark-as-read button functionality",
        read: false,
        channel: "IN_APP",
        createdAt: new Date(),
      };
      setNotifications((prev) => [testNotif, ...prev]);
    } catch (err) {
      console.error("Failed to create test notification");
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-2xl bg-surface-container-low border border-outline-variant hover:bg-surface-container-highest transition-all group"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-surface animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-4 w-80 sm:w-96 bg-surface-container-low border border-outline-variant rounded-[2rem] shadow-2xl z-50 overflow-hidden animate-scale-in origin-top-right max-h-[85vh] sm:max-h-[90vh]">
            <header className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-highest/50">
              <h3 className="font-black text-sm uppercase tracking-widest">Alerts Center</h3>
              <span className="text-[10px] font-black text-primary uppercase">Real-time</span>
            </header>

            <div className="max-h-[20rem] sm:max-h-[32rem] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-sm text-on-surface-variant font-medium">No alerts yet.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-6 border-b border-outline-variant/30 hover:bg-surface-container-highest/30 transition-colors ${!n.read ? "bg-primary/5" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-black uppercase tracking-tighter text-primary">
                        {n.type}
                      </span>
                      <span className="text-[9px] text-on-surface-variant font-bold">
                        {new Date(n.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <h4 className="font-black text-sm mb-1">{n.title}</h4>
                    <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                      {n.body}
                    </p>
                  </div>
                ))
              )}
            </div>

            <footer className="p-3 sm:p-4 text-center border-t border-outline-variant flex flex-col gap-2 sm:gap-3">
              {/* Debug info - always show button for testing */}
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="text-[8px] text-on-surface-variant font-mono">
                  Debug: {notifications.length} total, {unreadCount} unread
                </div>
                <button
                  onClick={createTestNotification}
                  className="text-[8px] font-black uppercase tracking-widest text-secondary hover:text-on-secondary-container transition-colors bg-secondary/10 px-2 py-1 rounded"
                >
                  Add Test
                </button>
              </div>
              <div className="flex justify-between items-center flex-wrap gap-2">
                <button
                  onClick={markAsRead}
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-on-primary-container transition-colors bg-primary/10 px-3 py-1.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={unreadCount === 0}
                >
                  {unreadCount > 0 ? `Mark All as Read (${unreadCount})` : "All Read"}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
                >
                  Close Panel
                </button>
              </div>
            </footer>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
