export default function Pricing() {
  return (
    <section className="pricing-root">
      <h2 className="text-4xl font-bold text-center mb-14 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-blue-700 to-purple-500">
        Pricing for All Teams
      </h2>
      <div className="flex flex-wrap gap-12 justify-center">
        <div className="pricing-card">
          <div className="price">$0</div>
          <ul>
            <li>Unlimited APIs</li>
            <li>Team Sync</li>
            <li>DevOps Integrations</li>
          </ul>
          <button className="button-main">Get Started</button>
        </div>
        <div className="pricing-card popular">
          <div className="price">$49/mo</div>
          <ul>
            <li>Priority Support</li>
            <li>Enterprise Security</li>
            <li>Unlimited Projects</li>
          </ul>
          <button className="button-main">Try Pro</button>
        </div>
        <div className="pricing-card">
          <div className="price">$179/mo</div>
          <ul>
            <li>White-glove Onboarding</li>
            <li>Custom Integrations</li>
            <li>Dedicated Manager</li>
          </ul>
          <button className="button-main">Contact Sales</button>
        </div>
      </div>
    </section>
  );
}
