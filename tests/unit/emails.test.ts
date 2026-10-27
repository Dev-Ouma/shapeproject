import { describe, it, expect } from 'vitest';
import { inviteEmail, welcomeEmail } from '../../src/lib/emails';

describe('account emails', () => {
  it('invite: three short lines, OUK colours, the link as the button', () => {
    const m = inviteEmail('https://shapeproject.ouk.ac.ke', 'Amina', 'editor', 'https://shapeproject.ouk.ac.ke/admin/invite/abc');
    expect(m.subject).toBe('Your SHAPE CMS invitation');
    expect(m.text.split('\n\n')[0]!.split('\n')).toHaveLength(3);
    expect(m.html).toContain('#037b90');
    expect(m.html).toContain('#ff7f50');
    expect(m.html).toContain('href="https://shapeproject.ouk.ac.ke/admin/invite/abc"');
    expect(m.text).toContain('as an editor');
  });

  it('welcome: names the account and links to sign-in', () => {
    const m = welcomeEmail('https://shapeproject.ouk.ac.ke', 'Amina', 'amina@ouk.ac.ke', 'admin');
    expect(m.text).toContain('amina@ouk.ac.ke');
    expect(m.text).toContain('as an administrator');
    expect(m.html).toContain('https://shapeproject.ouk.ac.ke/admin/login');
  });

  it('escapes names so they cannot inject markup', () => {
    const m = inviteEmail('https://x.org', '<img src=x onerror=alert(1)>', 'editor', 'https://x.org/i');
    expect(m.html).not.toContain('<img src=x');
    expect(m.html).toContain('&lt;img');
  });
});
