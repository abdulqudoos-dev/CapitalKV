'use client';

import React from 'react';
import { motion } from 'framer-motion';

const FAQ = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <motion.div
      className='container mx-auto px-10 mt-20 h-full'
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      <motion.h2
        className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12 bg-[radial-gradient(100%_100%_at_top_left,white,white,rgba(140,65,255,0.6))] text-transparent bg-clip-text'
        variants={itemVariants}
      >
        FAQ - Consumer/Enterprise
      </motion.h2>
      <motion.p
        className='text-center mx-auto max-w-[700px] text-gray-200'
        variants={itemVariants}
      >
        <motion.div
          className='text-center mx-auto max-w-[700px] text-gray-200 mb-2'
          variants={itemVariants}
        >
          Frequently Asked Questions (Comsumer/Enterprise)
        </motion.div>
        This page is designed to address questions from business or enterprise
        customers.
        <motion.div
          className='text-center mx-auto max-w-[700px] text-gray-200 mb-2'
          variants={itemVariants}
        >
          If you’re an individual customer, please refer to our Consumer FAQ.
        </motion.div>
        <motion.div
          className='text-center mx-auto max-w-[700px] text-gray-200 mb-4'
          variants={itemVariants}
        >
          Does Capitalkv train its models using customer data?
        </motion.div>
        <motion.div
          className='text-center mx-auto max-w-[700px] text-gray-200 mb-2'
          variants={itemVariants}
        >
          No. We do not use your enterprise or API data, inputs, or outputs for
          training our models.
        </motion.div>
        <motion.div
          className='text-center mx-auto max-w-[700px] text-gray-200 mb-4'
          variants={itemVariants}
        >
          Who owns inputs and outputs?
        </motion.div>
        <motion.div
          className='text-center mx-auto max-w-[700px] text-gray-200 mb-2'
          variants={itemVariants}
        >
          As between our enterprise customers and Capitalkv, the customer
          retains all rights to the inputs they provide and any output they
          receive from our services, to the extent permitted by law.
        </motion.div>
        <motion.div
          className='text-center mx-auto max-w-[700px] text-gray-200 mb-4'
          variants={itemVariants}
        >
          What security measures does Capitalkv use to protect customer data?
        </motion.div>
        <motion.div
          className='text-center mx-auto max-w-[700px] text-gray-200 mb-2'
          variants={itemVariants}
        >
          Security measures are outlined in Appendix 2 of our Data Processing
          Addendum (DPA).
        </motion.div>
        <motion.div
          className='text-center mx-auto max-w-[700px] text-gray-200 mb-4'
          variants={itemVariants}
        >
          Does Capitalkv support customers with compliance with the GDPR and
          other privacy laws?
        </motion.div>
        <motion.div
          className='text-center mx-auto max-w-[700px] text-gray-200 mb-2'
          variants={itemVariants}
        >
          Yes, we execute a Data Processing Addendum (DPA) with customers for
          their use of our enterprise services. This DPA is automatically
          incorporated into our Enterprise Terms of Service.
        </motion.div>
        <motion.div
          className='text-center mx-auto max-w-[700px] text-gray-200 mb-4'
          variants={itemVariants}
        >
          Is Capitalkv HIPAA compliant?
        </motion.div>
        <motion.div
          className='text-center mx-auto max-w-[700px] text-gray-200 mb-4'
          variants={itemVariants}
        >
          For how long is customer data retained?
        </motion.div>
        All conversations are automatically deleted within 30 days, unless we
        are legally required to retain them or they are flagged as potentially
        violating our Terms of Service or AUP.{' '}
      </motion.p>
    </motion.div>
  );
};

export default FAQ;
