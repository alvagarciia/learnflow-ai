import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left item - placeholder for future use */}
          <div className="flex-1">
            {/* Empty for now, can add logo or menu later */}
          </div>
          
          {/* Center item - Title */}
          <div className="flex-1 flex justify-center">
            <h1 className="text-4xl font-poppins font-bold text-gray-900">
              LearnFlowAI
            </h1>
          </div>
          
          {/* Right item - New Study Pack button */}
          <div className="flex-1 flex justify-end">
            <Link
              to="/generate"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              New Study Pack
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}