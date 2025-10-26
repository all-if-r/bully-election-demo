import React from "react";

export function Card({ className = "", children }) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children }) {
  return <div className="p-4 pb-2">{children}</div>;
}

export function CardTitle({ className = "", children }) {
  return <div className={`font-semibold text-gray-900 ${className}`}>{children}</div>;
}

export function CardContent({ children }) {
  return <div className="p-4 pt-2">{children}</div>;
}

export function Button({ variant = "default", className = "", ...props }) {
  const base = "text-sm font-medium rounded-xl px-3 py-2 transition active:scale-[0.98] border";
  const styles = {
    default: "bg-gray-900 text-white border-gray-900 hover:bg-black",
    secondary: "bg-white text-gray-800 border-gray-300 hover:bg-gray-100",
    destructive: "bg-red-600 text-white border-red-600 hover:bg-red-700",
    ghost: "bg-transparent text-gray-600 border-transparent hover:bg-gray-100 hover:text-gray-900",
  };

  return (
    <button
      className={`${base} ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
