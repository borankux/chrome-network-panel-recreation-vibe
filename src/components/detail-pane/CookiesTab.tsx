import type { HAREntry, HARCookie } from '@/types/har';

interface CookiesTabProps {
  entry: HAREntry;
}

export function CookiesTab({ entry }: CookiesTabProps) {
  const { request, response } = entry;

  return (
    <div className="p-4 space-y-6">
      <section>
        <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Request Cookies ({request.cookies.length})</h3>
        {request.cookies.length > 0 ? <CookiesTable cookies={request.cookies} /> : <p className="text-sm text-muted-foreground">No request cookies</p>}
      </section>

      <section>
        <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Response Cookies ({response.cookies.length})</h3>
        {response.cookies.length > 0 ? <CookiesTable cookies={response.cookies} /> : <p className="text-sm text-muted-foreground">No response cookies</p>}
      </section>
    </div>
  );
}

function CookiesTable({ cookies }: { cookies: HARCookie[] }) {
  return (
    <div className="border border-border rounded-md overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Value</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Domain</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Path</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Expires</th>
            <th className="px-3 py-2 text-center font-medium text-muted-foreground">HTTP</th>
            <th className="px-3 py-2 text-center font-medium text-muted-foreground">Secure</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">SameSite</th>
          </tr>
        </thead>
        <tbody>
          {cookies.map((cookie, index) => (
            <tr key={index} className="border-b border-border last:border-0 hover:bg-accent/30">
              <td className="px-3 py-2 font-mono text-purple-600 dark:text-purple-400">{cookie.name}</td>
              <td className="px-3 py-2 max-w-[200px] truncate" title={cookie.value}>{cookie.value}</td>
              <td className="px-3 py-2 text-muted-foreground">{cookie.domain || '-'}</td>
              <td className="px-3 py-2 text-muted-foreground">{cookie.path || '/'}</td>
              <td className="px-3 py-2 text-muted-foreground">{cookie.expires ? new Date(cookie.expires).toLocaleDateString() : 'Session'}</td>
              <td className="px-3 py-2 text-center">{cookie.httpOnly ? '✓' : '-'}</td>
              <td className="px-3 py-2 text-center">{cookie.secure ? '✓' : '-'}</td>
              <td className="px-3 py-2 text-muted-foreground">{cookie.sameSite || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
