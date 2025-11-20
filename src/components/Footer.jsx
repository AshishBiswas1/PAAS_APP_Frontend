export default function Footer() {
  return (
    <footer>
      <div className="footer-root">
        <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-indigo-200">Questions or custom setup?</h3>
        <a href="mailto:support@apisurge.io" className="underline text-indigo-300 mb-4 text-lg font-medium">support@apisurge.io</a>
        <p className="mb-6 font-medium text-lg">We'll help you craft your perfect testing stack, every step of the way.</p>
        <div className="footer-links mb-6">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
        <span className="text-sm text-gray-400">&copy; 2025 apisurge. All rights reserved.</span>
      </div>
    </footer>
  );
}
