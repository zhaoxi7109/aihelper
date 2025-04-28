"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import Button from '../ui/Button';

const researchPapers = [
  {
    id: 1,
    title: 'DeepSeek LLM: Scaling Open-Source Language Models',
    abstract: 'This paper introduces DeepSeek LLM, a family of language models trained from scratch on 2T tokens...',
    date: 'January 2024',
    link: 'https://arxiv.org/example1',
  },
  {
    id: 2,
    title: 'DeepSeek-Coder: When the Large Language Model Meets Programming',
    abstract: 'We present DeepSeek-Coder, a family of code language models trained on data from multiple programming languages...',
    date: 'November 2023',
    link: 'https://arxiv.org/example2',
  },
  {
    id: 3,
    title: 'Mathematical Reasoning Capabilities of DeepSeek Models',
    abstract: 'This work explores the mathematical reasoning capabilities of large language models through our DeepSeek Math model...',
    date: 'March 2024',
    link: 'https://arxiv.org/example3',
  },
];

const Research = () => {
  return (
    <section id="research" className="py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Research
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Advancing the frontier of AI through cutting-edge research
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {researchPapers.map((paper, index) => (
            <motion.div
              key={paper.id}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <span className="text-sm text-gray-500 block mb-3">{paper.date}</span>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{paper.title}</h3>
              <p className="text-gray-600 mb-4">{paper.abstract}</p>
              <Link 
                href={paper.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-medium hover:text-blue-700 flex items-center"
              >
                Read paper
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
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
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Button 
            href="/research"
            variant="outline"
          >
            View All Research
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Research; 