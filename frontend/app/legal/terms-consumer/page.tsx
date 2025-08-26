"use client";

import React from "react";
import { motion } from "framer-motion";

const Consumer = () => {
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
        Terms of Service - Consumer
      </motion.h2>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-2"
        variants={itemVariants}
      >
        <motion.h3
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-2"
          variants={itemVariants}
        >
          Last Modified: June 30, 2025
        </motion.h3>
        Welcome to CapitalKV! Please review these Terms of Service (these
        “Terms”), which describe the terms and conditions by which individuals
        may access and/or use CapitalKV, our website(s), and any and all related
        products, software, documentation, and online, mobile-enabled, and/or
        digital services (collectively, the “Service”) provided by CapitalKV
        (including its successors and assigns, CapitalKV,” “we,” “our,” or
        “us”). These Terms apply to all visitors and users of the Service, and
        to all others who access the Service (collectively, “Users,” and, as
        applicable to you, “you” or “your”). By accessing our Service, you
        signify that you have read, understood, and agree to be bound by these
        Terms. Please read our Privacy Policy, which describes how we collect
        and use personal information. Although it does not form part of these
        Terms, it is an important document you should read.
      </motion.p>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-2"
        variants={itemVariants}
      >
        Please note:We reserve the right to modify these Terms. For terms
        governing use of our services for services,tools businesses and CapitalKV Platform, 
        you must agree to the Enterprise Terms of Use. For Users who are residents of the European
        Economic Area (EEA), United Kingdom (UK) and Netherlands and turkiye , you are
        agreeing to the EU-Specific Terms in Section 18, which supplement or
        replace certain sections of these Terms.
      </motion.p>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-2"
        variants={itemVariants}
      >
        PLEASE READ THESE TERMS CAREFULLY TO ENSURE THAT YOU UNDERSTAND EACH
        PROVISION. THESE TERMS CONTAIN A MANDATORY INDIVIDUAL ARBITRATION
        PROVISION IN SECTION 17.2 (THE “ARBITRATION AGREEMENT”) AND A CLASS
        ACTION/JURY TRIAL WAIVER PROVISION IN SECTION 17.3 (THE “CLASS
        ACTION/JURY TRIAL WAIVER”) THAT REQUIRE, UNLESS YOU OPT OUT PURSUANT TO
        THE INSTRUCTIONS IN THE ARBITRATION AGREEMENT, THE EXCLUSIVE USE OF
        FINAL AND BINDING ARBITRATION ON AN INDIVIDUAL BASIS TO RESOLVE DISPUTES
        BETWEEN YOU AND US, INCLUDING ANY CLAIMS THAT AROSE OR WERE ASSERTED
        BEFORE YOU AGREED TO THESE TERMS. TO THE FULLEST EXTENT PERMITTED BY
        APPLICABLE LAW (AS DEFINED BELOW), YOU EXPRESSLY WAIVE YOUR RIGHT TO
        SEEK RELIEF IN A COURT OF LAW AND TO HAVE A JURY TRIAL ON YOUR CLAIMS,
        AS WELL AS YOUR RIGHT TO PARTICIPATE AS A PLAINTIFF OR CLASS MEMBER IN
        ANY CLASS, COLLECTIVE, PRIVATE ATTORNEY GENERAL, OR REPRESENTATIVE
        ACTION OR PROCEEDING.
      </motion.p>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-2"
        variants={itemVariants}
      >
        <motion.h3
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-2"
          variants={itemVariants}
        >
          How We Administer the Service
        </motion.h3>
        Eligibility. This is a contract between you and CapitalKV. You must read and
        agree to these Terms before using the Service or accesing the website in full. If you do not agree, you
        may not use the Service. You may use the Service only if you can form a
        legally binding contract with us, and only in compliance with these
        Terms and all applicable local, state, national, and international laws,
        rules, and regulations (“Applicable Law”). You must be at least 18 years
        old to use the Service. The Service is not available to any Users we
        previously removed from the Service.
      </motion.p>
      <motion.h3
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-2"
        variants={itemVariants}
      >
        User Accounts
      </motion.h3>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-2"
        variants={itemVariants}
      >
        Your User Account:Your account on the Service (your “User Account”)
        gives you access to certain services and functionalities that we may, in
        our sole discretion, establish and maintain as part of the Service from
        time to time. You acknowledge that, not with standing anything to the
        contrary here in, you do not own your User Account, nor do you possess
        any rights to data stored by or on behalf of CapitalKV on the servers
        running the Service. We may maintain different types of User Accounts
        for different types of Users
      </motion.p>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-2"
        variants={itemVariants}
      >
        Connecting Via Third-Party Services:By connecting to the Service via a
        third-party service, including via your Social Media account, you give
        us permission to access and use your information from that service, as
        permitted by that service, and to store your log-in credentials and/or
        access tokens for that service.
      </motion.p>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-2"
        variants={itemVariants}
      >
        User ID; Account Security:For some aspects of the Service, you must
        create an account and agree to comply with all the terms associated with
        that account. We will not be liable for, and expressly disclaim
        liability for, any losses caused by any unauthorized use of your User
        Account and/or any changes to your User Account. You will notify us
        immediately of any breach of security or unauthorized use of your User
        Account.
      </motion.p>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-2"
        variants={itemVariants}
      >
        Account Settings:You may control certain aspects of your User Account
        and any associated User profile, and of the way you interact with the
        Service, by changing the settings in your settings page. By providing us
        with your email address, you consent to our using that email address to
        send you Service-related notices, including any notices required by
        Applicable Law, in lieu of communication by postal mail. We may also use
        that email address to send you other messages as necessary to provide
        the Service.
      </motion.p>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-2"
        variants={itemVariants}
      >
        Changes, Suspension, and Termination. You may de-activate your User
        Account at any time. We may, with or without prior notice, change the
        Service, stop providing the Service or features of the Service to you or
        to Users generally, or create usage limits for the Service. We may, with
        or without prior notice, permanently terminate or temporarily suspend
        your access to your User Account and/or the Service without liability,
        with or without cause, and for any or no reason, including if, in our
        sole determination, you violate any provision of these Terms. Upon their
        termination for any reason or no reason, you continue to be bound by
        these Terms.
      </motion.p>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-2"
        variants={itemVariants}
      >
        Your Interactions with Other Users: YOU ARE SOLELY RESPONSIBLE FOR YOUR
        INTERACTIONS, INCLUDING SHARING OF INFORMATION, WITH EITHER THE PUBLIC
        OR OTHER USERS. WE RESERVE THE RIGHT, BUT HAVE NO OBLIGATION, TO MONITOR
        DISPUTES BETWEEN YOU AND OTHER USERS. WE EXPRESSLY DISCLAIM ALL
        LIABILITY ARISING FROM YOUR INTERACTIONS WITH OTHER USERS, AND FOR ANY
        USER’S ACTION OR INACTION, INCLUDING RELATING TO INPUT (AS DEFINED
        BELOW).
      </motion.p>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-2"
        variants={itemVariants}
      >
        <motion.h3
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-2"
          variants={itemVariants}
        >
          Access to the Service; Service Restrictions
        </motion.h3>
        Access to the Service and Cooperation. Subject to your compliance with
        these Terms, our Acceptable Use Policy, and any documentation we may
        make available to you, you are hereby granted a non-exclusive, limited,
        non-transferable, and freely revocable right to access and use the
        Service, solely for your personal use strictly as permitted by the
        features of the Service. We may terminate the license granted in this
        Section at any time, for any reason or no reason. We reserve all rights
        not expressly granted herein in and to the Service. Additionally, if you
        do not comply with these Terms, you agree CapitalKV may contact you and
        require your reasonable cooperation in remediating any issues resulting
        from said noncompliance, and you agree to reasonably cooperate as
        required. Restrictions. Except to the extent a restriction is prohibited
        by Applicable Law, you will not do, and will not assist, permit, or
        enable any third party to do, any of the following: disassemble, reverse
        engineer, decode, or decompile any part of the Service; use any robot,
        spider, scraper, off-line reader, data mining tool, creating of
        disgusting campaigns, mis information spreading by using our AI, 
        data gathering or extraction tool, or any other
        automated means to access the Service in a manner that sends more
        request messages to the servers running the Service than a human can
        reasonably produce in the same period of time by using a conventional
        on-line web browser.(except that CapitalKV grants the operators of public
        search engines revocable permission to use spiders for marketing to copy
        publicly available materials from the Service for the sole purpose of,
        and solely to the extent necessary for, creating publicly available
        searchable indices of, but not caches or archives of, such materials,
        and only as specified in the applicable robots.txt file); use any
        content available on or via the Service (including any caption
        information, keywords, or other metadata or even for marketing ) for any
        machine or deep learning and/or artificial intelligence training or
        development purposes, or for any technologies designed or intended for
        the identification of natural persons;
      </motion.p>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-2"
        variants={itemVariants}
      >
        Do not buy, sell, or transfer API keys or account information without our prior written
        consent.
      </motion.p>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-2"
        variants={itemVariants}
      >
        Do not copy, rent, sell, sublicense, distribute, modify, or create
        derivative works of the Service or any CapitalKV Intellectual Property,
        including via “scraping.” Avoid using the Service in any way that
        impacts server stability, performance, or the experience of other users.
        Do not take actions that impose an unreasonable load on our
        infrastructure. Do not use the Service in any way that (i) violates any
        Applicable Law, contractual obligations, or rights (including
        intellectual property, privacy, or personality rights), (ii) promotes
        harm, deception, or hatred, or (iii) may be objectionable to us or any
        third party. Do not use or display the Service in competition with us,
        to develop competing products, for benchmarking, or in a way that
        disadvantages us. Only access the Service through authorized means, and
        do not bypass measures to prevent restricted access. Do not interfere
        with the Service’s security, transmit spam, or use it to extract data
        programmatically. Avoid transmitting invalid data, viruses, or harmful
        software through the Service. Do not impersonate others, misrepresent
        affiliations, or hide your identity to use the Service fraudulently. Do
        not collect personal information from the Service without consent. Do
        not imply a relationship of endorsement or affiliation with us without
        written consent.
      </motion.p>
      <motion.h3
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        Intellectual Property
      </motion.h3>

      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200"
        variants={itemVariants}
      >
        <motion.h3
          className="text-center mx-auto max-w-[700px] text-gray-200"
          variants={itemVariants}
        >
          Input
        </motion.h3>
        You (or your licensors) retain ownership of any data, information, or
        content, in any form, that is collected, received, or otherwise
        transmitted by you through the Service, including any prompts/chats
        (collectively, “Input”). By using the Service, you grant us an
        irrevocable, transferable, sublicensable, royalty-free, worldwide
        license to use, copy, store, modify, distribute, and display your Input
        and Output (collectively, “Content”) to (i) maintain and provide the
        Service; (ii) improve our products and Service, including for data
        analysis, research, and product development; and (iii) take other
        actions as outlined in our Privacy Policy or authorized by you. You
        represent and warrant that: You have obtained all necessary consents for
        any identifiable persons in your Input. Your Input complies with all
        laws, does not infringe on third-party rights, and does not include
        sensitive or classified information. Input does not contain prohibited
        content, such as hate speech, self-harm, or illegal material. All Input
        provided is accurate and truthful. We disclaim any ownership rights over
        your Input and assume no liability for it. You are solely responsible
        for your Input and any consequences of submitting, posting, or sharing
        it. CapitalKV Intellectual Property. We (or our licensors) retain all
        rights, title, and interest in and to the Service, including all
        associated software, algorithms, and other materials (collectively,
        CapitalKV Intellectual Property”). You may not use any CapitalKV
        Intellectual Property for purposes outside of those expressly permitted
        in these Terms.
        <motion.h3
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          Output
        </motion.h3>
        You own the Output generated by your use of the Service. You may not
        represent Output as human-generated.
        Output may not be unique and can be similar across users. You agree to
        evaluate Output’s accuracy and suitability, particularly when it may
        impact individuals in a material or legal way.
        <motion.h3
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          Usage Data
        </motion.h3>
        We retain exclusive ownership of all diagnostic, technical, and usage
        data (“Usage Data”) generated from the Service. Usage Data may be used
        for service improvement, analytics, and other lawful purposes, and may
        be shared in de-identified or aggregated form.
        <motion.h3
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          Feedback.
        </motion.h3>
        If you provide us with suggestions or feedback, you assign to us all
        rights in this Feedback, allowing us to use it without any obligation to
        you.
        <motion.h3
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          Opt-Out
        </motion.h3>
        You may opt out of allowing your Content to chat or using the services by updating
        your account settings.
      </motion.p>
      <motion.h3
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        Confidential Information
      </motion.h3>

      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        The Service may include non-public, proprietary, or confidential
        information of CapitalKV and/or other Users (“Confidential
        Information”). You will: (a) protect the confidentiality of all
        Confidential Information with at least the same care as your own
        sensitive information; (b) use Confidential Information only to exercise
        your rights or fulfill your obligations under these Terms; and (c) not
        disclose Confidential Information, except to service providers or legal
        advisors who need to know and are bound by confidentiality restrictions.
        <motion.p
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          <motion.h3
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            Infringement Policy
          </motion.h3>
          We may terminate the accounts of Users who are repeat infringers or
          limit access to the Service at our discretion, especially for
          intellectual property infringements.
        </motion.p>
        <motion.p
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          Fees, Payments, and Cancellation If you purchase the Service, provide
          accurate billing information, including a valid payment method. For
          subscriptions, we will automatically charge your payment method upon
          renewal until canceled. Payments are non-refundable except where
          required by law. We may increase subscription prices with 14 days'
          notice, effective on your next renewal.
        </motion.p>
        <motion.p
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          Privacy and Data Security By using the Service, you acknowledge we may
          collect, use, and disclose your personal data as described in our
          Privacy Policy, which may include transferring or processing data in
          Europe. Although we prioritize data security, you acknowledge
          providing data at your own risk.
        </motion.p>
        <motion.p
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          Additional Terms for Apps To use any App, your mobile device must be
          compatible. You are responsible for any charges from your wireless
          provider. We grant you a non-exclusive, non-transferable, revocable
          license to use the App, subject to these Terms. You may not modify,
          distribute, or reverse-engineer the App.
        </motion.p>
        <motion.p
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          <motion.h3
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            iOS App
          </motion.h3>
          If using the iOS App, you acknowledge that these Terms are between you
          and CapitalKV, not Apple. Apple is not responsible for maintenance or
          support, and any claims related to the iOS App should be directed to
          CapitalKV, not Apple.
        </motion.p>
        <motion.h3
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          Android App
        </motion.h3>
        If using the Android App, you acknowledge that these Terms are between
        you and CapitalKV, not Google. Google is only a provider of the Google
        Play Store, and CapitalKV is solely responsible for the Android App.
      </motion.p>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        <motion.h3
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          Your Use of Third-Party Services
        </motion.h3>
        The Service may contain links to third-party sites, materials, and
        services (collectively, “Third-Party Services”) that are not owned or
        controlled by us. If you use a third-party service in connection with
        the Service, you are subject to their terms and conditions. We do not
        endorse or take responsibility for any third-party services. Accessing
        or sharing your Input or Output through any third-party service is at
        your own risk, and our Terms and Privacy Policy do not apply. You
        release us from any liability arising from your use of these third-party
        services.
      </motion.p>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        Release:You release us from any claims or damages arising from disputes
        between you and third parties in connection with the Service. This
        release includes claims you may not yet know about.
      </motion.p>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        Indemnity:You agree to indemnify and hold us, our affiliates, agents,
        and partners (collectively, "CapitalKV Indemnitees") harmless from any
        claims, damages, losses, or expenses arising from: (a) your use of the
        Service, including Output; (b) any violation of these Terms; (c)
        infringement of third-party rights; (d) any unlawful action or
        misconduct; or (e) unauthorized access to your account.
        <motion.h3
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          No Warranty; Disclaimers
        </motion.h3>
        The Service is provided "as is" and "as available." We do not guarantee
        error-free service or uninterrupted access. The Service, including all
        intellectual property and content, is provided without warranties of any
        kind, whether express or implied, including warranties of
        merchantability or fitness for a particular purpose.
      </motion.p>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        Limitation of Liability: To the fullest extent permitted by law, we are
        not liable for indirect, punitive, incidental, special, or consequential
        damages, including loss of profits or data, resulting from your use of
        the Service. In no event will our liability exceed the amount you paid
        for the Service or €100.00, whichever is greater. Governing Law,
        Arbitration, and Class Action/Jury Trial Waiver These Terms are governed
        by the laws of Europe (excluding any conflict of law principles). If any
        dispute arises, it will be resolved through binding arbitration, and you
        agree to exclusive jurisdiction in courts located in the jurisdiction
        agreed upon by both parties. The Federal Arbitration Act governs the
        arbitration process.
      </motion.p>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        Arbitration Agreement General. READ THIS SECTION CAREFULLY—IT REQUIRES
        ARBITRATION OF DISPUTES AND LIMITS YOUR ABILITY TO SEEK RELIEF FROM US.
        This Arbitration Agreement applies to any dispute between you and
        CapitalKV arising from: (i) these Terms; (ii) access to or use of the
        Service; (iii) transactions through the Service; or (iv) any other
        aspect of your relationship with CapitalKV as a User (collectively,
        “Claims”). Opting Out of Arbitration. You can opt out of this
        Arbitration Agreement within thirty (14) days of accepting these Terms
        by emailing us at capitalkv1@gmail.com with your legal name and stating
        your intent to opt out. Opting out does not affect other parts of these
        Terms.
      </motion.p>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        Dispute-Resolution Process: If you have a Claim, first contact us at
        capitalkv1@gmail.com for informal resolution. If unresolved after 60
        days, Claims will be resolved through binding arbitration under the
        Expedited Arbitration Procedures of AAA, with a single arbitrator.
        Arbitration will be conducted by videoconference unless the arbitrator
        determines otherwise. If using the Service for commercial purposes, each
        party is responsible for AAA fees and arbitrator costs. If using for
        non-commercial purposes, you may apply for a fee waiver. You may still
        sue in a small claims court if eligible, but must first engage in
        informal resolution.
      </motion.p>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        Equitable Relief: Nothing prevents us from seeking injunctive or
        equitable relief in court to protect our intellectual property or
        confidential information, nor prevents you from pursuing claims in small
        claims court.
      </motion.p>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        Severability:If any part of this Arbitration Agreement is found invalid,
        the remainder will still apply. If the Class Action/Jury Trial Waiver is
        unenforceable, only that part will be severed.
      </motion.p>

      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        Class Action/Jury Trial Waiver. By agreeing to these Terms, you waive
        the right to a jury trial and agree not to participate in class actions
        or collective proceedings. This applies to both individual and
        commercial use, and class arbitration is also waived. The arbitrator can
        only award relief to individual claimants, and any relief awarded will
        not affect other Users.
      </motion.p>

      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        <motion.h3
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          General Provisions
        </motion.h3>
        Assignment. You may not transfer or assign these Terms or any rights
        granted hereunder without our prior written consent. We may assign these
        Terms without restriction. Any attempted transfer or assignment in
        violation of this will be void. Notification Procedures and Changes to
        These Terms. We may notify you about updates or other matters via email,
        written notice, or on the Service, as we determine. We may change these
        Terms at our discretion, and will notify you of material changes. By
        continuing to use the Service after changes are made, you accept the new
        Terms. If you do not agree with the new Terms, you must stop using the
        Service. Entire Agreement; Severability. These Terms, along with any
        amendments, constitute the entire agreement between us regarding the
        Service. If any provision is found to be invalid, the remaining
        provisions will remain in effect. No Waiver. Failure to enforce any term
        does not waive that term or any other provision under these Terms.
      </motion.p>

      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        <motion.h3
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          Contact
        </motion.h3>
        If you have any questions, contact us at capitalkv1@gmail.com.
      </motion.p>

      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        Special Terms for Residents of the European Economic Area (EEA), United
        Kingdom (UK), and Netherlands ("EU-Specific Terms") Definition of
        Consumer. "EU-Consumers" are natural persons with habitual residence in
        the EEA, UK, or Netherlands,Turkiye who enter into these Terms for non-business
        purposes. Governing Law. These Terms are governed by the laws of the
        European Union, and the laws of your country of residence as applicable.
        <motion.h3
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          Venue of Jurisdiction
        </motion.h3>
        <motion.p
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          If you are an EU-Consumer, the arbitration agreement does not apply.
          You may bring disputes in your local court. We may bring disputes to
          the court in your country of residence if within the EEA, UK, Turkiye or
          Netherlands.
        </motion.p>
        <motion.p
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          Online Dispute Resolution. If you are an EU-Consumer and have a
          dispute with CapitalKV, you can use the European Commission’s Online
          Dispute Resolution (ODR) platform at:
          http://ec.europa.eu/consumers/odr/. We are not obligated to
          participate in online dispute resolution.
        </motion.p>
      </motion.p>

      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        <motion.h3
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          Copyright Complaints
        </motion.h3>
        If you believe that your copyrighted work has been copied in a way that
        constitutes copyright infringement and is accessible via the Service,
        please notify our copyright by following these instructions. For your
        complaint to be valid, you must provide all of the following information
        in writing: an electronic or physical signature of a person authorized
        to act on behalf of the copyright owner; identification of the
        copyrighted work that you claim has been infringed; identification of
        the material that is claimed to be infringing and its location on the
        Service; information reasonably sufficient to permit us to contact you,
        such as your address, telephone number, and email address; a statement
        that you have a good faith belief that use of the material in the manner
        complained of is not authorized by the copyright owner, its agent, or
        law; and a statement, made under penalty of perjury, that the above
        information is accurate, and that you are the copyright owner or are
        authorized to act on behalf of the owner. The above information must be
        submitted to our Copyright Agent, using the following contact
        information: 
      </motion.p>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        <motion.h3
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          Right of Withdrawal
        </motion.h3>
        As an EU consumer residing in the EEA, you have the right to withdraw
        from this contract within 14 days of accepting it, without providing any
        reason. The withdrawal period starts from the conclusion of the
        contract. To exercise your right of withdrawal, you must inform us,
        CapitalKV Ltd, at capitalkv1@gmail.com, using an unequivocal statement
        (e.g., a letter or email). You can use the Model Withdrawal Form below,
        though it’s not required. To meet the deadline, send your withdrawal
        notice before the 14-day period expires.
      </motion.p>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        <motion.h3
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          Right of Withdrawal.
        </motion.h3>
        As an EU consumer residing in the EEA, you have the right to withdraw
        from this contract within 14 days of accepting it, without providing any
        reason. The withdrawal period starts from the conclusion of the
        contract. To exercise your right of withdrawal, you must inform us,
        CapitalKV Ltd, at capitalkv1@gmail.com, using an unequivocal statement
        (e.g., a letter or email). You can use the Model Withdrawal Form below,
        though it’s not required. To meet the deadline, send your withdrawal
        notice before the 14-day period expires.
      </motion.p>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        <motion.h3
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          Consequences of Withdrawal.
        </motion.h3>
        If you withdraw from this contract and have signed up for a paid
        subscription, we will refund all payments made to us within 14 days. The
        refund will be processed using the same payment method unless agreed
        otherwise. If you requested services during the withdrawal period, you
        will owe us a proportional payment based on the services already
        provided.
      </motion.p>
      <motion.h3
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        Exceptions to Withdrawal Right
      </motion.h3>

      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        The right of withdrawal does not apply to contracts: For events tailored
        to your personal needs With entrepreneurs Not concluded exclusively
        using distance communication (e.g., email, post)
      </motion.p>

      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        Model Withdrawal Form: To CapitalKV Ltd, Amsterdam Netherlands, [email]:
        capitalkv1@gmail.com I/we hereby revoke the contract for the following
        goods/services: Ordered on [date]/received on [date] Name of consumer(s)
        Address of consumer(s) Signature of consumer(s) (if paper communication)
        Date "This form cannot be filled in if there is an fix contract ddecided
        beyond one year, that requires discussion with our team!"
      </motion.p>

      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        Limitation of Liability: The limitation of liability does not apply to
        EU consumers. Our liability for negligence is limited to foreseeable
        damages from a material contractual breach. We are not liable for minor
        breaches or non-material obligations, but this does not affect statutory
        obligations or liability for death/personal injury.
      </motion.p>

      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        Warranty and Compatibility: As a digital product, the services are
        subject to a statutory warranty for defects. We will provide necessary
        updates to ensure the services remain conforming during the contract
        term.
      </motion.p>

      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        No Release; Indemnity
        <motion.p
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          The release and indemnity provisions do not apply to EU consumers.
        </motion.p>
      </motion.p>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
        variants={itemVariants}
      >
        Changes to Terms: We may make changes to these Terms for EU consumers
        due to legal changes or to improve functionality. We will notify you at
        least 14 days in advance (or 30 days for significant changes). If you
        disagree, you may discontinue use of the services.
      </motion.p>
    </motion.div>
  );
};

export default Consumer;
