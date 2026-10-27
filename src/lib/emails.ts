// Branded account emails (OUK teal/coral on white). Email clients ignore stylesheets, so styles are inline
// and the layout is a single table. Each message is three short lines plus one button.
const TEAL = '#037b90';
const CORAL = '#ff7f50';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export type Email = { subject: string; text: string; html: string };

export function brandedEmail(o: { site: string; subject: string; lines: [string, string, string]; button: { label: string; href: string } }): Email {
  const logo = new URL('/images/cropped-SHAPE-final-Logo-192x192.jpeg', o.site).href;
  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f4f7f8;font-family:Arial,Helvetica,sans-serif;color:#10252c">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f8;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td style="background:${TEAL};padding:18px 24px"><img src="${logo}" width="36" height="36" alt="" style="vertical-align:middle;border-radius:6px;background:#fff"> <span style="color:#ffffff;font-size:17px;font-weight:bold;vertical-align:middle;padding-left:8px">SHAPE CMS</span></td></tr>
<tr><td style="padding:24px 24px 28px;font-size:15px;line-height:1.6">
<p style="margin:0 0 10px;font-size:17px;font-weight:bold">${esc(o.lines[0])}</p>
<p style="margin:0 0 10px">${esc(o.lines[1])}</p>
<p style="margin:0 0 18px;color:#5e7076">${esc(o.lines[2])}</p>
<a href="${esc(o.button.href)}" style="display:inline-block;background:${CORAL};color:#2b1105;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:999px">${esc(o.button.label)}</a>
</td></tr>
<tr><td style="padding:20px 24px;font-size:12px;color:#5e7076;border-top:4px solid ${CORAL}">SHAPE Project · Hosted by the Open University of Kenya · <a href="mailto:shape@ouk.ac.ke" style="color:${TEAL}">shape@ouk.ac.ke</a></td></tr>
</table></td></tr></table></body></html>`;
  const text = `${o.lines.join('\n')}\n\n${o.button.label}: ${o.button.href}\n\n— SHAPE Project, hosted by the Open University of Kenya`;
  return { subject: o.subject, text, html };
}

const roleName = (r: string) => (r === 'admin' ? 'an administrator' : 'an editor');

export const inviteEmail = (site: string, name: string, role: string, link: string) =>
  brandedEmail({
    site,
    subject: 'Your SHAPE CMS invitation',
    lines: [`Hello ${name}, you have been invited to the SHAPE CMS as ${roleName(role)}.`, 'Choose a password with the button below to create your account.', 'The link works once and expires in 7 days.'],
    button: { label: 'Create my account', href: link },
  });

export const welcomeEmail = (site: string, name: string, email: string, role: string) =>
  brandedEmail({
    site,
    subject: 'Your SHAPE CMS account is ready',
    lines: [`Welcome ${name}, your SHAPE CMS account (${email}) is ready.`, `You can manage website content as ${roleName(role)}.`, 'On first sign-in you will set up two-step sign-in with an authenticator app.'],
    button: { label: 'Sign in', href: new URL('/admin/login', site).href },
  });
