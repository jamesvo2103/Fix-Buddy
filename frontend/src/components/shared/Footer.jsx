export default function Footer() {
    return (
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Fix Buddy</h3>
              <p className="text-gray-300">AI-powered DIY repair solutions for household problems.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/" className="hover:text-white transition">Home</a></li>
                <li><a href="/diagnosis" className="hover:text-white transition">Diagnosis</a></li>
                <li><a href="/history" className="hover:text-white transition">History</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-gray-300">Email: support@fixbuddy.com</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-4 text-center text-gray-400">
            <p>&copy; 2025 Fix Buddy. All rights reserved. | MakeUC 2025</p>
          </div>
        </div>
      </footer>
    );
  }
  