import { useState } from "react";
const faqs = [
  { q: "Is apisurge suitable for enterprise?", a: "Absolutely. apisurge is built for scale, with features like SSO, audit logging, and priority support." },
  { q: "Can I automate test flows?", a: "Yes! Use our visual builder or raw code to automate scripts, schedule runs, and integrate with CI/CD." },
  { q: "How does billing work?", a: "Flexible monthly/annual plans, free tier, and discounts for non-profits and startups." }
];

export default function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section className="px-6 max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-blue-700 to-purple-500">
        Frequently Asked Questions
      </h2>
      <div className="faq-list">
        {faqs.map((f,i)=>(
          <div key={i} className="faq-item">
            <div className="faq-q" onClick={()=>setOpen(open===i?null:i)}>{f.q}</div>
            {open===i&&<div className="faq-a">{f.a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
