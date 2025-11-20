export default function News() {
  return (
    <section className="px-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-blue-700 to-purple-500">
        Latest News
      </h2>
      <div className="news-list">
        <div className="news-card">
          <div className="news-title">🚀 v1.5 Released!</div>
          <div>Test suite templates, improved logging, new integrations. <span className="text-indigo-500 font-semibold">Read more</span></div>
          <span className="text-xs text-gray-500">Nov 10, 2025</span>
        </div>
        <div className="news-card">
          <div className="news-title">🎉 10,000+ Users</div>
          <div>Thanks for making apisurge the world's fastest-growing API test platform!</div>
          <span className="text-xs text-gray-500">Oct 25, 2025</span>
        </div>
      </div>
    </section>
  );
}
