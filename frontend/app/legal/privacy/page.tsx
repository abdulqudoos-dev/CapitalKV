"use client";

import React from "react";
import { motion } from "framer-motion";

const Privacy = () => {
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
        Privacy policy
      </motion.h2>
      <motion.p
        className="text-center mx-auto max-w-[700px] text-gray-200"
        variants={itemVariants}
      >
        <motion.div
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          Who We Are
        </motion.div>
        <motion.div
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          Our website address is:{" "}
          <a
            href="https://capitalkv.com"
            className="text-blue-600 hover:underline"
          >
            https://capitalkv.com
          </a>
        </motion.div>
        <motion.div
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            Last Updated: June 30, 2025
          </motion.div>
          At CapitalKV LTD ("CapitalKV", "we", "us", or "our"), we value your privacy and are committed to handling your personal information in a fair, accountable, and transparent manner.

This Privacy Policy explains how we collect, use, and protect your personal data when you access or use our websites, products, applications, and other CapitalKV services (collectively, the "Service"). It also outlines your privacy rights and how the law protects you.

This policy does not apply to content or data we process on behalf of our enterprise or business customers when using our services or tools — such processing is governed by the applicable customer agreements and terms.

We use your data to operate, maintain, and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this Privacy Policy.

Unless otherwise defined here, the terms used in this Privacy Policy have the same meanings as in our Terms and Conditions.

Additionally, we may collect the visitor’s IP address and browser user agent string to assist with spam detection and website security.
        </motion.div>
        <motion.div
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        ></motion.div>
        <motion.div
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          About CapitalKV and Tools/Services
        </motion.div>
        CapitalKV is a NL-based company working on building Services and Technology tools to develop holographic future, CapitalKV is a separate company from Our
        other Sector Company.
        <motion.div
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          Collection of your personal information
        </motion.div>
        Personal information you provide
        <motion.div
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          When you use our Service or communicate with us, you provide certain
          personal information. This may include:
        </motion.div>
        Account Data: When an CapitalKV account is required to access the
        Service, we will collect your name, contact information, account
        credentials, and, where payment is required, Payment Data (described
        below). If you register or log into our Service using another service,
        that service will send your information to us. Payment Data: Where
        payment is required to access the Service, we may collect payment
        information (such as payment card information) directly from you and
        details regarding your transactions with us. Contact and Communications
        Data: If you communicate with us, we will collect contact information
        such as your name, email address, any other contact details you
        voluntarily choose to provide us, and any additional information you
        provide in your communications with us. Fore example When visitors leave
        comments or contact form on the site we collect the data shown in the
        comments form, and also the visitor’s IP address and browser user agent
        string to help spam detection. An anonymized string created from your
        email address (also called a hash) may be provided to the Gravatar
        service to see if you are using it. The Gravatar service privacy policy
        is available here:{" "}
        <a
          href="https://capitalkv.com"
          className="text-blue-600 hover:underline"
        >
          https://capitalkv.com
        </a>
        . After approval of your comment, your profile picture is visible to the
        public in the context of your comment.
        <motion.div
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            Media
          </motion.div>
          If you upload images to the website, you should avoid uploading images
          with embedded location data (EXIF GPS) included. Visitors to the
          website can download and extract any location data from images on the
          website.
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            User Content: When you use our Service, we collect personal
            information that is included in user prompts or inputs to the
            Service (like the text, photos and images, file uploads, and other
            materials you submit to our platform for marketing) ("Input") and
            outputs of the Service (like the text responses our platform for
            marketing generates based on your Input) ("Output") (together, "User
            Content"). If you include personal information in Inputs you provide
            to the Service, this information may be reproduced in the Output.
            Please do not share any personal information (including any
            sensitive information) in your Input to the Service. (this could
            include Feedback Data: Where applicable, we will collect your
            Feedback (as defined in our Terms of Service enterprise or
            Consumer). )
          </motion.div>
        </motion.div>
        <motion.div
          className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
          variants={itemVariants}
        >
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            Embedded Content from Other Websites
          </motion.div>
          Articles on this site may include embedded content (e.g. videos,
          images, articles, etc.). Embedded content from other websites behaves
          in the exact same way as if the visitor has visited the other website.
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            These websites may collect data about you, use cookies, embed
            additional third-party tracking, and monitor your interaction with
            that embedded content, including tracking your interaction with the
            embedded content if you have an account and are logged in to that
            website.
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            Who We Share Your Data With
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            If you request a password reset, your IP address will be included in
            the reset email.
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            <motion.div
              className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
              variants={itemVariants}
            >
              How Long We Retain Your Data
            </motion.div>
            If you leave a comment, the comment and its metadata are retained
            indefinitely. This is so we can recognize and approve any follow-up
            data automatically instead of holding them in a moderation queue.
            For users that register on our website (if any), we also store the
            personal information they provide in their user profile. All users
            can see, edit, or delete their personal information at any time
            (except they cannot change their username). Website administrators
            can also see and edit that information.
          </motion.div>
          If you are located in the European Economic Area ("EEA"), United
          Kingdom ("UK") or Switzerland (collectively, "Europe") the following
          disclosures apply: Data controller
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            Capitalkv LTD. is the controller of your personal information as
            described in this Privacy Policy, unless otherwise specified.
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            Legal basis
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            When we process your personal information, we will only do so in the
            following situations:
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            Contract: Where we need it to perform a contract with you, including
            where necessary to provide you our Service under our consumer Terms
            of Service (such as processing user data for platfroms, other
            Infrastructure that mainly for marketing or improvement of services).
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            Legitimate interests: Where it is necessary for our legitimate
            interests (or those of a third party) and your interests and rights
            do not override our interests. Our legitimate interests include:
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            protecting our Service from abuse, fraud, or other misuses;
            maintaining and improving our Service, including to enhance tools and
            improve our Service; research and development,
            including developing new products and features; ensuring the safety
            and security of our Service; detecting, preventing, and enforcing
            violations of our terms including misuse of services, fraud, abuse,
            and other trust and safety protocols; processing job applications
            and managing, improving, and safeguarding our recruiting and hiring
            processes; and protecting our rights and the rights of others.
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            Legal obligation: From time to time, we may also need to process
            personal information to comply with a legal obligation, if it is
            necessary to protect the vital interests of you or others, or if it
            is necessary for a task carried out in the public interest. The
            following list provides more details on our purposes for processing
            your personal information and the related legal bases. The legal
            basis under which your personal information is processed will depend
            on the data concerned and the specific context in which we use it.
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            To process payments for our Service
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            To provide our Service (including to provide Output in response to
            Input for our chats,this could include infrastructure and marketing)
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            To provide support and assistance in relation to our Service
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            To develop and improve our Service
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            To enhance and improve our services
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            To ensure the security and integrity of our Service
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            To comply with our legal obligations
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            To process job applications
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            For our business or commercial purposes
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            Automated decision-making
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            CapitalKV does not make decisions or take actions against
            individuals in ways that could have a legal or significant impact on
            them.
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            In addition,Capitalkv does not
            process data for the purposes of inferring or deriving any
            sensitive or special category data about individuals and we do not
            actively seek out data sources that include sensitive or special
            category data.
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            International transfers
            <motion.div
              className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
              variants={itemVariants}
            >
              By using our Service, you understand and acknowledge that your
              personal information will be used, stored and/or accessed by us in
              the Europe where mostly netherlands or Turkey and disclosed to our service providers in
              other jurisdictions. We maintain primary data centers in the
              turkiye or netherlands. We take steps designed to ensure that the personal
              information we collect under this Privacy Policy is processed as
              described in this Policy and according to applicable law. When we
              provide any personal information about you to any non-UK and
              non-EEA third-party, we will take appropriate measures to ensure
              that the recipient protects your personal information adequately
              in accordance with this Privacy Policy. These measures may include
              the following: Ensuring that there is an adequacy decision by the
              UK Government in the case of transfers out of the UK, or by the
              European Commission in the case of transfers out of the EEA, which
              means that the recipient country is deemed to provide adequate
              protection for such personal information; or Having in place
              standard contractual clauses with the recipient which have been
              approved by the UK Government for transfers out of the UK or by
              European Commission for transfers outside the EEA.
            </motion.div>
            Further details on the steps we take to protect your personal
            information, in these cases, are available up on request by
            contacting us by email at Capitalkv1@gmail.com at any time.
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            Additional information for U.S. residents
          </motion.div>
          Collection of your personal information
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            You can find a list of the categories of personal information that
            we collect in Section 2 “Collection of your personal information”
            above. The list below provides additional details regarding the
            categories of personal information that we collect and have
            collected over the past 12 months. Please refer to the Sections
            above regarding how we collect your personal information, how we use
            your personal information, and how we disclose your personal
            information for further detail.
            <motion.div
              className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
              variants={itemVariants}
            >
              Identifiers, including Account Data, we receive when you log into
              our platform and Contact and Communications Data you provide to us
            </motion.div>
            <motion.div
              className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
              variants={itemVariants}
            >
              Payment Data, to facilitate your transactions with us
            </motion.div>
            <motion.div
              className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
              variants={itemVariants}
            >
              Commercial information, such as records of your transaction
              history
            </motion.div>
            <motion.div
              className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
              variants={itemVariants}
            >
              Internet or other electronic network activity information,
              including your Technical Data
            </motion.div>
            <motion.div
              className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
              variants={itemVariants}
            >
              Other identifying information that you voluntarily choose to
              provide, including in the form of User Content, Feedback Data,
              Social Media Information
            </motion.div>
            <motion.div
              className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
              variants={itemVariants}
            >
              Geolocation data, including country or city information based on
              the IP address, or if you manually provide location information
            </motion.div>
            <motion.div
              className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
              variants={itemVariants}
            >
              Professional or employment-related information, to process your
              job application
            </motion.div>
            <motion.div
              className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
              variants={itemVariants}
            >
              Service providers, analytics partners, and parties you authorize,
              access, or authenticate,
            </motion.div>
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            Security of your personal information
            <motion.div
              className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
              variants={itemVariants}
            >
              CapitalKV takes reasonable precautions to safeguard your personal
              information, including through use of appropriate organizational
              and technical measures to help safeguard your personal information
              against accidental or unlawful destruction, loss, misuse, and
              unauthorized access, disclosure, alteration, and destruction.
            </motion.div>
            However, no security measure or modality of data transmission over
            the internet is 100% secure. Although we strive to use commercially
            acceptable means to protect your personal information, we cannot
            guarantee absolute security. As such, you acknowledge and accept
            that we cannot guarantee the security of your personal information
            and that any such transmission of your personal information to us is
            at your own risk. Once we have received your personal information,
            we will use strict procedures and security features to prevent
            unauthorized access to it. You are solely responsible for protecting
            your password, limiting access to your devices, and signing out of
            websites and online accounts after your sessions. . Retention of
            your personal information We retain your personal information where
            we have an ongoing legitimate business need to do so (e.g., to
            provide you with a service you have requested or to comply with
            applicable legal requirements). In certain circumstances, we will
            need to keep your information for legal reasons after our
            contractual relationship has ended. The specific retention periods
            depend on the nature of the information and why it is collected and
            processed and the nature of the legal requirement. For example, we
            may retain your personal information: • when we have a legal
            obligation to do so (e.g., if we receive a court order, we would
            retain your information for longer than our usual retention
            periods); • to deal with and resolve requests and complaints (e.g.,
            if there is an ongoing complaint about you); • to protect the
            safety, security, and integrity of our business and the Service, as
            well as to protect our rights and property and those of others
            (e.g., if we detect misuse of our Service or otherwise detect
            unusual activity on your account or in your interactions with us);
            and • for litigation or regulatory matters (e.g., we would retain
            your information if there was an ongoing legal claim and the
            information was relevant to the claim).
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            Links to other websites and social media features Our Service may
            contain hyperlinks to websites or plugins of social media platforms
            that are not operated by us. These hyperlinks and plugins are
            provided for your reference and convenience only. This Privacy
            Policy only applies to the personal information that we collect or
            which we receive as detailed in this Privacy Policy, and we cannot
            be responsible for personal information about you that is collected
            and stored by third parties. Third party websites have their own
            terms and conditions and privacy policies, and you should read these
            carefully before you submit any personal information to these
            websites. We do not endorse or otherwise accept any responsibility
            or liability for the content of such third-party websites or
            third-party terms and conditions or policies.
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            <motion.div
              className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
              variants={itemVariants}
            >
              Children's privacy
            </motion.div>
            As noted in the Terms of Service, our Service is not directed at
            children or minors under the age of 18 and we do not knowingly
            collect any personal information from them. While we have taken
            measures to limit undesirable data and outputs, CapitalKV Platform could
            produce output that is not appropriate for all ages. If you are a
            child under the age of 18, please do not attempt to register for or
            otherwise use our Service. If we learn that we have inadvertently
            obtained personal information about a child under the age of 18 via
            our Service, or from any other source, then we will delete that
            information as soon as possible. Please contact us at
            capitalkv1@gmail.com if you are aware that we may have inadvertently
            collected personal information from a child under the age of 18.
          </motion.div>
          <motion.div
            className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
            variants={itemVariants}
          >
            What Rights You Have Over Your Data
            <motion.div
              className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
              variants={itemVariants}
            >
              If you have an account on this site, or have left Data, you can
              request to receive an exported file of the personal data we hold
              about you, including any data you have provided to us. You can
              also request that we erase any personal data we hold about you.
              This does not include any data we are obliged to keep for
              administrative, legal, or security purposes.
              <motion.div
                className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
                variants={itemVariants}
              >
                We may update our Privacy Policy from time to time. If we make
                any changes, we will post an amended version and change the
                "Last Updated" date above. Where appropriate, we may provide you
                with notice prior to the update taking effect, such as by
                posting a conspicuous notice on our website or by contacting you
                using the email address you provided. Please review this Privacy
                Policy periodically.
              </motion.div>
            </motion.div>
            <motion.div
              className="text-center mx-auto max-w-[700px] text-gray-200 mb-4"
              variants={itemVariants}
            >
              If you use the Service after any changes to the Privacy Policy
              have been posted, that means you agree to all the changes.
            </motion.div>
          </motion.div>
          <a
            href="capitalkv1@gmail.com"
            className="text-blue-600 hover:underline"
          >
            If you have any questions about this Privacy Policy, please contact us: capitalkv1@gmail.com or by mail.
          </a>
        </motion.div>
      </motion.p>
    </motion.div>
  );
};

export default Privacy;
