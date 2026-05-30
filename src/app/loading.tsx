/**
 * Global navigation loader. Next.js renders this automatically whenever a
 * route segment is fetching server data — it overlays the viewport with a
 * frosted backdrop and a highlighted spinner card so the user has clear
 * feedback during slower navigations.
 *
 * z-[60] sits above the sticky navbar (z-50) so the whole page reads as
 * "loading", and `backdrop-blur` gives the soft blur over whatever the
 * layout keeps mounted behind it (navbar, body bg).
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="fixed inset-0 z-[60]  flex items-center justify-center bg-white/55 backdrop-blur-md"
    >
      <div className=" px-10 py-8   ">
        {/* Custom CSS loader — see .loader in globals.css.
            It renders its own "Loading..." text via ::before. */}
        <div className="loader" />
      </div>
    </div>
  );
}
