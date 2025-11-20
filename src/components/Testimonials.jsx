export default function Testimonials() {
  const testimonials = [
    {
      name: "Ashley D.",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      quote: "apisurge is a game-changer for API testing. My team ships faster and with confidence.",
    },
    {
      name: "Michael P.",
      avatar: "https://randomuser.me/api/portraits/men/43.jpg",
      quote: "Integrations and custom flows were easy enough for even junior devs to own. 10/10 UI.",
    },
    {
      name: "Riya N.",
      avatar: "https://randomuser.me/api/portraits/women/88.jpg",
      quote: "The speed and reliability are unmatched. The support team is exceptional.",
    },
  ];
  return (
    <section className="testimonials-root py-10">
      <h2 className="text-4xl font-bold mb-9 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-blue-700 to-purple-500">
        Loved by Modern Teams
      </h2>
      <div className="flex flex-wrap gap-10 justify-center">
        {testimonials.map((t,i)=>(
          <div key={i} className="testimonial-card">
            <div className="flex items-center mb-5">
              <img src={t.avatar} alt={t.name} className="testimonial-avatar" />
              <span className="testimonial-author">{t.name}</span>
            </div>
            <div className="testimonial-quote">"{t.quote}"</div>
          </div>
        ))}
      </div>
    </section>
  );
}
