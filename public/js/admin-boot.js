// Applies the remembered collapsed-sidebar state before first paint (external file: CSP forbids inline scripts).
try { if (localStorage.getItem('shape-admin-collapsed') === '1') document.documentElement.classList.add('a-collapsed'); } catch (e) {}
