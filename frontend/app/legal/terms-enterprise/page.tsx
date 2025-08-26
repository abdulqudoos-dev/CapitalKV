"use client";

import React from "react";
import { motion } from "framer-motion";

const Enterprise = () => {
  const container = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { delayChildren: 0.3, staggerChildren: 0.2 } 
    },
  };
  const item = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <motion.div className="container mx-auto px-6 md:px-12 mt-20 h-full" variants={container} initial="hidden" animate="visible">
      <motion.h2         className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12"
 variants={item}>
        Terms of Service Enterprise & Franchise
      </motion.h2>

      <motion.div className="text-center mx-auto max-w-[700px] text-gray-200 mb-4" variants={item}>
        <motion.p><strong>Last Updated:</strong> June 30, 2025</motion.p>

        <motion.p>
          These Terms of Service (“Terms”) govern your use of the CapitalKV enterprise software, platforms, or services (collectively, “Services”) offered by CapitalKV ("we", "our", or "us"). These Terms apply to businesses, enterprise clients, and authorized franchisees or resellers (“you” or “Customer”).
        </motion.p>

        <h3 className="text-xl font-semibold mt-8">Grant of Use & Franchise Rights</h3>
        <motion.p>
          Subject to these Terms and a valid agreement (Order Form, Master Services Agreement, or Franchise License), we grant you a limited, non-transferable, non-exclusive right to use the Services for internal business purposes or, where authorized, to market under our brand as a franchisee in specified regions.
        </motion.p>

        <h3 className="text-xl font-semibold mt-8">Account & Access Control</h3>
        <motion.p>
          You are responsible for maintaining the confidentiality of your credentials and managing any authorized sub-accounts. Unauthorized access, credential sharing, or circumvention of system limits is prohibited.
        </motion.p>

        <h3 className="text-xl font-semibold mt-8">Acceptable Use</h3>
        <motion.p>
          You agree not to misuse the Service. Prohibited activities include but are not limited to reverse engineering, spreading malware, illegal scraping, violating third-party rights, or acting contrary to applicable laws or platform integrity.
        </motion.p>

        <h3 className="text-xl font-semibold mt-8">Intellectual Property & Branding</h3>
        <motion.p>
          All software, trademarks, and proprietary assets remain our property. You retain rights to content you upload or generate. Franchisees may only use our branding in approved contexts. Feedback may be used by us freely to improve our services.
        </motion.p>

        <h3 className="text-xl font-semibold mt-8">Data Privacy & Compliance (GDPR)</h3>
        <motion.p>
          We process personal data in accordance with EU GDPR and equivalent laws. We will sign a Data Processing Agreement (DPA) where required. You must ensure your own processing basis is lawful and inform your end users or customers as necessary. Data subject rights (access, deletion, correction) are supported.
        </motion.p>

        <h3 className="text-xl font-semibold mt-8">Fees, Invoicing & Refunds</h3>
        <motion.p>
          Fees are specified in your commercial agreement. Invoices are due upon receipt unless otherwise stated. Subscription fees are charged in advance. Refunds are not provided unless required by law or agreed in writing.
        </motion.p>

        <h3 className="text-xl font-semibold mt-8">Confidentiality</h3>
        <motion.p>
          Both parties agree to treat all business, technical, or financial information exchanged as confidential, and to use it only in connection with the Services, unless disclosure is required by law.
        </motion.p>

        <h3 className="text-xl font-semibold mt-8">Termination</h3>
        <motion.p>
          Either party may terminate with 14 days’ notice for convenience or immediately for material breach or insolvency. Upon termination, access ceases and you must delete all proprietary materials.
        </motion.p>

        <h3 className="text-xl font-semibold mt-8">Limitation of Liability</h3>
        <motion.p>
          Neither party is liable for indirect or consequential damages. Our total liability is limited to the amount you paid in the 12 months prior to the claim. This does not limit liability for fraud, gross negligence, or breach of data protection duties.
        </motion.p>

        <h3 className="text-xl font-semibold mt-8">Governing Law & Jurisdiction</h3>
        <motion.p>
          These Terms are governed by the laws of the European Economic Area (EEA), without regard to conflict of laws. Where national law must apply, it shall be the law of the country where your billing entity is established. Disputes will be resolved by competent courts of that jurisdiction.
        </motion.p>

        <h3 className="text-xl font-semibold mt-8">Dispute Resolution</h3>
        <motion.p>
          Before initiating legal action, both parties agree to attempt informal resolution. Where required or agreed, disputes may be submitted to arbitration under internationally recognized rules (e.g., ICC or NAI).
        </motion.p>

        <h3 className="text-xl font-semibold mt-8">Modifications to Terms</h3>
        <motion.p>
          We may revise these Terms by posting updates. Material changes for enterprise or franchise users will require written notice. Continued use of the Service after notice implies acceptance of changes.
        </motion.p>

        <h3 className="text-xl font-semibold mt-8">Contact</h3>
        <motion.p>
          Questions, legal notices, or complaints should be directed to:<br/>
          <strong>CapitalKV Legal</strong><br/>
          legal@capitalkv.com
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default Enterprise;