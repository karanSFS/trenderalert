"use client";

export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#F7F7F5",
          color: "#171717",
          textAlign: "center",
        }}
      >
        <title>Something went wrong | TrenderAlert</title>
        <div>
          <h1>Something went wrong.</h1>
          <p>TrenderAlert could not load. Please try again.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 16,
              padding: "10px 20px",
              border: "none",
              borderRadius: 8,
              background: "#FFD400",
              color: "#111111",
              fontWeight: 650,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
