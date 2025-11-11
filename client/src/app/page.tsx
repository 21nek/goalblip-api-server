import HomeClient from '@/components/home-client';

export default function Page() {
  return (
    <main>
      <header>
        <h1>GoalBlip Demo Client</h1>
        <p>Önce API sunucusunu belirt, ardından tüm maçları keşfet.</p>
      </header>
      <HomeClient />
    </main>
  );
}
