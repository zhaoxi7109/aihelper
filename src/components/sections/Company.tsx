"use client";

import { motion } from 'framer-motion';
import Button from '../ui/Button';

const Company = () => {
  return (
    <section id="company" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">About DeepSeek</h2>
            <p className="text-lg text-gray-600 mb-6">
              DeepSeek is an AI research company dedicated to building foundation models that advance the frontiers of AI. Our mission is to create AI systems that are universally accessible and useful.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              Founded by a team of AI researchers and engineers with extensive experience in machine learning, natural language processing, and computer vision, we are focused on developing cutting-edge AI technologies that can benefit humanity.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                href="/about"
                variant="outline"
              >
                Learn About Us
              </Button>
              <Button 
                href="/careers"
                variant="outline"
              >
                Join Our Team
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            className="lg:w-1/2"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative rounded-xl overflow-hidden shadow-lg aspect-video bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-400">Company vision illustration</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          className="mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="text-blue-600 text-2xl mb-4">🧠</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Innovation</h4>
              <p className="text-gray-600">Pushing the boundaries of AI research through innovative approaches and solutions.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="text-blue-600 text-2xl mb-4">🌐</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Accessibility</h4>
              <p className="text-gray-600">Making advanced AI technology accessible to researchers, developers, and users worldwide.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="text-blue-600 text-2xl mb-4">🤝</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Responsibility</h4>
              <p className="text-gray-600">Developing AI systems responsibly with a focus on safety, fairness, and transparency.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Company; 