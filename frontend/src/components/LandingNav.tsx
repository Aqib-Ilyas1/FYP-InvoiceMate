import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const LandingNav = () => {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center bg-white dark:bg-gray-800 shadow-sm">
      <Link to="/" className="flex items-center justify-center">
        <span className="text-xl font-bold">InvoiceMate</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Button asChild variant="ghost">
          <Link to="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link to="/register">Get Started</Link>
        </Button>
      </nav>
    </header>
  );
};

export default LandingNav;
