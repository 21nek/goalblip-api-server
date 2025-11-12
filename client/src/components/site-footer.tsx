const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Match explorer', href: '#product' },
      { label: 'Automations', href: '#product' },
      { label: 'API access', href: '#product' }
    ]
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Careers', href: '#careers' },
      { label: 'Contact', href: '#contact' }
    ]
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '#blog' },
      { label: 'Docs', href: '#docs' },
      { label: 'Support', href: '#support' }
    ]
  }
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="surface surface--panel footer-top">
        <div className="footer-brand">
          <p className="logo">Goalblip</p>
          <p>AI-powered football intelligence for bettors, analysts, and clubs.</p>
        </div>
        <div className="footer-columns">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="footer-heading">{col.title}</p>
              <div className="footer-nav">
                {col.links.map((link) => (
                  <a key={link.label} href={link.href}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} Goalblip Labs</span>
        <div className="footer-links">
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="mailto:hello@goalblip.com">hello@goalblip.com</a>
        </div>
      </div>
    </footer>
  );
}
