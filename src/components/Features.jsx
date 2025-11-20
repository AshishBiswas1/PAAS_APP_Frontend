import { BoltIcon, Cog6ToothIcon, LifebuoyIcon } from '@heroicons/react/24/solid';
import { motion } from "framer-motion";

function FeatureBox({ icon: Icon, title, desc, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay }}
      viewport={{ once: true }}
      className="bg-white/70 backdrop-blur-xl rounded-3xl p-12 shadow-2xl hover:shadow-[0_8px_32px_0_rgba(72,61,139,0.20)] hover:-translate-y-2 transition-all text-center"
    >
      <div className="flex justify-center">
        <span className="inline-flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-400 to-purple-400 rounded-xl p-3 mb-7 w-16 h-16 text-white shadow-lg">
          <Icon className="h-10 w-10" />
        </span>
      </div>
      <h3 className="text-2xl font-extrabold text-indigo-700 mb-3">{title}</h3>
      <p className="text-gray-700 text-lg">{desc}</p>
    </motion.div>
  );
}

export default function Features() {
  return (
    <section id="features" className="min-h-screen flex items-center justify-center py-32 bg-transparent relative">
      <div className="w-full max-w-6xl mx-auto px-6 z-10">
        <h2 className="text-5xl font-extrabold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-blue-700 to-purple-500 drop-shadow-lg">
          Why Teams <span className="underline decoration-indigo-200 underline-offset-[12px]">Choose apisurge</span>
        </h2>
        <div className="grid gap-16 md:grid-cols-3">
          <FeatureBox
            icon={BoltIcon}
            title="Insanely Fast"
            desc="Run, rerun, and debug tests instantly—with live reload and results. Up to 10x faster than legacy tools."
            delay={0.0}
          />
          <FeatureBox
            icon={Cog6ToothIcon}
            title="Infinite Customization"
            desc="Design complex workflows visually or in code. Integrate with any CI/CD. Build a testing stack made for you."
            delay={0.12}
          />
          <FeatureBox
            icon={LifebuoyIcon}
            title="Pro-Level Support"
            desc="Expert onboarding, 24/7 troubleshooting, and guided templates. We’re your partner, not just a tool."
            delay={0.19}
          />
        </div>
      </div>
    </section>
  );
}
