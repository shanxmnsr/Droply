"use client";

export default function FileLoadingState() {
  return (
    <div className="flex flex-col justify-center items-center py-20">
      <span className="loading loading-spinner loading-lg text-primary"></span>
      <p className="mt-4 text-default-600">Loading your files...</p>
    </div>
  );
}
