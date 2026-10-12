import { AuthShell } from "@/components/auth/AuthShell";

/** Shown when the Supabase environment variables are missing. */
const SetupRequired = () => (
  <AuthShell wide>
    <h2 className="font-display text-xl font-semibold mb-2">Connect your database</h2>
    <p className="text-sm font-body text-muted-foreground mb-5">
      Sanctuary needs a Supabase project for accounts and churches. It takes about five minutes:
    </p>
    <ol className="space-y-3 text-sm font-body list-decimal pl-5">
      <li>
        Create a free project at <span className="font-medium">supabase.com</span>.
      </li>
      <li>
        In the project's <span className="font-medium">SQL Editor</span>, run the file{" "}
        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">supabase/migrations/0001_churches_and_members.sql</code>.
      </li>
      <li>
        Copy <code className="text-xs bg-muted px-1.5 py-0.5 rounded">.env.example</code> to{" "}
        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">.env.local</code> and paste your Project URL and anon key
        from <span className="font-medium">Project Settings → API</span>.
      </li>
      <li>Restart the dev server.</li>
    </ol>
    <p className="text-xs font-body text-muted-foreground mt-5">Full instructions are in SETUP.md.</p>
  </AuthShell>
);

export default SetupRequired;
