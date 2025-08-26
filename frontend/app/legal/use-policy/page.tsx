'use client';

import React from 'react';
import { motion } from 'framer-motion';

const UsePolicy = () => {
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
        className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12'
        variants={itemVariants}
      >
        Refund policy
      </motion.h2>
      <motion.p
        className='text-center mx-auto max-w-[700px] text-gray-200'
        variants={itemVariants}
      >
        <motion.div
          className='text-center mx-auto max-w-[700px] text-gray-200 mb-2'
          variants={itemVariants}
        >
          Last Updated: June 30, 2025
        </motion.div>
        <motion.div
          className='text-center mx-auto max-w-[700px] text-gray-200 mb-2'
          variants={itemVariants}
        >
          Returns
        </motion.div>
        <motion.div
          className='text-center mx-auto max-w-[700px] text-gray-200 mb-2'
          variants={itemVariants}
        >
ou have 14 calendar days to return an item from the date you received it.
          To be eligible for a return, your item must be unused and in the same condition that you received it. Your item must be in the original packaging.
        Your item needs to have the receipt or proof of purchase.

        </motion.div>

        <motion.div
          className='text-center mx-auto max-w-[700px] text-gray-200 mb-2'
          variants={itemVariants}
        >
  Refunds      
</motion.div>
        <motion.div
          className='text-center mx-auto max-w-[700px] text-gray-200 mb-2'
          variants={itemVariants}
        >
All Digital Products are non-refundable.
All Memberships, since they include digital products, consultations and services are also non-refundable.
For Physical Products, once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.
If your return is approved, we will initiate a refund to your credit card (or original method of payment).
You will receive the credit within a certain amount of days, depending on your card issuer’s policies 
        </motion.div>
        <motion.div
          className='text-center mx-auto max-w-[700px] text-gray-200 mb-2'
          variants={itemVariants}
        >
Shipping
        </motion.div>
        <motion.div
          className='text-center mx-auto max-w-[700px] text-gray-200 mb-2'
          variants={itemVariants}
        >
     You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non refundable.
If you receive a refund, the cost of return shipping will be deducted from your refund.

        </motion.div>
        <motion.div
          className='text-center mx-auto max-w-[700px] text-gray-200 mb-2'
          variants={itemVariants}
        >
          Contact Us
        </motion.div>
        <motion.div
          className='text-center mx-auto max-w-[700px] text-gray-200 mb-2'
          variants={itemVariants}
        >
If you have any questions on how to return your item to us, contact capitalkv1@gmail.com
        </motion.div>
      </motion.p>
    </motion.div>
  );
};

export default UsePolicy;
