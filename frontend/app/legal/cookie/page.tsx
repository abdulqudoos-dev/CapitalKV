"use client";

import React from "react";
import { motion } from "framer-motion";

const Cookie = () => {
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
      className="container mx-auto px-10 mt-20 h-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h2
        className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12"
        variants={itemVariants}
      >
        Cookie policy
      </motion.h2>
      <motion.h2
        className="text-center mx-auto max-w-[700px] text-gray-200"
        variants={itemVariants}
      ></motion.h2>

      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200"
        variants={itemVariants}
      >
        Last updated: june 30, 2025
        <motion.div
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-2"
          variants={itemVariants}
        >
          This Cookie Policy describes what kinds of cookies and similar
          technologies CapitalKV uses in connection with our Service (as defined in
          our Privacy Policy), and how you can manage them.
        </motion.div>
        <motion.div
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          What are cookies and local storage?
        </motion.div>
        Cookies are small files placed on your computer as you browse the web or
        use a web-enabled app. We also use local storage to save data on your
        computer or mobile device.
        <motion.div
          className="text-center mx-auto max-w-[700px] text-gray-200 mb42"
          variants={itemVariants}
        >
          Why does CapitalKV use these technologies?
        </motion.div>
        We currently only use tracking tools that are strictly necessary to
        operate our websites and other Services. For example, they allow us to
        authenticate users and enable specific features within the Service,
        including for security purposes (to protect you from forged requests),
        to remember user preferences/ settings and manage products you have
        access to. We do not currently use any cookies for analytics or
        advertising purposes. You cannot disable necessary tracking tools, since
        they are required for our Services to function.
        <motion.h2
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-2"
          variants={itemVariants}
        >
          List of cookies
        </motion.h2>
        Below is a list of all the necessary cookies and local storage items
        used on our Service:
        <motion.div
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          List of cookies here
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            If you leave a comment on our site you may opt-in to saving your
            name, email address and website in cookies. These are for your
            convenience so that you do not have to fill in your details again
            when you leave another comment. These cookies will last for one
            year.
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            If you visit our login page, we will set a temporary cookie to
            determine if your browser accepts cookies. This cookie contains no
            personal data and is discarded when you close your browser.
          </motion.div>
          When you log in, we will also set up several cookies to save your
          login information and your screen display choices. Login cookies last
          for two days, and screen options cookies last for a year. If you
          select “Remember Me”, your login will persist for two weeks. If you
          log out of your account, the login cookies will be removed.
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            Table Here.
          </motion.div>
        </motion.div>
        Additional information
        <a
          href="capitalkv1@gmail.com"
          className="text-blue-600 hover:underline"
        >
          You can send any questions to: capitalkv1@gmail.com.
        </a>
      </motion.p>
    </motion.div>
  );
};

export default Cookie;
