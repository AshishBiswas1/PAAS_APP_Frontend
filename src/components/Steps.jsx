export default function Steps() {
  return (
    <section className="steps-bg relative">
      <div className="max-w-3xl mx-auto relative">
        <div className="steps-line"></div>
        {[{step:1,title:"Connect & Configure",desc:"Add your endpoints, choose environments, and set up rapid CI links."},
          {step:2,title:"Test Live",desc:"Create, debug, and automate tests visually or with code—including data flows."},
          {step:3,title:"Collaborate & Integrate",desc:"Invite teammates, push config to Git, use integrations for end-to-end DevOps."},
        ].map((item,i)=>(
          <div className="step-card" key={i}>
            <span className="step-icon">{item.step}</span>
            <div>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
