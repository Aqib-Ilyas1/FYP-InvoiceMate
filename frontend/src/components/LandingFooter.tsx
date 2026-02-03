const LandingFooter = () => {
  return (
    <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white dark:bg-gray-800">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} InvoiceMate. All rights reserved.
      </p>
      <nav className="sm:ml-auto flex gap-4 sm:gap-6">
        <a href="#" className="text-xs hover:underline underline-offset-4">
          Terms of Service
        </a>
        <a href="#" className="text-xs hover:underline underline-offset-4">
          Privacy
        </a>
      </nav>
    </footer>
  );
};

export default LandingFooter;
