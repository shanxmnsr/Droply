"use client";

export default function FileLoadingState() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-3xl border border-zinc-800/70 bg-zinc-900/50 px-6 py-24"
    >
      {/* Title */}
      <h3 className="text-xl font-semibold text-zinc-100">
        Loading files
      </h3>

      {/* Description */}
      <p className="mt-2 max-w-md text-center text-sm text-zinc-400">
        Please wait while your files and folders are being loaded.
      </p>

      {/* Animated Dots */}
      <div className="mt-6 flex items-center gap-2">
        <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" />

        <span
          className="h-2 w-2 animate-bounce rounded-full bg-indigo-400"
          style={{ animationDelay: "0.15s" }}
        />

        <span
          className="h-2 w-2 animate-bounce rounded-full bg-indigo-400"
          style={{ animationDelay: "0.3s" }}
        />
      </div>
    </div>
  );
}