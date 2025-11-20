export default function Download() {
  return (
    <section id="download" className="px-6 max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-7 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-blue-700 to-purple-500">
        Download or Try Online
      </h2>
      <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-8">
        <a href="#" className="button-main" style={{color: 'white', WebkitTextFillColor: 'white'}}>Download Desktop</a>
        <a href="#" className="button-main" style={{background: 'white', color: '#4338ca', WebkitTextFillColor: '#4338ca'}}>Try Web App</a>
        <a href="#" className="button-main" style={{background: '#111827', color: 'white', WebkitTextFillColor: 'white'}}>Install CLI</a>
      </div>
    </section>
  );
}
