"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import Button from '../ui/Button';

const productCards = [
  {
    id: 1,
    title: 'DeepSeek LLM',
    description: 'Advanced language models trained on massive text corpora with state-of-the-art capabilities.',
    icon: '🤖',
  },
  {
    id: 2,
    title: 'DeepSeek Coder',
    description: 'Specialized coding assistant trained on open-source code repositories to help developers write better code.',
    icon: '👨‍💻',
  },
  {
    id: 3,
    title: 'DeepSeek Math',
    description: 'Specialized model for solving complex mathematical problems with step-by-step reasoning.',
    icon: '📊',
  },
  {
    id: 4,
    title: 'DeepSeek VL',
    description: 'Vision-language model that understands and generates text based on visual inputs.',
    icon: '👁️',
  },
];

const Products = () => {
  return (
    <section id="products" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Our Products
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Cutting-edge AI models designed for various applications
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {productCards.map((product, index) => (
            <motion.div
              key={product.id}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <div className="text-4xl mb-4">{product.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.title}</h3>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <Link 
                href={`/products/${product.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-blue-600 font-medium hover:text-blue-700 flex items-center"
              >
                Learn more
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button 
            href="/products"
            variant="primary"
          >
            View All Products
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Products; 