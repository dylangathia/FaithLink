# Connecting Sanctuary to Supabase

Sanctuary uses [Supabase](https://supabase.com) for accounts, churches and members. Setup takes about 10 minutes.

## 1. Create the project

1. Sign up at supabase.com and click **New project**.
2. Pick a name (e.g. `sanctuary`), set a database password, and choose the region closest to your churches.

## 2. Create the database tables

1. In the project, open **SQL Editor → New query**.
2. Paste the whole of [`supabase/migrations/0001_churches_and_members.sql`](supabase/migrations/0001_churches_and_members.sql) and click **Run**.

This creates churches, members, roles, join codes and invitations, plus the privacy rules that keep each church's data visible only to its own members.

## 3. Connect the app

1. Open **Project Settings → API**.
2. Copy `.env.example` to `.env.local` in the project folder.
3. Paste the **Project URL** into `VITE_SUPABASE_URL` and the **anon public** key into `VITE_SUPABASE_ANON_KEY`.
4. Restart `npm run dev`.

The anon key is safe in the browser: the database rules decide what each signed-in person can see.

## 4. Configure sign-in

Open **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:8080` while developing (change it to your real domain when you go live).
- **Redirect URLs**: add `http://localhost:8080/**` (and later `https://your-domain/**`).

### Email

Works out of the box. Under **Authentication → Providers → Email** you can turn **Confirm email** off while testing so new accounts can sign in straight away.

Supabase's built-in email sender is limited to a few emails per hour. Before launching, add your own SMTP under **Project Settings → Authentication → SMTP Settings** (e.g. Resend, SendGrid, Brevo).

### Phone (SMS codes)

Phone sign-in needs an SMS provider, which charges per message:

1. Create an account with one of the supported providers — **Twilio**, **MessageBird**, **Vonage** or **Textlocal**.
2. In Supabase, open **Authentication → Providers → Phone**, enable it and enter the provider's credentials.

Until this is set up, the Phone tab on the sign-in screen will show an error; email sign-in still works.

## 5. Try it

1. Open http://localhost:8080 and create an account.
2. Choose **I'm a pastor or church admin** and create your church.
3. Open **Church Admin** in the sidebar:
   - **Join codes & QR** — your first code is already there. Use **Present** to show it full screen.
   - **Add people** — add someone by phone or email, then send them their link by WhatsApp, SMS or email.
   - **Requests** — approve people who joined with a code.
4. In a private browser window, open the join link (or scan the QR with your phone), create a second account and join.

## How people join

| Method | How it works | Approval |
| --- | --- | --- |
| Personal invite | Admin adds name + phone/email and sends the link. The person also joins automatically when they sign in with that phone or email. | Not needed |
| Join code | Short code like `GRACE-7K2P`, entered on the welcome screen | Per code (on by default) |
| QR code | Same as a join code; scanning opens the join page | Per code |

Codes can be limited to a number of uses, set to expire, or switched off at any time.

## Roles

| Role | Can |
| --- | --- |
| Owner | Everything, including making and removing admins. One per church (whoever created it). |
| Admin | Add, approve and remove members and leaders; manage join codes; edit church details |
| Leader | Member features (leader-only tools come in later phases) |
| Member | Use the app within their church |
