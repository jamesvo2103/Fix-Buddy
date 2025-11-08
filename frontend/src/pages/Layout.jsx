import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
