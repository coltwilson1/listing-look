"use client";

import { useState, useEffect } from "react";

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function handler(e) {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message: e.detail.message }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
    }
    window.addEventListener("showToast", handler);
    return () => window.removeEventListener("showToast", handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-deep text-white px-6 py-3.5 rounded-2xl shadow-2xl font-sans text-[0.88rem] flex items-center gap-3 whitespace-nowrap"
          style={{ animation: "toastIn 0.3s ease-out both" }}
        >
          <span className="text-[1.1rem]">✉️</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
