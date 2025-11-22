'use client';

// Basit desktop layout: Sidebar'da maç listesi, ana alanda match detail
// Match detail component'i daha sonra eklenecek

export default function HomePage() {
  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#181818' }}>
      <div style={{ width: '400px', backgroundColor: '#1a1a1a', borderRight: '1px solid #2a2a2a', overflow: 'auto' }}>
        <div style={{ padding: '20px', color: '#fff' }}>
          <h2>Maç Listesi</h2>
          <p style={{ color: '#888' }}>Sidebar buraya gelecek</p>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '20px', color: '#fff' }}>
        <h2>Maç Detayı</h2>
        <p style={{ color: '#888' }}>Match detail component buraya gelecek</p>
      </div>
    </div>
  );
}

