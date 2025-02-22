import { Clock, Lock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="min-h-[96vh] bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-200 rounded-3xl overflow-hidden shadow-2xl">
        <div className="container mx-auto px-4 py-12 space-y-24">
          <section className="text-center space-y-8 p-8 rounded-2xl bg-white/30 backdrop-blur-lg">
            <h1 className="text-6xl font-bold text-gray-800">
              Preserve Your Legacy for Future Generations
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Create digital time capsules to safeguard your memories, stories, and precious moments. 
              Share them with loved ones now or schedule them for future discovery.
            </p>
            <div>
              <Link to="/auth">
                <button
                  className="inline-block bg-indigo-600 text-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
                >
                  Start Your Journey
                </button>
              </Link>
            </div>
          </section>

          <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: "Time-Locked Content",
                description: "Schedule when your capsules will be revealed to create anticipation and get a nostalgic surprise years later."
              },
              {
                icon: Lock,
                title: "Secure Storage",
                description: "State-of-the-art end-to-end encryption ensures your memories remain private and protected for generations."
              },
              {
                icon: Users,
                title: "Public Memory Gallery",
                description: "Join a vibrant community of memory keepers and share your stories with the world when you're ready."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white/40 backdrop-blur-lg p-8 rounded-xl shadow-lg hover:transform hover:scale-105 transition-transform duration-300"
              >
                <feature.icon className="h-12 w-12 text-indigo-600 mb-6" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-700">{feature.description}</p>
              </div>
            ))}
          </section>

          <section className="bg-white/40 backdrop-blur-lg rounded-3xl p-12 shadow-xl">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
                Discover Time Capsules Possibilities
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    title: "Family Album",
                    description: "A year of precious memories",
                    image: "https://images.unsplash.com/photo-1503516459261-40c66117780a?auto=format&fit=crop&w=800&q=80"
                  },
                  {
                    title: "Our Wedding",
                    description: "Messages from loved ones on our special day",
                    image: "https://images.unsplash.com/photo-1583939411023-14783179e581?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  },
                  {
                    title: "Letters to Self",
                    description: "Time-locked messages for personal growth",
                    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  },
                  {
                    title: "Graduation  ",
                    description: "Congratulations from family and friends",
                    image: "https://plus.unsplash.com/premium_photo-1713296254777-0a89f05dcb60?q=80&w=1930&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  },
                  {
                    title: "Travel 2024",
                    description: "Documenting worldwide explorations",
                    image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=800&q=80"
                  },
                  {
                    title: "Baby's First Year",
                    description: "Capturing precious milestones",
                    image: "https://images.unsplash.com/photo-1505679208891-9ab12ee61dc1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  }
                ].map((capsule, index) => (
                  <Link to="/auth" key={index} className="group relative aspect-video rounded-xl overflow-hidden hover:transform hover:scale-105 transition-transform duration-300">
                    <img 
                      src={capsule.image}
                      alt={capsule.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-700/40 to-transparent group-hover:from-gray-900/90 transition-all duration-300">
                      <div className="absolute bottom-0 left-0 p-6 w-full">
                        <h3 className="text-xl font-semibold text-white mb-2">{capsule.title}</h3>
                        <p className="text-gray-100 text-sm">{capsule.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="text-center p-8 rounded-2xl bg-white/40 backdrop-blur-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Ready to Create Your Legacy?</h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Join thousands of others who are preserving their memories for future generations.
            </p>
            <Link to="/auth">
              <button
                className="inline-block bg-indigo-600 text-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
              >
                Create Your First Time Capsule
              </button>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Home;