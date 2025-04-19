const HomePage = () => {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-blue-700">Welcome to EasyEMI</h1>
          <p className="text-lg text-gray-600">
            Your personal loan assistant to manage, track, and optimize your EMIs — all in one place.
          </p>
        </section>
  
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            title="📊 Track Loans Easily"
            description="View all your active loans in one dashboard with detailed breakdowns."
          /> 
          <FeatureCard
            title="📅 Auto EMI Generation"
            description="Monthly EMI entries are automatically created for each loan — no manual updates needed."
          />
          <FeatureCard
            title="📈 Foreclosure Simulation"
            description="Explore how early repayments or lump-sum amounts can save your interest cost."
          />
          <FeatureCard
            title="📚 Loan History"
            description="See payment history and analyze your progress toward becoming debt-free."
          />
          <FeatureCard
            title="🔐 Secure and Private"
            description="Your data is encrypted and only accessible by you."
          />
          <FeatureCard
            title="🔔 EMI Reminders"
            description="Get automatic reminders two days before your EMI due date so you never miss a payment."
          />
        </section>
  
        {/* <section className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to simplify your EMI journey?</h2>
          <a
            href="/signup"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition"
          >
            Get Started
          </a>
        </section> */}
      </div>
    );
  };
  
  const FeatureCard = ({ title, description }) => (
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition text-center">
      <h3 className="text-xl font-semibold text-blue-700 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
  
  export default HomePage;