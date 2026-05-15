import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import { 
  CheckCircle2, 
  AlertCircle,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Bike,
  ClipboardList
} from "lucide-react";

const DriverTerms = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isFromRegister = searchParams.get("from") === "register";

  const handleAccept = () => {
    localStorage.setItem("ko_terms_accepted", "true");
    navigate("/delivery/register");
  };

  const handleDecline = () => {
    navigate("/delivery");
  };

  const sections = [
    {
      title: "1. Eligibility Requirements",
      content: `To become a KO Rider, you must meet ALL of the following requirements:

- Be at least 18 years of age
- Hold a valid Ghana driver's license
- Own or have access to a roadworthy vehicle (motorcycle, car, or bicycle)
- Hold valid third-party vehicle insurance. Comprehensive insurance is strongly recommended. Proof of insurance must be uploaded during registration and renewed annually
- Have an active Ghana mobile money account
- Own a smartphone capable of running the KO Rider app
- Have no outstanding criminal record related to traffic violations or theft
- Be a resident of Greater Accra Region

Kokrobite Oasis reserves the right to verify any eligibility requirement and reject applications that do not meet these standards.`
    },
    {
      title: "2. Driver Obligations",
      content: `As a KO Rider driver, you agree to:

- Deliver orders promptly and professionally
- Handle food items with care and hygiene
- Dress in a manner appropriate for customer-facing work. KO-branded attire is optional but encouraged
- Communicate professionally with all customers at all times
- Keep your vehicle in roadworthy condition
- Update your availability status accurately in the KO Rider app
- Report any accidents or incidents immediately to Kokrobite Oasis management
- Comply with all Ghana road traffic laws
- Not consume alcohol or substances while on duty
- Comply with all account usage rules set out in Section 5

Regarding order cancellations, you are free to accept or decline any delivery request without penalty. However, multiple consecutive cancellations of accepted orders may result in account review as described in Section 7.`
    },
    {
      title: "3. Earnings & Payments",
      content: `Payment terms for KO Rider drivers:

- Base delivery fee: GHC 20.00 per completed delivery. Kokrobite Oasis may adjust the base fee, introduce surge pricing, or add incentive bonuses with at least seven (7) days' prior written notice. The current fee structure is published in the app and may vary by distance, time of day, or promotional period

- Payments are processed every Monday for the previous week's deliveries

- Payment is sent via Ghana Mobile Money to your registered MoMo number

- Incomplete, rejected, or cancelled deliveries do not qualify for payment

- Drivers are solely responsible for their own tax obligations to the Ghana Revenue Authority

- No payment is made for undelivered or fraudulently confirmed orders

- Kokrobite Oasis' total aggregate liability to any rider under or in connection with these Terms shall not exceed the total delivery fees paid to that rider in the 30 days preceding the event giving rise to the claim`
    },
    {
      title: "4. Order Management",
      content: `Regarding order handling:

- Accept only orders you are able to complete within a reasonable timeframe
- Do not cancel accepted orders except in genuine emergencies
- Always confirm pickup at the restaurant before leaving
- Always confirm delivery with the customer upon arrival
- Do not open, tamper with, or consume any part of a customer's order
- Report damaged or incorrect orders immediately to management before delivery
- Multiple cancellations of accepted orders may result in account suspension as outlined in Section 7`
    },
    {
      title: "5. Account & App Usage",
      content: `Your KO Rider account is personal and non-transferable. You must not:
- Share your login credentials with any other person
- Allow another person to use your account
- Operate multiple KO Rider accounts
- Use the app for any purpose other than legitimate delivery activities

Any activity carried out under your account is your sole responsibility.

GPS tracking is active during all deliveries solely for customer safety, route optimization, and dispute resolution.

Kokrobite Oasis may suspend or terminate accounts that violate these usage rules without prior notice.

Rider Confidentiality — Customer Data:
You acknowledge that during deliveries you will have access to customer personal data including names, addresses, and phone numbers. You agree to:
- Not retain, copy, record, or share customer data beyond what is necessary to complete the delivery
- Not contact customers outside the KO Rider app for non-delivery purposes
- Not use customer data for personal, commercial, or criminal purposes

Violation of this clause will result in immediate account termination and may result in criminal prosecution under Ghana's Data Protection Act, 2012 (Act 843)`
    },
    {
      title: "6. Conduct & Professionalism",
      content: `Professional conduct requirements:

- Treat all customers with respect and courtesy at all times
- No harassment, discrimination, or inappropriate behavior toward customers, restaurant staff, or KO management
- No political, religious, or offensive conversations with customers
- Represent the Kokrobite Oasis brand professionally at all times
- Complaints from customers will be investigated and may affect your account

Performance Rating Standards:
- A rating below 3.5 stars will trigger a performance review and mandatory retraining session
- A rating below 3.0 stars for two consecutive weeks will result in account suspension pending investigation
- A rating below 2.5 stars at any time may result in immediate account termination
- Kokrobite Oasis will notify the rider in writing before any adverse action is taken based on ratings`
    },
    {
      title: "7. Termination",
      content: `Kokrobite Oasis reserves the right to suspend or terminate a driver account for:

- Violation of any provision of these Terms
- Consistent poor customer ratings (see Section 6 for thresholds)
- Fraudulent activity or false delivery confirmations
- Criminal conduct of any kind
- Repeated cancellation of accepted orders
- Misuse of the KO Rider application
- Misuse of customer personal data
- Any conduct that damages the Kokrobite Oasis brand or reputation

Drivers may terminate their participation at any time by contacting Kokrobite Oasis management at hello@kokrobiteoasis.com. Upon termination, all outstanding earnings for completed deliveries will be paid on the next scheduled Monday payout date.`
    },
    {
      title: "8. Independent Contractor Status & Liability",
      content: `Independent Contractor Status:
KO Rider drivers are independent contractors, not employees of Kokrobite Oasis. This means:

- You are free to set your own working hours and work for other platforms or clients simultaneously
- You use your own equipment and vehicles and bear all operating costs including fuel, maintenance, and insurance
- Kokrobite Oasis does not control how you perform deliveries, only the end result — timely, safe, and professional delivery to the customer
- You are not entitled to employee benefits including SSNIT contributions, paid leave, or severance pay

Liability:
- Kokrobite Oasis is not liable for accidents, injuries, or damages that occur during or in connection with deliveries
- Drivers are responsible for maintaining their own vehicle insurance
- Kokrobite Oasis is not responsible for vehicle damage, theft, or loss
- Kokrobite Oasis' total aggregate liability to any rider shall not exceed the total delivery fees paid to that rider in the 30 days preceding the event giving rise to the claim. This limitation applies regardless of the form of action, whether in contract, tort, or otherwise`
    },
    {
      title: "9. Data Privacy",
      content: `Kokrobite Oasis processes rider personal data — including GPS location, mobile money details, vehicle information, and identity documents — in accordance with Ghana's Data Protection Act, 2012 (Act 843).

How we use your data:
- GPS tracking is active during deliveries solely for safety, route optimization, and dispute resolution
- Your personal data is stored securely and shared only with necessary parties such as restaurants and customers for delivery purposes
- We do not sell your personal data to third parties

Your rights:
You have the right to access, correct, or request deletion of your personal data at any time by contacting:
📧 hello@kokrobiteoasis.com

By registering as a KO Rider, you consent to the collection and processing of your personal data as described above.`
    },
    {
      title: "10. Amendments to These Terms",
      content: `Kokrobite Oasis may amend these Terms at any time by providing at least fourteen (14) days' written notice via the KO Rider app, email, or SMS.

Material changes that affect fees, liability, or termination rights will be communicated with at least thirty (30) days' prior notice.

Continued use of the KO Rider app after the effective date of any amendment constitutes your acceptance of the updated Terms.

If you do not accept the changes, you must terminate your account before the effective date by contacting us at hello@kokrobiteoasis.com.`
    },
    {
      title: "11. Force Majeure",
      content: `Neither party shall be liable for failure to perform their obligations under these Terms if such failure results from events beyond their reasonable control, including but not limited to:

- Natural disasters or severe weather events (including Accra flooding)
- Government actions, regulations, or lockdowns
- Internet or telecommunications failures
- Power outages
- Epidemics or public health emergencies
- Civil unrest or national emergencies
- Failures of third-party services including mobile money providers (MTN MoMo, Vodafone Cash, AirtelTigo)

The affected party must notify the other as soon as reasonably practicable and use all reasonable efforts to resume normal performance as quickly as possible.`
    },
    {
      title: "12. Dispute Resolution",
      content: `Any dispute arising from or in connection with these Terms shall be resolved as follows:

Step 1 — Internal Resolution:
The rider must first contact Kokrobite Oasis management at hello@kokrobiteoasis.com to attempt informal resolution within fourteen (14) days of the dispute arising.

Step 2 — Mediation:
If informal resolution fails, the dispute shall be submitted to mediation through the Ghana Mediation Centre or a mutually agreed mediator. Mediation must be completed within thirty (30) days of referral unless both parties agree to an extension.

Step 3 — Legal Proceedings:
If mediation fails, either party may pursue the matter in the courts of Ghana, which shall have exclusive jurisdiction over all disputes arising from these Terms.

These Terms shall be governed by and construed in accordance with the laws of the Republic of Ghana.`
    },
    {
      title: "13. Contact & Support",
      content: `For questions, support, or to report a concern regarding these Terms:

📧 Email: hello@kokrobiteoasis.com
📍 Location: East Legon, Accra, Ghana

Management hours:
Tuesday – Sunday: 11:00 AM – 8:00 PM
Monday: Closed

For urgent delivery issues during active shifts, use the in-app support chat or WhatsApp support details provided upon account approval.

These Terms were last updated in May 2026 and supersede all previous versions of the KO Rider Terms and Conditions.`
    }
  ];

  return (
    <div className="min-h-screen bg-[#0C0A09] text-white selection:bg-[#F97316]/30 pb-32">
      {/* TOP NAV */}
      <nav className="flex justify-between items-center p-6 sticky top-0 bg-[#0C0A09]/80 backdrop-blur-lg z-50">
        <button 
          onClick={() => navigate(-1)}
          className="text-sm text-white/40 hover:text-[#F97316] transition-colors flex items-center gap-2"
        >
          <HiOutlineArrowLeft /> Back
        </button>
        <div className="text-2xl font-display italic font-bold text-white absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <Bike size={24} className="text-[#F97316]" /> KO Rider
        </div>
        <div className="w-10" /> {/* Spacer for symmetry */}
      </nav>

      {/* HEADER CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-6 mt-6 p-8 rounded-2xl bg-gradient-to-br from-[#1C0A00] to-[#F97316] text-center shadow-xl shadow-[#F97316]/10 flex flex-col items-center"
      >
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
          <ClipboardList size={40} className="text-white" />
        </div>
        <h1 className="font-display text-[32px] text-white leading-tight">KO Rider Terms & Conditions</h1>
        <p className="text-white/60 text-sm mt-2">Kokrobite Oasis Rider Program</p>
        <p className="text-white/40 text-xs mt-1">Effective: May 2026 — Version 2.0</p>
      </motion.div>

      {/* IMPORTANT NOTICE BANNER */}
      <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-xl p-4 mx-6 my-6 flex gap-3">
        <AlertCircle className="text-[#F59E0B] shrink-0" size={20} />
        <p className="text-[#F59E0B] text-sm leading-relaxed">
          Please read these terms carefully before registering as a KO Rider driver. By registering and using the KO Rider app, you agree to be legally bound by these terms and conditions. These Terms are governed by the laws of the Republic of Ghana.
        </p>
      </div>

      {/* TERMS CONTENT SECTIONS */}
      <div className="space-y-4 px-4">
        {sections.map((section, idx) => (
          <motion.section 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6"
          >
            <h2 className="font-display text-[22px] text-white mb-4 border-b border-[#F97316]/15 pb-3">
              {section.title}
            </h2>
            <div className="text-white/60 text-sm leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          </motion.section>
        ))}
      </div>

      {/* BOTTOM ACCEPT SECTION */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0C0A09]/97 backdrop-blur-[20px] border-t border-[#F97316]/15 p-4 px-6 z-50">
        <div className="max-w-[500px] mx-auto">
          {isFromRegister ? (
            <>
              <button 
                onClick={handleAccept}
                className="w-full bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-bold uppercase tracking-wider text-sm py-4 rounded-xl shadow-lg shadow-[#F97316]/20 flex items-center justify-center gap-2"
              >
                I Accept These Terms <CheckCircle2 size={18} />
              </button>
              <button 
                onClick={handleDecline}
                className="w-full text-white/30 text-sm mt-4 hover:text-white transition-colors"
              >
                Decline
              </button>
            </>
          ) : (
            <button 
              onClick={() => navigate(-1)}
              className="w-full bg-[#F97316] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#F97316]/20 flex items-center justify-center gap-2"
            >
              Back to KO Rider <HiOutlineArrowLeft className="rotate-180" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverTerms;
