import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Server, 
  Wifi, 
  Users, 
  FileSearch, 
  Activity, 
  Code, 
  BookOpen, 
  CheckCircle,
  AlertTriangle,
  BrainCircuit,
  Menu,
  X,
  Zap,
  ExternalLink,
  List
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type DomainId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type DashboardTab = DomainId | 'overview';

interface FocusArea {
  title: string;
  summary: string;
}

interface Domain {
  id: DomainId;
  title: string;
  weight: string;
  icon: LucideIcon;
  description: string;
  key_concepts: string[];
  notes: string;
  focus_areas: FocusArea[];
}

const domains: Domain[] = [
  {
    id: 1,
    title: "Security and Risk Management",
    weight: "16%",
    icon: Shield,
    description: "The governance, compliance, and ethical backbone of information security.",
    key_concepts: [
      "CIA Triad & Authenticity/Non-repudiation",
      "Security Governance (Alignment with Business Strategy)",
      "Compliance, Legal & Regulatory (GDPR, HIPAA, AI Regulations)",
      "Professional Ethics (ISC² Code of Ethics)",
      "Risk Management (NIST RMF, Supply Chain Risk)",
      "Business Continuity Planning (BCP) & BIA",
      "Personnel Security (Candidate Screening, Exit Procedures)"
    ],
    notes: "Remains the highest weighted domain for 2026. Critical focus on 'Thinking Like a Manager'—human safety is #1. New emphasis on Supply Chain Risk Management (SCRM) and external dependencies.",
    focus_areas: [
      { title: "CIA Triad & Authenticity", summary: "Balance Confidentiality, Integrity, and Availability. Authenticity ensures data is genuine and Non-repudiation prevents denial of actions." },
      { title: "Security Governance Principles", summary: "Align security strategy with business goals. Understand Due Care (prudent person rule) vs. Due Diligence (research/management)." },
      { title: "Legal & Regulatory Issues", summary: "Understand GDPR (privacy), HIPAA (health), and transborder data flows. Know the difference between Civil, Criminal, and Administrative law." },
      { title: "ISC² Code of Ethics", summary: "Four canons: Protect society, Act honorably, Provide diligent service, and Advance the profession. Safety of society is paramount." },
      { title: "Risk Management Frameworks", summary: "Apply NIST RMF steps: Categorize, Select, Implement, Assess, Authorize, Monitor. Understand Quantitative (SLE/ALE) vs. Qualitative risk analysis." },
      { title: "Threat Modeling (STRIDE)", summary: "Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege. Proactive identification of threats." },
      { title: "Supply Chain Risk (SCRM)", summary: "Assess third-party vendor risks. Manage hardware/software supply chains to prevent upstream compromises (e.g., SolarWinds)." },
      { title: "Business Continuity (BCP)", summary: "Focus on keeping business running. BIA (Business Impact Analysis) identifies critical functions and MTD (Max Tolerable Downtime)." },
      { title: "Personnel Security", summary: "Candidate screening, background checks, and employment agreements. Proper termination procedures (disable access immediately)." },
      { title: "Security Awareness", summary: "Training users to recognize threats (phishing). Measuring effectiveness of training is a key governance requirement." }
    ]
  },
  {
    id: 2,
    title: "Asset Security",
    weight: "10%",
    icon: Lock,
    description: "Protecting assets throughout their entire lifecycle.",
    key_concepts: [
      "Data Lifecycle (Create, Store, Use, Share, Archive, Destroy)",
      "Asset Inventory & Classification",
      "Data States (At Rest, In Transit, In Use)",
      "Data Remanence (Clearing, Purging, Destruction)",
      "Privacy Protection & Data Rights (Data Owner vs. Processor)",
      "Data Loss Prevention (DLP) Strategies"
    ],
    notes: "Understand the nuances between Data Owner (Accountable) vs. Data Custodian (Responsible for tech implementation). 'Data In Use' is often the hardest to protect (requires memory protection).",
    focus_areas: [
      { title: "Data Classification", summary: "Labeling data based on value/sensitivity (e.g., Top Secret vs. Public). Classification drives the selection of security controls." },
      { title: "Data Lifecycle Management", summary: "Create, Store, Use, Share, Archive, Destroy. Security controls must persist across all phases of the lifecycle." },
      { title: "Data States", summary: "Data at Rest (storage encryption), Data in Transit (TLS/VPN), and Data in Use (memory protection/enclaves)." },
      { title: "Data Remanence", summary: "Residual data left after deletion. Clearing (software wipe) vs. Purging (degaussing) vs. Destruction (physical shredding)." },
      { title: "Privacy Protection", summary: "Adhering to privacy principles (collection limitation, data quality). Roles: Data Subject, Data Controller, Data Processor." },
      { title: "Asset Inventory", summary: "You cannot protect what you don't know you have. Hardware and software asset management is foundational." },
      { title: "Data Loss Prevention (DLP)", summary: "Tools to detect and block exfiltration of sensitive data (network, endpoint, and storage based DLP)." },
      { title: "Digital Rights Management", summary: "DRM controls how data is used (e.g., preventing printing or forwarding) regardless of where the file travels." },
      { title: "Data Roles", summary: "Data Owner (Management/Liable), Data Custodian (IT/Implementer), Data Steward (Quality/Content)." },
      { title: "Cloud Storage Security", summary: "Securing object storage (S3 buckets) and volume storage. Understanding shared responsibility for data in the cloud." }
    ]
  },
  {
    id: 3,
    title: "Security Architecture and Engineering",
    weight: "13%",
    icon: Server,
    description: "Designing security into systems, including OT and IoT.",
    key_concepts: [
      "Security Models (Bell-LaPadula, Biba, Clark-Wilson)",
      "Cryptography (Quantum-resistant concepts, PKI, Key Management)",
      "System Design Principles (Zero Trust Architecture)",
      "Physical Security (CPTED, Site Design, Safety)",
      "Industrial Control Systems (ICS) & OT Security",
      "Cloud Security (SASE, CASB)"
    ],
    notes: "Updated focus on Zero Trust principles (Never Trust, Always Verify). Be familiar with Operational Technology (OT) security risks and how they differ from IT (Availability often trumps Confidentiality in OT).",
    focus_areas: [
      { title: "Security Models", summary: "Bell-LaPadula (Confidentiality - No Read Up, No Write Down). Biba (Integrity - No Read Down, No Write Up)." },
      { title: "Cryptographic Lifecycles", summary: "Generation, Distribution, Storage, Usage, and Destruction of keys. Key management is often the weakest link." },
      { title: "Symmetric vs. Asymmetric", summary: "Symmetric (AES) is fast/one key. Asymmetric (RSA/ECC) is slow/two keys (public/private) for key exchange and signing." },
      { title: "Zero Trust Architecture", summary: "Remove implicit trust. Authenticate and authorize every access request. 'Never Trust, Always Verify'." },
      { title: "Physical Security (CPTED)", summary: "Crime Prevention Through Environmental Design. Natural access control, surveillance, and territorial reinforcement." },
      { title: "ICS & OT Security", summary: "SCADA/DCS systems. Availability is often #1 priority. Purdue model levels and air-gapping strategies." },
      { title: "Cloud Security Arch", summary: "SASE (Secure Access Service Edge), CASB (Cloud Access Security Broker). Security as a Service." },
      { title: "Trusted Computing Base", summary: "The total combination of protection mechanisms (hardware, firmware, software). TPM (Trusted Platform Module) provides hardware root of trust." },
      { title: "Side-Channel Attacks", summary: "Attacks based on physical implementation (power consumption, timing, emanations) rather than the algorithm itself." },
      { title: "Quantum-Resistant Crypto", summary: "Preparing for post-quantum computing threats. Transitioning to algorithms resistant to quantum cryptanalysis." }
    ]
  },
  {
    id: 4,
    title: "Communication and Network Security",
    weight: "13%",
    icon: Wifi,
    description: "Securing the transmission of data across complex networks.",
    key_concepts: [
      "OSI & TCP/IP Models",
      "Secure Protocols (TLS 1.3, IPSec, SSH, DNSSEC)",
      "Network Segmentation (Micro-segmentation)",
      "Wireless Security (WPA3, 5G Security)",
      "Software-Defined Networking (SDN) & SD-WAN",
      "Converged Protocols (VoIP, iSCSI)"
    ],
    notes: "Heavy emphasis on 'Secure by Design' in networks. Mnemonic for OSI: 'Please Do Not Throw Sausage Pizza Away'. Understand the implications of Software-Defined Networking (separation of control and data planes).",
    focus_areas: [
      { title: "OSI & TCP/IP Models", summary: "Know layers 1-7 (Physical to Application). Understand encapsulation/decapsulation and where devices (routers/switches) operate." },
      { title: "IPsec & VPNs", summary: "AH (Auth Header) vs ESP (Encapsulating Security Payload). Tunnel mode (gateway-to-gateway) vs. Transport mode (host-to-host)." },
      { title: "Software-Defined Networking", summary: "Separation of Control Plane (management) and Data Plane (traffic). Centralized programmability of network flow." },
      { title: "Wireless Security (WPA3)", summary: "SAE (Simultaneous Authentication of Equals) replaces the 4-way handshake to prevent offline dictionary attacks." },
      { title: "Network Segmentation", summary: "VLANs, DMZ, and Air gaps. Reducing the blast radius of an attack by isolating critical assets." },
      { title: "Micro-segmentation", summary: "Granular security policies applied to individual workloads, essential for Zero Trust and East-West traffic control." },
      { title: "Converged Protocols", summary: "VoIP (SIP/RTP), iSCSI, FCoE. Carrying storage or voice traffic over standard IP networks requires specific security." },
      { title: "Secure Components", summary: "Firewalls (Next-Gen vs. Stateful), Routers (ACLs), Switches (Port Security), and Load Balancers." },
      { title: "Network Attacks", summary: "SYN Flood, DDoS, Man-in-the-Middle, Replay attacks. Understand countermeasures for each." },
      { title: "Content Delivery (CDN)", summary: "Using distributed networks to improve availability and mitigate DDoS attacks against the origin server." }
    ]
  },
  {
    id: 5,
    title: "Identity and Access Management (IAM)",
    weight: "13%",
    icon: Users,
    description: "Controlling access via modern authentication methods.",
    key_concepts: [
      "Authentication & Authorization (MFA, Passwordless)",
      "Access Control Models (RBAC, ABAC, PBAC)",
      "Identity Federation (SAML, OIDC, OAuth 2.0)",
      "Identity Governance & Administration (IGA)",
      "Service Account Management",
      "Biometrics (FRR, FAR, CER)"
    ],
    notes: "2024-2026 content includes expanded coverage of ABAC (Attribute-Based Access Control) and PBAC (Policy-Based Access Control). Watch for 'Service Account' management questions—a common attack vector.",
    focus_areas: [
      { title: "Identification vs Auth", summary: "Identification (User ID) claims identity; Authentication (Password/Token) proves it; Authorization grants access." },
      { title: "Multi-Factor Auth (MFA)", summary: "Must use 2 different types: Knowledge (Password), Possession (Token), Inherence (Biometric). Two passwords is NOT MFA." },
      { title: "Federation (SAML/OIDC)", summary: "Enabling SSO across domains. SAML (XML-based) and OIDC (JSON-based) exchange identity data between IdP and SP." },
      { title: "Single Sign-On (SSO)", summary: "Improves user experience and reduces password fatigue, but creates a single point of failure (requires strong MFA)." },
      { title: "Access Control Models", summary: "DAC (Owner decides), MAC (Labels/Clearance), RBAC (Roles), ABAC (Context/Attributes - most flexible)." },
      { title: "Identity Governance", summary: "Managing the lifecycle of identities. Periodic access reviews (certification) to prevent privilege creep." },
      { title: "Biometric Technologies", summary: "FRR (Type I - False Reject), FAR (Type II - False Accept), CER (Crossover Error Rate - metric for comparison)." },
      { title: "Privileged Access (PAM)", summary: "Vaulting admin credentials, session recording, and Just-in-Time access for high-risk accounts." },
      { title: "Provisioning Lifecycle", summary: "Automating onboarding (JML - Joiner, Mover, Leaver). Ensuring access is revoked immediately upon termination." },
      { title: "Service Account Security", summary: "Non-human accounts often have high privileges and weak oversight. Need regular rotation and monitoring." }
    ]
  },
  {
    id: 6,
    title: "Security Assessment and Testing",
    weight: "12%",
    icon: FileSearch,
    description: "Validating controls through auditing and testing.",
    key_concepts: [
      "Vulnerability Assessment vs. Penetration Testing",
      "Log Review & Synthetic Transactions",
      "Third-Party/Supply Chain Audits (SOC Reports)",
      "Security Training & Awareness Testing",
      "Automated Security Testing (DAST/SAST integration)"
    ],
    notes: "Distinguish between SOC 1 (Financial) vs. SOC 2 (Security/Privacy) and Type 1 (Point in time) vs. Type 2 (Period of time). Type 2 is always preferred for long-term assurance.",
    focus_areas: [
      { title: "Vulnerability Assessment", summary: "Identifying weaknesses without exploiting them. Broad scope, automated, regular frequency." },
      { title: "Penetration Testing", summary: "Simulating attacks to exploit vulnerabilities. Validates defenses. Rules of Engagement are critical." },
      { title: "Log Review & Analysis", summary: "analyzing audit trails to detect anomalies. Centralized via SIEM for correlation and preservation." },
      { title: "Security Audits (SOC)", summary: "SOC 1 (Financial), SOC 2 (Trust Principles - Security/Availability). Type 1 (Design), Type 2 (Operating Effectiveness)." },
      { title: "Synthetic Transactions", summary: "Scripted user behaviors to test system performance and availability monitoring." },
      { title: "Training Validation", summary: "Using social engineering (phishing) simulations to test the effectiveness of user awareness training." },
      { title: "Compliance Checking", summary: "Verifying adherence to standards (PCI-DSS, ISO, NIST) using automated config tools and manual review." },
      { title: "Disaster Recovery Test", summary: "Checklist, Walkthrough, Simulation, Parallel, and Full Interruption tests to validate BCP/DR plans." },
      { title: "Test Output Analysis", summary: "Filtering false positives and prioritizing remediation based on risk and asset criticality." },
      { title: "Interface Testing (API)", summary: "Fuzzing and validating APIs to ensure they handle malformed input without crashing or leaking data." }
    ]
  },
  {
    id: 7,
    title: "Security Operations",
    weight: "13%",
    icon: Activity,
    description: "Day-to-day defense, incident response, and recovery.",
    key_concepts: [
      "Incident Management (SOAR - Security Orchestration, Automation, Response)",
      "Digital Forensics & Evidence Collection",
      "Disaster Recovery (DR) & BCP Testing",
      "Logging & Monitoring (SIEM, UEBA)",
      "Patch & Vulnerability Management",
      "Safety of Personnel (Travel, Emergency)"
    ],
    notes: "Newer emphasis on SOAR (automating the response). Incident Response Steps (NIST): Preparation -> Detection/Analysis -> Containment/Eradication/Recovery -> Post-Incident Activity. Human safety is ALWAYS priority #1.",
    focus_areas: [
      { title: "Incident Response Steps", summary: "Preparation, Detection/Analysis, Containment, Eradication, Recovery, Post-Incident (Lessons Learned)." },
      { title: "Digital Forensics", summary: "Preserving chain of custody. Collection order: CPU Cache -> RAM -> Swap -> HDD -> Removable Media." },
      { title: "Business Continuity (DR)", summary: "RTO (Time to restore), RPO (Data loss tolerance). Hot Site (Immediate), Warm Site (Delay), Cold Site (Weeks)." },
      { title: "Logging & SIEM", summary: "Aggregating logs for correlation. Ensuring logs are immutable and synchronized (NTP)." },
      { title: "Security Orchestration", summary: "SOAR tools automate incident response workflows (playbooks) to speed up mitigation." },
      { title: "Configuration Mgmt", summary: "maintaining baselines. Detecting drift. Change management boards (CAB) to approve modifications." },
      { title: "Patch Management", summary: "Testing patches before deployment. Prioritizing based on risk/exposure rather than just availability." },
      { title: "Threat Intelligence", summary: "Consuming feeds (IOCs, TTPs) to proactively hunt for threats. STIX/TAXII standards." },
      { title: "Personnel Safety", summary: "Travel safety, duress codes, and emergency evacuation. Human life is the primary asset." },
      { title: "Media Sanitization", summary: "Ensuring data is irretrievable at end-of-life. Destruction is the most secure method for high-sensitivity media." }
    ]
  },
  {
    id: 8,
    title: "Software Development Security",
    weight: "10%",
    icon: Code,
    description: "Integrating security into the software lifecycle.",
    key_concepts: [
      "SDLC & DevSecOps (CI/CD Pipelines)",
      "Software Assurance (SAST, DAST, IAST, SCA)",
      "Scaled Agile Frameworks",
      "OWASP Top 10 & API Security",
      "Database Security & Polyinstantiation",
      "Managed Services in Development"
    ],
    notes: "Includes 'Scaled Agile Framework' concepts. Focus on 'Shifting Left' (testing early). Understand the difference between SAST (Static/Source Code) and DAST (Dynamic/Runtime) testing.",
    focus_areas: [
      { title: "Secure SDLC", summary: "Integrating security at every phase (Reqs, Design, Code, Test, Deploy). 'Shift Left' security." },
      { title: "DevSecOps & CI/CD", summary: "Automating security gates in the pipeline. Continuous Integration/Continuous Deployment security." },
      { title: "Software Assurance", summary: "SAST (White-box/Code), DAST (Black-box/Runtime), IAST (Interactive). SCA (Software Composition Analysis)." },
      { title: "Database Security", summary: "Inference/Aggregation attacks. Polyinstantiation (hiding data by creating different versions for different clearance)." },
      { title: "OWASP Top 10", summary: "Most critical web risks: Broken Access Control, Cryptographic Failures, Injection, Insecure Design, etc." },
      { title: "API Security", summary: "Securing endpoints. Oauth/OIDC for API auth. Rate limiting and input validation for APIs." },
      { title: "Secure Coding", summary: "Input validation (never trust input), Output encoding, Parameterized queries (prevent SQLi)." },
      { title: "Integrated Product Teams", summary: "Cross-functional teams (Dev, Ops, Sec) working together. Agile methodology security." },
      { title: "Supply Chain Security", summary: "SBOM (Software Bill of Materials). verifying integrity of third-party libraries and code." },
      { title: "AI in Software Dev", summary: "Security implications of using AI coding assistants. Poisoning of training data models." }
    ]
  }
];

const domainBadgeClasses: Record<DomainId, string> = {
  1: 'bg-red-950/30 text-red-300 border border-red-900/50',
  2: 'bg-orange-950/30 text-orange-300 border border-orange-900/50',
  3: 'bg-yellow-950/30 text-yellow-300 border border-yellow-900/50',
  4: 'bg-emerald-950/30 text-emerald-300 border border-emerald-900/50',
  5: 'bg-teal-950/30 text-teal-300 border border-teal-900/50',
  6: 'bg-blue-950/30 text-blue-300 border border-blue-900/50',
  7: 'bg-indigo-950/30 text-indigo-300 border border-indigo-900/50',
  8: 'bg-violet-950/30 text-violet-300 border border-violet-900/50',
};

const domainIconClasses: Record<DomainId, string> = {
  1: 'text-red-300',
  2: 'text-orange-300',
  3: 'text-yellow-300',
  4: 'text-emerald-300',
  5: 'text-teal-300',
  6: 'text-blue-300',
  7: 'text-indigo-300',
  8: 'text-violet-300',
};

const generalTips = [
  {
    title: "Think Like a CEO/Director",
    content: "Your role is Risk Advisor, not Fixer. If an answer involves 'reconfiguring a firewall' vs 'updating a policy' or 'conducting a risk assessment', the management option is usually correct."
  },
  {
    title: "The Priority Stack (2026)",
    content: "1. Human Life/Safety (Absolute) 2. Public Trust/Ethics 3. Legal/Regulatory Compliance 4. Business Continuity 5. Profitability."
  },
  {
    title: "Newer Tech Context",
    content: "Expect questions context to include Cloud (SaaS/PaaS/IaaS), Hybrid environments, IoT/OT, and AI governance. The principles (CIA Triad) remain the same, but the environment has evolved."
  }
];

export default function CISSPDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeDomain = typeof activeTab === 'number'
    ? domains.find((d) => d.id === activeTab)
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row font-sans text-zinc-200">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-zinc-950 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="h-6 w-6 text-emerald-400" />
          <span className="font-bold text-lg">CISSP 2026 Prep</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-72 bg-zinc-950 text-zinc-400 flex flex-col transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-zinc-800 hidden md:flex items-center space-x-2">
          <BrainCircuit className="h-8 w-8 text-emerald-400" />
          <div>
            <h1 className="text-xl font-bold text-white leading-none">CISSP</h1>
            <span className="text-xs text-emerald-400 uppercase tracking-wider">2026 Study Companion</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Exam Domains
          </div>
          <ul className="space-y-1 px-2">
            {domains.map((domain) => (
              <li key={domain.id}>
                <button
                  onClick={() => {
                    setActiveTab(domain.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left
                    ${activeTab === domain.id 
                      ? 'bg-accent text-zinc-950 shadow-md' 
                      : 'hover:bg-zinc-900 hover:text-white'
                    }
                  `}
                >
                  <domain.icon className={`h-5 w-5 ${activeTab === domain.id ? 'text-zinc-950' : 'text-zinc-500'}`} />
                  <span className="text-sm font-medium line-clamp-1">{domain.title}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-8 px-4 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Overview
          </div>
          <div className="px-2">
             <button
                onClick={() => {
                  setActiveTab('overview');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left
                  ${activeTab === 'overview' 
                    ? 'bg-accent text-zinc-950 shadow-md' 
                    : 'hover:bg-zinc-900 hover:text-white'
                  }
                `}
              >
                <BookOpen className="h-5 w-5" />
                <span className="text-sm font-medium">Exam Strategy & 2026 Focus</span>
              </button>
          </div>
        </nav>
        
        <div className="p-4 border-t border-zinc-800 text-xs text-zinc-500 text-center">
          Aligned with April 2024 Refresh
          <br/>
          (Active for 2026)
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
        <div className="max-w-4xl mx-auto">
          
          {activeTab === 'overview' ? (
            <div className="space-y-8 animate-fade-in-up">
              <header className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Strategic Overview</h2>
                <p className="text-zinc-400 text-lg">Mastering the CISSP Mindset for 2026</p>
              </header>

              <div className="grid md:grid-cols-3 gap-6">
                {generalTips.map((tip, idx) => (
                  <div key={idx} className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                    <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                      <BrainCircuit className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-lg text-white mb-2">{tip.title}</h3>
                    <p className="text-zinc-400 leading-relaxed">{tip.content}</p>
                  </div>
                ))}
              </div>

              <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                <div className="bg-zinc-950 px-6 py-4 border-b border-zinc-800">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-emerald-400" />
                    Current Exam Profile (2024-2026 Cycle)
                  </h3>
                </div>
                <div className="p-6">
                  <p className="mb-4 text-zinc-400">
                    The exam content was last refreshed in April 2024 and remains the standard for 2026. 
                    Key weight changes to remember:
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-emerald-950/20 rounded-lg border border-emerald-900/50">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-400">Domain 1</span>
                        <span className="text-emerald-300">Security & Risk Management</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-500 line-through">15%</span>
                        <span className="font-bold text-emerald-400">16%</span>
                        <span className="text-xs bg-emerald-900 text-emerald-300 px-2 py-1 rounded-full">Top Priority</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-950/20 rounded-lg border border-red-900/50">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-red-300">Domain 8</span>
                        <span className="text-red-300">Software Development Security</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-500 line-through">11%</span>
                        <span className="font-bold text-red-300">10%</span>
                        <span className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded-full">Decreased</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                    <h4 className="font-bold text-zinc-200 mb-2">Technical Updates to Watch:</h4>
                    <ul className="list-disc list-inside text-zinc-400 space-y-1">
                      <li><strong>Zero Trust Architecture</strong> is now explicit in Domain 3/4.</li>
                      <li><strong>SOAR</strong> (Security Orchestration, Automation, Response) is key in Domain 7.</li>
                      <li><strong>OT/ICS Security</strong> has expanded coverage.</li>
                      <li><strong>Privacy Regulations</strong> now include broader AI and global data flow considerations.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : activeDomain ? (
            <div className="animate-fade-in-up">
              <header className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${domainBadgeClasses[activeDomain.id]}`}>
                      Domain {activeDomain.id}
                    </span>
                    <span className="text-sm font-semibold text-zinc-500">Exam Weight: {activeDomain.weight}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white">{activeDomain.title}</h2>
                  <p className="text-xl text-zinc-400 mt-2">{activeDomain.description}</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <activeDomain.icon className={`h-12 w-12 opacity-90 ${domainIconClasses[activeDomain.id]}`} />
                </div>
              </header>

              <div className="grid gap-6">
                {/* Key Concepts Card */}
                <div className="bg-zinc-900 rounded-xl border border-zinc-800">
                  <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-zinc-200 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      Key Concepts (2026 Focus)
                    </h3>
                  </div>
                  <div className="p-6">
                    <ul className="grid md:grid-cols-2 gap-4">
                      {activeDomain.key_concepts.map((concept, i) => (
                        <li key={i} className="flex items-start gap-3 group">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2.5 flex-shrink-0 transition-colors group-hover:bg-emerald-600" />
                          <a 
                            href={`https://www.google.com/search?q=${encodeURIComponent(concept + " CISSP")}&udm=50`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-300 hover:text-accent hover:underline decoration-accent/40 transition-all flex items-baseline gap-1.5"
                            title="Search with Google AI Mode"
                          >
                            <span>{concept}</span>
                            <ExternalLink className="h-3 w-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all text-emerald-500/70" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Notebook/Insight Card */}
                <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <BookOpen className="h-32 w-32" />
                  </div>
                  <h3 className="font-bold text-lg text-zinc-200 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Critical Notes & Mnemonics
                  </h3>
                  <div className="max-w-none text-zinc-300">
                    <p>{activeDomain.notes}</p>
                  </div>
                </div>

                {/* Deep Dive Tip */}
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                  <h4 className="font-bold text-zinc-200 mb-2">Study Focus Area</h4>
                  <p className="text-zinc-500 text-sm">
                    Use this dashboard to orient your study sessions. Ensure your study materials (books/videos) 
                    explicitly cover the <strong>2024 Exam Refresh</strong> topics like SOAR, Zero Trust, and CNC (Cloud Native Concepts) 
                    to be ready for a 2026 exam date.
                  </p>
                </div>

                {/* Top 10 Focus Areas - New Section with Summaries */}
                <div className="bg-zinc-900 rounded-xl border border-zinc-800">
                  <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 rounded-t-xl">
                    <h3 className="font-bold text-lg text-zinc-200 flex items-center gap-2">
                      <List className="h-5 w-5 text-indigo-400" />
                      Top 10 Key Areas of Focus
                    </h3>
                  </div>
                  <div className="p-6">
                    <p className="mb-4 text-xs text-zinc-500 uppercase tracking-wider">Derived from Notebook Sources</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {activeDomain.focus_areas.map((area, i) => (
                        <div key={i} className="border border-zinc-800 rounded-lg p-3 hover:bg-zinc-950 transition-colors">
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-indigo-950/40 text-indigo-300 text-xs font-bold mt-0.5">
                              {i + 1}
                            </span>
                            <div className="flex-1">
                              <a 
                                href={`https://www.google.com/search?q=${encodeURIComponent(area.title + " CISSP")}&udm=50`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-zinc-200 hover:text-accent hover:underline decoration-accent/40 flex items-center gap-1.5"
                                title="Search with Google AI Mode"
                              >
                                {area.title}
                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 text-indigo-300" />
                              </a>
                              <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                                {area.summary}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
