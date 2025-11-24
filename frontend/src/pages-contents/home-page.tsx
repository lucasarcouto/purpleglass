export function HomePage() {
  return (
    <div className="flex items-center justify-center p-8 min-h-screen">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-5xl font-bold text-foreground mb-8">PurpleGlass</h1>

        <div className="bg-card rounded-lg shadow-xl p-8 border border-border">
          <h2 className="text-2xl font-semibold text-card-foreground mb-6">
            React + Node.js App
          </h2>
        </div>
      </div>
    </div>
  );
}
